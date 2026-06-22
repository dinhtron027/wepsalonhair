# Salon Dương Chi - Hệ thống Website Quản Lý & Đặt Lịch Salon Tóc

Hệ thống quản lý và đặt lịch cho Salon tóc nữ cao cấp Dương Chi, bao gồm giao diện khách hàng (Public Website) và bảng điều khiển của quản trị viên (Admin Dashboard).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend
- **Framework:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, PostCSS
- **State Management:** Zustand (Client State), TanStack React Query (Server State)
- **Routing:** React Router DOM 6
- **Realtime:** Socket.IO Client
- **Hiệu ứng & UI:** Framer Motion, Lucide React, Swiper, React Big Calendar, React Hot Toast

### Backend
- **Framework:** Node.js, Express 5
- **Realtime:** Socket.IO
- **Xác thực & Bảo mật:** JWT (HS256), bcryptjs, Helmet, CORS, Express Rate Limit
- **Xác thực dữ liệu:** Joi
- **Gửi Email:** Nodemailer (SMTP)

### Database
- **Database:** MongoDB
- **Thư viện kết nối:** Mongoose ODM

### Infrastructure & CI/CD
- **Containerization:** Docker, Docker Compose
- **Web Server:** Nginx (Reverse Proxy & static serving)
- **SSL:** Let's Encrypt (Certbot)
- **CI/CD Workflow:** GitHub Actions (tự động hóa kiểm thử và deploy qua SSH)

---

## 📂 Cấu Trúc Thư Mục Tổng Thể (Directory Structure)

Dưới đây là sơ đồ cấu trúc thư mục chính của dự án để lập trình viên dễ dàng định vị các module:

```text
salon/
├── backend/                  # Mã nguồn phía Server (Express/Node.js)
│   ├── config/               # Cấu hình Database & Biến môi trường
│   ├── controllers/          # Xử lý Logic Requests & Responses (API Handlers)
│   ├── middleware/           # Các hàm trung gian (Xác thực JWT, Phân quyền, Giới hạn tần suất)
│   ├── models/               # Định nghĩa Mongoose Schemas (User, Service, Product, Booking, etc.)
│   ├── routes/               # Khai báo đường dẫn API Endpoints
│   ├── services/             # Lớp trung gian thực hiện Nghiệp vụ (Business Logic)
│   ├── shared/               # Định nghĩa lỗi dùng chung (Custom Errors)
│   ├── socket/               # Quản lý kết nối & Sự kiện Realtime Socket.IO
│   ├── tests/                # Bộ kiểm thử Unit Test cho Backend
│   ├── utils/                # Các hàm tiện ích bổ trợ (Validation, Seeding, Date, Logger)
│   ├── app.js                # Khởi tạo ứng dụng Express & Middleware chính
│   └── server.js             # Entrypoint khởi tạo server HTTP & Socket.IO
├── frontend/                 # Mã nguồn phía Client (React/Vite SPA)
│   ├── public/               # Tài nguyên tĩnh công khai (logo, ảnh, icon)
│   └── src/                  # Mã nguồn ứng dụng React
│       ├── components/       # Các components dùng chung (Navigation, Admin, Buttons...)
│       ├── hooks/            # Custom React Hooks
│       ├── layouts/          # Giao diện khung (AdminLayout, MainLayout)
│       ├── pages/            # Các trang giao diện (Home, Products, Booking, admin/...)
│       ├── routes/           # Định tuyến ứng dụng React Router DOM
│       ├── services/         # Client API services (Axios instance, queries, mutations)
│       ├── store/            # Quản lý Client State bằng Zustand
│       ├── App.tsx           # Component gốc cấu hình Routes & Providers
│       └── main.tsx          # Điểm khởi chạy React app
├── docker-compose.yml        # Cấu hình container chạy local/production
├── Dockerfile                # Dockerfile đóng gói Backend
└── package.json              # Khai báo script và thư viện phía root (Backend dev)
```

---

## 🛠️ Yêu Cầu Môi Trường & Cài Đặt

### 1. Yêu cầu môi trường
- **Node.js:** Phiên bản 18+ (Khuyên dùng v22 hoặc v23)
- **MongoDB:** Phiên bản Community Server chạy local hoặc tài khoản MongoDB Atlas Cloud

### 2. Cài đặt các gói phụ thuộc
Cần cài đặt thư viện tại thư mục gốc (Root) của Backend và thư mục `frontend/` của Client:

```bash
# Cài đặt dependencies tại thư mục gốc (cho backend)
npm install

# Di chuyên vào thư mục frontend và cài đặt dependencies
cd frontend
npm install --legacy-peer-deps
```

> [!IMPORTANT]
> Khi cài đặt dependencies cho frontend, bạn **bắt buộc** phải sử dụng flag `--legacy-peer-deps`. Điều này là do thư viện đăng nhập bằng Facebook (`react-facebook-login`) sử dụng phiên bản React cũ hơn, gây ra xung đột phiên bản khi npm phân tích cây phụ thuộc.

### 3. Hướng dẫn chạy nhanh MongoDB local (Lựa chọn tiện lợi)
Nếu máy bạn chưa cài đặt sẵn MongoDB, cách nhanh nhất là khởi chạy cơ sở dữ liệu qua Docker:

```bash
# Tạo và chạy một container MongoDB local trên cổng mặc định 27017
docker run -d --name mongo-salon -p 27017:27017 mongo:latest
```

---

## ⚙️ Biến Môi Trường (.env)

Tạo các tệp cấu hình `.env` dựa theo các tệp mẫu có sẵn trong dự án:

### 1. Backend (Tạo tệp `.env` tại thư mục gốc `salon/`)
Sao chép cấu trúc từ tệp [.env.example](file:///home/dinh_trong/salon/.env.example) và cấu hình các giá trị sau:

| Tên biến | Kiểu dữ liệu | Mô tả / Giá trị mặc định |
| :--- | :--- | :--- |
| `NODE_ENV` | String | Chế độ chạy ứng dụng (`development` \| `production` \| `test`) |
| `PORT` | Number | Cổng chạy backend API (Mặc định: `5000`) |
| `MONGODB_URI` | String | Đường dẫn kết nối MongoDB (Mặc định: `mongodb://127.0.0.1:27017/salon-duong-chi`) |
| `JWT_SECRET` | String | Khóa bí mật dùng để mã hóa mã JWT Token (Tối thiểu 16 ký tự) |
| `JWT_EXPIRES_IN` | String | Thời gian hiệu lực của JWT token (Mặc định: `7d`) |
| `RATE_LIMIT_WINDOW_MS`| Number | Khoảng thời gian giới hạn API Rate Limit (ms) (Ví dụ: `900000` = 15 phút) |
| `RATE_LIMIT_MAX` | Number | Số request tối đa được gửi trong window đối với API thông thường (Ví dụ: `300`) |
| `AUTH_RATE_LIMIT_MAX` | Number | Số request tối đa được gửi đối với API xác thực như Login/Register (Ví dụ: `20`) |
| `FRONTEND_URL` | String | Danh sách URL Frontend được CORS cho phép (Ví dụ: `http://localhost:5173`) |
| `SMTP_HOST` | String | Host máy xuất phát gửi email SMTP (Ví dụ: `smtp.gmail.com`) |
| `SMTP_PORT` | Number | Port máy chủ gửi email (Thường là `587` cho TLS) |
| `SMTP_USER` | String | Tài khoản gửi email của hệ thống |
| `SMTP_PASS` | String | Mật khẩu ứng dụng gửi email (App Password) |
| `EMAIL_FROM` | String | Nhãn và địa chỉ email gửi đi (Ví dụ: `Salon Duong Chi <no-reply@salon.local>`) |
| `ZALO_WEBHOOK_URL` | String | URL Webhook liên kết với hệ thống Zalo |
| `ZALO_ACCESS_TOKEN` | String | Access Token của Zalo Official Account |
| `PAYMENT_PROVIDER` | String | Cổng thanh toán hoạt động (`cash` \| `momo` \| `vnpay`) |
| `PAYMENT_MOCK_ENABLED`| Boolean | Cho phép giả lập kết quả thanh toán khi thử nghiệm (`true` \| `false`) |
| `VNPAY_TMN_CODE` | String | Mã Terminal của đối tác VNPay |
| `VNPAY_HASH_SECRET` | String | Khóa bảo mật băm dữ liệu của VNPay |
| `MOMO_PARTNER_CODE` | String | Mã Partner của ứng dụng MoMo |
| `MOMO_ACCESS_KEY` | String | Access Key được MoMo cấp |
| `MOMO_SECRET_KEY` | String | Secret Key kết nối API của MoMo |
| `DEFAULT_ADMIN_NAME` | String | Tên Admin mặc định khởi tạo khi seed dữ liệu |
| `DEFAULT_ADMIN_EMAIL`| String | Email Admin dùng đăng nhập (Mặc định: `admin@duongchi.com`) |
| `DEFAULT_ADMIN_PHONE`| String | Số điện thoại Admin dùng đăng nhập (Mặc định: `0900000000`) |
| `DEFAULT_ADMIN_PASSWORD`| String| Mật khẩu của tài khoản Admin mặc định |
| `DEFAULT_STAFF_...` | Mix | Thông tin tài khoản Nhân viên mẫu |
| `DEFAULT_CUSTOMER_...`| Mix | Thông tin tài khoản Khách hàng chạy thử |
| `GOOGLE_CLIENT_ID` | String | Google OAuth Client ID dùng để xác thực tại Backend |

### 2. Frontend (Tạo tệp `.env` tại thư mục `frontend/`)
Sao chép cấu trúc từ tệp [frontend/.env.example](file:///home/dinh_trong/salon/frontend/.env.example) và cấu hình các giá trị sau:

| Tên biến | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `VITE_API_URL` | String | URL của Backend API (Local: `http://localhost:5000`, Production: `https://api.salonduongchi.website`) |
| `VITE_GOOGLE_CLIENT_ID`| String | Google OAuth Client ID để hiển thị nút Đăng nhập bằng Google |

---

## 🏃 Hướng Dẫn Chạy Dự Án Ở Môi Trường Local (Development)

Để phát triển dự án hoặc chạy thử nghiệm trực tiếp, hãy khởi chạy backend và frontend theo các bước sau:

### Bước 1: Khởi chạy MongoDB
Đảm bảo dịch vụ cơ sở dữ liệu MongoDB đang hoạt động tại máy của bạn (hoặc container Docker đang chạy).

### Bước 2: Nạp dữ liệu Seed ban đầu (Chỉ chạy ở lần khởi động đầu tiên)
Tại thư mục gốc `salon/`, chạy lệnh sau để nạp dữ liệu mặc định (gồm 30 dịch vụ nữ, tài khoản admin, staff, và khách hàng mẫu):
```bash
npm run seed
```

### Bước 3: Chạy ứng dụng

#### Cách 1: Chạy song song cả Frontend & Backend (Khuyên dùng)
Tại thư mục gốc `salon/`, chạy lệnh:
```bash
npm run dev
```
Hệ thống sử dụng thư viện `concurrently` để tự động khởi chạy song song cả hai phía:
- **Backend API:** Khởi động tại `http://localhost:5000`
- **Frontend Web:** Khởi động tại `http://localhost:5173` (hoặc `http://localhost:5174` nếu cổng 5173 bị chiếm dụng)

#### Cách 2: Chạy độc lập trong các Terminal riêng biệt (Thuận tiện khi debug)
- **Chạy Backend:** Mở một Terminal tại thư mục gốc `salon/` và chạy:
  ```bash
  # Chạy backend ở chế độ nodemon tự động reload khi code thay đổi
  npm run start:dev
  ```
- **Chạy Frontend:** Mở một Terminal khác, di chuyển vào thư mục `frontend/` và chạy:
  ```bash
  npm run dev
  ```

---

## 🐳 Khởi Chạy Với Docker / Docker Compose

Dự án hỗ trợ đóng gói Docker toàn phần giúp bạn triển khai đồng bộ ở local hoặc production chỉ với một câu lệnh.

### Khởi chạy môi trường:
Tại thư mục gốc, tạo tệp `.env` phù hợp, sau đó chạy lệnh:
```bash
# Khởi tạo và chạy ngầm các dịch vụ (Database, Backend, Frontend qua Nginx)
docker compose up -d --build
```
Hệ thống sẽ chạy 3 containers:
1. `mongodb` (Port `27017`)
2. `backend` (Port `5000`)
3. `frontend` (Port `8080` thông qua Nginx)

### Lệnh hữu ích với Docker:
- **Xem logs của tất cả dịch vụ:**
  ```bash
  docker compose logs -f
  ```
- **Nạp seed dữ liệu mẫu bên trong Docker container:**
  ```bash
  docker compose exec backend npm run seed
  ```
- **Dừng và xóa các container:**
  ```bash
  docker compose down
  ```

---

## 🧪 Kiểm Tra & Test Chất Lượng Code

Bạn có thể chạy các lệnh kiểm thử chất lượng code sau tại thư mục gốc của dự án:

```bash
# Quét lỗi code & định dạng (ESLint cho frontend)
npm run lint

# Kiểm tra tĩnh kiểu dữ liệu (TypeScript typecheck cho frontend)
npm run typecheck

# Chạy toàn bộ các Unit Tests của Backend
npm test

# Build production đóng gói code frontend tối ưu hóa
npm run build
```

### 📱 Kiểm thử Giao diện Di động (Mobile Responsive UI Testing)

Để kiểm tra giao diện Admin hiển thị và hoạt động mượt mà trên các thiết bị di động (mobile & tablet):
1. **Sử dụng Trình duyệt (Chrome/Firefox/Edge DevTools):**
   - Mở Dashboard Admin (`/admin`).
   - Nhấn phím `F12` (hoặc chuột phải chọn **Inspect**).
   - Click vào biểu tượng **Toggle Device Toolbar** (hình điện thoại/máy tính bảng) ở góc trên bên trái cửa sổ Inspect (hoặc nhấn `Ctrl + Shift + M`).
   - Chọn các thiết bị mô phỏng phổ biến để kiểm tra các breakpoint:
     - **320px** (Mobile nhỏ - SE)
     - **375px / 390px / 414px** (Mobile trung bình/lớn - iPhone X/12/Pro Max, Samsung Galaxy)
     - **768px** (Tablet - iPad Mini)
     - **1024px** (Tablet Pro / Laptop nhỏ - iPad Pro)
2. **Các điểm chính cần kiểm tra:**
   - **Thanh Sidebar/Drawer trên Mobile:** Bấm vào nút hamburger ở Topbar để trượt Sidebar ra ngoài. Kiểm tra lớp overlay mờ (backdrop) phía sau, khi click vào backdrop hoặc click chọn một trang điều hướng bất kỳ, Sidebar sẽ tự động đóng lại để giải phóng không gian màn hình.
   - **Nút Đăng xuất ở Header:** Trên mobile, nút này được thu gọn thành icon đơn giản để tiết kiệm diện tích Topbar.
   - **Trang Lịch Hẹn (Bookings):** Tự động chuyển đổi giữa Tab **Lịch biểu (Calendar)** và **Danh sách (List)**. Trên thiết bị di động, mặc định mở Tab **Danh sách** dạng các card cuộn dọc hiển thị thông tin rõ ràng và có các nút cập nhật trạng thái lớn, dễ chạm.
   - **Trang Dịch Vụ, Sản Phẩm, Đơn Hàng:** Tự động ẩn các bảng Table cồng kềnh và chuyển đổi sang giao diện dạng thẻ **Card** trực quan, rõ ràng, không bị tràn ngang toàn trang.
   - **Trang Kho Hàng:** Các bảng dữ liệu chi tiết được bọc trong container cho phép cuộn ngang mượt mà, với thuộc tính `whitespace-nowrap` giúp dữ liệu không bị bẻ dòng gây biến dạng bảng biểu.

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

### 6. Hướng dẫn kiểm tra sau khi Deploy:
1. **Xem trạng thái Docker containers:** `docker ps`
2. **Xem nhật ký hoạt động:** `docker compose logs -f`
3. **Kiểm tra trạng thái Nginx:** `sudo systemctl status nginx`
4. **Kiểm tra phản hồi của API:**
   `curl -i https://api.salonduongchi.website/api/health`
5. **Truy cập web:** Vào địa chỉ `https://salonduongchi.website` trên trình duyệt để kiểm tra hoạt động thực tế.

---

## ⚠️ Khắc Phục Sự Cố Thường Gặp (Troubleshooting)

### 1. Xung đột dependency khi chạy `npm install` tại thư mục frontend
* **Hiện tượng:** Quá trình cài đặt package bị dừng lại kèm nhiều cảnh báo lỗi liên quan đến `peer dependency`.
* **Nguyên nhân:** Thư viện SDK Facebook cũ chưa được cập nhật tương thích với cây phụ thuộc mới của npm.
* **Cách xử lý:** Bắt buộc chạy lệnh cài đặt kèm cờ bỏ qua xung đột:
  ```bash
  npm install --legacy-peer-deps
  ```

### 2. Lỗi kết nối Cơ sở dữ liệu (`MongooseServerSelectionError`)
* **Hiện tượng:** Chạy `npm run dev` hoặc `npm run seed` bị crash và báo lỗi không kết nối được MongoDB.
* **Nguyên nhân:** Dịch vụ MongoDB local chưa được khởi chạy hoặc sai cấu hình URI kết nối.
* **Cách xử lý:** 
  - Đảm bảo MongoDB đang chạy trên cổng `27017` bằng cách kiểm tra status dịch vụ máy chủ hoặc chạy nhanh qua Docker container (Xem phần cài đặt nhanh MongoDB bằng Docker ở trên).
  - Kiểm tra biến `MONGODB_URI` trong tệp `.env` đã trỏ đúng IP và cổng (ví dụ: `mongodb://127.0.0.1:27017/wepsalonhair`).

### 3. Lỗi chặn truy cập API (`Blocked by CORS Policy`)
* **Hiện tượng:** Giao diện web hiển thị lỗi kết nối hoặc các API backend bị trình duyệt chặn, báo lỗi CORS.
* **Nguyên nhân:** Địa chỉ URL của Frontend chạy local/production không khớp với khai báo được phép kết nối tại cấu hình Backend.
* **Cách xử lý:** Mở tệp `.env` tại thư mục gốc, cập nhật biến `FRONTEND_URL` trùng khớp với địa chỉ chạy thực tế của Frontend (Ví dụ: `FRONTEND_URL=http://localhost:5173` hoặc `FRONTEND_URL=http://127.0.0.1:5173`).

### 4. Lỗi xung đột cổng mạng (Port `5000` hoặc `5173` already in use)
* **Hiện tượng:** Khởi động Backend báo lỗi `EADDRINUSE: address already in use :::5000`.
* **Nguyên nhân:** Đang có tiến trình chạy ngầm chiếm dụng cổng mạng.
* **Cách xử lý:**
  - Trên Linux/MacOS: Chạy lệnh `lsof -i :5000` để tìm PID của tiến trình, sau đó tắt bằng lệnh `kill -9 <PID>`.
  - Hoặc bạn có thể đổi giá trị `PORT` trong tệp `.env` backend thành cổng khác (ví dụ: `5001`), sau đó điều chỉnh cấu hình tương ứng ở frontend.

---

## 📘 Hướng Dẫn Vận Hành Cho Quản Trị Viên (Admin Guide)

Dưới đây là hướng dẫn chi tiết cách tạo và quản lý dịch vụ mới trên trang quản trị Admin (`/admin/services`):

### 1. Tạo Dịch Vụ Mới
Truy cập vào trang quản trị Dịch Vụ, form tạo mới được chia thành các nhóm trường dữ liệu trực quan:
- **Thông Tin Cơ Bản**:
  - **Tên dịch vụ**: Tên hiển thị trên trang khách hàng (Ví dụ: *Uốn Sóng Lơi Hàn Quốc*).
  - **Danh mục dịch vụ**: Chọn một trong các nhóm danh mục cố định (Cắt & Tạo Kiểu Nữ, Uốn Tóc Nữ, Duỗi Tóc Nữ, Nhuộm Tóc Nữ, Phục Hồi Tóc, Gội Đầu Dưỡng Sinh, Combo Làm Đẹp). **Quy tắc quan trọng**: Hệ thống sử dụng danh mục cố định này để tự động phân phối dịch vụ vào các trang danh mục tương ứng của khách hàng. Không được chỉnh sửa danh mục ngoài danh sách này.
  - **Mô tả dịch vụ**: Đoạn giới thiệu ngắn về đặc tính, công dụng, đối tượng phù hợp của dịch vụ.
- **Giá & Thời Lượng**:
  - **Giá gốc (VNĐ)**: Nhập số nguyên dương (không sử dụng dấu chấm/phẩy).
  - **Giảm giá chung (%)**: Nhập từ 0 đến 100 nếu muốn giảm giá dịch vụ này mọi lúc.
  - **Thời lượng thực hiện**: Số phút dự kiến (Ví dụ: *60* phút).
- **Hình Ảnh**:
  - **Ảnh dịch vụ (Link ảnh URL)**: Đường dẫn tuyệt đối của hình ảnh (`https://...`). Xem hướng dẫn upload ảnh lên Cloudinary để lấy link URL ảnh tại mục [Nguồn lưu trữ ảnh](#cloudinary).

### 2. Thiết Lập Khuyến Mãi Giờ Vàng
Khuyến mãi giờ vàng (Happy Hour) cho phép thiết lập ưu đãi giảm giá tự động vào các khung giờ cố định trong tuần để thu hút khách hàng đặt lịch vào giờ thấp điểm:
- Gạt nút **"Kích hoạt"** trong phần *Khuyến mãi giờ vàng*.
- **Tên chương trình**: Tên chương trình hiển thị cho khách hàng (Ví dụ: *Ưu đãi buổi sáng*).
- **Mức giảm giá giờ vàng (%)**: Nhập số phần trăm giảm giá (Ví dụ: *15* tương đương giảm 15%).
- **Khung giờ áp dụng**: Chọn giờ bắt đầu và kết thúc (Giờ kết thúc phải lớn hơn giờ bắt đầu).
- **Ngày áp dụng**: Click chọn các ngày trong tuần (T2 - CN) muốn áp dụng khuyến mãi.

### 3. Quy Tắc Nhập Dữ Liệu và Validation
Hệ thống tích hợp validation tự động cả ở Frontend và Backend:
- Tên dịch vụ là duy nhất (không được tạo 2 dịch vụ trùng tên).
- Thời lượng tối thiểu phải là 15 phút.
- Khi kích hoạt giờ vàng, bắt buộc phải điền đầy đủ các thông tin: Tên chương trình, mức giảm giá, giờ bắt đầu/kết thúc và ít nhất một ngày áp dụng.

<a name="cloudinary"></a>
### 4. Hướng Dẫn Upload Ảnh Lên Cloudinary Để Lấy Link
Vì dự án chưa tích hợp API upload trực tiếp từ mã nguồn, để có link ảnh dạng `https://...` hợp lệ:
1. Đăng nhập vào trang quản trị [Cloudinary Console](https://cloudinary.com).
2. Vào mục **Assets (Media Library)** ở thanh menu bên trái.
3. Nhấp nút **Upload** ở góc trên bên phải để tải ảnh từ máy tính của bạn lên.
4. Di chuột vào ảnh đã upload, click biểu tượng **Link (Copy URL)** để copy link ảnh tuyệt đối.
5. Dán link này vào ô nhập liệu **Link hình ảnh** trong form tạo dịch vụ.

---

## 🚀 Tính Năng Mới & Lịch Sử Nâng Cấp (Changelog)


Dưới đây là chi tiết các hạng mục tính năng nâng cấp lớn liên quan đến giao dịch dịch vụ tóc nữ và hệ thống quản trị CRM khách hàng:

### 1. Thanh Điều Hướng Dropdown 10 Mục
* **Dropdown Menu Lưới 2 Cột (Desktop):** Giao diện Dropdown dịch vụ được mở rộng sang dạng lưới 2 cột tinh tế (`min-width: 460px`), hiển thị đầy đủ 10 dịch vụ/chức năng chính.
* **Hamburger Menu (Mobile):** Hỗ trợ phân cấp cây thư mục dịch vụ động rõ ràng trên các thiết bị di động.
* **10 Liên Kết Điều Hướng:**
  * **Trải Nghiệm** (`/services/experience`) - Quy trình phục vụ khách hàng tiêu chuẩn 5 sao.
  * **Chăm Dưỡng** (`/services/care`) - Bí quyết chăm sóc tóc và liệu trình khuyên dùng.
  * **Bảng Giá** (`/pricing`) - Tổng hợp bảng giá dịch vụ trực quan.
  * **7 Danh Mục Dịch Vụ Nữ:**
    1. Cắt & Tạo Kiểu Nữ (`/services/category/haircut`)
    2. Uốn Tóc Nữ (`/services/category/perm`)
    3. Duỗi Tóc Nữ (`/services/category/straightening`)
    4. Nhuộm Tóc Nữ (`/services/category/color`)
    5. Phục Hồi Tóc (`/services/category/treatment`)
    6. Gội Đầu Dưỡng Sinh (`/services/category/shampoo`)
    7. Combo Làm Đẹp (`/services/category/combo`)

### 2. Quản Lý Dữ Liệu Dịch Vụ Hệ Thống (Backend Schema & Idempotent Seed)
* **Unified Schema:** Tệp [Service.js](file:///home/dinh_trong/salon/backend/models/Service.js) định nghĩa cấu trúc dữ liệu dịch vụ chuẩn hóa gồm: `name`, `slug`, `category`, `categorySlug`, `description`, `price`, `duration`, `durationMinutes`, `suitableFor` (mảng đối tượng phù hợp), `benefits` (mảng lợi ích), `isFeatured` (dịch vụ nổi bật).
* **Mongoose Middleware:** Tích hợp hook `pre('validate')` tự động chuyển đổi tên thành `slug`, ánh xạ danh mục tiếng Việt sang `categorySlug` chuẩn tiếng Anh, và đồng bộ tự động giữa `duration` và `durationMinutes` để tương thích ngược với Admin Dashboard cũ.
* **Idempotent Seeding:** Lệnh `npm run seed` tự động nạp **30 dịch vụ** cao cấp dành cho nữ vào cơ sở dữ liệu. Lệnh này chạy idempotent (không tạo bản ghi trùng lặp khi chạy nhiều lần nhờ cơ chế tìm và cập nhật theo `slug` hoặc chèn mới nếu chưa tồn tại).

### 3. Các Trang Giao Diện Mới (Frontend Pages)
* **Trang Trải Nghiệm** (`/services/experience`): Sử dụng hiệu ứng dòng thời gian (`framer-motion`) mô phỏng quy trình 6 bước phục vụ khách hàng chu đáo và sang trọng.
* **Trang Chăm Dưỡng** (`/services/care`): Cung cấp các thông tin hữu ích về chăm sóc tóc hư tổn, dưỡng màu và các liệu trình chuyên sâu tại salon.
* **Trang Chi Tiết Danh Mục** (`/services/category/:categorySlug`): Tự động tải danh sách dịch vụ thuộc danh mục tương ứng từ backend, hiển thị dưới dạng card dịch vụ hiện đại có hiển thị đối tượng phù hợp, lợi ích dịch vụ, và nút "Đặt lịch ngay".
* **Trang Bảng Giá** (`/pricing`): Phân nhóm động các dịch vụ theo danh mục, hiển thị rõ ràng thông tin giá cả đi kèm cảnh báo: *Giá dịch vụ trên mang tính chất tham khảo, chi phí thực tế sẽ điều chỉnh linh hoạt tùy thuộc vào độ dài, độ dày và tình trạng sức khỏe thực tế của tóc.*
* **Hỗ Trợ Pre-select Dịch Vụ Khi Đặt Lịch** (`/booking?service=<slug>`): Trang đặt lịch tự động chọn trước dịch vụ khách hàng mong muốn dựa trên tham số query từ đường dẫn.

### 4. Salon Customer CRM (Hệ thống Quản lý Khách hàng Chuyên nghiệp)
Hệ thống nâng cấp trang quản trị **Khách hàng** (`/admin/customers`) từ danh sách cơ bản thành cổng CRM đầy đủ:
* **Hồ sơ CRM tổng hợp:** Hiển thị thẻ chỉ số (Summary CRM Cards) gồm Tổng số khách, Khách mới, Khách VIP, Khách cần chăm sóc, Doanh thu và Khách lâu chưa quay lại.
* **Bộ lọc nâng cao & Phân khúc tự động (CRM Segmentation):**
  * Lọc theo tên, số điện thoại, email, stylist, trạng thái lịch hẹn, khoảng ngày đặt lịch.
  * Phân khúc khách hàng tự động và gắn thẻ tag: `new` (Mới), `regular` (Thường xuyên), `vip` (VIP - từ 10 cuộc hẹn hoặc chi tiêu >= 5M), `inactive` (Lâu chưa quay lại - quá 60 ngày), `high_value` (Chi tiêu cao - trên 3M), `color_customer` (Từng nhuộm), `treatment_needed` (Cần phục hồi).
* **Quản lý ghi chú chăm sóc (Customer Note):** Hỗ trợ thêm ghi chú nội bộ, tư vấn, hoặc khiếu nại với dòng thời gian (Timeline) rõ ràng.
* **Lưu trữ công thức nhuộm (Hair Formula):** Ghi lại chi tiết thuốc nhuộm, oxy, mức độ nền tóc trước/sau dịch vụ để đảm bảo kết quả đồng đều cho những lần làm tóc tiếp theo.
* **Thống kê sản phẩm đã mua:** Quét tự động lịch sử đơn hàng để gợi ý các sản phẩm dưỡng tóc khách hàng đã từng sử dụng.
* **Đặt lịch lại nhanh (Quick Rebook):** Tạo lịch hẹn trực tiếp cho khách hàng ngay trong hồ sơ chi tiết mà không cần tải lại trang. Hỗ trợ khách lẻ vãng lai dựa trên số điện thoại/email mà không bắt buộc có mã tài khoản (User Object ID) trên hệ thống.

### 5. Hệ thống Xác thực Tài khoản Mới (Email/Password & Google Login)
Hệ thống xác thực người dùng được cải tiến toàn diện:
* **Tạm ẩn Đăng nhập bằng Facebook**: Để tối ưu hóa và dọn dẹp thư viện, chức năng đăng nhập bằng Facebook đã được ẩn trên giao diện (sẽ được tích hợp lại ở phiên bản tiếp theo).
* **Đăng ký tài khoản mới**: Người dùng có thể đăng ký tài khoản khách hàng mới qua form `/register` gồm: *Họ tên*, *Email*, *Số điện thoại (tùy chọn)*, *Mật khẩu* và *Xác nhận mật khẩu*.
  - **Mật khẩu an toàn**: Mật khẩu của người dùng được tự động hash bảo mật một chiều bằng `bcryptjs` trước khi lưu trữ vào MongoDB.
  - **Xác thực Backend**: Tích hợp kiểm tra email trùng lặp và xác nhận khớp mật khẩu tập trung bằng Joi schema tại API `POST /api/auth/register`.
* **Đồng bộ hóa Google Login & Liên kết email**: Sau khi xác thực Google OAuth thành công, hệ thống sẽ tự động liên kết với tài khoản local nếu trùng email, tránh tạo tài khoản trùng lặp và giữ nguyên quyền lợi khách hàng.
* **Cá nhân hóa lời chào mừng trên Navbar**:
  - Giao diện Header của Desktop và Mobile tự động chuyển đổi từ nút *"Đăng Nhập"* thành lời chào cá nhân hóa *"Xin chào, {Tên}"* (hoặc fallback sang email trước dấu `@`) kèm theo ảnh đại diện (avatar) Google thu nhỏ có viền Rose đặc trưng của tiệm.
  - Sau khi đăng nhập thành công, session được lưu trữ an toàn trong `localStorage` và tự động khôi phục thông qua API `GET /api/auth/me` mỗi khi tải lại trang, giúp duy trì phiên làm việc không bị gián đoạn.
* **Hướng dẫn kiểm thử thủ công**:
  1. Truy cập trang Đăng nhập (`/login`) -> Click *"Đăng ký ngay"* -> Chuyển sang `/register`.
  2. Điền thông tin đăng ký (thử nhập mật khẩu không khớp hoặc email đã tồn tại để xem thông báo lỗi hiển thị trực quan).
  3. Đăng ký thành công -> Hệ thống tự động lưu session đăng nhập và chuyển hướng bạn về Trang chủ.
  4. Navbar & Mobile Menu lập tức hiển thị *"Xin chào, {Họ tên}"* cùng nút *"Đăng xuất"*.
  5. Reload (F5) trang -> Xác nhận phiên đăng nhập vẫn được duy trì mượt mà.
  6. Click nút *"Đăng xuất"* -> Hệ thống xóa sạch dữ liệu session trong bộ nhớ và chuyển hướng bạn về trang Đăng nhập.