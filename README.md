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

## ⚡ Khởi Chạy Nhanh Trong 3 Phút (Quick Start for Beginners)

Dành cho người mới tải dự án về muốn chạy và trải nghiệm ngay trên máy tính cá nhân (Local):

### Bước 1: Cài đặt thư viện (Dependencies)
Mở Terminal tại thư mục gốc của dự án (`salon/`) và chạy:

```bash
# 1. Cài đặt dependencies cho backend tại thư mục gốc
npm install

# 2. Cài đặt dependencies cho frontend (bắt buộc cờ --legacy-peer-deps)
cd frontend && npm install --legacy-peer-deps && cd ..
```

> [!IMPORTANT]
> Khi cài đặt dependencies cho frontend, bạn **bắt buộc** phải sử dụng flag `--legacy-peer-deps`. Điều này là do thư viện đăng nhập bằng Facebook (`react-facebook-login`) sử dụng phiên bản React cũ hơn, gây ra xung đột phiên bản khi npm phân tích cây phụ thuộc.

---

### Bước 2: Tạo tệp cấu hình môi trường (.env)
Dự án đã cấu hình sẵn giá trị mặc định tối ưu cho môi trường chạy local, bạn chỉ cần tạo tệp `.env` bằng 2 lệnh copy:

```bash
# Tạo file .env cho Backend từ file mẫu
cp .env.example .env

# Tạo file .env cho Frontend từ file mẫu
cp frontend/.env.example frontend/.env
```

*(Các giá trị mặc định trong `.env.example` và `frontend/.env.example` đã trỏ sẵn vào `http://localhost:5000` và MongoDB local, bạn không cần phải thay đổi gì nếu chạy mặc định).*

---

### Bước 3: Khởi chạy Database MongoDB
Bạn có thể chọn **1 trong 3 cách** sau để có cơ sở dữ liệu:

* **Cách A (Dễ nhất - Không cần cài MongoDB):** Dùng cụm [MongoDB Atlas Cloud](https://cloud.mongodb.com/) miễn phí. Mở file `.env` và dán chuỗi kết nối vào dòng `MONGODB_URI` (Ví dụ: `MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/salon-duong-chi?retryWrites=true&w=majority"`).
* **Cách B (Dùng Docker nếu máy có Docker):**
  ```bash
  docker run -d --name mongo-salon -p 27017:27017 mongo:7-jammy
  ```
* **Cách C (Dùng MongoDB cài trực tiếp trên máy):** Khởi động dịch vụ MongoDB service trên máy tính của bạn (cổng mặc định `27017`).

---

### Bước 4: Nạp dữ liệu mẫu ban đầu (Seed Data - Bắt buộc)
Lần đầu tiên khởi chạy, database chưa có dữ liệu. Hãy chạy lệnh sau để tự động tạo 30 dịch vụ nữ, sản phẩm, các danh mục và tài khoản quản trị viên:

```bash
npm run seed
```

---

### Bước 5: Chạy ứng dụng song song
Tại thư mục gốc `salon/`, chỉ cần gõ:

```bash
npm run dev
```

Hệ thống sẽ tự động khởi động đồng thời cả Backend và Frontend:
* 🌐 **Giao diện Khách hàng (Frontend):** [http://localhost:5173](http://localhost:5173)
* 🔌 **Backend API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Tài Khoản Trải Nghiệm Mẫu (Demo Credentials)

Sau khi chạy lệnh `npm run seed`, hệ thống đã sẵn sàng với 3 nhóm tài khoản phân quyền:

| Vai trò (Role) | Email đăng nhập | Mật khẩu mặc định | Quyền hạn & Chức năng |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@salonduongchi.vn` | `Admin@123456` | Toàn quyền quản trị Salon, xem Bảng điều khiển, Báo cáo doanh thu, CRM khách hàng, Quản lý kho, Quản lý dịch vụ/sản phẩm tại `/admin` |
| **Nhân viên (Staff)** | `staff@salonduongchi.vn` | `Staff@123456` | Xem lịch hẹn salon, hỗ trợ khách hàng, cập nhật trạng thái làm tóc |
| **Khách hàng (Customer)** | `customer@salonduongchi.vn`| `Customer@123456`| Xem danh mục, chọn dịch vụ, đặt lịch hẹn trực tuyến, lưu công thức chăm sóc tóc |

> [!TIP]
> Để đăng nhập quyền Admin: Truy cập [http://localhost:5173/login](http://localhost:5173/login) $\rightarrow$ Đăng nhập với tài khoản Admin ở trên $\rightarrow$ Menu trên cùng sẽ xuất hiện nút **Quản trị Salon** (hoặc bạn có thể truy cập thẳng [http://localhost:5173/admin](http://localhost:5173/admin)).

---

## ⚙️ Biến Môi Trường (.env) Chi Tiết

### 1. Phân loại biến môi trường Backend (`.env` tại thư mục gốc)

#### Nhóm A: Bắt buộc tối thiểu (Minimal Setup để chạy local)
Chỉ cần cấu hình nhóm này là toàn bộ website đã chạy đầy đủ tính năng cốt lõi:
| Tên biến | Kiểu dữ liệu | Giá trị mặc định (Local) | Mô tả |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | `development` | Chế độ chạy ứng dụng |
| `PORT` | Number | `5000` | Cổng HTTP Server của Backend API |
| `MONGODB_URI` | String | `mongodb://127.0.0.1:27017/salon-duong-chi` | Chuỗi kết nối MongoDB (Local hoặc Atlas) |
| `JWT_SECRET` | String | `salon_secret_key_1234567890_dev` | Khóa bí mật ký mã token JWT (tối thiểu 16 ký tự) |
| `FRONTEND_URL` | String | `http://localhost:5173` | Domain Frontend được phép gọi API (CORS whitelist) |

#### Nhóm B: Tùy chọn nâng cao (Optional Services)
Nếu không điền các biến này, hệ thống sẽ tự động tắt tính năng phụ tương ứng mà **không gây lỗi crash ứng dụng**:
| Nhóm tính năng | Tên biến | Mô tả |
| :--- | :--- | :--- |
| **Google OAuth** | `GOOGLE_CLIENT_ID`<br>`GOOGLE_CLIENT_SECRET`<br>`GOOGLE_CALLBACK_URL` | Cho phép đăng nhập 1-chạm bằng tài khoản Google (Lấy từ Google Cloud Console) |
| **Lưu trữ ảnh Cloud** | `CLOUDINARY_CLOUD_NAME`<br>`CLOUDINARY_API_KEY`<br>`CLOUDINARY_API_SECRET` | Upload ảnh dịch vụ / sản phẩm trực tiếp từ Admin lên Cloudinary |
| **Cổng thanh toán** | `PAYMENT_PROVIDER`<br>`VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`<br>`MOMO_PARTNER_CODE`, `MOMO_ACCESS_KEY`, `MOMO_SECRET_KEY` | Tích hợp cổng thanh toán trực tuyến MoMo hoặc VNPay (Mặc định: `cash` tiền mặt) |
| **Gửi Email SMTP** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Gửi email xác nhận đặt lịch tự động cho khách hàng qua Gmail SMTP |

### 2. Frontend (`frontend/.env`)
| Tên biến | Giá trị Local | Giá trị Production | Mô tả |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:5000` | `https://api.salonduongchi.website` | Địa chỉ Backend API để trình duyệt gọi dữ liệu |
| `VITE_GOOGLE_CLIENT_ID`| (Để trống hoặc điền ID) | (ID Google Console) | Hiển thị nút đăng nhập Google ở giao diện Client |

---

## 🏃 Các Chế Độ Chạy Dự Án (Development Modes)

### Cách 1: Chạy song song cả Frontend & Backend (Khuyên dùng)
Tại thư mục gốc `salon/`, chạy lệnh:
```bash
npm run dev
```
Hệ thống sử dụng thư viện `concurrently` để tự động khởi chạy song song cả hai phía:
- **Backend API:** Khởi động tại `http://localhost:5000`
- **Frontend Web:** Khởi động tại `http://localhost:5173` (hoặc `http://localhost:5174` nếu cổng 5173 bị chiếm dụng)

### Cách 2: Chạy độc lập trong các Terminal riêng biệt (Dễ debug)
- **Terminal 1 - Chạy Backend:**
  ```bash
  # Chạy backend với chế độ watch tự động reload khi sửa code
  npm run dev:backend
  ```
- **Terminal 2 - Chạy Frontend:**
  ```bash
  # Chạy frontend Vite development server
  npm run dev:frontend
  ```

---

## 🐳 Khởi Chạy Toàn Bộ Bằng Docker Compose

Dự án hỗ trợ đóng gói Docker toàn phần giúp bạn chạy trọn gói Database, Backend và Frontend mà không cần cài Node.js hay MongoDB lên máy:

```bash
# 1. Khởi tạo và chạy ngầm toàn bộ dịch vụ
docker compose up -d --build

# 2. Nạp dữ liệu mẫu vào database bên trong Docker container (Chạy 1 lần đầu)
docker compose exec api npm run seed

# 3. Theo dõi logs hoạt động
docker compose logs -f

# 4. Dừng hệ thống khi không sử dụng
docker compose down
```

Hệ thống sẽ chạy 3 containers phối hợp:
1. `mongodb` (Port `27017` nội bộ hoặc host)
2. `api` (Port `5000:5000`)
3. `frontend` (Port `8080:80` thông qua Nginx Alpine)

---

## 🚀 Tự Động Đồng Bộ & Deploy Lên AWS EC2 Qua SSH

Dự án đã tích hợp kịch bản tự động hóa đồng bộ mã nguồn trực tiếp từ máy local lên máy chủ AWS EC2 qua `rsync` an toàn:

| Lệnh | Ý nghĩa chức năng |
| :--- | :--- |
| `npm run deploy:sync` | **Chỉ đồng bộ file:** Đẩy các file vừa thay đổi sang EC2 qua SSH rsync trong 2 giây (loại trừ an toàn node_modules và bảo vệ file .env production). |
| `npm run deploy:ec2` | **Đồng bộ + Rebuild:** Đẩy code mới sang EC2 và tự động rebuild Docker containers trên máy chủ. |
| `npm run deploy:seed` | **Đồng bộ + Seed:** Đẩy code và nạp lại dữ liệu mẫu vào MongoDB trên EC2. |

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

Để kiểm tra giao diện Admin hiển thị và hoạt động mượt mà trên thiết bị di động:
1. Mở DevTools trên trình duyệt (`F12` hoặc `Ctrl + Shift + I`).
2. Nhấn `Ctrl + Shift + M` để kích hoạt chế độ xem mô phỏng thiết bị di động (iPhone / Pixel / iPad).
3. Kiểm tra thanh điều hướng Hamburger, Dropdown danh mục dịch vụ và các thao tác vuốt chọn lịch làm tóc.

## 🌐 Kiến Trúc & Hướng Dẫn Deploy Production (AWS EC2)

Dưới đây là tài liệu chi tiết về kiến trúc hệ thống và hướng dẫn vận hành, kiểm tra trên môi trường Production thực tế.

### 1. Production Architecture (Luồng Hệ Thống)
Hệ thống được thiết kế theo luồng xử lý như sau:
```text
User 
 └──> Domain Namecheap (salonduongchi.website)
       └──> AWS EC2 Elastic IP (54.251.145.138)
             └──> Host Nginx (Reverse Proxy & SSL)
                   ├──> Port 8080: Frontend Docker Container (Nginx serve static)
                   ├──> Port 5000: Backend API Docker Container (Node.js/Express)
                         └──> MongoDB Atlas (Database đám mây)
```
* **Định tuyến Frontend:** Tên miền `salonduongchi.website` và `www.salonduongchi.website` được Nginx host phân phối ngược (reverse proxy) vào Frontend Docker container thông qua cổng máy chủ **`8080`**.
* **Định tuyến Backend:** Tên miền phụ `api.salonduongchi.website` được Nginx host phân phối ngược vào Backend container thông qua cổng máy chủ **`5000`**.
* **Bảo mật SSL:** Các kết nối HTTPS được cấu hình và gia hạn tự động thông qua **Certbot (Let's Encrypt)** trực tiếp trên tầng Nginx host.

### 2. Production Domains
* **Main site:** [https://salonduongchi.website](https://salonduongchi.website)
* **WWW site:** [https://www.salonduongchi.website](https://www.salonduongchi.website)
* **API base URL:** [https://api.salonduongchi.website](https://api.salonduongchi.website)
* **Sitemap XML:** [https://salonduongchi.website/sitemap.xml](https://salonduongchi.website/sitemap.xml)
* **Robots TXT:** [https://salonduongchi.website/robots.txt](https://salonduongchi.website/robots.txt)

### 3. SEO Setup
Dự án đã tích hợp đầy đủ cấu hình tối ưu hóa tìm kiếm SEO tĩnh:
* **Tệp cấu hình nguồn:** Đặt tại [frontend/public/sitemap.xml](file:///home/ubuntu/salon-root/frontend/public/sitemap.xml) và [frontend/public/robots.txt](file:///home/ubuntu/salon-root/frontend/public/robots.txt). Các tệp này sẽ được Vite tự động đóng gói vào thư mục `dist/` khi build và copy vào container.
* **Tác dụng:**
  * `sitemap.xml`: Giúp các bot tìm kiếm (Google, Bing) hiểu nhanh các liên kết công khai chính thức đang hoạt động của website.
  * `robots.txt`: Khai báo các quy tắc thu thập thông tin, chỉ dẫn đường dẫn Sitemap và ngăn chặn (Disallow) việc index các trang riêng tư/quản trị như `/admin`, `/login`, `/dashboard`.
* **Google Search Console:** Tên miền đã được xác minh quyền sở hữu. Bạn có thể gửi lại hoặc cập nhật sơ đồ trang web bất kỳ lúc nào bằng cách nhập từ khóa `sitemap.xml` tại mục Sitemaps trong dashboard của Google Search Console.

### 4. Important Nginx Notes (Cấu hình Nginx Host)
Cấu hình Nginx reverse proxy chính được cài đặt trực tiếp trên EC2 tại đường dẫn:
`/etc/nginx/sites-available/salonduongchi.website`

Một bản sao lưu cấu hình chuẩn này được lưu trữ trong mã nguồn tại: [deploy/nginx/salonduongchi.website.conf](file:///home/ubuntu/salon-root/deploy/nginx/salonduongchi.website.conf) để phục vụ cho việc khôi phục hoặc tạo máy chủ mới.

> [!IMPORTANT]
> Để tránh việc các file SEO tĩnh bị Nginx/React tự động fallback về `/index.html` của trang chính, cấu hình Nginx bắt buộc phải chỉ định cụ thể các location block riêng cho `sitemap.xml` và `robots.txt` trước block `location /`:

```nginx
server {
    server_name salonduongchi.website www.salonduongchi.website;

    location = /sitemap.xml {
        proxy_pass http://127.0.0.1:8080/sitemap.xml;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /robots.txt {
        proxy_pass http://127.0.0.1:8080/robots.txt;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # ... cấu hình SSL Certbot tự động quản lý bên dưới ...
}
```
*Lưu ý:* Không chỉnh sửa block cấu hình `api.salonduongchi.website` (cổng 5000) trừ khi có sự thay đổi về cổng API backend.

### 5. Deployment Workflow (Luồng Tự Động Hóa)
Quy trình cập nhật mã nguồn hàng ngày được tự động hóa qua GitHub Actions:
```text
[Developer commit & push code lên main]
                   │
                   ▼
  [GitHub Actions Triggered (concurrency: production-deploy)]
                   │
                   ▼
  [SSH Kết nối an toàn vào AWS EC2 (ubuntu@54.251.145.138)]
                   │
                   ▼
  [Dọn dẹp Git locks & chown quyền sở hữu thư mục project]
                   │
                   ▼
  [Đồng bộ mã nguồn sạch: git fetch + git reset --hard]
                   │
                   ▼
  [Docker Compose dừng container cũ & rebuild không cache nếu có thay đổi]
                   │
                   ▼
  [Prune dọn dẹp dung lượng đĩa & hoàn tất cập nhật website]
```

**Lệnh làm việc hàng ngày của lập trình viên (Daily Workflow Commands):**
```bash
# 1. Đồng bộ code mới nhất về máy local tránh xung đột
git pull --rebase origin main

# 2. Thực hiện sửa đổi tính năng/nội dung giao diện...

# 3. Add và Commit code
git add .
git commit -m "feat: cập nhật nội dung bảng giá dịch vụ mới"

# 4. Push lên GitHub (Luồng CI/CD sẽ tự động chạy và cập nhật web sau 1-2 phút)
git push origin main
```

### 6. EC2 Production Commands (Các lệnh quản trị trên EC2)
Khi đăng nhập vào EC2 qua SSH, bạn có thể quản lý và kiểm tra hệ thống bằng các lệnh sau:

* **Di chuyển tới thư mục gốc dự án:**
  ```bash
  cd /home/ubuntu/salon-root
  ```
* **Kiểm tra trạng thái các container:**
  ```bash
  sudo docker compose ps
  ```
* **Xem logs trực tiếp từ các containers (nhấn Ctrl+C để thoát):**
  ```bash
  sudo docker compose logs -f
  ```
* **Chạy deploy lại thủ công (Rebuild & Start):**
  ```bash
  sudo docker compose down --remove-orphans
  sudo docker compose up -d --build
  ```
* **Kiểm tra phản hồi nhanh của các trang từ host:**
  ```bash
  curl -I https://salonduongchi.website
  curl -I https://salonduongchi.website/sitemap.xml
  curl -I https://salonduongchi.website/robots.txt
  ```

### 7. Known Production Fixes (Các lỗi đã khắc phục và lưu ý)
* **Frontend build bị lỗi `SIGKILL` (Out of Memory):**
  * *Nguyên nhân:* EC2 t3.micro chỉ có 1GB RAM vật lý, khi Vite biên dịch sẽ tiêu tốn quá lượng RAM này khiến OS tắt tiến trình build.
  * *Cách xử lý:* Đã tạo bộ nhớ ảo Swap 1.7GB tại `/swapfile` giúp hệ điều hành điều tiết bộ nhớ khi build.
* **Lỗi Git kẹt locks (`ORIG_HEAD.lock`):**
  * *Nguyên nhân:* Do tiến trình bị ngắt đột ngột hoặc ổ đĩa cứng của EC2 bị đầy 100% (không thể ghi file).
  * *Cách xử lý:* Đã tích hợp lệnh xóa file lock kẹt và reset quyền thư mục `chown -R ubuntu:ubuntu` trong workflow. Hãy luôn giữ dung lượng đĩa trống trên EC2 bằng cách chạy định kỳ: `sudo docker system prune -a -f`.
* **Docker lỗi cổng `5000` already in use (Trùng cổng):**
  * *Nguyên nhân:* Do docker daemon cũ bị crash đột ngột để lại các tiến trình containerd-shim mồ côi (zombie processes) tự động khởi chạy và chiếm cổng.
  * *Cách xử lý:* Tắt dịch vụ Docker mặc định của hệ thống (`sudo systemctl disable docker docker.socket`) vì dự án đang chạy Docker Snap ổn định hơn, sau đó tìm và kill các tiến trình mồ côi bằng `sudo kill -9 <PID>`.

### 8. Biến Môi Trường Ví Dụ (Environment Variables Setup)

#### Tệp cấu hình `.env` của Backend tại `/home/ubuntu/salon-root/.env` (Ví dụ):
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/salon_duong_chi?retryWrites=true&w=majority
JWT_SECRET=viet-chuoi-bao-mat-ngau-nhien-dai-tai-day
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://salonduongchi.website,https://www.salonduongchi.website
GOOGLE_CLIENT_ID=google-oauth-client-id-cua-ban
GOOGLE_CLIENT_SECRET=google-oauth-client-secret-cua-ban
GOOGLE_CALLBACK_URL=https://api.salonduongchi.website/api/auth/google/callback
CLOUDINARY_CLOUD_NAME=ten-cloud-cua-ban
CLOUDINARY_API_KEY=key-cloudinary-cua-ban
CLOUDINARY_API_SECRET=secret-cloudinary-cua-ban
```

#### GitHub Secrets (Cấu hình trong Settings -> Secrets của Repository):
* `VPS_HOST`: Địa chỉ IP của máy chủ EC2 (`54.251.145.138`)
* `VPS_USER`: Tên tài khoản đăng nhập (`ubuntu`)
* `VPS_SSH_KEY`: Nội dung file khóa Private Key (`.pem`) dùng để SSH không cần mật khẩu.

---

### 9. Các bước kiểm tra nhanh sau triển khai (Verification Steps):
1. **Xem trạng thái Docker containers:** `sudo docker compose ps`
2. **Xem nhật ký hoạt động:** `sudo docker compose logs -f`
3. **Kiểm tra trạng thái Nginx:** `sudo systemctl status nginx`
4. **Kiểm tra phản hồi của API (HTTPS):**
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
### 4. Hướng Dẫn Upload Ảnh Lên Cloudinary
Dự án đã tích hợp tính năng tải ảnh lên Cloudinary bảo mật trực tiếp từ giao diện Admin (khi tạo/chỉnh sửa dịch vụ và sản phẩm):
1. **Hoạt động**:
   - Quản trị viên có thể kéo thả, click để chọn tệp hoặc chụp trực tiếp từ camera/chọn từ thư viện ảnh trên điện thoại.
   - Giao diện hiển thị ảnh xem trước (local preview) lập tức kèm trạng thái tải lên ("Đang tải ảnh...").
   - File ảnh được gửi lên Backend Node.js dưới dạng multipart/form-data. Backend kiểm tra quyền Admin, xác thực file (chỉ chấp nhận JPG, PNG, WEBP và dung lượng dưới 5MB).
   - Backend chuyển tiếp file buffer trực tiếp sang Cloudinary để giữ bảo mật tuyệt đối cho `CLOUDINARY_API_SECRET` (không lưu file tạm trên server).
   - Nhận URL bảo mật từ Cloudinary và lưu vào database dưới dạng `imageUrl` (đồng bộ tự động với `image`) và `cloudinaryPublicId`.
2. **Cấu hình môi trường**:
   Bổ sung các khóa sau vào file `.env` ở Backend:
   ```env
   CLOUDINARY_CLOUD_NAME=ten_cloud_cua_ban
   CLOUDINARY_API_KEY=api_key_cua_ban
   CLOUDINARY_API_SECRET=api_secret_cua_ban
   ```

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