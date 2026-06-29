# Salon Backend/DevOps Interview Guide

Tài liệu này được biên soạn dành riêng cho sinh viên IT năm 2 đang chuẩn bị phỏng vấn thực tập (Intern/Junior) vị trí Backend/DevOps. Tài liệu liên hệ trực tiếp các kiến thức nền tảng (Database, OS, Network, System Design, Framework, Docker, Nginx, CI/CD) với dự án **Salon Đường Chi** thực tế.

---

## 1. Tổng quan project app salon

Dự án **Salon Đường Chi** là một hệ thống web/app hoàn chỉnh (Full-stack) hỗ trợ khách hàng đặt lịch dịch vụ làm tóc, mua sắm sản phẩm chăm sóc tóc trực tuyến và giúp quản trị viên (Admin/Staff) quản lý toàn bộ hoạt động của salon trong thời gian thực.

### Mô hình kiến trúc tổng quan
Dự án sử dụng mô hình kiến trúc Monorepo chia làm hai phần chính:
1. **Frontend (SPA):** Viết bằng React 18, TypeScript, Vite, Tailwind CSS, quản lý state bằng Zustand và React Query, giao tiếp thời gian thực qua Socket.IO Client.
2. **Backend (RESTful API & Realtime Server):** Chạy trên Node.js với Express 5, cơ sở dữ liệu MongoDB (thông qua Mongoose), giao tiếp thời gian thực bằng Socket.IO.

### Sơ đồ luồng dữ liệu (Data Flow)
```text
[Khách hàng / Admin]
       │
       ▼ (HTTPS / WSS)
[Nginx Reverse Proxy (Cổng 443 / 80)]
       │
       ├──────────────────────────────┐
       ▼ (Cổng 3000)                  ▼ (Cổng 5000)
[Frontend Container (Static HTML)]  [Backend Container (Node.js API)]
                                      │
                                      ├───────────────┐
                                      ▼               ▼
                                 [MongoDB]      [Cloudinary / SMTP]
```

---

## 2. Database trong app salon

Hệ thống sử dụng **MongoDB** làm cơ sở dữ liệu chính, được mô hình hóa qua **Mongoose ODM**. Mặc dù MongoDB là NoSQL (Document-based), chúng ta vẫn phải thiết kế các mối quan hệ (Relationships) giữa các tập dữ liệu (Collections) tương tự như SQL truyền thống.

### Các Collection chính và Mối quan hệ
Hệ thống quản lý dữ liệu thông qua các collection sau:

| Tên Collection | Mục đích | Các trường quan trọng | Mối quan hệ (Relationship) |
| :--- | :--- | :--- | :--- |
| `Users` | Lưu tài khoản người dùng | `_id`, `email`, `password`, `role` (admin/staff/customer), `provider` (local/google) | Một-nhiều với `Bookings`, `Orders`, `Carts` |
| `Services` | Danh sách dịch vụ làm tóc | `_id`, `name`, `price`, `durationMinutes`, `addons[]` | Liên kết với `Bookings` |
| `Products` | Danh sách sản phẩm bán kèm | `_id`, `name`, `price`, `stock`, `lowStockThreshold` | Liên kết với `Carts`, `Orders` |
| `Bookings` | Quản lý lịch hẹn làm tóc | `_id`, `userId` (optional), `customerName`, `phone`, `date`, `time`, `serviceId`, `status` | Tham chiếu tới `Users` (`userId`) và `Services` (`serviceId`) |
| `Carts` | Giỏ hàng của người dùng | `_id`, `userId`, `items` (`productId`, `quantity`) | Tham chiếu 1-1 tới `Users`, 1-nhiều tới `Products` |
| `Orders` | Đơn hàng mua sản phẩm | `_id`, `userId`, `products` (`productId`, `quantity`), `totalPrice`, `status`, `payment` | Tham chiếu tới `Users`, `Products` |
| `InventoryTransactions` | Lịch sử nhập/xuất kho | `_id`, `productId`, `type` (import/export), `quantity`, `previousStock`, `newStock` | Tham chiếu nhiều-1 tới `Products` |

### Primary Key, Foreign Key và Quan hệ trong NoSQL (MongoDB)
* **Primary Key (Khóa chính):** Trong MongoDB, mỗi document tự động có trường `_id` làm khóa chính duy nhất.
* **Foreign Key (Khóa ngoại):** Được giả lập bằng cách lưu thuộc tính kiểu `Schema.Types.ObjectId` kèm theo thuộc tính `ref` trỏ đến collection khác.
  * *Ví dụ:* Trong collection `Bookings`, trường `userId` lưu `_id` của user đặt lịch, đóng vai trò như một khóa ngoại tham chiếu đến collection `Users`.

### Index (Chỉ mục) trong App Salon
Index giúp tăng tốc độ tìm kiếm dữ liệu từ độ phức tạp $O(N)$ (quét toàn bộ bảng - Colscan) xuống $O(\log N)$ (tìm kiếm trên cây - Ixscan).
* **Unique Index trong Bookings:** Tránh tình trạng đặt trùng giờ trùng ngày.
  ```javascript
  // Đảm bảo tại một thời điểm (ngày + giờ) chỉ có duy nhất một lịch hẹn được kích hoạt
  bookingSchema.index({ date: 1, time: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed', 'in_service'] } } });
  ```
* **Compound Index trong InventoryTransactions:** Tối ưu hóa việc truy vấn lịch sử kho của một sản phẩm cụ thể theo thứ tự thời gian giảm dần (mới nhất lên đầu).
  ```javascript
  inventoryTransactionSchema.index({ productId: 1, createdAt: -1 });
  ```

### Transaction (Giao dịch) và Xử lý tranh chấp (Race Condition)
Khi khách đặt mua sản phẩm, hệ thống phải trừ số lượng tồn kho (`stock`) trong bảng `Products` và tạo một bản ghi trong bảng `Orders`. Nếu trừ kho thành công nhưng tạo đơn hàng thất bại, dữ liệu sẽ bị bất nhất. 
* **Giải pháp trong MongoDB:** Sử dụng Session Transaction để đảm bảo tính **ACID**.
* **Xử lý bất đồng bộ bằng Atomic Update (Conditional Update):** Khi trừ kho, hệ thống áp dụng câu lệnh cập nhật có điều kiện để tránh việc số lượng tồn kho bị âm:
  ```javascript
  // Cập nhật nguyên tử: Chỉ trừ kho khi số lượng hiện tại đủ đáp ứng
  const result = await Product.updateOne(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } }
  );
  if (result.modifiedCount === 0) {
    throw new Error('Số lượng sản phẩm trong kho không đủ!');
  }
  ```

### SQL Query mẫu (Dành cho phỏng vấn hệ CSDL quan hệ)
Nếu nhà tuyển dụng yêu cầu chuyển đổi luồng đặt lịch của app sang SQL, bạn cần chuẩn bị các câu lệnh sau:
* **Tạo bảng `bookings` có khóa ngoại:**
  ```sql
  CREATE TABLE bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      service_id INT,
      booking_date DATE NOT NULL,
      booking_time TIME NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
  );
  ```
* **Query lấy danh sách lịch hẹn kèm tên khách hàng và tên dịch vụ:**
  ```sql
  SELECT b.id, u.name AS customer_name, s.name AS service_name, b.booking_date, b.booking_time, b.status
  FROM bookings b
  INNER JOIN users u ON b.user_id = u.id
  INNER JOIN services s ON b.service_id = s.id
  WHERE b.booking_date = '2026-06-29';
  ```

### Các câu hỏi phỏng vấn liên quan đến Database
* **Phỏng vấn có thể hỏi gì?**
  1. *Index là gì? Tại sao không index tất cả các cột/trường trong database?*
  2. *Làm thế nào để tránh tình trạng hai người cùng đặt một slot giờ làm tóc tại cùng một thời điểm?*
  3. *Sự khác nhau giữa SQL và NoSQL là gì? Tại sao dự án của bạn lại chọn MongoDB?*
* **Cách trả lời ngắn gọn:**
  1. Index là cấu trúc dữ liệu giúp tăng tốc độ tìm kiếm dữ liệu. Không index tất cả vì index làm tăng dung lượng lưu trữ và làm chậm các thao tác ghi (`INSERT`, `UPDATE`, `DELETE`) do database phải cập nhật lại cây chỉ mục.
  2. Sử dụng cơ chế Unique Index (Chỉ mục duy nhất) kết hợp điều kiện trạng thái (tránh trùng lặp trên các lịch chưa hủy) ở tầng Database, hoặc áp dụng Transaction kết hợp kiểm tra tính khả dụng trước khi ghi nhận đặt lịch.
  3. SQL có cấu trúc chặt chẽ (Schema cố định), hỗ trợ ACID giao dịch phức tạp tốt hơn. NoSQL (như MongoDB) linh hoạt về cấu trúc dữ liệu (Document có thể thêm bớt trường dễ dàng), dễ dàng mở rộng theo chiều ngang (Horizontal Scaling) và phù hợp với dữ liệu dạng JSON từ JavaScript.
* **Sai lầm người mới hay mắc:**
  * Nghĩ rằng MongoDB không cần thiết kế quan hệ và cứ nhúng (embed) toàn bộ dữ liệu vào một Document duy nhất dẫn đến Document vượt quá giới hạn 16MB của MongoDB.
  * Quên đánh index cho các trường thường xuyên dùng để tìm kiếm/lọc như `email` của User hay `date` của Bookings.
* **Liên hệ với project salon:**
  * Bảng `Bookings` đánh chỉ mục duy nhất cho bộ đôi `{ date, time }` đối với các lịch hẹn hoạt động để ngăn chặn đặt trùng giờ.
  * Bảng `InventoryTransactions` được đánh chỉ mục hỗn hợp `{ productId: 1, createdAt: -1 }` để Admin xem lịch sử kho nhanh chóng.

---

## 3. Operating System/Linux trong app salon

Khi triển khai (deploy) ứng dụng salon lên môi trường production, chúng ta sử dụng một máy chủ ảo (VPS) chạy hệ điều hành **Linux** (ví dụ: Ubuntu Server).

### App chạy trên Linux Server như thế nào?
Khi chạy lệnh `node backend/server.js` hoặc chạy qua Docker container, hệ điều hành Linux sẽ khởi tạo một **Process (Tiến trình)**.
* **Process (Tiến trình):** Là một chương trình đang được thực thi, có không gian bộ nhớ riêng (RAM), luồng xử lý riêng và ID tiến trình (`PID`).
* **Port (Cổng):** Tiến trình API backend của salon mặc định lắng nghe trên cổng `5000`. Khi có request mạng gửi tới cổng `5000`, Linux sẽ chuyển request đó tới đúng tiến trình Node.js đang sở hữu cổng này.

### Logs nằm ở đâu trên Linux?
* Nếu chạy ứng dụng bằng dịch vụ hệ thống (Systemd), log sẽ được ghi nhận và quản lý bởi `journald`. Ta xem bằng lệnh `journalctl`.
* Nếu chạy ứng dụng bằng Docker, Docker sẽ bắt các luồng đầu ra tiêu chuẩn (`stdout`/`stderr`) của container và lưu lại. Ta xem bằng lệnh `docker logs <container_id>`.
* Log của Nginx thường nằm ở: `/var/log/nginx/access.log` (ghi nhận request) và `/var/log/nginx/error.log` (ghi nhận lỗi kết nối/hệ thống).

### Quyền hạn (Permissions) trên Linux khi Deploy
Mỗi file và thư mục trên Linux đều có cấu trúc quyền sở hữu: **Owner - Group - Others** với 3 loại quyền: **Read (r - 4), Write (w - 2), Execute (x - 1)**.
* **Lỗi thiếu quyền (Permission Denied):** Xảy ra khi bạn chạy ứng dụng dưới một user không có quyền ghi vào thư mục log, hoặc không có quyền đọc file cấu hình `.env` hay file SSL certificate.
* **Lỗi chiếm dụng cổng (Port Address Already in Use):** Xảy ra khi tiến trình backend salon (cổng 5000) khởi động nhưng trên server đã có một tiến trình khác đang chạy và chiếm dụng cổng 5000. Bạn phải tìm và tắt tiến trình cũ.
* **Lỗi hết bộ nhớ (Out of Memory - OOM):** Khi RAM của VPS bị đầy (do rò rỉ bộ nhớ - memory leak ở backend hoặc do VPS cấu hình yếu), Linux Kernel sẽ kích hoạt cơ chế `OOM Killer` để tự động tắt tiến trình ngốn nhiều RAM nhất (thường là tiến trình Node.js của backend).

### Các câu lệnh Linux bỏ túi khi đi phỏng vấn
Bạn cần thành thạo các câu lệnh sau để kiểm tra hệ thống:

```bash
# 1. Kiểm tra các tiến trình đang chạy và lọc tiến trình Node.js
ps aux | grep node

# 2. Xem mức độ sử dụng CPU, RAM của các tiến trình trong thời gian thực
top
# Hoặc phiên bản trực quan hơn nếu có cài đặt: htop

# 3. Kiểm tra xem port 5000 hoặc 80 đang bị chiếm bởi tiến trình nào
ss -tunlp | grep :5000
# Hoặc lệnh truyền thống: netstat -tunlp | grep :5000

# 4. Xem log hệ thống thời gian thực của một dịch vụ (ví dụ nginx)
journalctl -u nginx -f

# 5. Xem log trực tiếp của container backend trong Docker
docker logs -f --tail 100 salon-backend-container
```

### Các câu hỏi phỏng vấn liên quan đến OS/Linux
* **Phỏng vấn có thể hỏi gì?**
  1. *Làm thế nào để bạn biết cổng 80 trên server có đang bị chiếm dụng hay không và xử lý thế nào?*
  2. *Sự khác biệt giữa Process (Tiến trình) và Thread (Luồng) là gì?*
  3. *Làm cách nào để ứng dụng Node.js của bạn tự khởi động lại khi server Linux bị crash hoặc restart?*
* **Cách trả lời ngắn gọn:**
  1. Sử dụng lệnh `ss -lntp | grep :80` hoặc `netstat -lntp | grep :80`. Nếu bị chiếm dụng, tôi tìm PID của tiến trình đó và dùng lệnh `kill -9 <PID>` để giải phóng cổng (sau khi xác nhận tiến trình đó có thể tắt một cách an toàn).
  2. Process là một chương trình đang thực thi với tài nguyên hệ thống và vùng nhớ RAM độc lập. Thread là một đơn vị thực thi nhỏ hơn bên trong Process, các Thread trong cùng một Process chia sẻ chung vùng nhớ RAM của Process đó.
  3. Tôi sử dụng các trình quản lý tiến trình như **PM2** (`pm2 start app.js --watch`) hoặc thiết lập ứng dụng chạy dưới dạng một **Systemd Service** cấu hình tự khởi động lại (`Restart=always`), hoặc cấu hình chính sách tự khởi động lại của Docker container (`restart: always`).
* **Sai lầm người mới hay mắc:**
  * Chạy ứng dụng bằng quyền `root` tối cao trên server Linux. Điều này rất nguy hiểm về mặt bảo mật: nếu hacker tấn công được vào app Node.js, chúng sẽ có toàn quyền kiểm soát toàn bộ server Linux. Luôn chạy ứng dụng dưới một user có đặc quyền hạn chế.
* **Liên hệ với project salon:**
  * Dockerfile cấu hình build frontend và backend không sử dụng quyền root mặc định khi thực thi, đồng thời ánh xạ cổng (port-mapping) từ container ra cổng host của server Linux một cách rõ ràng.

---

## 4. Networking trong app salon

Khi khách hàng truy cập địa chỉ `https://salonduongchi.website` trên trình duyệt, một loạt các bước giao tiếp mạng (networking) được diễn ra.

### Quy trình 6 bước khi người dùng truy cập App Salon
```text
[Trình duyệt] ────(1) Hỏi IP cho domain────► [DNS Server]
     │                                            │
     │◄───(2) Trả về IP: 123.45.67.89 ────────────┘
     │
     ├────(3) Gửi Request HTTPS (Cổng 443) ──────► [Nginx (Host VPS)]
     │                                                  │
     │◄───(6) Trả về dữ liệu (HTML/JSON) ───────────────┤ (4) Chuyển tiếp request
     │                                                  ▼ (Cổng nội bộ Docker)
     │                                            [Backend Container]
     │                                                  │
     └──────────────────────────────────────────────────┴ (5) Lấy dữ liệu
                                                          ▼
                                                    [MongoDB (Cổng 27017)]
```

1. **DNS Lookup (Truy vấn DNS):** Trình duyệt gửi truy vấn đến DNS Server để phân giải tên miền `salonduongchi.website` thành địa chỉ IP public của máy chủ VPS (ví dụ: `123.45.67.89`).
2. **Thiết lập kết nối TCP (3-way handshake):** Trình duyệt thiết lập kết nối tin cậy với VPS thông qua giao thức TCP trên cổng `443` (cổng tiêu chuẩn cho HTTPS).
3. **Thỏa thuận mã hóa SSL/TLS:** Trình duyệt và Nginx trên server thực hiện bắt tay bảo mật để mã hóa toàn bộ dữ liệu truyền tải, đảm bảo an toàn thông tin đặt lịch và thông tin đăng nhập của khách hàng.
4. **Nginx Reverse Proxy:** Nginx nhận request HTTPS tại cổng `443`, giải mã SSL, sau đó chuyển tiếp (proxy) request HTTP không mã hóa tới container backend đang chạy ở cổng `5000` bên trong mạng nội bộ của Docker.
5. **Backend xử lý và truy vấn Database:** Backend tiếp nhận request, kết nối với MongoDB qua cổng mặc định `27017` để truy vấn danh sách dịch vụ hoặc ghi nhận lịch hẹn.
6. **Phản hồi (Response):** Backend trả dữ liệu JSON về cho Nginx, Nginx đóng gói mã hóa SSL rồi gửi ngược lại cho trình duyệt hiển thị giao diện cho khách hàng.

### Bảng mã lỗi HTTP (HTTP Status Codes) cần nhớ
Khi hệ thống gặp lỗi, các mã trạng thái HTTP sẽ phản ánh vị trí xảy ra lỗi:

| Mã lỗi | Tên lỗi | Nguyên nhân thực tế trong App Salon | Cách debug |
| :--- | :--- | :--- | :--- |
| **404** | Not Found | Khách truy cập vào đường dẫn không tồn tại hoặc API backend thay đổi route mà frontend chưa cập nhật. | Kiểm tra cấu hình router ở frontend (`App.tsx`) và file định nghĩa route ở backend (`backend/routes/`). |
| **500** | Internal Server Error | Lỗi logic ở code backend (ví dụ: code bị crash do truy cập vào thuộc tính `undefined` của object không tồn tại). | Xem log chi tiết của backend bằng lệnh `docker logs` để tìm file và dòng code gây ra lỗi (Stack trace). |
| **502** | Bad Gateway | Nginx đang chạy nhưng không thể kết nối tới container backend (backend đã bị crash hoặc chưa khởi động xong). | Kiểm tra xem container backend có đang chạy không (`docker ps`), xem cổng backend cấu hình có khớp với cổng cấu hình trong Nginx không. |
| **504** | Gateway Timeout | Backend nhận được request từ Nginx nhưng xử lý quá lâu (quá thời gian timeout cấu hình của Nginx, thường là 60s). | Tối ưu hóa truy vấn Database (thêm index), kiểm tra xem backend có bị lặp vô hạn hoặc gọi API bên thứ ba (như cổng thanh toán VNPay) bị nghẽn không. |

### Các câu hỏi phỏng vấn về Networking
* **Phỏng vấn có thể hỏi gì?**
  1. *Sự khác biệt giữa HTTP và HTTPS là gì? TLS/SSL hoạt động ở tầng nào trong mô hình OSI?*
  2. *Reverse Proxy là gì? Tại sao phải dùng Nginx làm Reverse Proxy mà không cho client kết nối trực tiếp đến Node.js backend?*
  3. *Làm thế nào để bạn debug khi trang web hiện lỗi 502 Bad Gateway?*
* **Cách trả lời ngắn gọn:**
  1. HTTPS là HTTP được mã hóa bảo mật bằng chứng chỉ SSL/TLS. SSL/TLS hoạt động ở tầng **Presentation (Trình diễn)** trong mô hình OSI (hoặc tầng ứng dụng trong mô hình TCP/IP).
  2. Reverse Proxy là máy chủ trung gian đứng trước các máy chủ backend để nhận request từ client rồi phân phối đến các máy chủ phù hợp. Ta dùng Nginx làm Reverse Proxy để:
     * Cấu hình SSL/TLS tập trung (không cần cấu hình HTTPS trực tiếp trong code Node.js).
     * Tăng tính bảo mật (giấu IP và cổng thực của backend container).
     * Load Balancing (cân bằng tải) và phục vụ file tĩnh cực nhanh.
  3. Khi gặp lỗi 502, việc đầu tiên là tôi kiểm tra xem dịch vụ API backend có đang chạy hay không bằng lệnh `docker ps` hoặc `pm2 list`. Nếu backend vẫn chạy, tôi kiểm tra log lỗi của Nginx (`/var/log/nginx/error.log`) để xem Nginx đang cố gắng kết nối vào IP/Port nào và đối chiếu với cổng thực tế backend đang lắng nghe.
* **Sai lầm người mới hay mắc:**
  * Cấu hình cứng địa chỉ IP public của server hoặc localhost trong code frontend. Khi deploy lên domain khác hoặc môi trường production, frontend sẽ không thể gọi API được. Luôn dùng biến môi trường (như `VITE_API_URL`) để cấu hình động.
* **Liên hệ với project salon:**
  * File `.env.example` khai báo `VITE_API_URL=https://api.salonduongchi.website` cấu hình cho client gọi đến subdomain API, subdomain này được Nginx định tuyến trực tiếp vào cổng 5000 của Docker backend.

---

## 5. Framework hoạt động bên trong

Backend của Salon sử dụng **Express 5** - một minimalist web framework cho Node.js. Để hiểu cách nó hoạt động, hãy xem luồng đi của một request đặt lịch.

### Luồng đi của Request `POST /api/bookings`
Khi khách hàng nhấn nút "Xác nhận đặt lịch" trên giao diện, request sẽ đi qua các lớp kiến trúc sau:

```text
[Client Request]
       │
       ▼
1. [Routing Layer] ──────► Định tuyến đường dẫn `/api/bookings`
       │
       ▼
2. [Middleware Layer] ───► Validate dữ liệu (Joi) & Xác thực JWT (nếu có)
       │
       ▼
3. [Controller Layer] ───► Điều phối, gọi Service tương ứng
       │
       ▼
4. [Service Layer] ──────► Xử lý logic nghiệp vụ (kiểm tra slot trống, tính tiền)
       │
       ▼
5. [Model Layer] ────────► Truy vấn và lưu dữ liệu vào MongoDB
       │
       ▼
[Client Response] ◄────── Gửi phản hồi chuẩn qua `sendSuccess`
```

1. **Routing Layer (Tầng định tuyến):** File `backend/routes/bookingRoutes.js` bắt khớp method `POST` và path `/`.
2. **Middleware Layer (Tầng trung gian):**
   * *Validation Middleware:* Sử dụng thư viện **Joi** để kiểm tra tính hợp lệ của dữ liệu đầu vào (tên khách hàng không được để trống, số điện thoại đúng định dạng, ngày đặt lịch phải là tương lai...). Nếu lỗi, trả về ngay mã lỗi `400 Bad Request`.
   * *Auth Middleware (nếu có):* Giải mã và xác thực token JWT gửi kèm trong header `Authorization: Bearer <token>`.
3. **Controller Layer (Tầng điều khiển):** Gọi hàm `createBooking` trong `bookingController.js`. Controller đóng vai trò điều phối: lấy dữ liệu từ request body, chuyển giao cho tầng Service xử lý, nhận kết quả và trả về client.
4. **Service Layer (Tầng nghiệp vụ):** Thực hiện tính toán logic nghiệp vụ:
   * Kiểm tra xem khung giờ đó đã có ai đặt chưa.
   * Áp dụng các quy trình giảm giá dịch vụ hoặc phụ phí giờ cao điểm.
5. **Model Layer (Tầng dữ liệu - Mongoose Model):** Gọi phương thức `Booking.create(...)` để tương tác trực tiếp với cơ sở dữ liệu MongoDB.

### Error Handling (Xử lý lỗi tập trung)
Để tránh ứng dụng bị sập khi gặp lỗi không mong muốn, hệ thống sử dụng một Middleware xử lý lỗi tập trung ở cuối file `app.js`.
* Tất cả các controller được bọc trong hàm `asyncHandler` để tự động bắt (`catch`) các lỗi bất đồng bộ và chuyển tiếp lỗi đó đến middleware xử lý lỗi bằng hàm `next(err)`.
* Middleware xử lý lỗi sẽ định dạng lại phản hồi lỗi một cách chuyên nghiệp và trả về mã trạng thái HTTP phù hợp (ví dụ: `400` cho dữ liệu sai, `401` cho sai token, `500` cho lỗi server kèm theo việc ẩn stack trace lỗi ở môi trường production).

### Các câu hỏi phỏng vấn về Framework
* **Phỏng vấn có thể hỏi gì?**
  1. *Middleware trong Express là gì? Cho ví dụ về cách bạn sử dụng middleware trong dự án.*
  2. *Tại sao cần dùng thư viện Validation (như Joi) ở backend trong khi frontend đã kiểm tra dữ liệu đầu vào rồi?*
  3. *Làm thế nào để quản lý các lỗi bất đồng bộ (async/await) trong Express mà không phải viết quá nhiều khối `try/catch`?*
* **Cách trả lời ngắn gọn:**
  1. Middleware là các hàm trung gian có quyền truy cập vào đối tượng request (`req`), response (`res`) và hàm `next` tiếp theo trong chu kỳ request-response của ứng dụng. Trong dự án salon, tôi dùng middleware để xác thực token JWT (`protect`), phân quyền người dùng (`restrictTo('admin')`) và validate định dạng dữ liệu đầu vào bằng Joi.
  2. Frontend validation chỉ giúp tăng trải nghiệm người dùng (UX). Hacker có thể dễ dàng vượt qua frontend bằng cách dùng các công cụ như Postman hoặc curl để gửi request trực tiếp đến API. Do đó, backend validation là bắt buộc để bảo vệ toàn vẹn dữ liệu và an ninh hệ thống.
  3. Tôi sử dụng một hàm bọc (wrapper helper) có tên là `asyncHandler`. Hàm này nhận vào một async function controller, thực thi nó và tự động gọi `.catch(next)` để đẩy mọi lỗi phát sinh về middleware xử lý lỗi tập trung của Express.
* **Sai lầm người mới hay mắc:**
  * Quên gọi hàm `next()` trong middleware tự viết, khiến cho request bị "treo" vô hạn và trình duyệt của client sẽ quay vòng tròn cho đến khi bị timeout.
* **Liên hệ với project salon:**
  * Dự án sử dụng `validateRequest(joiSchema)` làm middleware kiểm duyệt đầu vào trước khi controller tiếp nhận xử lý.

---

## 6. System Design cho app salon

Thiết kế hệ thống là phần quan trọng để chứng minh tư duy phát triển dài hạn của ứng dụng khi lượng người dùng tăng cao.

### Sơ đồ kiến trúc mở rộng (Scalable System Design)
Khi salon của bạn phát triển từ 1 chi nhánh lên chuỗi 50 chi nhánh với hàng chục ngàn lượt đặt lịch mỗi ngày, cấu trúc hệ thống cần nâng cấp như sau:

```text
                     [Client Request (Browser / App)]
                                    │
                                    ▼
                      [Cloudflare (DNS, DDoS Protection)]
                                    │
                                    ▼
                        [Nginx Load Balancer]
                                    │
                  ┌─────────────────┼─────────────────┐
                  ▼                 ▼                 ▼
             [App Server 1]    [App Server 2]    [App Server 3]
                  │                 │                 │
                  ├─────────────────┴─────────────────┤
                  ▼                                   ▼
          [Redis Cache]                         [Message Queue (RabbitMQ)]
          (Bảng giá, Slots)                           │
                  │                                   ▼
                  ▼                           [Worker Service]
         [MongoDB Cluster]                      (Gửi Email/SMS)
         (Primary-Secondary)
```

### Các quyết định thiết kế cốt lõi trong dự án

#### A. Lưu trữ hình ảnh sản phẩm/dịch vụ làm tóc
* **Vấn đề:** Ảnh chụp các mẫu tóc của salon thường có dung lượng lớn. Nếu lưu trực tiếp trên server VPS, ổ cứng sẽ nhanh chóng bị đầy và băng thông của VPS sẽ bị nghẽn khi nhiều người xem ảnh cùng lúc.
* **Giải pháp:** Sử dụng dịch vụ lưu trữ đám mây bên thứ ba như **Cloudinary** hoặc Amazon S3 kết hợp mạng phân phối nội dung (CDN). Backend chỉ lưu đường dẫn URL của ảnh vào MongoDB. Frontend sẽ tải ảnh trực tiếp từ CDN của dịch vụ lưu trữ này, giúp giảm tải tối đa cho VPS của salon.

#### B. Xử lý gửi Email/SMS xác nhận đặt lịch
* **Vấn đề:** Gửi email qua SMTP (như Nodemailer) là một tác vụ I/O tốn thời gian (mất từ 1-3 giây để kết nối với mail server và gửi đi). Nếu thực hiện tác vụ này trực tiếp trong luồng đặt lịch, khách hàng sẽ phải đợi phản hồi rất lâu trên màn hình.
* **Giải pháp:** Sử dụng **Message Queue (Hàng đợi tin nhắn)** như Redis (BullMQ) hoặc RabbitMQ. Khi khách đặt lịch thành công, backend lưu lịch vào DB rồi đẩy một "tin nhắn nhiệm vụ" vào hàng đợi và lập tức trả kết quả "Đặt lịch thành công" về cho khách hàng. Một tiến trình chạy ngầm (Worker) sẽ lấy nhiệm vụ từ hàng đợi ra để gửi email một cách độc lập (Asynchronous Background Job).

#### C. Cache bảng giá và danh sách dịch vụ
* **Vấn đề:** Bảng giá và danh sách dịch vụ của salon là dữ liệu rất ít khi thay đổi (chỉ thay đổi khi salon có dịch vụ mới hoặc cập nhật giá). Việc liên tục truy vấn vào MongoDB mỗi khi có khách vào trang Pricing/Services là không cần thiết.
* **Giải pháp:** Sử dụng **Redis** để cache lại danh sách dịch vụ dưới dạng JSON. Khi khách truy cập, backend kiểm tra trong Redis trước: nếu có (Cache Hit), trả về ngay; nếu không có (Cache Miss), truy vấn MongoDB, lưu kết quả vào Redis rồi trả về. Khi admin cập nhật dịch vụ, ta thực hiện xóa cache cũ trong Redis (Cache Invalidation).

### Các câu hỏi phỏng vấn về System Design
* **Phỏng vấn có thể hỏi gì?**
  1. *Làm thế nào để thiết kế một hệ thống gửi thông báo đặt lịch thành công qua Email/SMS mà không làm chậm trải nghiệm của người dùng?*
  2. *Nếu có chương trình khuyến mãi giờ vàng làm tóc, lượng truy cập tăng đột biến gấp 100 lần, hệ thống của bạn sẽ bị nghẽn ở đâu và cách khắc phục thế nào?*
* **Cách trả lời ngắn gọn:**
  1. Tôi sẽ tách tác vụ gửi thông báo ra khỏi luồng xử lý request chính bằng cách sử dụng hàng đợi tin nhắn (Message Queue). Tiến trình chính chỉ ghi nhận lịch hẹn vào DB, đẩy task gửi mail vào hàng đợi rồi phản hồi thành công ngay lập tức cho client. Tiến trình worker chạy nền sẽ xử lý hàng đợi này sau.
  2. Hệ thống sẽ bị nghẽn đầu tiên ở Cơ sở dữ liệu (quá tải kết nối/CPU ghi đọc) và băng thông mạng của server. Khắc phục bằng cách:
     * Cài đặt **Redis Cache** cho các dữ liệu đọc nhiều (bảng giá, dịch vụ).
     * Sử dụng **Load Balancer** (như Nginx) để phân phối tải ra nhiều instance backend chạy song song.
     * Áp dụng **Rate Limiting** ở tầng Gateway để chặn các request spam từ bot phá hoại hệ thống.
* **Sai lầm người mới hay mắc:**
  * Nghĩ rằng để tăng hiệu năng chỉ cần nâng cấp cấu hình server VPS mạnh hơn (Vertical Scaling). Thực tế, lập trình viên cần tối ưu hóa từ thuật toán, thiết kế cơ sở dữ liệu và áp dụng kiến trúc phân tán (Horizontal Scaling) thì hệ thống mới bền vững và tiết kiệm chi phí.

---

## 7. Docker, Nginx, CI/CD

Đây là các công cụ Devops cốt lõi giúp chuẩn hóa môi trường phát triển và tự động hóa quy trình triển khai sản phẩm.

### Docker giúp gì cho App Salon?
* **Vấn đề:** "Code chạy tốt trên máy của tôi nhưng lỗi khi đưa lên server" là lỗi kinh điển do sự khác biệt về phiên bản Node.js, hệ điều hành hoặc môi trường hệ thống.
* **Giải pháp:** Docker đóng gói toàn bộ ứng dụng và tất cả các thư viện phụ thuộc của nó vào một **Image**. Image này chạy độc lập trong một môi trường cô lập gọi là **Container**. Bất kỳ hệ điều hành nào cài Docker đều chạy ứng dụng giống hệt nhau.
* **Port Mapping (Ánh xạ cổng):** Container chạy trong mạng nội bộ riêng của Docker. Để người dùng bên ngoài truy cập được vào backend bên trong container, ta phải ánh xạ cổng: ví dụ `5000:5000` (cổng 5000 của VPS trỏ vào cổng 5000 của Container).

### Cấu hình Nginx reverse proxy mẫu cho App Salon
Nginx đóng vai trò là cổng chào (Gateway) của server. Dưới đây là file cấu hình Nginx mẫu thực tế giúp định tuyến domain và cấu hình SSL:

```nginx
# Cấu hình chuyển hướng từ HTTP sang HTTPS (Bảo mật bắt buộc)
server {
    listen 80;
    server_name salonduongchi.website api.salonduongchi.website;
    return 301 https://$host$request_uri;
}

# Cấu hình cho Frontend SPA
server {
    listen 443 ssl;
    server_name salonduongchi.website;

    ssl_certificate /etc/letsencrypt/live/salonduongchi.website/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/salonduongchi.website/privkey.pem;

    location / {
        # Định tuyến vào container frontend chạy cổng 3000
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Cấu hình cho API Backend và Realtime Socket.IO
server {
    listen 443 ssl;
    server_name api.salonduongchi.website;

    ssl_certificate /etc/letsencrypt/live/api.salonduongchi.website/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.salonduongchi.website/privkey.pem;

    location / {
        # Định tuyến vào container backend chạy cổng 5000
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Cấu hình hỗ trợ WebSocket (dành cho Socket.IO hoạt động thời gian thực)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### GitHub Actions CI/CD triển khai tự động (Automated Deployment)
Quy trình tự động hóa giúp giảm thiểu sai sót khi deploy thủ công:

```text
[Developer] ──Push Code──► [GitHub Repository]
                                  │
                                  ▼ (Kích hoạt Workflow CI/CD)
                       [GitHub Actions Runner]
                       ├── 1. Run Lint & Typecheck
                       ├── 2. Run Unit Tests (node:test)
                       ├── 3. Build & Push Docker Image lên Registry
                       └── 4. SSH vào Server VPS để:
                              ├── Pull Docker Image mới nhất về
                              └── Restart lại Docker Containers
```

#### File cấu hình CI/CD rút gọn (`.github/workflows/deploy.yml`)
```yaml
name: Deploy Salon App

on:
  push:
    branches: [ main ]

jobs:
  test-and-build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout mã nguồn
        uses: actions/checkout@v4

      - name: Cài đặt Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Chạy kiểm tra chất lượng code (Lint & Test)
        run: |
          npm ci
          npm run lint
          npm test

      - name: Build Docker Image cho Backend
        run: |
          docker build -t my-dockerhub-user/salon-backend:latest ./backend

  deploy:
    needs: test-and-build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy lên VPS qua giao thức SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_IP }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull my-dockerhub-user/salon-backend:latest
            docker stop salon-backend || true
            docker rm salon-backend || true
            docker run -d --name salon-backend -p 5000:5000 --env-file /home/ubuntu/salon/.env my-dockerhub-user/salon-backend:latest
```

---

## 8. Các lỗi thực tế và cách debug

Khi vận hành thực tế hệ thống salon, các lỗi sau đây rất hay xảy ra. Bạn cần nắm rõ bản chất và phương án xử lý để ghi điểm với nhà tuyển dụng:

### Lỗi 1: Tải ảnh dịch vụ lên bị lỗi hoặc mất ảnh khi khởi động lại container
* **Bản chất:** Các tệp tin được ghi trực tiếp vào bên trong ổ cứng của Docker container có tính chất tạm thời (Ephemeral). Khi container bị stop/restart hoặc deploy phiên bản mới, toàn bộ dữ liệu ghi trực tiếp này sẽ bị xóa sạch.
* **Cách khắc phục:** 
  * Cách 1: Sử dụng **Docker Volume** để ánh xạ thư mục lưu trữ ảnh từ container ra ổ cứng vật lý của VPS (`docker run -v /var/data/images:/app/public/uploads`).
  * Cách 2 (Khuyên dùng): Chuyển hoàn toàn việc lưu trữ ảnh sang dịch vụ Cloud như Cloudinary và chỉ lưu URL vào database.

### Lỗi 2: Trạng thái đặt lịch báo lỗi "Không thể tìm nạp" (Couldn't fetch) trên Google Search Console
* **Bản chất:** Google Search Console báo lỗi "Không thể tìm nạp" cho các file như `sitemap.xml` hoặc `robots.txt` khi mới khai báo do hệ thống Google chưa xếp lịch quét hoặc do cấu hình tường lửa (Cloudflare WAF) phát hiện tác vụ quét tự động và chặn truy cập.
* **Cách khắc phục:** Sử dụng công cụ **Kiểm tra URL trực tiếp (Test Live URL)** của GSC. Nếu kiểm tra trực tiếp trả về mã trạng thái `200 OK`, tức là hệ thống mạng hoạt động bình thường, ta chỉ cần đợi Google hoàn tất xử lý hàng đợi quét trong vòng 24h-48h.

### Lỗi 3: Lỗi mất kết nối thời gian thực (Realtime Socket.IO) trên trang quản lý lịch hẹn của Admin
* **Bản chất:** Mặc định kết nối WebSocket yêu cầu các tiêu đề đặc biệt (Connection: Upgrade). Nếu đi qua Nginx reverse proxy mà không cấu hình các tiêu đề này, Nginx sẽ từ chối kết nối WebSocket và chuyển kết nối về dạng HTTP Polling liên tục gây tốn tài nguyên.
* **Cách khắc phục:** Cấu hình đúng tiêu đề `Upgrade` và `Connection` trong khối cấu hình `location` của Nginx (như phần cấu hình mẫu ở Mục 7).

---

## 9. Bộ câu hỏi phỏng vấn theo từng nhóm

Dưới đây là tập hợp các câu hỏi phỏng vấn thực tế thiết kế riêng cho dự án Salon Đường Chi, chia theo 4 cấp độ trả lời để bạn tự tin ứng biến.

### Nhóm 1: Cơ sở dữ liệu (Database)

#### Câu hỏi 1: Làm thế nào để truy vấn nhanh các đơn đặt lịch hẹn của một khách hàng cụ thể?
* **Câu trả lời ngắn:** Đánh index cho trường `userId` trong collection `Bookings`.
* **Liên hệ với project salon:** Trong ứng dụng của tôi, khi khách hàng truy cập trang lịch sử đặt lịch cá nhân, hệ thống sẽ thực hiện truy vấn `Booking.find({ userId: req.user.id })`.
* **Gây ấn tượng:** "Tôi sẽ tạo một single index cho trường `userId` trong schema của `Bookings`. Đồng thời, nếu trang lịch sử đặt lịch có tính năng lọc theo trạng thái lịch hẹn (ví dụ: đang chờ, đã hoàn thành), tôi sẽ cân nhắc tạo một **Compound Index** kết hợp `{ userId: 1, status: 1 }` để tối ưu hóa tối đa tốc độ truy vấn trên MongoDB, giảm thời gian phản hồi API xuống dưới 50ms."

#### Câu hỏi 2: Sự khác biệt lớn nhất khi cập nhật số lượng tồn kho sản phẩm trong môi trường có nhiều người mua cùng lúc là gì?
* **Câu trả lời ngắn:** Phải tránh lỗi Race Condition (tranh chấp dữ liệu) khiến số lượng kho bị trừ âm hoặc cập nhật sai.
* **Liên hệ với project salon:** Khi người dùng thanh toán giỏ hàng chứa dầu gội, hệ thống phải trừ số lượng tồn kho của sản phẩm đó trong collection `Products`.
* **Gây ấn tượng:** "Tôi không đọc số lượng tồn kho ra ngoài code rồi tính toán và lưu lại (vì cách này dễ bị ghi đè dữ liệu sai nếu có 2 luồng chạy song song). Thay vào đó, tôi sử dụng lệnh cập nhật nguyên tử (Atomic Update) trực tiếp ở tầng database thông qua lệnh `$inc` của MongoDB kết hợp điều kiện lọc số lượng lớn hơn hoặc bằng lượng cần mua: `Product.updateOne({ _id: productId, stock: { $gte: quantity } }, { $inc: { stock: -quantity } })`. Điều này đảm bảo an toàn luồng dữ liệu mà không cần sử dụng các cơ chế lock phức tạp gây chậm hệ thống."

---

### Nhóm 2: Hệ điều hành & Mạng máy tính (OS & Networking)

#### Câu hỏi 3: Sự khác nhau giữa lệnh `ps` và lệnh `top` trên Linux là gì?
* **Câu trả lời ngắn:** `ps` chụp lại danh sách tiến trình tại một thời điểm, còn `top` hiển thị và cập nhật liên tục tiến trình theo thời gian thực.
* **Liên hệ với project salon:** Tôi sử dụng hai lệnh này để giám sát tiến trình API của backend salon chạy trên server Linux.
* **Gây ấn tượng:** "`ps` (Process Status) rất hữu ích khi kết hợp với `grep` để kiểm tra nhanh xem tiến trình backend của mình có đang chạy hay không và lấy số PID của nó (ví dụ: `ps aux | grep node`). Trong khi đó, `top` hoặc `htop` giống như Task Manager trên Windows, giúp tôi theo dõi liên tục xem ứng dụng của mình có đang bị ngốn CPU hay bị rò rỉ bộ nhớ RAM (Memory Leak) làm đơ VPS hay không."

#### Câu hỏi 4: Khi deploy ứng dụng, tại sao bạn cần cấu hình HTTPS và chứng chỉ SSL/TLS được cài ở đâu?
* **Câu trả lời ngắn:** HTTPS giúp mã hóa dữ liệu truyền tải giữa client và server để chống nghe lén thông tin. Chứng chỉ SSL/TLS thường được tôi cấu hình trực tiếp ở Nginx.
* **Liên hệ với project salon:** Dự án của tôi sử dụng chứng chỉ miễn phí từ Let's Encrypt cho hai tên miền `salonduongchi.website` và `api.salonduongchi.website`.
* **Gây ấn tượng:** "Tôi cấu hình chứng chỉ SSL/TLS tại tầng **Nginx (Reverse Proxy)** thay vì cấu hình trực tiếp trong code Node.js. Cơ chế này gọi là **SSL Termination**. Nó giúp giải phóng tài nguyên tính toán mã hóa cho Node.js backend, giúp backend tập trung xử lý logic nghiệp vụ và quản lý chứng chỉ tập trung tại một nơi dễ dàng gia hạn tự động bằng `certbot`."

---

### Nhóm 3: Backend & DevOps

#### Câu hỏi 5: Hãy giải thích vòng đời của một request trong Express từ lúc client gửi đi đến khi nhận phản hồi.
* **Câu trả lời ngắn:** Request đi qua Nginx -> Router -> Các Middleware (Auth, Validation) -> Controller -> Service -> Model và cuối cùng trả về Response.
* **Liên hệ với project salon:** Ví dụ với request đặt lịch làm tóc gửi tới `POST /api/bookings`.
* **Gây ấn tượng:** "Khi request gửi tới, Nginx chuyển tiếp tới ứng dụng Express. Đầu tiên, request đi qua các Middleware toàn cục (như CORS, Helmet, Parser). Sau đó, Router nhận diện đường dẫn và chuyển hướng qua Middleware kiểm tra đăng nhập (`protect`) và Middleware kiểm duyệt dữ liệu đầu vào bằng `Joi`. Nếu mọi thứ hợp lệ, Controller tiếp nhận request, gọi đến tầng Service để thực hiện logic nghiệp vụ như kiểm tra tính sẵn sàng của lịch hẹn và lưu vào DB qua Model Mongoose. Kết quả xử lý sẽ được định dạng đồng nhất qua helper `sendSuccess` trước khi gửi về cho client."

#### Câu hỏi 6: Docker Image và Docker Container khác nhau như thế nào?
* **Câu trả lời ngắn:** Image là bản thiết kế đóng gói mã nguồn và thư viện tĩnh, còn Container là một thực thể hoạt động được khởi tạo từ Image đó.
* **Liên hệ với project salon:** Dự án có Dockerfile cho backend để xây dựng Image tĩnh, khi chạy `docker-compose up` sẽ tạo ra các container backend và database chạy song song.
* **Gây ấn tượng:** "Mối quan hệ giữa Docker Image và Docker Container tương tự như **Class** và **Object** trong lập trình hướng đối tượng (OOP). Image là lớp (Class) được đóng gói sẵn và không thể thay đổi (Read-only). Còn Container là đối tượng (Object) đại diện cho một tiến trình sống chạy độc lập từ lớp đó. Từ một Image backend salon được build từ CI/CD, tôi có thể khởi chạy nhiều Container backend giống hệt nhau trên các server khác nhau hoặc chạy nhiều bản sao trên cùng một server để chia tải."

---

## 10. Checklist ôn tập trước phỏng vấn

Hãy tự kiểm tra lại kiến thức của mình bằng cách tích vào các nội dung dưới đây:

* [ ] **Database:** Tôi giải thích được database trong app salon dùng để làm gì.
* [ ] **Database:** Tôi giải thích được luồng user đặt lịch được lưu vào database như thế nào (quan hệ giữa `Bookings`, `Users`, và `Services`).
* [ ] **Database:** Tôi hiểu tầm quan trọng của việc đánh Index cho các cột hay tìm kiếm và cơ chế tránh trùng giờ đặt lịch bằng Unique Index.
* [ ] **OS/Linux:** Tôi giải thích được tiến trình (Process), cổng (Port), và cách xem tài nguyên hệ thống bằng lệnh `top`/`htop` trên Linux.
* [ ] **Networking:** Tôi hiểu cặn kẽ đường đi của một request từ trình duyệt qua DNS, Nginx Reverse Proxy, Docker container, vào đến backend và database.
* [ ] **Networking:** Tôi phân biệt được các mã lỗi HTTP thông dụng: 404, 500, 502, 504 và cách định vị lỗi tương ứng trong dự án thực tế.
* [ ] **Framework:** Tôi làm chủ luồng dữ liệu 3 lớp (Router - Controller - Service - Model) và hiểu cơ chế hoạt động của middleware trong Express.
* [ ] **System Design:** Tôi nắm được tư duy mở rộng hệ thống bằng cách ứng dụng lưu trữ đám mây (Cloudinary), bộ nhớ đệm (Redis Cache), và hàng đợi gửi mail (Message Queue).
* [ ] **DevOps:** Tôi giải thích được sự khác biệt giữa Docker image và container, vai trò của Nginx proxy và sơ đồ CI/CD tự động deploy bằng GitHub Actions.
* [ ] **Phỏng vấn:** Tôi tự tin trả lời được các câu hỏi phỏng vấn bằng cách lấy ví dụ thực tiễn từ dự án Salon Đường Chi.
