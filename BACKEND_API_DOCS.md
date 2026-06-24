# Tài liệu API Backend - Salon Dương Chí

Tài liệu này tổng hợp toàn bộ thông tin chi tiết về cấu hình, cơ sở dữ liệu và danh sách API của phần Backend trong dự án Salon Dương Chí.

---

## 1. Môi trường chạy Backend
* **Local URL**: `http://localhost:5000`
* **Production URL**: `https://api.salonduongchi.website`
* **Port mặc định**: `5000`
* **Các file cấu hình liên quan đến Port**:
  * [backend/config/env.js](file:///home/dinh_trong/salon/backend/config/env.js): Định nghĩa và kiểm tra biến môi trường `PORT` (mặc định `5000`).
  * [backend/server.js](file:///home/dinh_trong/salon/backend/server.js): Khởi tạo máy chủ HTTP lắng nghe trên cổng `env.PORT`.
  * [docker-compose.yml](file:///home/dinh_trong/salon/docker-compose.yml): Map cổng `5000` của host với cổng `5000` của container `api`.
  * [deploy/nginx/salonduongchi.website.conf](file:///home/dinh_trong/salon/deploy/nginx/salonduongchi.website.conf): Nginx host ngoài EC2 chuyển tiếp request đến `http://127.0.0.1:5000`.

---

## 2. Danh sách toàn bộ API

| Method | Endpoint | Chức năng | Cần Đăng Nhập? | Request Body | Response mẫu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/health` | Kiểm tra trạng thái hoạt động của API | Không | Không có | `{"success": true, "message": "..."}` |
| **POST** | `/api/auth/register` | Đăng ký tài khoản khách hàng mới | Không | `{name, phone, email, password, confirmPassword}` | `{"success": true, "data": {token, user}}` |
| **POST** | `/api/auth/login` | Đăng nhập tài khoản (Admin, Staff, Customer) | Không | `{identifier, password}` | `{"success": true, "data": {token, user}}` |
| **POST** | `/api/auth/google` | Đăng nhập bằng Google OAuth | Không | `{idToken}` | `{"success": true, "data": {token, user}}` |
| **POST** | `/api/auth/facebook` | Đăng nhập bằng Facebook OAuth | Không | `{accessToken}` | `{"success": true, "data": {token, user}}` |
| **GET** | `/api/auth/me` | Lấy thông tin tài khoản hiện tại | Có | Không có | `{"success": true, "data": user}` |
| **GET** | `/api/services` | Lấy danh sách dịch vụ hoạt động (Lọc theo danh mục) | Không | Không có (Query: `?category=slug`) | `{"success": true, "data": [...]}` |
| **GET** | `/api/services/:id` | Xem chi tiết dịch vụ | Không | Không có | `{"success": true, "data": {...}}` |
| **GET** | `/api/products` | Lấy danh sách sản phẩm hoạt động (Phân trang) | Không | Không có (Query: `?category=&page=&limit=`) | `{"success": true, "data": [...], "pagination": {...}}` |
| **GET** | `/api/products/:id` | Xem chi tiết sản phẩm | Không | Không có | `{"success": true, "data": {...}}` |
| **POST** | `/api/bookings` | Tạo lịch hẹn mới | Không bắt buộc | `{customerName, phone, email, serviceId, date, time, ...}` | `{"success": true, "data": booking}` |
| **GET** | `/api/bookings/slots` | Lấy danh sách khung giờ đã kín trong ngày | Không | Không có (Query: `?date=YYYY-MM-DD` - Bắt buộc) | `{"success": true, "data": ["09:00", ...]}` |
| **GET** | `/api/bookings` | Xem danh sách lịch hẹn (Nhân viên/Admin) | Có (Staff/Admin) | Không có (Query: `?status=&date=&limit=`) | `{"success": true, "data": [...]}` |
| **PUT** | `/api/bookings/:id` | Cập nhật thông tin/Trạng thái lịch hẹn | Có (Staff/Admin) | `{status, stylist, hairColorUsed, note}` | `{"success": true, "data": {...}}` |
| **DELETE** | `/api/bookings/:id` | Hủy lịch hẹn | Có | Không có | `{"success": true, "message": "Huy lich..."}` |
| **GET** | `/api/cart` | Lấy giỏ hàng của tài khoản | Có (Cust/Admin) | Không có | `{"success": true, "data": cart}` |
| **POST** | `/api/cart/items` | Thêm sản phẩm vào giỏ hàng | Có (Cust/Admin) | `{productId, quantity}` | `{"success": true, "data": cart}` |
| **PUT** | `/api/cart/items/:productId` | Thay đổi số lượng sản phẩm trong giỏ | Có (Cust/Admin) | `{quantity}` | `{"success": true, "data": cart}` |
| **DELETE** | `/api/cart/items/:productId` | Xóa sản phẩm khỏi giỏ hàng | Có (Cust/Admin) | Không có | `{"success": true, "data": cart}` |
| **POST** | `/api/orders` | Tạo đơn hàng mới | Có | `{items, paymentProvider, note}` | `{"success": true, "data": order}` |
| **GET** | `/api/orders` | Lấy lịch sử đơn hàng của bản thân | Có | Không có | `{"success": true, "data": [...]}` |
| **GET** | `/api/orders/:id` | Xem chi tiết đơn hàng | Có | Không có | `{"success": true, "data": {...}}` |
| **POST** | `/api/admin/uploads/image` | Tải hình ảnh lên Cloudinary | Có (Admin) | Form-data: `image` (tệp), `folder` (optional) | `{"success": true, "data": {imageUrl, publicId}}` |
| **GET** | `/api/admin/bookings` | Quản lý danh sách đặt lịch toàn hệ thống | Có (Admin) | Không có | `{"success": true, "data": [...]}` |
| **PATCH** | `/api/admin/bookings/:id` | Cập nhật nhanh trạng thái đặt lịch | Có (Admin) | `{status, stylist, hairColorUsed, note}` | `{"success": true, "data": {...}}` |
| **GET** | `/api/admin/services` | Lấy tất cả dịch vụ để quản lý | Có (Admin) | Không có | `{"success": true, "data": [...]}` |
| **POST** | `/api/admin/services` | Thêm dịch vụ mới | Có (Admin) | `{name, category, price, durationMinutes, ...}` | `{"success": true, "data": service}` |
| **PUT** | `/api/admin/services/:id` | Sửa thông tin dịch vụ | Có (Admin) | Dữ liệu dịch vụ cập nhật | `{"success": true, "data": service}` |
| **DELETE** | `/api/admin/services/:id` | Xóa dịch vụ hệ thống | Có (Admin) | Không có | `{"success": true, "data": service}` |
| **GET** | `/api/admin/products` | Lấy tất cả sản phẩm để quản lý | Có (Admin) | Không có | `{"success": true, "data": [...]}` |
| **POST** | `/api/admin/products` | Tạo sản phẩm mới | Có (Admin) | `{name, price, stock, category, ...}` | `{"success": true, "data": product}` |
| **PUT** | `/api/admin/products/:id` | Cập nhật thông tin sản phẩm | Có (Admin) | Dữ liệu sản phẩm cập nhật | `{"success": true, "data": product}` |
| **DELETE** | `/api/admin/products/:id` | Xóa sản phẩm hệ thống | Có (Admin) | Không có | `{"success": true, "data": product}` |
| **GET** | `/api/admin/orders` | Quản lý danh sách toàn bộ đơn hàng | Có (Admin) | Không có | `{"success": true, "data": [...]}` |
| **GET** | `/api/admin/customers` | Lấy danh sách khách hàng CRM (lọc, sắp xếp) | Có (Admin) | Không có (Query: `?search=&segment=&sortBy=`) | `{"success": true, "data": {items, pagination}}` |
| **GET** | `/api/admin/customers/:id` | Xem thông tin chi tiết CRM của khách hàng | Có (Admin) | Không có | `{"success": true, "data": {...}}` |
| **POST** | `/api/admin/customers/:id/notes` | Thêm ghi chú CRM về khách hàng | Có (Admin) | `{note, type}` | `{"success": true, "data": note}` |
| **POST** | `/api/admin/customers/:id/hair-formulas` | Thêm công thức làm tóc/nhuộm của khách | Có (Admin) | `{colorName, formula, oxidant, baseLevel, ...}` | `{"success": true, "data": formula}` |
| **POST** | `/api/admin/customers/:id/rebook` | Đặt lịch hẹn nhanh từ bảng CRM khách hàng | Có (Admin) | `{serviceId, date, time, stylist, note}` | `{"success": true, "data": booking}` |
| **GET** | `/api/admin/inventory` | Xem tình trạng kho & giao dịch xuất nhập | Có (Admin) | Không có | `{"success": true, "data": {...}}` |
| **POST** | `/api/admin/inventory/adjust` | Nhập hoặc xuất kho sản phẩm | Có (Admin) | `{productId, type: "import"/"export", quantity, note}` | `{"success": true, "data": {...}}` |
| **GET** | `/api/admin/stats/revenue` | Thống kê doanh thu và báo cáo hệ thống | Có (Admin) | Không có (Query: `?from=&to=`) | `{"success": true, "data": {...}}` |

---

## 3. Các API cụ thể theo yêu cầu

### A. API liên quan đến Services (Dịch vụ)
* **Lấy danh sách dịch vụ**: `GET /api/services` (Không yêu cầu đăng nhập).
* **Lấy chi tiết dịch vụ**: `GET /api/services/:id` (Không yêu cầu đăng nhập).
* **Lọc dịch vụ theo danh mục**: `GET /api/services?category=<tên_danh_mục_hoặc_slug>` (Không yêu cầu đăng nhập).
* **Thêm dịch vụ**: `POST /api/admin/services` (Yêu cầu đăng nhập tài khoản vai trò `admin`).
* **Sửa dịch vụ**: `PUT /api/admin/services/:id` (Yêu cầu đăng nhập tài khoản vai trò `admin`).
* **Xoá dịch vụ**: `DELETE /api/admin/services/:id` (Yêu cầu đăng nhập tài khoản vai trò `admin`).

### B. API liên quan đến Categories (Danh mục)
* **Lấy danh sách danh mục**: *Chưa tìm thấy trong source code*. Hệ thống không có endpoint hoặc bảng lưu trữ danh mục riêng biệt. Phía frontend lấy danh sách danh mục bằng cách gom nhóm trường `category` từ danh sách Services hoặc Products.
* **Thêm danh mục**: *Chưa tìm thấy trong source code*. Danh mục mới được tạo tự động khi tạo/sửa dịch vụ/sản phẩm có tên danh mục mới.
* **Sửa/Xóa danh mục**: *Chưa tìm thấy trong source code*. Không hỗ trợ API sửa/xóa danh mục riêng biệt.

### C. API liên quan đến Auth / Admin
* **Đăng nhập admin**: `POST /api/auth/login` (Sử dụng chung endpoint đăng nhập, hệ thống sẽ kiểm tra và trả về vai trò `role: "admin"`).
* **Đăng ký admin**: *Chưa tìm thấy trong source code*. Không có API đăng ký admin nhằm tăng tính bảo mật. Tài khoản admin được tạo qua seed file db hoặc cập nhật trực tiếp trong DB.
* **Kiểm tra token**: Không có API verify riêng, dùng gián tiếp thông qua endpoint `GET /api/auth/me`.
* **Xác thực**: JWT (Json Web Token), thuật toán mã hóa `HS256`, hạn dùng `7d` (mặc định).
* **Cách gửi token**: Gửi qua Header: `Authorization: Bearer <token>`.

### D. API Upload Ảnh
* **Endpoint**: `POST /api/admin/uploads/image` (Yêu cầu đăng nhập vai trò `admin`).
* **Cách hoạt động**: Frontend gửi tệp ảnh qua multipart form-data đến backend. Backend dùng Multer memoryStorage để nhận buffer và upload trực tiếp lên Cloudinary.
* **Field name của file**: `image`.
* **Định dạng file cho phép**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`.
* **Giới hạn kích thước file**: Tối đa 5MB.
* **Cloudinary config**: Nằm tại file [backend/services/cloudinaryService.js](file:///home/dinh_trong/salon/backend/services/cloudinaryService.js), sử dụng các biến từ file config [backend/config/env.js](file:///home/dinh_trong/salon/backend/config/env.js).

---

## 4. Các biến môi trường cần thiết
* **NODE_ENV**: Môi trường chạy ứng dụng (`development`, `test`, `production`).
* **PORT**: Cổng kết nối của Backend Server (mặc định: `5000`).
* **MONGODB_URI**: Đường dẫn kết nối CSDL MongoDB.
* **JWT_SECRET**: Chuỗi bảo mật dùng để mã hóa và xác thực JWT token (ở môi trường `production`, yêu cầu bắt buộc tối thiểu 32 ký tự).
* **JWT_EXPIRES_IN**: Thời gian hết hạn của JWT (mặc định: `7d`).
* **RATE_LIMIT_WINDOW_MS**: Thời gian giới hạn request (mặc định: 15 phút).
* **RATE_LIMIT_MAX**: Số lượng request tối đa trong window cho API chung (mặc định: `300`).
* **AUTH_RATE_LIMIT_MAX**: Số lượng request tối đa trong window cho các API Auth (mặc định: `20`).
* **FRONTEND_URL**: Danh sách các URL Client được phép gọi API (phục vụ CORS), phân tách bằng dấu phẩy.
* **SMTP_HOST**, **SMTP_PORT**, **SMTP_USER**, **SMTP_PASS**, **EMAIL_FROM**: Thông tin cấu hình máy chủ gửi email thông báo.
* **ZALO_WEBHOOK_URL**, **ZALO_ACCESS_TOKEN**: Token và webhook kết nối với dịch vụ Zalo API.
* **PAYMENT_PROVIDER**: Cấu hình nhà cung cấp thanh toán (`cash`, `momo`, `vnpay`).
* **PAYMENT_MOCK_ENABLED**: Bật/tắt chế độ thanh toán giả lập.
* **VNPAY_TMN_CODE**, **VNPAY_HASH_SECRET**: Mã website và mã bảo mật của VNPAY.
* **MOMO_PARTNER_CODE**, **MOMO_ACCESS_KEY**, **MOMO_SECRET_KEY**: Các thông tin kết nối ví MoMo.
* **DEFAULT_ADMIN_NAME**, **DEFAULT_ADMIN_EMAIL**, **DEFAULT_ADMIN_PHONE**, **DEFAULT_ADMIN_PASSWORD**: Thông tin khởi tạo tài khoản Admin mặc định khi seed database.
* **GOOGLE_CLIENT_ID**, **GOOGLE_CLIENT_SECRET**, **GOOGLE_CALLBACK_URL**: Thông tin cấu hình đăng nhập bằng Google.
* **CLOUDINARY_CLOUD_NAME**, **CLOUDINARY_API_KEY**, **CLOUDINARY_API_SECRET**: Thông tin cấu hình kết nối tài khoản lưu trữ ảnh Cloudinary.

---

## 5. Cơ sở dữ liệu (Database)
* **Hệ cơ sở dữ liệu**: MongoDB, kết nối và tương tác thông qua thư viện `mongoose`.
* **File kết nối**: [backend/config/db.js](file:///home/dinh_trong/salon/backend/config/db.js).
* **Danh sách các Schema/Model**:
  1. `User` ([backend/models/User.js](file:///home/dinh_trong/salon/backend/models/User.js)): Lưu trữ thông tin tài khoản (Admin, Staff, Customer), hỗ trợ social login.
  2. `Service` ([backend/models/Service.js](file:///home/dinh_trong/salon/backend/models/Service.js)): Danh sách dịch vụ của salon, addons đi kèm và quy tắc định giá động theo giờ.
  3. `Product` ([backend/models/Product.js](file:///home/dinh_trong/salon/backend/models/Product.js)): Danh sách sản phẩm bán tại salon và số lượng tồn kho.
  4. `Booking` ([backend/models/Booking.js](file:///home/dinh_trong/salon/backend/models/Booking.js)): Quản lý các lịch hẹn làm tóc của khách hàng.
  5. `Customer` ([backend/models/Customer.js](file:///home/dinh_trong/salon/backend/models/Customer.js)): Lưu trữ hồ sơ CRM của khách hàng (phân khúc vip/new, tổng chi tiêu, dịch vụ/nhân viên yêu thích, lịch sử làm màu tóc).
  6. `CustomerNote` ([backend/models/CustomerNote.js](file:///home/dinh_trong/salon/backend/models/CustomerNote.js)): Lưu trữ các ghi chú CRM của khách hàng do nhân viên/admin viết.
  7. `HairFormula` ([backend/models/HairFormula.js](file:///home/dinh_trong/salon/backend/models/HairFormula.js)): Quản lý công thức nhuộm/làm tóc (nồng độ oxy, base level, hãng màu nhuộm, tình trạng tóc trước/sau).
  8. `Order` ([backend/models/Order.js](file:///home/dinh_trong/salon/backend/models/Order.js)): Đơn mua sản phẩm của khách và trạng thái thanh toán.
  9. `Cart` ([backend/models/Cart.js](file:///home/dinh_trong/salon/backend/models/Cart.js)): Giỏ hàng mua sản phẩm tạm thời của người dùng.
  10. `InventoryTransaction` ([backend/models/InventoryTransaction.js](file:///home/dinh_trong/salon/backend/models/InventoryTransaction.js)): Nhật ký lịch sử giao dịch xuất/nhập kho của sản phẩm.

---

## 6. Bảo mật và cấu hình CORS
* **Cấu hình CORS**: Nằm tại file [backend/app.js](file:///home/dinh_trong/salon/backend/app.js). Backend chỉ chấp nhận các request từ các nguồn nằm trong mảng `FRONTEND_URL` được cấu hình từ biến môi trường, cộng thêm các loopback origin để dev tại máy local (`localhost`, `127.0.0.1`, `::1`).
* **Helmet**: Được sử dụng để thiết lập các HTTP Header bảo mật tiêu chuẩn, có cấu hình mở rộng cho phép popup đăng nhập của Google/Facebook hoạt động bình thường.
* **Rate Limiting**: Sử dụng `express-rate-limit` để giới hạn tần suất request.
  * API chung: Giới hạn theo biến `RATE_LIMIT_MAX` (mặc định 300 requests / 15 phút).
  * API Auth: Giới hạn nghiêm ngặt theo biến `AUTH_RATE_LIMIT_MAX` (mặc định 20 requests / 15 phút) nhằm phòng tránh brute-force.
* **Bảo vệ API Admin**: Được bọc qua middleware `roleMiddleware('admin')`. Chỉ tài khoản có `role === 'admin'` được giải mã từ JWT mới được phép thao tác.
* **Bảo mật mật khẩu**: Mật khẩu người dùng được băm một chiều bằng thư viện `bcryptjs` với độ muối (salt rounds) là 10 trước khi lưu vào MongoDB.

---

## 7. Đánh giá và Khuyến nghị

### Các điểm thiếu sót hiện tại
1. **Thiếu Model Categories riêng biệt**: Việc quản lý danh mục dịch vụ/sản phẩm bằng chuỗi thô (`String`) trực tiếp trong document Service/Product rất dễ dẫn đến sai lệch chính tả và không nhất quán dữ liệu. Khuyến nghị tạo thêm một Model `Category` riêng và sử dụng liên kết `ObjectId` tham chiếu từ Service/Product.
2. **Thiếu tài liệu API tự động**: Dự án chưa có Swagger/OpenAPI. Việc bảo trì tài liệu thủ công có thể dẫn đến lệch pha khi code thay đổi. Khuyến nghị tích hợp `swagger-ui-express` để tự động hóa tài liệu.
3. **Chưa có API CRUD tài khoản Staff**: Hiện tại phần Admin chưa có các API CRUD trực tiếp để quản lý tài khoản của nhân viên (`role: 'staff'`).

### Điểm dễ gây lỗi khi Deploy lên EC2/Nginx/HTTPS
1. **Độ dài khóa JWT_SECRET**: Khi chuyển sang môi trường production (`NODE_ENV=production`), server sẽ crash lập tức nếu `JWT_SECRET` dưới 32 ký tự hoặc dùng giá trị mặc định. Cần đảm bảo định cấu hình chuỗi bí mật đủ mạnh trong file `.env` trên EC2.
2. **Cấu hình FRONTEND_URL**: Biến môi trường này cần được liệt kê chính xác (bao gồm cả `https://www.salonduongchi.website` và `https://salonduongchi.website`). Thiếu một trong hai sẽ gây lỗi CORS khi người dùng truy cập.
3. **Nginx Proxy cho WebSockets**: Socket.io được sử dụng trong các thông báo realtime. File cấu hình Nginx ngoài host phải có các chỉ thị `Connection "upgrade"` và `Upgrade $http_upgrade` để đảm bảo kết nối socket hoạt động tốt. (Cấu hình Nginx mẫu trong thư mục `deploy` đã xử lý việc này).
