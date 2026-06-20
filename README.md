# Salon Dương Chí - Hệ thống Website Quản Lý & Đặt Lịch Salon Tóc

Hệ thống quản lý và đặt lịch cho Salon tóc nữ cao cấp Dương Chí, bao gồm giao diện khách hàng (Public Website) và bảng điều khiển của quản trị viên (Admin Dashboard).

---

## 🚀 Chức Năng Mới & Các Phần Đã Nâng Cấp (Dịch Vụ Nữ)

Hệ thống đã được nâng cấp toàn diện phần **Dịch Vụ** hướng tới trải nghiệm chuyên nghiệp, đầy đủ và tối ưu hóa thương mại cho Salon tóc nữ:

### 1. Thanh Điều Hướng Dropdown 10 Mục
* **Dropdown Menu Lưới 2 Cột (Desktop)**: Giao diện Dropdown dịch vụ được mở rộng sang dạng lưới 2 cột tinh tế (`min-width: 460px`), hiển thị đầy đủ 10 dịch vụ/chức năng chính.
* **Hamburger Menu (Mobile)**: Hỗ trợ phân cấp cây thư mục dịch vụ động rõ ràng trên các thiết bị di động.
* **10 Liên Kết Điều Hướng**:
  * **Trải Nghiệm** (`/services/experience`) - Quy trình phục vụ khách hàng tiêu chuẩn 5 sao.
  * **Chăm Dưỡng** (`/services/care`) - Bí quyết chăm sóc tóc và liệu trình khuyên dùng.
  * **Bảng Giá** (`/pricing`) - Tổng hợp bảng giá dịch vụ trực quan.
  * **7 Danh Mục Dịch Vụ Nữ**:
    1. Cắt & Tạo Kiểu Nữ (`/services/category/haircut`)
    2. Uốn Tóc Nữ (`/services/category/perm`)
    3. Duỗi Tóc Nữ (`/services/category/straightening`)
    4. Nhuộm Tóc Nữ (`/services/category/color`)
    5. Phục Hồi Tóc (`/services/category/treatment`)
    6. Gội Đầu Dưỡng Sinh (`/services/category/shampoo`)
    7. Combo Làm Đẹp (`/services/category/combo`)

### 2. Quản Lý Dữ Liệu Dịch Vụ Hệ Thống (Backend Schema & Idempotent Seed)
* **Unified Schema**: Tệp [Service.js](file:///c:/Users/DINH%20TRONG/OneDrive/MicrosoftFileShare/salon/backend/models/Service.js) định nghĩa cấu trúc dữ liệu dịch vụ chuẩn hóa gồm: `name`, `slug`, `category`, `categorySlug`, `description`, `price`, `duration`, `durationMinutes`, `suitableFor` (mảng đối tượng phù hợp), `benefits` (mảng lợi ích), `isFeatured` (dịch vụ nổi bật).
* **Mongoose Middleware**: Tích hợp hook `pre('validate')` tự động chuyển đổi tên thành `slug`, ánh xạ danh mục tiếng Việt sang `categorySlug` chuẩn tiếng Anh, và đồng bộ tự động giữa `duration` và `durationMinutes` để tương thích ngược với Admin Dashboard cũ.
* **Idempotent Seeding**: Lệnh `npm run seed` tự động nạp **30 dịch vụ** cao cấp dành cho nữ vào cơ sở dữ liệu. Lệnh này chạy idempotent (không tạo bản ghi trùng lặp khi chạy nhiều lần nhờ cơ chế tìm và cập nhật theo `slug` hoặc chèn mới nếu chưa tồn tại).

### 3. Các Trang Giao Diện Mới (Frontend Pages)
* **Trang Trải Nghiệm** (`/services/experience`): Sử dụng hiệu ứng dòng thời gian (`framer-motion`) mô phỏng quy trình 6 bước phục vụ khách hàng chu đáo và sang trọng.
* **Trang Chăm Dưỡng** (`/services/care`): Cung cấp các thông tin hữu ích về chăm sóc tóc hư tổn, dưỡng màu và các liệu trình chuyên sâu tại salon.
* **Trang Chi Tiết Danh Mục** (`/services/category/:categorySlug`): Tự động tải danh sách dịch vụ thuộc danh mục tương ứng từ backend, hiển thị dưới dạng card dịch vụ hiện đại có hiển thị đối tượng phù hợp, lợi ích dịch vụ, và nút "Đặt lịch ngay".
* **Trang Bảng Giá** (`/pricing`): Phân nhóm động các dịch vụ theo danh mục, hiển thị rõ ràng thông tin giá cả đi kèm cảnh báo: *Giá dịch vụ trên mang tính chất tham khảo, chi phí thực tế sẽ điều chỉnh linh hoạt tùy thuộc vào độ dài, độ dày và tình trạng sức khỏe thực tế của tóc.*
* **Hỗ Trợ Pre-select Dịch Vụ Khi Đặt Lịch** (`/booking?service=<slug>`): Trang đặt lịch tự động chọn trước dịch vụ khách hàng mong muốn dựa trên tham số query từ đường dẫn.

### 4. Salon Customer CRM (Hệ thống Quản lý Khách hàng Chuyên nghiệp)
Hệ thống nâng cấp trang quản trị **Khách hàng** (`/admin/customers`) từ danh sách cơ bản thành cổng CRM đầy đủ:
* **Hồ sơ CRM tổng hợp**: Hiển thị thẻ chỉ số (Summary CRM Cards) gồm Tổng số khách, Khách mới, Khách VIP, Khách cần chăm sóc, Doanh thu và Khách lâu chưa quay lại.
* **Bộ lọc nâng cao & Phân khúc tự động (CRM Segmentation)**:
  * Lọc theo tên, số điện thoại, email, stylist, trạng thái lịch hẹn, khoảng ngày đặt lịch.
  * Phân khúc khách hàng tự động và gắn thẻ tag: `new` (Mới), `regular` (Thường xuyên), `vip` (VIP - từ 10 cuộc hẹn hoặc chi tiêu >= 5M), `inactive` (Lâu chưa quay lại - quá 60 ngày), `high_value` (Chi tiêu cao - trên 3M), `color_customer` (Từng nhuộm), `treatment_needed` (Cần phục hồi).
* **Quản lý ghi chú chăm sóc (Customer Note)**: Hỗ trợ thêm ghi chú nội bộ, tư vấn, hoặc khiếu nại với dòng thời gian (Timeline) rõ ràng.
* **Lưu trữ công thức nhuộm (Hair Formula)**: Ghi lại chi tiết thuốc nhuộm, oxy, mức độ nền tóc trước/sau dịch vụ để đảm bảo kết quả đồng đều cho những lần làm tóc tiếp theo.
* **Thống kê sản phẩm đã mua**: Quét tự động lịch sử đơn hàng để gợi ý các sản phẩm dưỡng tóc khách hàng đã từng sử dụng.
* **Đăt lịch lại nhanh (Quick Rebook)**: Tạo lịch hẹn trực tiếp cho khách hàng ngay trong hồ sơ chi tiết mà không cần tải lại trang. Hỗ trợ khách lẻ vãng lai dựa trên số điện thoại/email mà không bắt buộc có mã tài khoản (User Object ID) trên hệ thống.

---

## 📂 Cấu Trúc Thư Mục Chỉnh Sửa & Thêm Mới

Các tệp được thêm mới và cải tiến trong đợt nâng cấp hệ thống (Dịch vụ & CRM):

```text
salon/
├── backend/
│   ├── models/
│   │   ├── Service.js               # [MODIFY] Nâng cấp Mongoose Schema & pre-validate hook dịch vụ
│   │   ├── CustomerNote.js          # [NEW] Model ghi chú chăm sóc khách hàng CRM
│   │   └── HairFormula.js           # [NEW] Model lưu trữ công thức nhuộm màu & tình trạng tóc
│   ├── utils/
│   │   ├── validationSchemas.js     # [MODIFY] Cập nhật Joi schema xác thực Service & CRM (note, formula, rebook)
│   │   └── seed.js                  # [MODIFY] Nạp 30 dịch vụ nữ và 10 khách hàng CRM mẫu đa dạng phân khúc
│   ├── services/
│   │   ├── serviceService.js        # [MODIFY] Hỗ trợ filter dịch vụ theo category/categorySlug
│   │   └── adminService.js          # [MODIFY] Nghiệp vụ CRM khách hàng, thống kê, phân khúc tự động
│   └── controllers/
│   │   ├── serviceController.js     # [MODIFY] Cấp API endpoint nhận query params filter dịch vụ
│   │   └── adminController.js       # [MODIFY] API handlers quản lý khách hàng, ghi chú, công thức và rebook
│   └── routes/
│       └── adminRoutes.js           # [MODIFY] Đăng ký các route CRM mới dành cho quản trị viên
│
└── frontend/src/
    ├── services/
    │   └── adminApi.ts              # [MODIFY] Định nghĩa TypeScript interfaces CRM & các API endpoints tương ứng
    ├── components/
    │   ├── navigation/
    │   │   ├── menuData.ts          # [MODIFY] Mở rộng danh sách menu 10 mục dịch vụ
    │   │   └── styled.ts            # [MODIFY] Cập nhật Dropdown dạng lưới 2 cột
    │   └── admin/
    │       └── customers/
    │           ├── CustomerCard.tsx         # [MODIFY] Thẻ khách hàng CRM hiển thị segment badges và thao tác nhanh
    │           ├── CustomerDetailModal.tsx   # [NEW] Modal chi tiết hồ sơ dạng Tabs (Lịch sử, Ghi chú, Công thức, Sản phẩm)
    │           ├── CustomerFilters.tsx      # [NEW] Component lọc khách hàng theo phân khúc, dịch vụ, thợ làm
    │           ├── CustomerHistoryTable.tsx # [NEW] Bảng hiển thị lịch sử đặt lịch chi tiết của khách hàng
    │           ├── CustomerNotes.tsx        # [NEW] Timeline ghi chú CRM & Form tạo ghi chú mới
    │           ├── CustomerSegmentBadge.tsx # [NEW] Huy hiệu phân khúc màu pastel
    │           ├── CustomerSummaryCards.tsx # [NEW] Các thẻ thống kê nhanh lượng khách hàng ở đầu trang
    │           ├── HairFormulaForm.tsx      # [NEW] Form tạo & cập nhật công thức tóc
    │           ├── RebookModal.tsx          # [NEW] Modal đặt lại lịch hẹn nhanh từ trang khách hàng
    │           └── customerFormatters.ts    # [NEW] Tiện ích định dạng tiền tệ, ngày tháng
    ├── pages/
    │   ├── ExperiencePage.tsx       # [NEW] Trang quy trình trải nghiệm 6 bước
    │   ├── CarePage.tsx             # [NEW] Trang kiến thức và liệu trình chăm dưỡng tóc
    │   ├── ServiceCategoryPage.tsx  # [NEW] Trang danh mục dịch vụ động theo categorySlug
    │   ├── Pricing.tsx              # [MODIFY] Phân nhóm bảng giá theo categorySlug + lưu ý giá tham khảo
    │   ├── BookingPage.tsx          # [MODIFY] Auto-select dịch vụ từ URL query parameter
    │   └── admin/
    │       └── Customers.tsx        # [MODIFY] Tái cấu trúc giao diện danh sách CRM Khách hàng
    └── routes/
        └── index.tsx                # [MODIFY] Đăng ký các route trang dịch vụ mới
```

---

## 🛠️ Yêu Cầu & Cài Đặt Hệ Thống

### 1. Yêu cầu môi trường
* **Node.js**: Phiên bản 18+ (Đã thử nghiệm thành công trên Node v23)
* **MongoDB**: Phiên bản Community Server chạy cục bộ (Local) hoặc MongoDB Atlas Cloud

### 2. Cài đặt các gói phụ thuộc
Cài đặt dependencies tại thư mục gốc (Root) và frontend:

```bash
# Cài đặt tại thư mục gốc (Root) để cài dependencies cho backend
npm install

# Cài đặt dependencies cho frontend (sử dụng --legacy-peer-deps vì các thư viện React cũ)
cd frontend
npm install --legacy-peer-deps
```

---

## ⚙️ Biến Môi Trường (.env)

Vui lòng tạo file `.env` tại thư mục gốc của project (sử dụng cấu trúc tương tự `.env.example` đã có sẵn):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/wepsalonhair
JWT_SECRET=supersecretkey_min16chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Cấu hình Admin Seed dữ liệu mặc định
DEFAULT_ADMIN_NAME=Admin Duong Chi
DEFAULT_ADMIN_EMAIL=admin@duongchi.com
DEFAULT_ADMIN_PHONE=0900000000
DEFAULT_ADMIN_PASSWORD=adminpassword123
```

Tại thư mục `frontend/` bạn có thể cấu hình file `.env` hoặc `.env.production` nếu cần thiết:
* `VITE_API_URL=http://localhost:5000`

---

## 🏃 Chạy Trực Tiếp Ở Môi Trường Local (Development)

Để phát triển dự án hoặc chạy thử nghiệm trực tiếp, hãy khởi chạy backend và frontend song song:

### Bước 1: Khởi chạy MongoDB Local
Hãy đảm bảo dịch vụ MongoDB đang chạy cục bộ tại máy của bạn.

### Bước 2: Nạp dữ liệu Seed dịch vụ (Dành cho lần chạy đầu tiên)
Tại thư mục gốc `salon/`, chạy lệnh sau để nạp 30 dịch vụ nữ:
```bash
npm run seed
```

### Bước 3: Chạy đồng thời Backend & Frontend
Tại thư mục gốc `salon/`, chạy lệnh:
```bash
npm run dev
```
Hệ thống sử dụng `concurrently` để chạy song song:
* **Backend API**: Khởi động tại `http://localhost:5000`
* **Frontend Web**: Khởi động tại `http://localhost:5173` (hoặc `http://localhost:5174` nếu port 5173 bị chiếm dụng)

---

## 🐳 Khởi Chạy Với Docker / Docker Compose (Local & Production)

Hệ thống hỗ trợ đóng gói Docker toàn phần. Trong môi trường production, cơ sở dữ liệu được chuyển hướng sang MongoDB Atlas để đảm bảo an toàn dữ liệu và tối ưu hiệu suất, thay vì phụ thuộc vào MongoDB container chạy local.

```bash
# Khởi chạy các dịch vụ (Backend và Frontend)
docker compose up -d --build

# Xem logs của hệ thống
docker compose logs -f
```

---

## 🌐 Hướng Dẫn Thiết Lập & Deploy Production (AWS EC2)

Dưới đây là tài liệu hướng dẫn cấu hình chi tiết từng bước cho môi trường Production thực tế.

### 1. Cấu hình DNS (Namecheap / Nhà Cung Cấp)
Đảm bảo đã trỏ các bản ghi **A Record** sau về Elastic IP máy chủ EC2 (`3.1.105.97`):
* `@` (salonduongchi.website) -> `3.1.105.97`
* `www` (www.salonduongchi.website) -> `3.1.105.97`
* `api` (api.salonduongchi.website) -> `3.1.105.97`

### 2. Cấu hình MongoDB Atlas (Cơ sở dữ liệu đám mây)
1. Đăng nhập MongoDB Atlas Console.
2. Vào **Network Access** -> **Add IP Address** -> Thêm Elastic IP `3.1.105.97` vào danh sách cho phép (Whitelist).
3. Lấy chuỗi kết nối (Connection String) dạng: `mongodb+srv://<username>:<password>@cluster.mongodb.net/salon_duong_chi` để lưu cấu hình.

### 3. Cài đặt trên máy chủ AWS EC2 Ubuntu
Đăng nhập SSH vào server Ubuntu (`ubuntu@3.1.105.97`) và thực hiện:

#### Bước A: Cài đặt Docker & Docker Compose
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker ubuntu
# Log out và log in lại để phân quyền docker có hiệu lực
```

#### Bước B: Clone dự án và tạo tệp môi trường
```bash
# Clone dự án về thư mục chỉ định
git clone https://github.com/dinhtron027/wepsalonhair.git /home/ubuntu/salon-root
cd /home/ubuntu/salon-root

# Tạo file .env cho backend
nano .env
```
Nhập nội dung `.env` backend sản xuất:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<db_user>:<db_pass>@<cluster>.mongodb.net/salon_duong_chi?retryWrites=true&w=majority
JWT_SECRET=long-random-string-at-least-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://salonduongchi.website,https://www.salonduongchi.website
```

Tạo tệp `.env` ở thư mục frontend `/home/ubuntu/salon-root/frontend/.env` để cấu hình API Base URL khi build:
```env
VITE_API_URL=https://api.salonduongchi.website
```

### 4. Cấu hình Nginx & SSL (Let's Encrypt) trên EC2
Cài đặt Nginx và Certbot trên Ubuntu:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Tạo file cấu hình site `/etc/nginx/sites-available/salonduongchi.website`:
```bash
sudo nano /etc/nginx/sites-available/salonduongchi.website
```
Nội dung file cấu hình Nginx:
```nginx
server {
    listen 80;
    server_name salonduongchi.website www.salonduongchi.website;

    location / {
        proxy_pass http://127.0.0.1:8080; # Cổng host của frontend container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.salonduongchi.website;

    location / {
        proxy_pass http://127.0.0.1:5000; # Cổng host của backend api container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Hỗ trợ WebSockets (Real-time updates)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Kích hoạt cấu hình và khởi động lại Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/salonduongchi.website /etc/nginx/sites-enabled/
sudo nginx -t # Kiểm tra cú pháp cấu hình
sudo systemctl restart nginx
```

Cấp chứng chỉ SSL miễn phí bằng Certbot:
```bash
sudo certbot --nginx -d salonduongchi.website -d www.salonduongchi.website -d api.salonduongchi.website
# Làm theo hướng dẫn trên màn hình để tự động cấu hình chuyển hướng HTTP -> HTTPS
```

### 5. Thiết lập CI/CD bằng GitHub Secrets
Vào repository trên GitHub (`dinhtron027/wepsalonhair`), điều hướng tới **Settings** -> **Secrets and variables** -> **Actions** và tạo:
* `VPS_HOST`: `3.1.105.97`
* `VPS_USER`: `ubuntu`
* `VPS_SSH_KEY`: Nội dung tệp Private Key SSH (`.pem`) dùng kết nối vào EC2.

Mỗi khi bạn thực hiện `git push` mã nguồn mới lên nhánh `main`, luồng GitHub Actions sẽ tự động kích hoạt SSH để kéo code và build chạy lại dự án trên EC2.

---

## 🧪 Kiểm Tra & Test Chất Lượng Code

Bạn có thể chạy các lệnh kiểm thử chất lượng code sau tại thư mục gốc:

```bash
# Quét lỗi code & định dạng (ESLint cho frontend)
npm run lint

# Kiểm tra tĩnh kiểu dữ liệu (TypeScript typecheck cho frontend)
npm run typecheck

# Chạy toàn bộ các Unit Tests của Backend
npm test

# Build production đóng gói code tối ưu hóa
npm run build
```

### Hướng dẫn kiểm tra sau khi Deploy:
1. **Xem trạng thái Docker containers**: `docker ps`
2. **Xem nhật ký hoạt động**: `docker compose logs -f`
3. **Kiểm tra trạng thái Nginx**: `sudo systemctl status nginx`
4. **Kiểm tra phản hồi của API**:
   `curl -i https://api.salonduongchi.website/api/health`
5. **Truy cập web**: Vào địa chỉ `https://salonduongchi.website` trên trình duyệt xem giao diện và dữ liệu CRM đã được hiển thị đầy đủ và ổn định.

---

## ⚠️ Lưu ý về Giá Dịch Vụ & Liên hệ
* Mọi mức giá của dịch vụ trên website đều hiển thị bằng đơn vị **VND** (ví dụ: `250.000 đ`).
* Mức giá hiển thị là **giá tham khảo cơ bản**. Chi phí dịch vụ thực tế có thể thay đổi linh hoạt tùy vào chiều dài, độ dày và mức độ hư tổn của tóc của khách hàng sau khi được chuyên viên tư vấn trực tiếp tại tiệm.
* Các liên kết tư vấn/chăm sóc khách hàng hoặc đặt lịch gấp có thể điều hướng trực tiếp sang số điện thoại Hotline hoặc link Zalo chính thức của Salon Dương Chí.