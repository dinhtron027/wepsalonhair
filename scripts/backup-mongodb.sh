#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────────────────────
# MongoDB Backup Script — Salon Dương Chi
#
# Sử dụng: bash scripts/backup-mongodb.sh
#
# Yêu cầu:
#   - mongodump đã cài đặt (MongoDB Database Tools)
#   - File .env chứa MONGODB_URI hoặc biến môi trường MONGODB_URI
#
# Kết quả:
#   - File nén .gz trong thư mục backups/ có timestamp
#   - Tự động xóa bản backup cũ hơn RETENTION_COUNT bản
# ────────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
RETENTION_COUNT=${BACKUP_RETENTION:-7}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="salon_backup_${TIMESTAMP}"

# ── Load .env if available ─────────────────────────────────────────────────────
if [ -f "${PROJECT_ROOT}/backend/.env" ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' "${PROJECT_ROOT}/backend/.env" | grep MONGODB_URI | xargs)
fi

if [ -z "${MONGODB_URI:-}" ]; then
  echo "❌ MONGODB_URI không được thiết lập."
  echo "   Hãy đặt biến môi trường MONGODB_URI hoặc thêm vào file backend/.env"
  exit 1
fi

# ── Check mongodump ────────────────────────────────────────────────────────────
if ! command -v mongodump &>/dev/null; then
  echo "❌ mongodump chưa được cài đặt."
  echo "   Cài đặt: sudo apt-get install -y mongodb-database-tools"
  echo "   Hoặc tải từ: https://www.mongodb.com/try/download/database-tools"
  exit 1
fi

# ── Create backup directory ────────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"

echo "🔄 Bắt đầu backup MongoDB..."
echo "   Thời gian: $(date)"
echo "   Thư mục: ${BACKUP_DIR}/${BACKUP_NAME}"

# ── Run backup ─────────────────────────────────────────────────────────────────
mongodump \
  --uri="$MONGODB_URI" \
  --out="${BACKUP_DIR}/${BACKUP_NAME}" \
  --gzip \
  2>&1

if [ $? -eq 0 ]; then
  # Tạo file nén .tar.gz
  ARCHIVE_PATH="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
  tar -czf "$ARCHIVE_PATH" -C "$BACKUP_DIR" "$BACKUP_NAME"
  rm -rf "${BACKUP_DIR}/${BACKUP_NAME}"

  ARCHIVE_SIZE=$(du -sh "$ARCHIVE_PATH" | cut -f1)
  echo ""
  echo "✅ Backup thành công!"
  echo "   File: ${ARCHIVE_PATH}"
  echo "   Kích thước: ${ARCHIVE_SIZE}"
else
  echo "❌ Backup thất bại!"
  exit 1
fi

# ── Cleanup old backups ────────────────────────────────────────────────────────
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "salon_backup_*.tar.gz" -type f | wc -l)

if [ "$BACKUP_COUNT" -gt "$RETENTION_COUNT" ]; then
  echo ""
  echo "🧹 Xóa backup cũ (giữ lại ${RETENTION_COUNT} bản mới nhất)..."

  # shellcheck disable=SC2012
  ls -t "${BACKUP_DIR}"/salon_backup_*.tar.gz | tail -n +"$((RETENTION_COUNT + 1))" | while read -r old_backup; do
    echo "   Xóa: $(basename "$old_backup")"
    rm -f "$old_backup"
  done
fi

echo ""
echo "📋 Danh sách backup hiện tại:"
ls -lth "${BACKUP_DIR}"/salon_backup_*.tar.gz 2>/dev/null || echo "   (không có backup nào)"
echo ""
echo "✨ Hoàn tất!"
