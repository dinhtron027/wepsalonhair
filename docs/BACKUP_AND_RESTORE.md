# Hướng dẫn Backup & Restore — Salon Dương Chi

## Yêu cầu

- **MongoDB Database Tools** (chứa `mongodump` và `mongorestore`)
  ```bash
  sudo apt-get install -y mongodb-database-tools
  ```
- Biến môi trường `MONGODB_URI` hoặc file `backend/.env` chứa connection string

## Backup

### Chạy thủ công

```bash
bash scripts/backup-mongodb.sh
```

Kết quả: File `backups/salon_backup_YYYYMMDD_HHMMSS.tar.gz`

### Cron tự động (khuyến nghị)

Thêm vào crontab để backup hàng ngày lúc 3:00 sáng:

```bash
crontab -e
```

Thêm dòng:

```cron
0 3 * * * cd /path/to/wepsalonhair && bash scripts/backup-mongodb.sh >> /var/log/salon-backup.log 2>&1
```

### Tùy chỉnh retention

Mặc định giữ lại **7 bản backup**. Thay đổi bằng biến môi trường:

```bash
BACKUP_RETENTION=14 bash scripts/backup-mongodb.sh
```

## Restore

### Bước 1: Giải nén backup

```bash
tar -xzf backups/salon_backup_YYYYMMDD_HHMMSS.tar.gz -C backups/
```

### Bước 2: Restore vào MongoDB

```bash
mongorestore \
  --uri="$MONGODB_URI" \
  --gzip \
  --drop \
  backups/salon_backup_YYYYMMDD_HHMMSS/
```

> ⚠️ **Cảnh báo:** Flag `--drop` sẽ xóa tất cả dữ liệu hiện tại trước khi restore. Bỏ flag này nếu muốn merge.

### Bước 3: Xác nhận

```bash
mongosh "$MONGODB_URI" --eval "db.getCollectionNames()"
```

## Lưu ý quan trọng

### MongoDB Atlas Free Tier (M0)

Nếu bạn dùng **Atlas Free/Shared Tier (M0/M2/M5)**:

- `mongodump` **có thể** hoạt động từ phiên bản Atlas mới
- Nếu `mongodump` không chạy, sử dụng Atlas UI:
  1. Vào [MongoDB Atlas Console](https://cloud.mongodb.com)
  2. Chọn Cluster → **...** → **Command Line Tools**
  3. Copy connection string và chạy `mongodump` từ EC2

### Atlas Automated Backup (Paid plan M10+)

Nếu upgrade lên M10+, Atlas cung cấp automated backup có sẵn:
1. Vào Cluster → **Backup**
2. Bật **Continuous Backup** hoặc **Cloud Backup**
3. Có thể restore trực tiếp từ Atlas UI

## Cấu trúc backup

```
backups/
├── salon_backup_20260714_030000.tar.gz
├── salon_backup_20260713_030000.tar.gz
└── ... (giữ lại 7 bản mới nhất)
```

Mỗi backup chứa tất cả collections: Users, Products, Services, Bookings, Orders, Customers, etc.
