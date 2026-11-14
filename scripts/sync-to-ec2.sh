#!/usr/bin/env bash
# ==============================================================================
# Script: sync-to-ec2.sh
# Mục đích: Đồng bộ tự động mã nguồn từ máy local sang máy chủ AWS EC2 qua SSH rsync
# Tác giả: Senior DevOps Engineer
# ==============================================================================

set -eo pipefail

# ─── 1. CẤU HÌNH KẾT NỐI EC2 ───────────────────────────────────────────────────
EC2_HOST="${EC2_HOST:-54.251.145.138}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY="${EC2_KEY:-$HOME/.ssh/salonduongchi1311.pem}"
REMOTE_DIR="${REMOTE_DIR:-/home/ubuntu/salon-root}"

# Đường dẫn thư mục gốc dự án local
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ─── 2. ĐỌC THAM SỐ DÒNG LỆNH ─────────────────────────────────────────────────
DO_RESTART=false
DO_SEED=false
DO_DRY_RUN=false
SYNC_ENV=false

print_usage() {
  echo "Sử dụng: bash scripts/sync-to-ec2.sh [TÙY CHỌN]"
  echo ""
  echo "Tùy chọn:"
  echo "  --restart       Tự động rebuild và khởi động lại Docker containers trên EC2 sau khi đồng bộ"
  echo "  --seed          Chạy script nạp dữ liệu mẫu vào MongoDB trên EC2 sau khi đồng bộ"
  echo "  --sync-env      Đồng bộ cả file .env lên EC2 (mặc định bỏ qua để bảo vệ bí mật production)"
  echo "  --dry-run       Mô phỏng đồng bộ (kiểm tra các file sẽ được chuyển mà không ghi đè thật)"
  echo "  -h, --help      Hiển thị hướng dẫn này"
  echo ""
  echo "Ví dụ:"
  echo "  bash scripts/sync-to-ec2.sh                  # Chỉ sync source code"
  echo "  bash scripts/sync-to-ec2.sh --restart        # Sync và rebuild containers"
  echo "  bash scripts/sync-to-ec2.sh --restart --seed # Sync, rebuild và seed database"
}

for arg in "$@"; do
  case "$arg" in
    --restart)
      DO_RESTART=true
      ;;
    --seed)
      DO_SEED=true
      ;;
    --sync-env)
      SYNC_ENV=true
      ;;
    --dry-run)
      DO_DRY_RUN=true
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      echo "⚠️  Cảnh báo: Tùy chọn không xác định '$arg'. Dùng --help để xem chi tiết."
      ;;
  esac
done

echo "======================================================================="
echo "  🚀 BẮT ĐẦU ĐỒNG BỘ MÃ NGUỒN SANG AWS EC2"
echo "  📍 Local:  ${PROJECT_ROOT}"
echo "  🌐 Remote: ${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}"
echo "  🔑 Key:    ${EC2_KEY}"
echo "======================================================================="

# ─── 3. KIỂM TRA SSH PRIVATE KEY ─────────────────────────────────────────────
if [ ! -f "${EC2_KEY}" ]; then
  echo "❌ LỖI: Không tìm thấy file SSH key tại: ${EC2_KEY}"
  echo "👉 Hãy đảm bảo file salonduongchi1311.pem đã được lưu trong ~/.ssh/ và gán quyền 600:"
  echo "   chmod 600 ${EC2_KEY}"
  exit 1
fi

chmod 600 "${EC2_KEY}" 2>/dev/null || true

# ─── 4. KIỂM TRA KẾT NỐI SSH TỚI EC2 ──────────────────────────────────────────
echo "🔍 Đang kiểm tra kết nối SSH tới EC2..."
if ! ssh -i "${EC2_KEY}" -o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" "echo 'SSH Connected'" >/dev/null 2>&1; then
  echo "❌ LỖI: Không thể kết nối SSH tới ${EC2_USER}@${EC2_HOST} bằng key ${EC2_KEY}!"
  echo "👉 Vui lòng kiểm tra IP EC2, Security Group (mở port 22) hoặc đường dẫn key."
  exit 1
fi
echo "✅ Kết nối SSH thành công!"

# ─── 5. THIẾT LẬP DANH SÁCH LOẠI TRỪ (EXCLUDE) ────────────────────────────────
EXCLUDES=(
  --exclude='.git/'
  --exclude='.github/'
  --exclude='node_modules/'
  --exclude='frontend/node_modules/'
  --exclude='frontend/dist/'
  --exclude='dist/'
  --exclude='coverage/'
  --exclude='*.log'
  --exclude='.DS_Store'
  --exclude='mongo_data/'
  --exclude='__pycache__/'
  --exclude='.gemini/'
  --exclude='.agents/'
)

if [ "$SYNC_ENV" = false ]; then
  EXCLUDES+=(--exclude='.env')
  echo "ℹ️  Bảo vệ an toàn: File .env được giữ nguyên trên EC2 (dùng --sync-env nếu muốn ghi đè)."
else
  echo "⚠️  Lưu ý: File .env local sẽ được đồng bộ đè lên file .env trên EC2."
fi

# ─── 6. THỰC HIỆN ĐỒNG BỘ BẰNG RSYNC ─────────────────────────────────────────
RSYNC_FLAGS="-avzP --delete"
if [ "$DO_DRY_RUN" = true ]; then
  RSYNC_FLAGS="-avznP"
  echo "🔍 [DRY-RUN] Chế độ mô phỏng, không ghi đè file thật trên server:"
fi

echo "📦 Đang đồng bộ các file mã nguồn..."
rsync ${RSYNC_FLAGS} \
  -e "ssh -i ${EC2_KEY} -o StrictHostKeyChecking=no" \
  "${EXCLUDES[@]}" \
  "${PROJECT_ROOT}/" \
  "${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}/"

echo "✅ Đồng bộ mã nguồn hoàn tất!"

if [ "$DO_DRY_RUN" = true ]; then
  echo "🏁 Kết thúc mô phỏng (dry-run)."
  exit 0
fi

# ─── 7. TỰ ĐỘNG THỰC THI TRÊN EC2 (NẾU ĐƯỢC YÊU CẦU) ────────────────────────
if [ "$DO_RESTART" = true ] || [ "$DO_SEED" = true ]; then
  echo "-----------------------------------------------------------------------"
  echo "⚙️  Đang thực thi các tác vụ quản trị trên máy chủ EC2..."

  REMOTE_COMMANDS=""

  if [ "$DO_RESTART" = true ]; then
    echo "🔄 Khởi động lại và build Docker Containers..."
    REMOTE_COMMANDS+="cd ${REMOTE_DIR} && sudo docker compose build --build-arg VITE_API_URL=https://api.salonduongchi.website frontend && sudo docker compose up -d && "
  fi

  if [ "$DO_SEED" = true ]; then
    echo "🌱 Nạp dữ liệu mẫu vào MongoDB..."
    REMOTE_COMMANDS+="cd ${REMOTE_DIR} && sudo docker compose exec -T api npm run seed -- --force && "
  fi

  REMOTE_COMMANDS+="echo 'Done!'"

  ssh -i "${EC2_KEY}" -o StrictHostKeyChecking=no "${EC2_USER}@${EC2_HOST}" "${REMOTE_COMMANDS}"
fi

# ─── 8. KIỂM TRA TRẠNG THÁI CUỐI CÙNG ─────────────────────────────────────────
echo "-----------------------------------------------------------------------"
echo "🩺 Kiểm tra trạng thái hệ thống sau triển khai:"
curl -Is https://salonduongchi.website | head -n 1 || echo "Frontend kiểm tra thất bại"
curl -Is https://api.salonduongchi.website/api/health | head -n 1 || echo "API kiểm tra thất bại"

echo "======================================================================="
echo "  🎉 HOÀN TẤT ĐỒNG BỘ VÀ CẬP NHẬT LÊN AWS EC2!"
echo "======================================================================="
