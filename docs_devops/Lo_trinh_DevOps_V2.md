# LỘ TRÌNH HỌC DEVOPS THỰC CHIẾN (V2)
Tài liệu hướng dẫn từ Zero đến Hero, bám sát **project thực tế: Salon Đường Chi** — một ứng dụng quản lý salon tóc full-stack với React Frontend, NodeJS Backend, Docker, Nginx và CI/CD tự động.

---

## Giới thiệu Dự án Thực tế: Salon Đường Chi

Mọi ví dụ trong tài liệu này đều lấy từ project **Salon Đường Chi** — một ứng dụng quản lý salon tóc thực tế đang chạy trên AWS EC2.

### Kiến trúc tổng thể
```
[Người dùng]
     ↓
https://salonduongchi.website   → Nginx → Frontend container (port 8080) → React/Vite
https://api.salonduongchi.website → Nginx → Backend container (port 5000) → NodeJS/Express
                                                ↓
                                          MongoDB Atlas (Cloud Database)
```

### Các thành phần project
| Thành phần | Công nghệ | Port | Domain |
| :--- | :--- | :--- | :--- |
| Frontend | React + Vite | `8080` | `salonduongchi.website` |
| Backend API | NodeJS + Express | `5000` | `api.salonduongchi.website` |
| Database | MongoDB Atlas | Cloud | - |
| Web Server | Nginx | `80/443` | Cả 2 domain |
| Server | AWS EC2 (Ubuntu) | - | IP tĩnh (Elastic IP) |
| CI/CD | GitHub Actions | - | Trigger khi push `main` |

### Cấu trúc thư mục project
```
salon/
├── backend/            ← NodeJS API (Express)
│   ├── server.js       ← Entry point backend
│   └── tests/          ← Unit tests
├── frontend/           ← React + Vite
│   └── Dockerfile      ← Build frontend thành image
├── deploy/
│   └── nginx/
│       └── salonduongchi.website.conf  ← Config Nginx thật trên server
├── .github/
│   └── workflows/
│       ├── ci.yml      ← Chạy lint, typecheck, test, build khi có PR
│       └── deploy.yml  ← Deploy tự động lên EC2 khi push main
├── Dockerfile          ← Build backend thành image
├── docker-compose.yml  ← Chạy cả frontend + backend
└── .env.example        ← Mẫu biến môi trường
```

---

## Bài 1: DevOps là gì và lộ trình học

### 1.1. DevOps là gì?
DevOps là sự kết hợp giữa phát triển phần mềm (Development) và vận hành hệ thống (Operations) thông qua các quy trình tự động hóa. 
Mục tiêu là giúp phần mềm được **build, test, deploy và theo dõi một cách tự động, ổn định và có kiểm soát**.

*   **Development**: Viết code, phát triển tính năng mới, sửa lỗi.
*   **Operations**: Vận hành server, thiết lập mạng, bảo mật, theo dõi log và hiệu năng.
*   **DevOps**: Cây cầu nối hai phần trên lại với nhau, đảm bảo code từ máy dev lên production mượt mà nhất.

### 1.2. DevOps không chỉ là công cụ
Một hiểu lầm phổ biến là *DevOps = Docker + Kubernetes + AWS*.
Cách hiểu đúng hơn: **DevOps = Tư duy + Quy trình + Công cụ**. Công cụ chỉ đóng vai trò hỗ trợ; điều cốt lõi là bạn phải biết cách tổ chức quy trình làm phần mềm sao cho tự động hóa, lặp lại được, ít xảy ra lỗi và dễ dàng kiểm soát khi có sự cố.

### 1.3. Bản chất vấn đề DevOps giải quyết
| Vấn đề thường gặp | DevOps giải quyết thế nào |
| :--- | :--- |
| **Deploy thủ công mất thời gian:** Mỗi lần đưa code lên server phải SSH, copy file, gõ lệnh restart bằng tay. | Dùng pipeline CI/CD để build, test và deploy **tự động**. |
| **Máy local chạy được, server lại lỗi:** Môi trường dev và production (server) khác nhau (phiên bản Node/Python, thư viện...). | Dùng **Docker** để đóng gói toàn bộ ứng dụng và môi trường chạy cho nhất quán. |
| **Không biết lỗi nằm ở đâu:** Thiếu log, thiếu công cụ theo dõi, app sập không ai biết. | Thiết lập **Monitoring & Logging** (Prometheus, Grafana, ELK) để báo động khi có lỗi. |
| **Sợ deploy vì dễ hỏng:** Không có test, không có môi trường staging (chạy thử) hoặc rollback (quay lại bản cũ). | Xây dựng quy trình release rõ ràng với **Automated Test** và kịch bản Rollback. |

### 1.4. Lộ trình học gợi ý
Để tránh bị "ngợp", hãy học theo thứ tự:
1.  **Linux/Bash Script**: Làm chủ terminal, quản lý file, process, viết script tự động.
2.  **Mạng máy tính & SSH**: Hiểu về IP, Port, cách truy cập server từ xa an toàn.
3.  **Git/GitHub**: Quản lý phiên bản code, làm việc nhóm.
4.  **Docker**: Đóng gói ứng dụng để chạy ở bất kỳ đâu.
5.  **Nginx & Cloud**: Mang ứng dụng ra ngoài Internet (AWS EC2, Domain, HTTPS).
6.  **CI/CD**: Tự động hóa quá trình deploy (Github Actions, GitLab CI/CD).

---

## Bài 2: Linux Cơ Bản (Điều hướng, Quản lý File, Phân quyền)

Trong môi trường server thực tế, bạn sẽ không có giao diện chuột (GUI) mà hoàn toàn thao tác qua **Terminal (Dòng lệnh)**.

### 2.1. Thư mục và Điều hướng
| Lệnh | Ý nghĩa | Ví dụ & Ghi chú |
| :--- | :--- | :--- |
| `pwd` | Xem đường dẫn thư mục hiện tại | Dùng khi không biết mình đang đứng ở đâu |
| `ls -la` | Liệt kê tất cả file/thư mục (kể cả file ẩn) | `-l` là dạng list, `-a` là all (file ẩn bắt đầu bằng dấu chấm) |
| `cd <thư_mục>` | Di chuyển vào thư mục | `cd ..` để về thư mục cha, `cd ~` để về Home directory |

### 2.2. Thao tác với File & Folder
| Lệnh | Ý nghĩa | Ví dụ & Ghi chú |
| :--- | :--- | :--- |
| `touch <file>` | Tạo file rỗng | `touch config.txt` |
| `mkdir -p` | Tạo thư mục | `mkdir -p app/src/components` (`-p` tạo cả thư mục cha nếu chưa có) |
| `cat <file>` | Xem nội dung file | `cat app.log` (in toàn bộ file ra màn hình) |
| `tail -f` | Xem log realtime | `tail -f app.log` (dùng rất nhiều khi chờ debug ứng dụng) |
| `cp / mv / rm`| Copy / Di chuyển (đổi tên) / Xóa | `rm -r old_folder` (Xóa thư mục và các file bên trong) |
| `du -sh` | Xem dung lượng ổ cứng | `du -sh /var/log` (Hữu ích khi server báo full disk) |

### 2.3. Quyền (Permissions) trong Linux
Mọi file trong Linux đều có quyền đọc (Read - r), ghi (Write - w), và chạy (Execute - x).

*   **`ls -l`**: Kiểm tra quyền của file. Kết quả sẽ có dạng `-rwxr-xr--`.
*   **`chmod +x <file>`**: Cấp quyền chạy cho một file script. Ví dụ: `chmod +x deploy.sh` (rất quan trọng, nếu quên lệnh này thì script không thể chạy).
*   **`chown user:group <file>`**: Thay đổi chủ sở hữu file. Ví dụ: `sudo chown ubuntu:ubuntu index.html`.

---

## Bài 3: Trình soạn thảo Vim

**Vim** là một trình soạn thảo văn bản chạy trực tiếp trên Terminal. Điểm khó nhất của Vim là nó có nhiều chế độ hoạt động khác nhau.

### 3.1. Các chế độ quan trọng
1.  **Normal Mode (Chế độ lệnh)**: Mặc định khi vừa mở Vim. Dùng để di chuyển, copy, xóa, nhưng **không thể gõ chữ**.
2.  **Insert Mode (Chế độ gõ chữ)**: Dùng để soạn thảo nội dung.
3.  **Command Mode (Chế độ thoát/lưu)**: Để thực hiện lưu file, thoát hoặc tìm kiếm.

### 3.2. Quy trình sinh tồn với Vim
Khi chạy lệnh `vim config.txt`, hãy làm theo các bước:
1.  Nhấn phím **`i`** (để vào Insert Mode). Lúc này bạn mới bắt đầu gõ được nội dung.
2.  Gõ nội dung, sửa code tùy ý.
3.  Nhấn phím **`Esc`** (để thoát về Normal Mode).
4.  Gõ **`:wq`** rồi nhấn Enter (để Lưu và Thoát). Nếu muốn thoát mà **không lưu**, gõ **`:q!`**.

### 3.3. Các phím tắt cần nhớ ở Normal Mode
*   **Di chuyển**: `gg` (về đầu file), `G` (xuống cuối file), `0` (về đầu dòng), `$` (về cuối dòng).
*   **Xóa/Copy**: `dd` (xóa cả dòng), `yy` (copy cả dòng), `p` (dán), `u` (hoàn tác / undo).
*   **Tìm kiếm**: Gõ `/từ_khóa` (Ví dụ `/server_name`), nhấn `n` để tìm tiếp kết quả sau.

---

## Bài 4: Quản trị Hệ thống Linux (Process, Systemctl, Biến môi trường)

Đây là những kiến thức cốt lõi giúp bạn làm chủ hệ điều hành, biết được cái gì đang chạy, tại sao server bị treo và làm sao cấu hình biến bảo mật.

### 4.1. Quản lý Tiến trình (Process)
Khi một chương trình chạy (ví dụ: Nginx, NodeJS, Docker), nó sẽ tạo ra các **Process** (Tiến trình) và chiếm dụng CPU, RAM.

*   **`top`** hoặc **`htop`**: Mở bảng theo dõi tài nguyên (giống Task Manager trên Windows). Giúp phát hiện process nào đang ăn nhiều RAM hay CPU nhất. Nhấn `q` để thoát.
*   **`ps aux`**: Liệt kê chi tiết mọi process đang chạy.
*   **Tìm process bằng grep**: `ps aux | grep nginx` (Tìm xem Nginx đang chạy bằng những process nào, có PID là bao nhiêu).
*   **`kill <PID>`**: Ép buộc một process dừng lại. PID là mã số của process đó. Nếu process bị treo cứng, dùng `kill -9 <PID>`.

### 4.2. Quản lý Service với Systemd (systemctl)
Các phần mềm quan trọng như Nginx, Docker, SSHD trên server Linux đều chạy ngầm như một **Service**. `systemctl` là công cụ giúp quản lý chúng.

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `sudo systemctl status nginx` | Xem trạng thái Nginx (đang chạy màu xanh, lỗi màu đỏ). |
| `sudo systemctl start nginx` | Khởi động Nginx. |
| `sudo systemctl stop nginx` | Dừng Nginx. |
| `sudo systemctl restart nginx` | Khởi động lại Nginx (Cần thiết sau khi sửa file cấu hình). |
| `sudo systemctl enable docker` | Đặt Docker tự động chạy khi server khởi động (reboot). |

### 4.3. Biến môi trường (Environment Variables)
Biến môi trường là các giá trị được khai báo ở mức hệ điều hành, giúp các ứng dụng đọc được cấu hình mà **không cần ghi trực tiếp (hardcode) mật khẩu vào code**.

*   **Khởi tạo biến tạm thời:** `export DB_PASS="secret123"`
*   **Đọc biến:** `echo $DB_PASS`
*   **Lưu biến vĩnh viễn:** Bạn phải ghi vào file `~/.bashrc` hoặc `~/.profile`.
*   **File `.env`**: Trong thực tế, các project code (NodeJS, Python, Docker) thường dùng một file tên là `.env` để chứa các biến môi trường thay vì set thẳng vào OS.
    Ví dụ file `.env`:
    ```
    PORT=3000
    DB_HOST=127.0.0.1
    DB_PASSWORD=siêubảo_mật
    ```
    **Lưu ý quan trọng**: Tuyệt đối không bao giờ commit file `.env` lên Github. Hãy đưa nó vào file `.gitignore`.

---

## Bài 5: Dòng chảy dữ liệu (Pipe & Redirect) & Công cụ tìm kiếm

Linux hoạt động theo nguyên tắc: **"Mọi thứ đều là File"** và dữ liệu chạy qua lại như những dòng chảy (Stream).

### 5.1. Kỹ thuật điều hướng (Redirect)
Thay vì in kết quả ra màn hình, ta có thể "bẻ lái" luồng dữ liệu đó vào một file text để lưu lại (rất hay dùng để lưu log).

*   **`>` (Ghi đè)**: Nếu file đã có dữ liệu, nó sẽ bị xóa sạch và thay bằng dữ liệu mới.
    *Ví dụ:* `echo "Hello" > log.txt`
*   **`>>` (Ghi nối đuôi)**: Giữ nguyên dữ liệu cũ, ghi thêm dòng mới vào cuối file.
    *Ví dụ:* `echo "Error 404" >> log.txt`

### 5.2. Đường ống thần kỳ Pipe (`|`)
Dấu `|` dùng để lấy đầu ra của lệnh phía trước làm đầu vào cho lệnh phía sau. Giúp kết hợp nhiều lệnh lại với nhau.
*Ví dụ:* `cat /var/log/nginx/error.log | grep "critical"` (Đọc file log, nhưng chỉ lọc ra những dòng chứa chữ "critical").

### 5.3. Hai "Thám tử": Grep và Find
*   **`grep`**: Tìm kiếm **bên trong nội dung file**.
    *Cú pháp:* `grep -i "từ_khóa" tên_file` (Cờ `-i` giúp tìm không phân biệt chữ hoa/thường).
*   **`find`**: Tìm kiếm **vị trí của file** dựa trên tên.
    *Cú pháp:* `find /home -name "*.conf"` (Tìm tất cả file có đuôi `.conf` trong thư mục `/home`).

---

## Bài 6: Bash Scripting - Tự động hoá cho DevOps

Thay vì gõ từng lệnh, chờ chạy xong rồi gõ lệnh tiếp theo, ta gom tất cả vào một file script để máy tính tự động chạy từ trên xuống dưới.

### 6.1. Quy tắc viết Bash Script
1.  Luôn bắt đầu file bằng dòng Shebang: **`#!/bin/bash`**. Dòng này báo cho OS biết hãy dùng trình dịch Bash để chạy file này.
2.  Sau khi viết xong file (ví dụ `backup.sh`), phải cấp quyền bằng lệnh `chmod +x backup.sh`.
3.  Chạy script bằng cách gõ: `./backup.sh`.

### 6.2. Kịch bản Backup thực chiến
Dưới đây là một script backup, tự nén thư mục và tự ghi log:
```bash
#!/bin/bash
SOURCE_DIR="$HOME/devops-lab"
BACKUP_DIR="$HOME/backups"
LOG_FILE="$BACKUP_DIR/backup.log"
DATE=$(date +"%Y-%m-%d_%H-%M")

# 1. Tạo thư mục backup nếu chưa có
mkdir -p "$BACKUP_DIR"

# 2. Nén thư mục (-c: create, -z: gzip, -f: file)
tar -czf "$BACKUP_DIR/backup-$DATE.tar.gz" "$SOURCE_DIR"

# 3. Ghi log kiểm tra thành công hay thất bại
if [ $? -eq 0 ]; then
    echo "[$DATE] SUCCESS: Backup thành công" >> "$LOG_FILE"
else
    echo "[$DATE] ERROR: Backup thất bại" >> "$LOG_FILE"
fi
```

### 6.3. Tự động hóa với Cronjob
Để script trên tự chạy vào 23:00 mỗi đêm:
1. Gõ `crontab -e`.
2. Thêm dòng: `0 23 * * * /home/user/backup.sh`

---

## Bài 7: Quản lý Mã nguồn với Git & GitHub

Git giống như một "Cỗ máy thời gian". Nếu bạn làm hỏng code, Git giúp bạn khôi phục lại phiên bản hoàn hảo ngày hôm qua chỉ bằng một lệnh.

### 7.1. Ba môi trường của Git
1.  **Working Directory**: Thư mục bạn đang gõ code.
2.  **Staging Area (Sân chờ)**: Nơi chứa những file đã sửa xong, chuẩn bị lưu. (Lệnh `git add`)
3.  **Local Repository (Kho lưu trữ)**: Nơi Git đóng băng các file lại thành một phiên bản. (Lệnh `git commit`)

### 7.2. Chu trình lệnh cơ bản hàng ngày
*   `git init`: Biến thư mục bình thường thành Git repository.
*   `git status`: Xem file nào vừa bị sửa.
*   `git add .`: Đưa tất cả file bị sửa vào Staging Area.
*   `git commit -m "Tính năng mới"`: Lưu lại với một lời nhắn.
*   `git push`: Đẩy code từ máy bạn lên kho GitHub trên mạng.
*   `git pull`: Kéo code mới nhất từ GitHub về máy bạn (thường dùng khi làm việc nhóm).

### 7.3. Git Branch (Nhánh) và Merge
Thực tế đi làm, **không ai code trực tiếp lên nhánh `main`**. Bạn phải tạo ra một nhánh con, làm việc trên đó, test kỹ rồi mới "gộp" (Merge) vào nhánh chính.
*   `git branch feature-login`: Tạo nhánh mới tên là `feature-login`.
*   `git checkout feature-login`: Chuyển sang nhánh đó để làm việc. (Hoặc dùng lệnh gộp `git checkout -b feature-login`).
*   **Pull Request (PR)**: Sau khi đẩy nhánh của bạn lên GitHub, bạn tạo một PR để đồng nghiệp review code. Nếu OK, họ sẽ duyệt để Merge code của bạn vào `main`.
*   **Merge Conflict (Xung đột code)**: Xảy ra khi 2 người cùng sửa 1 dòng code. Lúc này Git sẽ đánh dấu lỗi trong file, bạn phải mở file ra, xóa phần code bị sai và giữ lại phần đúng, rồi `git commit` lại.

---

## Bài 8: Mạng máy tính cơ bản & HTTP Status Codes

Để một máy tính giao tiếp với thế giới, nó cần mạng. Hiểu mạng giúp bạn biết vì sao app không kết nối được database hay vì sao web sập.

### 8.1. IP, Port và DNS
Hãy tưởng tượng một Server (máy tính) giống như một Tòa chung cư.
*   **IP Address (Địa chỉ IP):** Là Địa chỉ của tòa chung cư (Ví dụ: `192.168.1.100` hoặc `52.74.103.175`). 
*   **Port (Cổng):** Là Số phòng trong tòa chung cư. Một máy tính có thể chạy cùng lúc nhiều phần mềm. Gói tin mạng chui vào đúng phần mềm nhờ số Port.
    *   Port `80` và `443`: Dành cho Web (HTTP/HTTPS).
    *   Port `22`: Dành cho SSH (điều khiển từ xa).
    *   Port `3306` hoặc `5432`: Dành cho Database.
*   **DNS (Domain Name System):** Danh bạ điện thoại của Internet. Nó dịch tên miền dễ nhớ (như `google.com`) thành địa chỉ IP (như `142.250.190.46`).

### 8.2. HTTP Status Codes (Mã trạng thái)
Khi bạn gõ URL vào trình duyệt, Server sẽ trả về một mã số cho biết kết quả:
*   **200 OK**: Thành công. Web tải bình thường.
*   **400 Bad Request**: Trình duyệt (hoặc code frontend) gửi dữ liệu sai định dạng.
*   **401 / 403**: Lỗi xác thực (Chưa đăng nhập / Không có quyền truy cập).
*   **404 Not Found**: Đường dẫn không tồn tại. (DevOps cần kiểm tra Nginx cấu hình đúng thư mục chưa).
*   **500 Internal Server Error**: Code Backend bị lỗi (crash). Mở log backend ra xem ngay!
*   **502 Bad Gateway**: Nginx chạy bình thường nhưng không thể gọi được Backend/Docker. (Rất hay gặp khi container bị chết).

### 8.3. "Bác sĩ khám mạng" (Lệnh kiểm tra)
| Lệnh | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| `ip a` | Xem IP của máy hiện tại | `ip a` |
| `ping` | Xem máy đích có "sống" không | `ping google.com` |
| `ss -tulpn` | Xem Port nào đang mở, phần mềm nào đang giữ port đó | `ss -tulpn` |
| `curl` | Gọi web từ terminal | `curl -I https://app.trongdev.me` |

---

## Bài 9: SSH - "Chìa khóa vạn năng" điều khiển Server từ xa

Làm sao để ngồi ở quán cafe mà gõ lệnh được trên cái Server vật lý đặt ở tận bên Mỹ? Đó là nhờ **SSH (Secure Shell)**.

### 9.1. Bản chất của SSH Key
Thay vì dùng Mật khẩu (rất dễ bị hacker mò ra bằng phần mềm dò pass), hệ thống thực tế dùng **SSH Key**. Nó gồm 1 cặp:
1.  **Private Key (Chìa khóa bí mật)**: Nằm ở máy của bạn. Tuyệt đối không cho ai biết, không push lên mạng.
2.  **Public Key (Ổ khóa)**: Gửi cái này lên mọi Server bạn muốn truy cập.

Khi bạn kết nối, Server sẽ lấy Ổ khóa ra test. Nếu khớp với Chìa khóa ở máy bạn, nó cho vào ngay lập tức mà không cần hỏi pass. Rất an toàn và hữu ích khi làm CI/CD tự động.

### 9.2. Cách tạo và sử dụng SSH Key
1.  Tạo chìa khóa: Gõ lệnh `ssh-keygen` trên máy của bạn (Cứ Enter liên tục).
2.  Lệnh này sinh ra 2 file trong thư mục `~/.ssh/`: file `id_rsa` (Private Key) và `id_rsa.pub` (Public Key).
3.  Copy ổ khóa lên server: `ssh-copy-id ubuntu@<IP_Server>`
4.  Từ giờ, chỉ cần gõ `ssh ubuntu@<IP_Server>` là bạn sẽ được vào thẳng server.

---

## Bài 10: Docker & Docker Compose Thực Hành

### 10.1. Mục tiêu bài học
Sau bài này, người học cần hiểu được:
- Docker dùng để đóng gói và chạy ứng dụng trong container.
- Phân biệt được Dockerfile, Image, Container, Docker Hub, Volume và Network.
- Biết các lệnh Docker quan trọng dùng trong thực tế.
- Biết build image, chạy container, xem log, vào container để debug.
- Biết vì sao cần port mapping khi chạy ứng dụng bằng Docker.
- Biết dùng Docker Compose để quản lý nhiều container dễ hơn.
- Biết các lỗi Docker thường gặp và cách kiểm tra.

### 10.2. Bảng khái niệm Docker quan trọng

| Khái niệm | Ý nghĩa | Ví dụ |
| :--- | :--- | :--- |
| **Dockerfile** | File công thức dùng để tạo Docker Image | `Dockerfile` |
| **Image** | Bản đóng gói read-only của ứng dụng và môi trường chạy | `nginx:alpine`, `username/website:v2` |
| **Container** | Phiên bản đang chạy được tạo ra từ Image | `my_web_container` |
| **Docker Hub** | Nơi lưu trữ và chia sẻ Docker Image trên Internet | `hub.docker.com` |
| **Registry** | Kho lưu image. Docker Hub là một loại registry phổ biến | Docker Hub, GitHub Container Registry |
| **Volume** | Nơi lưu dữ liệu bền vững, không mất khi container bị xóa | `mysql_data:/var/lib/mysql` |
| **Network** | Mạng riêng để các container giao tiếp với nhau | `app-network` |
| **Port Mapping** | Ánh xạ cổng từ máy host vào container | `-p 8080:80` |
| **Docker Compose** | Công cụ quản lý nhiều container bằng file .yml | `docker-compose.yml` |

### 10.3. Công thức cốt lõi cần nhớ

```
Dockerfile → (docker build) → Image → (docker run) → Container
```

Ví dụ với website:
```
Code HTML/CSS/JS → Dockerfile → Image: username/website:v2 → Container → Website chạy trên server
```

### 10.4. Phân biệt Image và Container

| Tiêu Chí | Image | Container |
| :--- | :--- | :--- |
| Bản chất | Bản đóng gói, khuôn mẫu | Phiên bản đang chạy từ image |
| Trạng thái | Không chạy | Đang chạy hoặc đã dừng |
| Có thể sửa trực tiếp không? | Không nên sửa trực tiếp | Có thể thao tác tạm thời |
| Lệnh xóa | `docker rmi <image>` | `docker rm <container>` |
| Lệnh xem | `docker images` | `docker ps` |

> **Cách nhớ**: Image = Bản thiết kế. Container = Căn nhà được xây từ bản thiết kế đó. Hoặc: Image = Class, Container = Object.

### 10.5. Các lệnh Docker quan trọng

**Kiểm tra Docker đã cài chưa:**
```bash
docker --version
```

**Xem danh sách image trên máy:**
```bash
docker images
```

**Tải image từ Docker Hub:**
```bash
docker pull nginx:alpine
```

**Chạy container:**
```bash
docker run -d --name my_web -p 8080:80 nginx
```

| Thành phần | Ý nghĩa |
| :--- | :--- |
| `-d` | Chạy nền (detached) |
| `--name my_web` | Đặt tên container |
| `-p 8080:80` | Map port 8080 máy host → port 80 container |

**Xem container:**
```bash
docker ps        # container đang chạy
docker ps -a     # tất cả container kể cả đã dừng
```

**Dừng và xóa container:**
```bash
docker stop my_web
docker rm my_web
```

**Xem log container (rất quan trọng khi debug):**
```bash
docker logs my_web          # xem toàn bộ log
docker logs -f my_web       # xem log realtime
docker logs --tail 100 my_web  # xem 100 dòng cuối
```

**Vào bên trong container:**
```bash
docker exec -it my_web /bin/sh
# hoặc nếu container có bash:
docker exec -it my_web /bin/bash
```

**Kiểm tra chi tiết container (IP nội bộ, network, volume, env vars...):**
```bash
docker inspect my_web
```

**Build image từ Dockerfile:**
```bash
docker build -t my-website:v1 .
```

**Push image lên Docker Hub:**
```bash
docker login
docker push username/my-website:v1
```

### 10.6. Dockerfile cơ bản

Dockerfile là file hướng dẫn Docker cách tạo ra image. Ví dụ website tĩnh dùng Nginx:

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

| Dòng | Ý nghĩa |
| :--- | :--- |
| `FROM nginx:alpine` | Lấy image nền là Nginx bản nhẹ |
| `COPY . /usr/share/nginx/html` | Copy toàn bộ code website vào thư mục web của Nginx |
| `EXPOSE 80` | Khai báo container dùng port 80 |

Build và chạy:
```bash
docker build -t my-website:v1 .
docker run -d --name my_web_container -p 8080:80 my-website:v1
curl http://localhost:8080
```

### 10.7. File `.dockerignore`

Giống như `.gitignore` dùng để không push file thừa lên Git, `.dockerignore` giúp không copy file thừa vào image khi `docker build`. Điều này giúp image nhẹ hơn và build nhanh hơn.

Ví dụ file `.dockerignore`:
```
node_modules
.git
.env
*.log
```

> **Tại sao quan trọng?** Nếu không có `.dockerignore`, thư mục `node_modules` có thể nặng vài trăm MB sẽ bị copy vào image, làm image phình to không cần thiết.

### 10.8. Port Mapping trong Docker

Container có mạng riêng. Ứng dụng bên trong container có thể chạy ở port 80, nhưng bên ngoài chưa truy cập được nếu không map port.

```
Cú pháp: -p <port_máy_host>:<port_trong_container>
Ví dụ:   -p 8080:80
```

Sơ đồ trong dự án thực tế:
```
User → https://app.trongdev.me → Nginx (port 443) → localhost:8080 → Docker Container (port 80)
```

> **Quy tắc quan trọng**: Khi dùng Nginx làm reverse proxy, **đừng bao giờ** map Docker ra port 80 (`-p 80:80`). Hãy để Nginx giữ port 80/443, còn Docker chạy ở port phụ như 8080.

### 10.9. Docker Volume

**Volume** là nơi lưu dữ liệu bền vững cho container. Mặc định, nếu dữ liệu nằm trong container và container bị xóa, dữ liệu sẽ **mất**. Volume giúp tách dữ liệu ra khỏi vòng đời container.

Ví dụ chạy MySQL với volume và biến môi trường:
```bash
# Tạo volume trước
docker volume create mysql_data

# Chạy MySQL - dùng biến môi trường thay vì hardcode password
docker run -d \
  --name mysql_db \
  -e MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD}" \
  -v mysql_data:/var/lib/mysql \
  mysql:8
```

> **Lưu ý bảo mật**: Không bao giờ ghi mật khẩu trực tiếp vào lệnh hay file. Hãy dùng biến môi trường hoặc file `.env`.

Các lệnh volume:
```bash
docker volume ls              # xem danh sách volume
docker volume create my_data  # tạo volume
docker volume inspect my_data # xem chi tiết
docker volume rm my_data      # xóa volume (cẩn thận nếu là database!)
```

### 10.10. Docker Network

Docker Network giúp các container giao tiếp với nhau. Khi nhiều container cùng nằm trong 1 network, chúng có thể gọi nhau bằng **tên container** thay vì cần biết IP nội bộ.

Ví dụ: backend gọi database qua `database:3306` thay vì phải biết IP `172.17.0.2`.

```bash
docker network create app-network

docker run -d --name backend --network app-network backend-image
docker run -d --name database --network app-network mysql:8
# Trong code backend có thể dùng: mysql://database:3306/...
```

### 10.11. Docker Compose

Thay vì gõ nhiều lệnh `docker run`, ta viết tất cả vào 1 file `docker-compose.yml`.

**Ví dụ website tĩnh:**
```yaml
services:
  web:
    image: username/my-website:v1
    container_name: my_web_container
    ports:
      - "8080:80"
    restart: unless-stopped
```

**Ví dụ có network, volume và biến môi trường từ file .env:**
```yaml
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    networks:
      - app-network

  mysql:
    image: mysql:8
    container_name: mysql_db
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network

volumes:
  mysql_data:

networks:
  app-network:
```

File `.env` đi kèm (không commit lên Git):
```
MYSQL_ROOT_PASSWORD=mật_khẩu_mạnh_của_bạn
MYSQL_DATABASE=app_db
```

**Các lệnh Compose:**
```bash
docker compose up -d     # khởi động tất cả service
docker compose down      # dừng và xóa container (volume vẫn còn)
docker compose down -v   # dừng VÀ xóa cả volume (cẩn thận! dữ liệu mất sạch)
docker compose logs -f   # xem log tất cả service
docker compose ps        # xem trạng thái các service
```

> **Phân biệt `down` và `down -v`**: `docker compose down` chỉ xóa container, dữ liệu trong volume vẫn được giữ nguyên và an toàn. `docker compose down -v` xóa cả volume, toàn bộ dữ liệu database sẽ mất. Không dùng `-v` trên production nếu chưa backup!

### 10.12. Quy trình Docker trong CI/CD

Quy trình thực tế khi push code lên nhánh `main`:

```
Developer viết code
    ↓
git push
    ↓
GitHub Actions chạy
    ↓
docker build → docker push lên Docker Hub
    ↓
SSH vào AWS EC2
    ↓
docker compose pull (kéo image mới)
    ↓
docker compose up -d (khởi động lại bằng compose)
    ↓
Nginx reverse proxy ra domain HTTPS
```

Ví dụ lệnh deploy trên server (dùng Compose, không dùng `docker run` thuần):
```bash
cd /home/ubuntu/project-folder
docker compose pull        # kéo image mới nhất từ Docker Hub
docker compose up -d       # khởi động lại service với image mới
docker compose ps          # kiểm tra trạng thái
```

### 10.13. Bảng lệnh Docker ôn nhanh

| Lệnh | Chức năng |
| :--- | :--- |
| `docker --version` | Xem phiên bản Docker |
| `docker images` | Xem danh sách image |
| `docker pull <image>` | Tải image |
| `docker build -t <name>:<tag> .` | Build image từ Dockerfile |
| `docker push <image>` | Push image lên registry |
| `docker ps` | Xem container đang chạy |
| `docker ps -a` | Xem tất cả container |
| `docker run -d --name <name> -p 8080:80 <image>` | Chạy container |
| `docker stop <container>` | Dừng container |
| `docker rm <container>` | Xóa container |
| `docker rmi <image>` | Xóa image |
| `docker logs <container>` | Xem log container |
| `docker logs -f <container>` | Xem log realtime |
| `docker exec -it <container> /bin/sh` | Vào trong container |
| `docker inspect <container>` | Xem chi tiết container |
| `docker volume ls` | Xem volume |
| `docker network ls` | Xem network |
| `docker compose up -d` | Chạy các service trong Compose |
| `docker compose down` | Dừng và xóa các service Compose |
| `docker compose down -v` | Dừng, xóa service **và** volume |

### 10.14. Lỗi Docker thường gặp

| Lỗi | Nguyên nhân | Cách kiểm tra / sửa |
| :--- | :--- | :--- |
| `permission denied while trying to connect to Docker daemon` | User chưa có quyền dùng Docker | Dùng `sudo docker ...` hoặc thêm user vào group docker: `sudo usermod -aG docker $USER` |
| `pull access denied` | Sai tên image hoặc image private | Kiểm tra lại tên image, tag, Docker Hub login |
| `port is already allocated` | Port đã bị service khác chiếm | Chạy `sudo ss -tulpn` để xem port nào bị chiếm |
| Container vừa chạy đã tắt | App lỗi hoặc command sai | Xem `docker logs <container>` |
| Không truy cập được website | Sai port mapping hoặc app chưa listen | Kiểm tra `docker ps`, `curl localhost:8080` |
| Xóa container mất dữ liệu | Dữ liệu nằm trong container, không dùng volume | Dùng Docker Volume cho database |
| `docker compose` không chạy | Chưa cài Compose hoặc sai file YAML | Kiểm tra `docker compose version`, sửa indent YAML |
| Image quá nặng | Dockerfile copy nhiều file rác | Thêm file `.dockerignore`, dùng base image nhẹ như `alpine` |
| Server pull image cũ | Tag không đổi hoặc cache | Dùng tag version rõ ràng như `v1`, `v2`, tránh chỉ dùng `latest` |

### 10.15. Bài tập thực hành

**Bài tập 1: Chạy Nginx bằng Docker**
```bash
docker run -d --name test_nginx -p 8080:80 nginx:alpine
curl http://localhost:8080
docker logs test_nginx
docker stop test_nginx && docker rm test_nginx
```

**Bài tập 2: Build website tĩnh thành Docker Image**

Tạo file `index.html`:
```html
<h1>Hello Docker</h1>
<p>Website này đang chạy trong container.</p>
```

Tạo `Dockerfile`:
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

Tạo `.dockerignore`:
```
*.md
.git
```

Build và chạy:
```bash
docker build -t my-static-web:v1 .
docker run -d --name my_static_web -p 8080:80 my-static-web:v1
curl http://localhost:8080
```

**Bài tập 3: Đẩy image lên Docker Hub**
```bash
docker tag my-static-web:v1 username/my-static-web:v1
docker login
docker push username/my-static-web:v1
```

**Bài tập 4: Chạy bằng Docker Compose**

Tạo `docker-compose.yml`:
```yaml
services:
  web:
    image: my-static-web:v1
    container_name: my_static_web
    ports:
      - "8080:80"
    restart: unless-stopped
```

```bash
docker compose up -d
docker ps
curl http://localhost:8080
docker compose down
```

### 10.16. Tóm tắt cần nhớ

**Công thức quan trọng:** `Dockerfile → Image → Container`

**Quy trình deploy thực tế:**
```
Code → Build Docker Image → Push Docker Hub → Pull về AWS EC2 → docker compose up -d → Nginx HTTPS → User truy cập domain
```

**Điều quan trọng nhất:** Trước khi xóa hoặc chạy lại container lỗi, luôn xem log trước:
```bash
docker logs <container>
```

---

## Bài 11: Web Server Nginx & Reverse Proxy

### 11.1. Nginx là gì?

**Nginx** (đọc là _Engine-X_) là một Web Server và Reverse Proxy Server hiệu năng cao, được sử dụng phổ biến trong môi trường Production, DevOps và Cloud.

Nginx đóng vai trò là **"Người Lễ Tân"** đứng trước cửa tòa nhà: đón toàn bộ lượt khách từ Internet, kiểm tra họ muốn vào phòng nào, rồi dẫn họ đến đúng ứng dụng đang chạy bên trong — mà khách không cần biết chi tiết bên trong là gì.

---

### 11.2. Tại sao cần Nginx? (So sánh kiến trúc)

**Kiến trúc KHÔNG có Nginx:**
```
Internet → Docker Container (port 80) → Website
```
Vấn đề:
- Container phải mở thẳng cổng 80 ra Internet — rủi ro bảo mật.
- Khó cấu hình HTTPS (chứng chỉ SSL).
- Chỉ chạy được **1 website** trên server (vì 1 server chỉ có 1 cổng 80).
- Không phù hợp môi trường Production.

**Kiến trúc CÓ Nginx:**
```
Internet → Nginx (port 80/443) → Docker Container (port 8080) → Website
```
Lợi ích:
- Nginx nắm giữ cổng 80/443, ứng dụng chạy ngầm ở cổng nội bộ (8080, 3000...).
- Chạy **nhiều website** cùng lúc trên 1 server, phân loại theo domain.
- Dễ dàng bật HTTPS cho toàn bộ domain từ một chỗ.
- Che giấu kiến trúc nội bộ, tăng bảo mật.

---

### 11.3. Reverse Proxy là gì?

**Reverse Proxy** là cơ chế Nginx đứng giữa người dùng và ứng dụng, nhận request rồi _chuyển tiếp (proxy)_ vào đúng địa chỉ nội bộ.

```
Người dùng gõ:     https://app.trongdev.me
Nginx nhận và gửi tới: http://127.0.0.1:8080  ← app đang chạy ở đây
```

Người dùng chỉ thấy domain, không biết ứng dụng thật đang chạy ở đâu và bằng công nghệ gì.

---

### 11.4. Các vai trò của Nginx

**1. Reverse Proxy** — vai trò chính, đã giải thích ở trên.

**2. Chạy nhiều ứng dụng trên 1 server**
```
app.trongdev.me     → Frontend  (port 8080)
api.trongdev.me     → Backend   (port 3000)
grafana.trongdev.me → Grafana   (port 3001)
jenkins.trongdev.me → Jenkins   (port 8081)
```
Tất cả đều đi qua Nginx, mỗi domain được route đến đúng ứng dụng.

**3. HTTPS (SSL/TLS)** — Nginx kết hợp với Let's Encrypt/Certbot để mã hóa kết nối.

**4. Chuyển hướng HTTP → HTTPS** — Tự động đẩy người dùng từ `http://` sang `https://`.

**5. Phục vụ Static Files nhanh** — HTML, CSS, JS, hình ảnh được Nginx xử lý trực tiếp mà không cần qua app server.

**6. Load Balancing** — Phân phối tải cho nhiều server backend:
```
Internet → Nginx → Server1
                 → Server2
                 → Server3
```

---

### 11.5. Cài đặt Nginx

Trên Ubuntu/Debian (AWS EC2):
```bash
sudo apt update
sudo apt install nginx -y

# Kiểm tra Nginx đã chạy chưa
sudo systemctl status nginx

# Đặt Nginx tự khởi động khi server reboot
sudo systemctl enable nginx
```

Truy cập `http://<IP_Server>` trong trình duyệt — nếu thấy trang "Welcome to nginx!" là thành công.

---

### 11.6. Cấu trúc thư mục Nginx cần biết

```
/etc/nginx/
├── nginx.conf                  ← File config chính (không sửa trực tiếp)
├── sites-available/            ← Nơi VIẾT các config cho từng website
│   ├── app.trongdev.me         ← File config của website này
│   └── default                 ← Config mặc định (nên xóa khi deploy)
└── sites-enabled/              ← Nơi KÍCH HOẠT config (chỉ là symlink)
    └── app.trongdev.me → ../sites-available/app.trongdev.me
```

**Quy trình chuẩn:**
1. Viết config vào `sites-available/`.
2. Tạo symlink sang `sites-enabled/` để kích hoạt.
3. Kiểm tra cú pháp rồi reload Nginx.

```bash
# Bước 1: Tạo file config
sudo nano /etc/nginx/sites-available/app.trongdev.me

# Bước 2: Kích hoạt (tạo symlink)
sudo ln -s /etc/nginx/sites-available/app.trongdev.me /etc/nginx/sites-enabled/

# Bước 3: Xóa config default (nếu chưa xóa)
sudo rm /etc/nginx/sites-enabled/default

# Bước 4: Kiểm tra cú pháp và reload
sudo nginx -t
sudo systemctl reload nginx
```

> **Tại sao dùng symlink?** Vì bạn có thể "tắt" một website chỉ bằng cách xóa symlink trong `sites-enabled/` mà không mất file config gốc trong `sites-available/`.

---

### 11.7. Cấu hình Reverse Proxy chuẩn

#### Bước 1 — Cấu hình HTTP (trước khi có SSL)

```nginx
server {
    listen 80;
    server_name app.trongdev.me;

    location / {
        proxy_pass http://127.0.0.1:8080;

        # Các header quan trọng — giúp app biết IP thật của người dùng
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **Tại sao cần `proxy_set_header`?** Khi Nginx chuyển tiếp request, nếu không truyền header, ứng dụng phía sau sẽ chỉ thấy IP của Nginx (`127.0.0.1`) chứ không thấy IP thật của người dùng. Điều này ảnh hưởng đến logging, rate-limiting và security.

#### Bước 2 — Cấu hình HTTPS hoàn chỉnh (sau khi có SSL)

```nginx
# Block 1: Chuyển hướng HTTP → HTTPS
server {
    listen 80;
    server_name app.trongdev.me;
    return 301 https://$host$request_uri;
}

# Block 2: HTTPS với Reverse Proxy
server {
    listen 443 ssl;
    server_name app.trongdev.me;

    ssl_certificate     /etc/letsencrypt/live/app.trongdev.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.trongdev.me/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Luồng hoàn chỉnh:
```
User gõ http://... → Nginx block 1 → 301 redirect → https://...
User gõ https://... → Nginx block 2 → proxy_pass → localhost:8080 → Docker Container
```

---

### 11.8. Lấy SSL miễn phí với Certbot

```bash
# Cài Certbot plugin cho Nginx
sudo apt install certbot python3-certbot-nginx -y

# Xin chứng chỉ SSL và tự động cấu hình Nginx
sudo certbot --nginx -d app.trongdev.me

# Certbot tự gia hạn định kỳ (kiểm tra cronjob)
sudo certbot renew --dry-run
```

> **Lưu ý quan trọng**: Certbot phải chạy trên server thật, domain phải đã trỏ đúng về IP server và port 80 phải đang mở. Không chạy Certbot ở local/WSL nếu domain chưa trỏ về máy đó.

---

### 11.9. Lệnh kiểm tra và debug Nginx

| Lệnh | Mục đích |
| :--- | :--- |
| `sudo nginx -t` | **Kiểm tra cú pháp config** — LUÔN chạy trước khi reload |
| `sudo systemctl reload nginx` | Áp dụng config mới mà **không** cắt kết nối hiện tại |
| `sudo systemctl restart nginx` | Restart hoàn toàn — dùng khi reload không đủ |
| `sudo systemctl status nginx` | Xem Nginx đang chạy hay bị lỗi |
| `sudo tail -f /var/log/nginx/access.log` | Xem log truy cập realtime |
| `sudo tail -f /var/log/nginx/error.log` | Xem log lỗi realtime (quan trọng khi debug) |
| `curl -I http://localhost` | Kiểm tra Nginx có phản hồi không |
| `curl -I https://app.trongdev.me` | Kiểm tra HTTPS hoạt động đúng không |

> **Quy tắc vàng:** Trước khi reload Nginx, **luôn chạy `sudo nginx -t`** để kiểm tra cú pháp. Nếu file config bị lỗi mà cứ reload, Nginx sẽ từ chối load config mới và giữ nguyên bản cũ — hoặc tệ hơn là crash.

---

### 11.10. Lỗi Nginx thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
| :--- | :--- | :--- |
| `502 Bad Gateway` | Nginx chạy OK nhưng không kết nối được app phía sau | Kiểm tra `curl localhost:8080`, xem app/container có đang chạy không |
| `404 Not Found` | Nginx không tìm thấy file hoặc route | Kiểm tra `root` path trong config, kiểm tra file có tồn tại không |
| `403 Forbidden` | Nginx không có quyền đọc file | Kiểm tra quyền file: `ls -l`, `chmod`, `chown` |
| `nginx: [emerg] bind() to 0.0.0.0:80 failed` | Port 80 đã bị chiếm bởi process khác | Chạy `sudo ss -tulpn | grep :80` để tìm process đang chiếm |
| `nginx -t` báo lỗi cú pháp | Sai dấu `;`, `{`, `}` trong file config | Đọc kỹ thông báo lỗi, sửa đúng dòng bị chỉ ra |
| Website không vào được dù Nginx chạy | Domain chưa trỏ về IP server | Kiểm tra `nslookup app.trongdev.me`, `dig app.trongdev.me` |
| Certbot thất bại | Port 80 đóng hoặc domain chưa trỏ đúng | Mở port 80 trong Security Group, đảm bảo domain trỏ đúng IP |
| `ERR_TOO_MANY_REDIRECTS` | Nginx redirect HTTP→HTTPS nhưng cũng proxy ngược lại HTTP | Thêm header `X-Forwarded-Proto` và xử lý đúng trong app |

---

### 11.11. Cách ghi nhớ tổng thể

```
Internet
    ↓
Nginx (Lễ tân — port 80/443)
    ↓  ← Kiểm tra domain, route đến đúng ứng dụng
Docker Container (Phòng làm việc — port 8080/3000/...)
    ↓
Ứng dụng (NodeJS / Python / PHP / Static Files)
```

Người dùng chỉ giao tiếp với Nginx. Mọi ứng dụng thật đều nằm phía sau và được **bảo vệ hoàn toàn khỏi Internet trực tiếp**.



## Bài 12: Đưa Website Lên Cloud (Thực chiến với Project Salon)

Trước khi cấu hình CI/CD tự động, bạn cần biết cách deploy bằng tay một lần để hiểu rõ từng bước.

### 12.1. AWS EC2 và Security Group

1. **EC2 (Elastic Compute Cloud)**: Là một máy chủ Linux ảo trên AWS. Project Salon dùng **Ubuntu Server** trên EC2.
2. **SSH Key Pair (`.pem`)**: Khi tạo máy EC2, AWS đưa cho bạn một file `.pem`. Đây là **Private Key** duy nhất để truy cập server.
   ```bash
   # SSH vào server với file .pem
   ssh -i salon-key.pem ubuntu@<Elastic_IP>
   ```
3. **Security Group (Tường lửa AWS)**: Phải mở đúng port trong **Inbound Rules**:

| Port | Protocol | Source | Mục đích |
| :--- | :--- | :--- | :--- |
| `22` | TCP | IP của bạn (hoặc 0.0.0.0/0) | SSH vào server |
| `80` | TCP | 0.0.0.0/0 | HTTP (Certbot cần) |
| `443` | TCP | 0.0.0.0/0 | HTTPS |

> **Lưu ý bảo mật**: Không nên mở port `5000` hay `8080` ra ngoài internet. Đây là port nội bộ, chỉ Nginx mới cần gọi vào chúng qua `localhost`.

### 12.2. Domain, DNS và Elastic IP

Project Salon dùng 2 domain, cả hai đều trỏ về **cùng 1 máy EC2**:

| Type | Name | Value |
| :--- | :--- | :--- |
| A Record | `salonduongchi.website` | Elastic IP của EC2 |
| A Record | `www.salonduongchi.website` | Elastic IP của EC2 |
| A Record | `api.salonduongchi.website` | Elastic IP của EC2 |

> **Elastic IP**: IP Public của EC2 tự đổi mỗi khi Tắt/Bật máy. Hãy cấp một **Elastic IP** (IP tĩnh miễn phí khi đang dùng) để 3 bản ghi DNS trên không bao giờ hỏng.

### 12.3. Cài đặt môi trường trên EC2

```bash
# SSH vào server lần đầu
ssh -i salon-key.pem ubuntu@<Elastic_IP>

# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
# Đăng xuất và đăng nhập lại để có quyền Docker

# Cài Nginx
sudo apt install nginx -y
sudo systemctl enable nginx

# Cài Certbot
sudo apt install certbot python3-certbot-nginx -y

# Clone project về server
cd /home/ubuntu
git clone https://github.com/dinhtron027/salon.git salon-root
cd salon-root

# Tạo file .env từ mẫu
cp .env.example .env
nano .env  # Điền đầy đủ giá trị thật
```

### 12.4. Cấu hình Nginx thực tế của Project Salon

File config nằm tại: `deploy/nginx/salonduongchi.website.conf`

**Điểm quan trọng**: Project Salon có **2 domain** trên cùng 1 server → cần **4 server block** trong Nginx:

```nginx
# === BLOCK 1: Frontend (salonduongchi.website) HTTPS ===
server {
    server_name salonduongchi.website www.salonduongchi.website;

    # Route sitemap và robots.txt qua frontend container
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
        proxy_pass http://127.0.0.1:8080; # Frontend container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/salonduongchi.website/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/salonduongchi.website/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# === BLOCK 2: Backend API (api.salonduongchi.website) HTTPS ===
server {
    server_name api.salonduongchi.website;

    location / {
        proxy_pass http://127.0.0.1:5000; # Backend container
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Hỗ trợ WebSocket (dùng cho Socket.IO realtime)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/salonduongchi.website/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/salonduongchi.website/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# === BLOCK 3: Redirect HTTP → HTTPS (Frontend) ===
server {
    listen 80;
    server_name salonduongchi.website www.salonduongchi.website;
    if ($host = salonduongchi.website) {
        return 301 https://$host$request_uri;
    }
    if ($host = www.salonduongchi.website) {
        return 301 https://$host$request_uri;
    }
    return 404;
}

# === BLOCK 4: Redirect HTTP → HTTPS (API) ===
server {
    listen 80;
    server_name api.salonduongchi.website;
    if ($host = api.salonduongchi.website) {
        return 301 https://$host$request_uri;
    }
    return 404;
}
```

> **Tại sao Backend cần thêm WebSocket headers?** Project Salon dùng **Socket.IO** để push thông báo realtime (đặt lịch, trạng thái đơn hàng...). WebSocket là giao thức kết nối liên tục, cần Nginx chuyển tiếp đặc biệt bằng `Upgrade` và `Connection` headers.

### 12.5. Cấu hình HTTPS và upload lên server

```bash
# Trên EC2: copy file config Nginx từ project vào đúng chỗ
sudo cp /home/ubuntu/salon-root/deploy/nginx/salonduongchi.website.conf \
    /etc/nginx/sites-available/salonduongchi.website

# Kích hoạt site
sudo ln -s /etc/nginx/sites-available/salonduongchi.website \
           /etc/nginx/sites-enabled/salonduongchi.website

# Tắt default site
sudo rm -f /etc/nginx/sites-enabled/default

# Xin chứng chỉ SSL (chạy lệnh này khi DNS đã trỏ đúng về server)
sudo certbot --nginx \
    -d salonduongchi.website \
    -d www.salonduongchi.website \
    -d api.salonduongchi.website

# Kiểm tra và reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## Bài 13: CI/CD với GitHub Actions (Phân tích từ Project Salon)

Project Salon có **2 file workflow** tách biệt theo đúng nguyên tắc: **CI** (kiểm tra code) và **CD** (deploy lên server). Đây là cách tổ chức chuẩn trong thực tế.

### 13.1. Tổng quan 2 workflow

| File | Trigger | Chức năng |
| :--- | :--- | :--- |
| `ci.yml` | Khi push hoặc có PR vào `main` | Lint, typecheck, test, build — đảm bảo code không bị lỗi |
| `deploy.yml` | Khi push vào `main` | SSH vào EC2, git pull, docker compose build & up |

**Thứ tự chạy**: CI chạy trước để kiểm tra. Nếu CI pass, deploy.yml mới có ý nghĩa (chúng chạy song song nhưng CI là "cổng kiểm tra").

### 13.2. GitHub Secrets cần tạo

Vào **Settings > Secrets and variables > Actions** của repo, tạo:

| Secret | Giá trị |
| :--- | :--- |
| `VPS_HOST` | Elastic IP hoặc domain của EC2 |
| `VPS_USER` | `ubuntu` |
| `VPS_SSH_KEY` | Toàn bộ nội dung file `.pem` (copy-paste vào đây) |

> **Không lưu gì khác lên GitHub**: Mật khẩu, API key, JWT secret đều phải nằm trong file `.env` trên server EC2, **không** trong Secrets của GitHub.

### 13.3. File CI — `.github/workflows/ci.yml`

Chạy trên **Windows** vì dev dùng Windows. Gồm 4 bước kiểm tra:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: windows-latest
    defaults:
      run:
        shell: pwsh  # PowerShell (Windows)

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22.13.0  # Phải đúng phiên bản với Dockerfile
          cache: npm
          cache-dependency-path: |
            package-lock.json
            frontend/package-lock.json

      - name: Install root dependencies
        run: npm ci --legacy-peer-deps

      - name: Install frontend dependencies
        run: npm ci --prefix frontend --legacy-peer-deps

      - name: Verify  # Chạy lint + typecheck + test + build
        run: npm run test:ci

      - name: Audit   # Kiểm tra lỗ hổng bảo mật npm packages
        run: npm run audit:ci
```

Lệnh `npm run test:ci` trong `package.json` thực ra chạy 4 việc liên tiếp:
```bash
npm run lint && npm run typecheck && npm test && npm run build
```

### 13.4. File CD — `.github/workflows/deploy.yml`

Đây là workflow deploy thật của project, có nhiều logic hay cần chú ý:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

concurrency:
  group: production-deploy
  cancel-in-progress: true  # Nếu đang deploy mà push tiếp, cancel deploy cũ
  
jobs:
  deploy:
    name: SSH Deploy to EC2
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: 22
          timeout: 5m
          command_timeout: 15m
          script: |
            set -e  # Dừng ngay nếu có lỗi
            cd /home/ubuntu/salon-root

            # 1. Kiểm tra dung lượng đĩa — cảnh báo nếu < 2GB
            AVAIL_KB=$(df / | awk 'NR==2 {print $4}')
            AVAIL_GB=$(( AVAIL_KB / 1024 / 1024 ))
            echo "Dung lượng trống: ${AVAIL_GB} GB"
            if [ "$AVAIL_GB" -lt 2 ]; then
              echo "⚠️ CẢNH BÁO: Đĩa sắp đầy! Nguy cơ build thất bại."
            fi

            # 2. Fix quyền và lấy code mới nhất
            sudo chown -R ubuntu:ubuntu .
            git fetch origin main
            git reset --hard origin/main  # Reset cứng về main, không merge

            # 3. Dọn dẹp Docker cache trước khi build
            sudo docker builder prune -f
            sudo docker image prune -f
            sudo docker container prune -f
            sudo docker network prune -f

            # 4. Build image mới từ code mới (không dừng container cũ trước)
            sudo docker compose build

            # 5. Khởi chạy container mới (--remove-orphans xóa service cũ không còn dùng)
            sudo docker compose up -d --remove-orphans

            # 6. Dọn dẹp image thừa sau deploy
            sudo docker image prune -f
```

### 13.5. Phân tích điểm thú vị của deploy.yml

**`concurrency: cancel-in-progress: true`** — Nếu bạn push 2 lần liên tiếp nhanh, lần deploy thứ nhất đang chạy sẽ bị **hủy** và nhường chỗ cho lần thứ hai. Tránh 2 deploy chạy song song gây xung đột.

**`git reset --hard origin/main`** — Thay vì `git pull`, dùng `git fetch` rồi `reset --hard` để đảm bảo server **luôn giống hệt** nhánh `main` trên GitHub, kể cả khi có file bị sửa tay trên server.

**Build trước khi down** — Lệnh `docker compose build` chạy **trước** khi `docker compose up -d`. Cách này giúp:
- Nếu build bị lỗi → container cũ vẫn đang chạy → không bị downtime.
- Chỉ khi build thành công mới mới đổi container mới.

**Kiểm tra dung lượng đĩa** — Docker build cần nhiều không gian. Script cảnh báo sớm khi đĩa sắp đầy thay vì để build thất bại giữa chừng (lỗi `ENOSPC`).

### 13.6. Luồng hoàn chỉnh khi push code

```
Developer: git push origin main
    ↓
GitHub Actions: ci.yml chạy đồng thời với deploy.yml
    ├── ci.yml: lint → typecheck → unit test → build
    └── deploy.yml:
            SSH vào EC2 (ubuntu@Elastic_IP)
            ↓
            cd /home/ubuntu/salon-root
            ↓
            git fetch + git reset --hard origin/main (lấy code mới)
            ↓
            docker compose build (build lại image frontend + backend)
            ↓
            docker compose up -d --remove-orphans
            ↓
        Container frontend (port 8080) + backend (port 5000) chạy với code mới
            ↓
        Nginx proxy → salonduongchi.website + api.salonduongchi.website
            ↓
        Người dùng thấy website được cập nhật ✅
```

**Chúc mừng bạn đã hiểu toàn bộ luồng DevOps của một project thực tế!**
Từ lúc bạn gõ `git push` cho đến lúc người dùng thấy phiên bản mới trên trình duyệt — tất cả diễn ra hoàn toàn tự động trong vài phút.
