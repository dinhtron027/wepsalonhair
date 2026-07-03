# Kubernetes Full Learning Guide (Phiên bản Chuẩn Kỹ Thuật)

Tài liệu này được biên soạn cho sinh viên IT định hướng DevOps, sử dụng dự án Web Salon (Frontend React, Backend Node.js, Database) để giải thích Kubernetes một cách thực tế, dễ hiểu nhưng vẫn đảm bảo sự chính xác tuyệt đối về mặt kỹ thuật.

## Mục lục

1. [Bài 1: Kubernetes là gì? Vì sao DevOps cần học Kubernetes?](#bài-1-kubernetes-là-gì-vì-sao-devops-cần-học-kubernetes)
2. [Bài 2: Kiến trúc Kubernetes](#bài-2-kiến-trúc-kubernetes)
3. [Bài 3: Pod](#bài-3-pod)
4. [Bài 4: Deployment, ReplicaSet và Self-healing](#bài-4-deployment-replicaset-và-self-healing)
5. [Bài 5: Service](#bài-5-service)
6. [Bài 6: Ingress và Domain](#bài-6-ingress-và-domain)
7. [Bài 7: ConfigMap và Secret](#bài-7-configmap-và-secret)
8. [Bài 8: Volume, PersistentVolume, PersistentVolumeClaim](#bài-8-volume-persistentvolume-persistentvolumeclaim)
9. [Bài 9: Namespace](#bài-9-namespace)
10. [Bài 10: Rolling Update và Rollback](#bài-10-rolling-update-và-rollback)
11. [Bài 11: Horizontal Pod Autoscaler](#bài-11-horizontal-pod-autoscaler)
12. [Bài 12: Helm](#bài-12-helm)
13. [Bài 13: CI/CD với GitHub Actions và Kubernetes](#bài-13-cicd-với-github-actions-và-kubernetes)
14. [Bài 14: Deploy project web salon lên Kubernetes](#bài-14-deploy-project-web-salon-lên-kubernetes)
15. [Bài 15: Monitoring, Logging và bảo trì Kubernetes](#bài-15-monitoring-logging-và-bảo-trì-kubernetes)
16. [Tổng kết toàn bộ Kubernetes](#tổng-kết-toàn-bộ-kubernetes)
17. [Bảng so sánh nhanh](#bảng-so-sánh-nhanh)
18. [Lộ trình học tiếp theo](#lộ-trình-học-tiếp-theo)
19. [Checklist tự đánh giá](#checklist-tự-đánh-giá)

---

## Bài 1: Kubernetes là gì? Vì sao DevOps cần học Kubernetes?

### 1. Khái niệm chính
**Kubernetes** (viết tắt là **K8s**) là một hệ thống mã nguồn mở do Google thiết kế, chuyên dùng để tự động hóa việc triển khai (deploy), mở rộng (scale) và quản lý vận hành các ứng dụng chạy trong Container ở quy mô cụm máy chủ (cluster).

### 2. Vấn đề nó giải quyết
Khi app của bạn có 1-2 container, chạy `docker-compose` trên 1 máy EC2 là đủ. Nhưng khi hệ thống lớn lên, bạn cần chạy 10 container Backend phân tán trên 5 máy chủ khác nhau để gánh tải. Lúc này bạn phải đối mặt với các vấn đề:
* Làm sao phân chia đều lượng truy cập vào 10 container (Load Balancing)?
* Nếu 1 máy chủ gặp sự cố phần cứng, ai sẽ tự động khởi tạo lại các container đó trên máy khác (High Availability)?
* Làm sao cập nhật code mới cho hàng loạt container mà web không bị gián đoạn (Zero-downtime deployment)?

K8s được sinh ra để tự động giải quyết toàn bộ các bài toán vận hành hệ thống phân tán này.

### 3. Trước khi có Kubernetes thì làm thế nào?
Trước đây, SysAdmin/DevOps phải cấu hình thủ công: SSH vào từng máy chủ để chạy lệnh Docker. Phải tự cấu hình Nginx làm Load Balancer, rồi cập nhật IP của từng container vào cấu hình mỗi khi có thay đổi. Nếu một máy chủ sập vào nửa đêm, DevOps phải thức dậy để restart hệ thống bằng tay. Rất vất vả và dễ xảy ra sai sót.

### 4. Kubernetes hoạt động như thế nào?
Bạn gộp nhiều máy chủ lại thành một cụm (**Cluster**). K8s đóng vai trò là "bộ não" điều hành cụm đó.
Thay vì cấu hình từng máy, bạn sử dụng phương pháp "Infrastructure as Code" (Hạ tầng dưới dạng mã). Bạn viết một file YAML mô tả trạng thái mong muốn: *"Tôi cần 3 container Backend luôn chạy"*. K8s sẽ tự động tìm máy rảnh để đặt container, tự động chia tải và tự khởi tạo container mới bù vào nếu có lỗi xảy ra.

### 5. Ví dụ liên hệ với project web salon
* **Docker Compose:** Project salon của bạn chạy trên 1 con EC2. Lỡ con EC2 đó sập, toàn bộ Salon ngừng hoạt động.
* **Kubernetes:** Bạn có 3 con EC2. K8s sẽ phân bổ Backend ở máy 1 và máy 2, Database ở máy 3. Khi lễ Tết khách đông, K8s tự động nhân bản (auto-scale) Backend lên 10 container. Khi vắng khách, nó thu hồi về 2 container để tối ưu chi phí.

### 6. Lỗi hiểu sai phổ biến
* **Sai lầm:** "Kubernetes quản lý Docker" (cách hiểu cũ).
  **Sự thật:** Docker thường được dùng để đóng gói ứng dụng (build image). Kubernetes chạy và quản lý các container thông qua một Container Runtime tương thích chuẩn CRI (Container Runtime Interface) như `containerd` hoặc `CRI-O`. Nói chính xác hơn: Docker giúp đóng gói app, còn K8s điều phối container ở quy mô cluster.
* **Sai lầm:** Web nào cũng nên cài K8s cho chuyên nghiệp.
  **Sự thật:** K8s cực kỳ phức tạp và cần tài nguyên máy chủ riêng để chạy Control Plane. Nếu salon mới mở, ít traffic, 1 EC2 + Docker Compose là phương án tốt nhất. Chỉ dùng K8s khi thực sự cần tính sẵn sàng cao và khả năng scale mạnh mẽ.

### 7. Tóm tắt bài học
K8s là nền tảng điều phối container ở quy mô cụm máy chủ. Nó tự động hóa Load Balancing, Self-healing, và Auto-scaling. DevOps học K8s để xây dựng hệ thống tự động, thay vì vận hành thủ công.

### 8. Câu hỏi kiểm tra
1. K8s tương tác với container thông qua chuẩn giao tiếp nào thay vì phụ thuộc hoàn toàn vào Docker?
2. Tại sao web salon quy mô nhỏ (khoảng vài chục lượt truy cập/ngày) lại không nên dùng K8s?

---

## Bài 2: Kiến trúc Kubernetes

### 1. Khái niệm chính
Một hệ thống Kubernetes được gọi là một **Cluster** (Cụm máy chủ). Cluster chia làm 2 thành phần rõ ràng:
* **Control Plane (Não bộ):** Đưa ra quyết định, lưu trữ trạng thái của cụm.
* **Worker Node (Máy trạm):** Nhận lệnh và thực thi việc chạy ứng dụng.

### 2. Vấn đề nó giải quyết
Việc tách bạch kiến trúc giúp hệ thống an toàn và dễ quản lý. Nếu các Worker Node (nơi chạy ứng dụng) bị quá tải hoặc lỗi, Control Plane vẫn hoạt động độc lập để kịp thời điều phối và khắc phục sự cố.

### 3. Các thành phần bên trong
* **Control Plane:**
  * **API Server:** Cửa ngõ giao tiếp duy nhất. Tất cả mọi lệnh `kubectl` hay kết nối từ Worker Node đều phải đi qua API Server để xác thực.
  * **etcd:** Kho lưu trữ dạng Key-Value cực kỳ đáng tin cậy. Nó lưu toàn bộ trạng thái và cấu hình của Cluster.
  * **Scheduler:** Người xếp việc. Nó theo dõi các Pod chưa có nhà, đánh giá tài nguyên (RAM/CPU) của các Node và quyết định đặt Pod vào Node nào phù hợp nhất.
  * **Controller Manager:** Chịu trách nhiệm giám sát. Nó liên tục so sánh trạng thái hiện tại (trong `etcd`) với trạng thái mong muốn và can thiệp nếu có sai lệch (ví dụ: Pod bị chết thì ra lệnh tạo lại).
* **Worker Node:**
  * **kubelet:** Quản đốc xưởng chạy trên mỗi Node. Nó nhận lệnh từ API Server và yêu cầu Container Runtime tạo/xóa container.
  * **kube-proxy:** Xử lý mạng lưới. Nó cấu hình các quy tắc định tuyến mạng để các request đi đến đúng Pod.
  * **Container Runtime:** Môi trường thực thi container (như containerd, CRI-O).

### 4. Kubernetes hoạt động như thế nào? (Luồng tạo app)
Khi bạn muốn triển khai Backend Salon:
1. Bạn gửi file YAML đến **API Server**.
2. **API Server** lưu yêu cầu vào **etcd**.
3. **Scheduler** phát hiện có Pod mới cần chạy, tìm thấy Node 2 đang rảnh và ghi quyết định vào **etcd**.
4. **kubelet** trên Node 2 nhận được chỉ thị từ API Server.
5. **kubelet** gọi **Container Runtime** kéo Image về và chạy container.

### 5. Ví dụ liên hệ với project web salon
Trong môi trường thực tế, code web (Frontend, Backend) của bạn **không bao giờ** được chạy trên các máy chủ Control Plane. Chúng chỉ chạy trên các Worker Node. Control Plane được bảo vệ nghiêm ngặt để đảm bảo khả năng quản trị cụm.

### 6. Lỗi hiểu sai phổ biến
* **Sai lầm:** Data của Database web cũng được lưu trong `etcd`.
  **Sự thật:** `etcd` chỉ lưu cấu hình và trạng thái của riêng K8s. Dữ liệu của Database Salon (MongoDB) phải được lưu trữ ở các ổ cứng dùng cho ứng dụng (Persistent Volume).
* **Sai lầm:** Nếu Control Plane sập, web salon sẽ chết.
  **Sự thật:** Nếu Control Plane mất kết nối, các Pod web salon trên Worker Node vẫn tiếp tục chạy và phục vụ khách hàng. Bạn chỉ bị mất khả năng deploy code mới hoặc auto-scale cho đến khi Control Plane phục hồi.

### 7. Tóm tắt bài học
Kiến trúc K8s gồm Control Plane (API Server, etcd, Scheduler, Controller) quản lý cụm, và Worker Node (kubelet, kube-proxy, Container runtime) là nơi chạy các ứng dụng thực tế.

### 8. Câu hỏi kiểm tra
1. Thành phần nào đánh giá dung lượng RAM/CPU còn trống của Worker Node để phân bổ Pod?
2. Thành phần nào trực tiếp giao tiếp với Container Runtime để chạy container trên Node?

---

## Bài 3: Pod

### 1. Khái niệm chính
**Pod** là đơn vị triển khai nhỏ nhất và cơ bản nhất mà Kubernetes có thể quản lý. Trong K8s, bạn không triển khai trực tiếp các container rời rạc, mà bạn đặt chúng vào bên trong Pod.

### 2. Vì sao Kubernetes không chạy container trực tiếp mà dùng Pod?
K8s dùng Pod để tạo ra một "môi trường chia sẻ". Các container nằm trong cùng 1 Pod sẽ chia sẻ chung một địa chỉ IP, chung không gian mạng (Network Namespace), và có thể gắn chung các ổ cứng (Volume). Điều này rất hữu ích cho các mô hình ứng dụng cần một container chính (app) và một container phụ trợ (sidecar) chạy song song và giao tiếp chặt chẽ qua `localhost`.

### 3. Vòng đời của Pod (Tính chất Ephemeral)
Pod là thực thể **tạm thời (ephemeral)**. Khi một Pod được lên lịch chạy trên một Node, nó sẽ nằm ở đó cho đến khi kết thúc nhiệm vụ hoặc bị xóa.
* Container bên trong Pod **có thể được khởi động lại** bởi `kubelet` nếu nó bị crash (phụ thuộc vào `restartPolicy`).
* Tuy nhiên, nếu chính Pod đó bị xóa bỏ, bị trục xuất (evict) do Node quá tải, hoặc Node bị hỏng, K8s **sẽ không hồi sinh** cái Pod cũ đó. Bộ quản lý (như Deployment) sẽ nhận diện sự mất mát và tạo ra một Pod **mới hoàn toàn** với một địa chỉ IP mới.

### 4. Pod có IP riêng như thế nào?
Mỗi Pod được gán một địa chỉ IP nội bộ riêng biệt trong Cluster. Mọi container bên trong Pod đều dùng chung IP này và phân biệt với nhau qua các Port khác nhau.

### 5. Vì sao không nên quản lý Pod thủ công?
Vì tính chất tạm thời, nếu bạn tạo Pod thủ công, khi Pod chết đi, ứng dụng của bạn sẽ bị gián đoạn hoàn toàn. Trong production, chúng ta tuyệt đối không tạo Pod trực tiếp (Naked Pod), mà phải dùng **Deployment** để quản lý vòng đời của Pod.

### 6. Ví dụ liên hệ với project web salon
* **Thiết kế đúng:** Một Pod `salon-frontend` chứa 1 container React. Một Pod `salon-backend` chứa 1 container Node.js. Các chức năng tách biệt để dễ scale.
* **Thiết kế sai:** Nhét cả Frontend React và Backend Node.js vào chung 1 Pod. Cách thiết kế này làm mất đi khả năng mở rộng độc lập của từng thành phần.

### 7. Lỗi hiểu sai phổ biến
* **Sai lầm:** K8s "không bao giờ" khởi động lại Pod.
  **Sự thật:** Nếu tiến trình (process) trong container bị lỗi, container đó vẫn có thể được `kubelet` tự động khởi động lại trong chính Pod hiện tại. Pod chỉ thực sự biến mất khi nó bị điều kiện bên ngoài xóa bỏ hoặc Node gặp sự cố.

### 8. Tóm tắt bài học
Pod là lớp vỏ bọc container, là đơn vị nhỏ nhất K8s quản lý. Các container trong cùng Pod chia sẻ chung IP và Volume. Pod có tính chất tạm thời và dễ bị thay thế bằng Pod mới.

### 9. Câu hỏi kiểm tra
1. Tại sao nói Pod là một thực thể tạm thời (ephemeral)?
2. Các container chạy bên trong cùng 1 Pod có thể giao tiếp với nhau thông qua cơ chế mạng nào?

---

## Bài 4: Deployment, ReplicaSet và Self-healing

### 1. Khái niệm chính
* **Deployment:** Là một đối tượng quản lý cấp cao giúp định nghĩa và kiểm soát việc triển khai các Pod.
* **Replica:** Bản sao của một Pod. (3 replicas nghĩa là 3 Pod chạy cùng 1 image giống hệt nhau).
* **ReplicaSet:** Là thành phần chạy ngầm dưới Deployment, chịu trách nhiệm duy trì số lượng Pod đang chạy luôn khớp với con số mong muốn.

### 2. Vấn đề nó giải quyết
Vì Pod mang tính tạm thời và có thể bị xóa, chúng ta cần một cơ chế tự động giám sát và thay thế Pod lỗi. Deployment và ReplicaSet mang đến khả năng **Self-healing (Tự phục hồi)** và cho phép update cấu hình hệ thống mà không gây downtime.

### 3. Deployment quản lý Pod như thế nào?
Luồng phân cấp: **Deployment -> quản lý -> ReplicaSet -> quản lý -> Pods**.
Khi bạn tạo hoặc cập nhật Deployment, Deployment sẽ điều khiển ReplicaSet để tăng hoặc giảm số lượng Pod tương ứng.

### 4. Kubernetes tự phục hồi khi Pod chết ra sao?
1. Bạn cấu hình Deployment `backend-salon` với `replicas: 3`.
2. Hệ thống đang chạy 3 Pod. Một Node bị sập kéo theo 1 Pod Backend chết theo.
3. **ReplicaSet** phát hiện: *"Số Pod hiện tại là 2, thấp hơn mức mong muốn là 3"*.
4. ReplicaSet ngay lập tức yêu cầu tạo thêm 1 Pod mới trên một Node đang hoạt động bình thường.
5. Số lượng Pod trở lại 3. Hệ thống phục hồi tự động (Self-healing).

### 5. Ví dụ liên hệ với project web salon
Nếu bạn chạy Backend với Docker thuần trên 1 máy EC2, khi máy EC2 đó cháy, bạn phải tự can thiệp. 
Với K8s, thông qua Deployment, K8s sẽ tự động dời các Pod Backend sang các máy EC2 khác trong Cluster mà không cần bạn phải thao tác bằng tay lúc nửa đêm.

### 6. Lỗi hiểu sai phổ biến
* **Sai lầm:** Tự viết file YAML tạo ReplicaSet.
  **Sự thật:** Trong thực tế, DevOps không bao giờ tương tác trực tiếp với ReplicaSet. Chúng ta luôn làm việc thông qua Deployment, và Deployment sẽ tự quản lý ReplicaSet bên dưới.

### 7. Tóm tắt bài học
Deployment là "lá chắn" bảo vệ và quản lý Pod. Cơ chế đếm số lượng của ReplicaSet là trái tim của tính năng Tự phục hồi trong K8s. Luôn dùng Deployment để chạy ứng dụng Stateless trong Production.

### 8. Câu hỏi kiểm tra
1. Giữa Deployment và ReplicaSet, đối tượng nào trực tiếp đảm bảo số lượng bản sao (replicas) của Pod luôn ổn định?
2. Điều gì sẽ xảy ra nếu bạn cố tình xóa một Pod đang được quản lý bởi một Deployment?

---

## Bài 5: Service

### 1. Khái niệm chính
**Service** là một đối tượng mạng trong Kubernetes, cung cấp một địa chỉ IP tĩnh và một tên DNS nội bộ cố định để kết nối đến một nhóm các Pod đang chạy.

### 2. Vấn đề nó giải quyết
Khi ReplicaSet thay thế một Pod bị hỏng bằng một Pod mới, IP của Pod mới sẽ thay đổi. 
Nếu bạn cấu hình ứng dụng trỏ trực tiếp đến IP của Pod, kết nối sẽ bị đứt khi Pod đó tái sinh. **Service** sinh ra để đóng vai trò làm Cân bằng tải (Load Balancer) nội bộ và cung cấp một điểm truy cập ổn định bất chấp IP của Pod liên tục thay đổi.

### 3. Phân loại Service
* **ClusterIP (Mặc định):** Cung cấp IP chỉ có thể truy cập được từ **bên trong** Cluster. Thích hợp cho Backend API hoặc Database.
* **NodePort:** Mở một port tĩnh (30000 - 32767) trên mỗi Worker Node. Cho phép bên ngoài Internet truy cập vào ứng dụng qua địa chỉ `<Node_IP>:<NodePort>`.
* **LoadBalancer:** Yêu cầu Cloud Provider (như AWS, GCP) tạo một Load Balancer thực sự bên ngoài Internet để định tuyến traffic thẳng vào hệ thống K8s.

### 4. Lỗi hiểu sai phổ biến (Đặc biệt quan trọng đối với Frontend)
* **Sai lầm:** Code React chạy trên trình duyệt có thể gọi trực tiếp API qua URL `http://backend-svc:5000`.
  **Sự thật:** Tên miền nội bộ `backend-svc` **chỉ có thể phân giải được từ bên trong K8s Cluster**. Trình duyệt của khách hàng ở ngoài Internet không thể hiểu `backend-svc` là gì.
* **Cách làm đúng:** 
  - URL API trong React (`VITE_API_URL`) phải là một domain public mà khách hàng truy cập được (ví dụ `https://api.trongdev.me` hoặc `https://salon.com/api`).
  - Request đi từ trình duyệt vào Domain public -> Đi qua **Ingress** của K8s -> Ingress mới biết cách chuyển request đó đến Service nội bộ `backend-svc`.
  - Ngoại lệ: Chỉ khi code Frontend chạy Server-Side Rendering (SSR) bằng Next.js bên trong Pod, hoặc Backend gọi Database, thì chúng mới nằm chung trong Cluster và gọi thẳng được tên Service nội bộ.

### 5. So sánh Service với Docker Compose network
* Trong `docker-compose`, các container gọi nhau bằng tên service.
* Trong K8s, Service hoạt động tương tự, nhưng mạnh mẽ hơn nhiều nhờ khả năng tự động Load Balancing cho nhiều Pod trải dài trên nhiều Node khác nhau.

### 6. Tóm tắt bài học
Service giải quyết bài toán biến động IP của Pod bằng cách tạo ra một điểm truy cập tĩnh. Luôn lưu ý phân biệt giữa mạng nội bộ Cluster (ClusterIP) và mạng bên ngoài (Trình duyệt người dùng).

### 7. Câu hỏi kiểm tra
1. Tại sao một ứng dụng React thuần (Single Page Application) chạy trên trình duyệt lại không thể sử dụng ClusterIP Service để fetch dữ liệu từ Backend?
2. Sự khác nhau giữa `ClusterIP` và `NodePort` là gì?

## Bài 6: Ingress và Domain

### 1. Khái niệm chính
* **Ingress:** Là một bộ quy tắc (rules) cấu hình việc định tuyến lưu lượng mạng (HTTP/HTTPS) từ bên ngoài Internet vào các Service bên trong Kubernetes.
* **Ingress Controller:** Là thành phần phần mềm thực thi các quy tắc Ingress đó. Ingress chỉ là "tờ giấy ghi luật", còn Ingress Controller mới là "người bảo vệ" đứng ở cửa ngõ để điều hướng traffic thực tế.

### 2. Ingress Controller và Nginx có phải là một?
* **Sai lầm:** Ingress luôn luôn là Nginx.
* **Sự thật:** Không phải. Bạn có thể chọn bất kỳ công cụ nào làm Ingress Controller: NGINX, Traefik, HAProxy, Kong, hay AWS Load Balancer Controller. Ingress-Nginx chỉ là lựa chọn phổ biến nhất. Lưu ý cực kỳ quan trọng: Nếu bạn tạo file Ingress YAML mà cụm K8s chưa cài đặt Ingress Controller nào, thì file YAML đó hoàn toàn vô tác dụng.

### 3. Vì sao Service chưa đủ để public website?
Ở Bài 5, ta dùng `NodePort` hoặc `LoadBalancer`.
* Dùng `NodePort`: Cổng hiển thị xấu, khó nhớ (vd: `30123`) và không an toàn.
* Dùng `LoadBalancer`: Nếu dự án có nhiều sub-domain (app, api, admin), mỗi Service đòi 1 Load Balancer của AWS sẽ tốn rất nhiều tiền.
* **Ingress giải quyết việc này:** Bạn chỉ tốn chi phí cho 1 LoadBalancer duy nhất trỏ vào Ingress Controller. Sau đó, Ingress sẽ định tuyến traffic nội bộ vào đúng Service mong muốn dựa trên URL/Path.

### 4. Cách domain trỏ vào ứng dụng Kubernetes
1. Bạn cấu hình Domain (`app.trongdev.me`) trỏ DNS về IP của Ingress Controller.
2. Ingress Controller nhận request, kiểm tra danh sách rules.
3. Nếu rule khớp với host `app.trongdev.me`, nó chuyển traffic tới `salon-frontend-svc`.

### 5. HTTPS trong Kubernetes
Trong thực tế, bạn thường sử dụng công cụ như `cert-manager` để tự động xin và gắn chứng chỉ Let's Encrypt cho Ingress, giúp cấu hình SSL/HTTPS một cách tự động và tập trung.

### 6. Tóm tắt bài học
Ingress quản lý định tuyến bên ngoài vào Cluster. Ingress Controller là thành phần thực thi. Nó giúp tối ưu chi phí Load Balancer và hỗ trợ cấu hình HTTPS tập trung.

### 7. Câu hỏi kiểm tra
1. Điều gì xảy ra nếu bạn apply một file Ingress YAML vào Cluster chưa có Ingress Controller?
2. Ingress Controller phổ biến nhất trong các hệ thống K8s tự host là gì?

---

## Bài 7: ConfigMap và Secret

### 1. Khái niệm chính
* **ConfigMap:** Đối tượng dùng để lưu trữ dữ liệu cấu hình không nhạy cảm (Ví dụ: URL API, biến môi trường thông thường).
* **Secret:** Đối tượng dùng để lưu trữ dữ liệu nhạy cảm (Ví dụ: Mật khẩu Database, JWT Secret, TLS Certificates).

### 2. Vì sao không nên hardcode cấu hình vào image?
Nguyên tắc 12-factor app yêu cầu tách biệt hoàn toàn cấu hình khỏi source code. Nếu bạn hardcode chuỗi kết nối Database vào code, bạn phải build lại Docker image mỗi lần đổi môi trường (từ Dev sang Prod). Dùng ConfigMap/Secret giúp bạn sử dụng chung 1 Image cho mọi môi trường, chỉ thay đổi biến được tiêm vào (inject) khi chạy.

### 3. Vấn đề bảo mật của Secret trong Kubernetes
* **Lưu ý cực kỳ quan trọng:** Theo mặc định, dữ liệu trong K8s Secret **chỉ được encode (mã hóa chuỗi) bằng Base64, không phải encryption (mã hóa bảo mật)**. Base64 có thể dễ dàng giải mã ngược lại bằng bất kỳ công cụ online nào.
* Do đó, **tuyệt đối không commit** file `secret.yaml` có chứa Base64 của mật khẩu thật lên GitHub (kể cả private repo).

### 4. Cách bảo mật Secret trong thực tế
Để hệ thống thực sự an toàn, DevOps sẽ:
1. Bật tính năng **Encryption at Rest** trên etcd để dữ liệu lưu trên ổ cứng được mã hóa.
2. Cấu hình **RBAC (Role-Based Access Control)** chặt chẽ để cấm người không có quyền chạy lệnh `kubectl get secret`.
3. Sử dụng các giải pháp quản lý Secret chuyên nghiệp như **AWS Secrets Manager**, **Azure Key Vault**, hoặc **HashiCorp Vault** tích hợp với K8s thông qua Secret Store CSI Driver.

### 5. Tóm tắt bài học
Phân tách cấu hình ra khỏi code bằng ConfigMap và Secret. Cẩn trọng với Secret vì mặc định nó không phải là giải pháp bảo mật hoàn hảo.

### 6. Câu hỏi kiểm tra
1. Tại sao mã hóa Base64 của Secret lại bị coi là điểm yếu bảo mật nếu không áp dụng thêm các biện pháp khác?
2. Kể tên một công cụ quản lý Secret bên ngoài (External Secret Management) thường được dùng tích hợp với K8s?

---

## Bài 8: Volume, PersistentVolume, PersistentVolumeClaim

### 1. Vì sao container mất dữ liệu khi bị xóa?
Container được thiết kế với tư duy phi trạng thái (Stateless). Mọi dữ liệu ghi vào file system của container sẽ bị mất ngay khi Pod bị xóa hoặc khởi động lại. Do đó, các ứng dụng có trạng thái (Stateful) như Database cần ổ cứng gắn ngoài để bảo toàn dữ liệu.

### 2. Khái niệm chính
* **PersistentVolume (PV):** Ổ cứng lưu trữ vật lý thực sự trên hạ tầng (như AWS EBS, ổ cứng NFS). Nó tồn tại độc lập với vòng đời của Pod.
* **PersistentVolumeClaim (PVC):** "Giấy xin cấp ổ cứng". Pod sử dụng PVC để yêu cầu K8s cấp cho mình một dung lượng lưu trữ cụ thể. K8s sẽ tìm một PV phù hợp và gắn vào PVC đó.
* **StorageClass:** Công cụ tự động hóa việc tạo ra các PV. Khi có một PVC yêu cầu ổ cứng, StorageClass sẽ gọi API của nhà cung cấp Cloud (ví dụ AWS) để cấp phát ngay lập tức một ổ EBS mới.

### 3. Lưu ý thực tế khi chạy Database
* **Thực tiễn DevOps:** Chạy Database (như MongoDB, PostgreSQL) trên Kubernetes là một thử thách rất lớn về sao lưu, chống phân mảnh và hiệu năng I/O. 
* Do đó, trong môi trường Production, xu hướng chung là đưa Database **ra ngoài** K8s và sử dụng các dịch vụ Managed Database (như AWS RDS, MongoDB Atlas). K8s chỉ nên tập trung chạy các ứng dụng Stateless (Frontend, Backend).

### 4. Tóm tắt bài học
Sử dụng PV và PVC để cung cấp ổ đĩa lưu trữ dài hạn cho Pod. Tuy nhiên, ưu tiên dùng dịch vụ Database ngoài K8s cho Production để đảm bảo an toàn dữ liệu.

### 5. Câu hỏi kiểm tra
1. Sự khác biệt giữa lưu trữ mặc định của Container và PersistentVolume là gì?
2. Tại sao các kỹ sư DevOps thường khuyên dùng AWS RDS thay vì tự dựng MySQL bằng StatefulSet/Deployment trong K8s?

---

## Bài 9: Namespace

### 1. Khái niệm chính
**Namespace** cung cấp một cơ chế phân chia logic để chia một Cluster K8s vật lý thành nhiều "Cluster ảo" khác nhau.

### 2. Vì sao cần chia namespace?
* **Cách ly tài nguyên:** Tách biệt ứng dụng của team Dev và team Prod, hoặc giữa các khách hàng khác nhau.
* **Tránh xung đột tên:** Trong 2 Namespace khác nhau, bạn có thể có 2 Service cùng tên (ví dụ: `backend-svc` trong Namespace `dev` và `backend-svc` trong Namespace `prod`).

### 3. Quản lý tài nguyên theo namespace
Bằng cách sử dụng **ResourceQuota**, DevOps có thể giới hạn tổng dung lượng RAM và CPU mà một Namespace được phép sử dụng. Việc này ngăn chặn tình huống code lỗi ở môi trường `dev` ăn hết tài nguyên và làm ảnh hưởng đến môi trường `prod`.

### 4. Lỗi hiểu sai phổ biến
* **Sai lầm:** Pod ở Namespace `dev` không thể giao tiếp mạng với Pod ở Namespace `prod`.
  **Sự thật:** Mặc định trong K8s, mạng là mạng phẳng (flat network), các Pod giữa các Namespace vẫn có thể gọi nhau. Để chặn giao tiếp, bạn phải cấu hình **NetworkPolicy**.

### 5. Tóm tắt bài học
Namespace giúp quản lý tổ chức tài nguyên, tạo ranh giới logic trong cùng một Cluster.

### 6. Câu hỏi kiểm tra
1. Tên Service có bắt buộc phải là duy nhất trên toàn bộ K8s Cluster không?
2. Công cụ nào giúp hạn chế tài nguyên phần cứng (CPU/RAM) tiêu thụ tối đa của một Namespace?

---

## Bài 10: Rolling Update và Rollback

### 1. Khái niệm chính
* **Rolling Update (Cập nhật cuốn chiếu):** Chiến lược mặc định của Deployment để nâng cấp phiên bản ứng dụng mà không gây gián đoạn (Zero-downtime). K8s sẽ dần dần tạo các Pod phiên bản mới và tắt các Pod phiên bản cũ.
* **Rollback:** Đưa ứng dụng quay trở về phiên bản ổn định trước đó một cách nhanh chóng khi phiên bản mới gặp lỗi.

### 2. K8s cập nhật Pod như thế nào?
Giả sử bạn đang chạy 3 Pod Backend `v1`. Khi cập nhật lên `v2`:
1. Deployment tạo ra ReplicaSet mới cho `v2` và khởi động 1 Pod `v2`.
2. Khi K8s xác nhận Pod `v2` đã sẵn sàng nhận traffic (thông qua Readiness Probe), nó sẽ tắt 1 Pod `v1`.
3. Quá trình tiếp tục cho đến khi tất cả Pod đều là `v2`. Trong suốt quá trình này, người dùng vẫn truy cập được hệ thống.

### 3. Rollback ra sao?
Deployment lưu trữ lại lịch sử các ReplicaSet cũ. Khi phát hiện `v2` lỗi, bạn sử dụng lệnh `kubectl rollout undo deployment <tên>`. K8s sẽ lập tức thực hiện quy trình Rolling Update ngược lại để đưa các Pod về `v1`.

### 4. Lưu ý khi thực hành Database Schema
* Vì trong lúc Rolling Update, cả phiên bản `v1` và `v2` có thể đang chạy song song, bạn phải đặc biệt chú ý đến **Backward Compatibility** (Tương thích ngược) của Database. Không nên thực hiện các câu lệnh xóa cột (DROP COLUMN) hoặc đổi tên bảng đột ngột làm hỏng code của phiên bản cũ.

### 5. Tóm tắt bài học
Rolling Update là tính năng cốt lõi giúp triển khai mượt mà không gây gián đoạn. Rollback là phao cứu sinh khi cập nhật lỗi.

### 6. Câu hỏi kiểm tra
1. Sự khác biệt về trải nghiệm người dùng giữa Rolling Update của K8s so với việc `docker stop` và `docker run` thủ công trên máy EC2 là gì?
2. Tại sao thiết kế Database tương thích ngược lại quan trọng trong quá trình Rolling Update?

---

## Bài 11: Horizontal Pod Autoscaler

### 1. Khái niệm chính
* **HPA (Horizontal Pod Autoscaler):** Cơ chế tự động co giãn số lượng Pod dựa trên mức độ sử dụng tài nguyên (thường là CPU hoặc RAM) của ứng dụng.
* **Autoscaling (Tự động mở rộng):** Tự động điều chỉnh số lượng bản sao (Replicas) để đáp ứng lượng traffic hiện tại mà không cần kỹ sư DevOps can thiệp bằng tay.

### 2. HPA khác với tăng cấu hình server như thế nào?
* **Vertical Scaling (Mở rộng dọc):** Thêm RAM, nâng cấp CPU cho máy chủ hiện tại. Điểm yếu là phải khởi động lại máy, và máy tính có giới hạn phần cứng.
* **Horizontal Scaling (Mở rộng ngang):** Thay vì làm cho máy chủ to lên, ta nhân bản ứng dụng chạy song song trên nhiều máy tính nhỏ hơn. K8s HPA sử dụng phương pháp này.

### 3. Scale theo CPU/RAM hoạt động như thế nào?
Bạn cấu hình HPA: *"Hãy giữ cho CPU trung bình của các Pod Backend ở mức 70%"*.
K8s sẽ liên tục đo đạc thông qua Metrics Server. Nếu CPU vượt 70%, HPA sẽ ra lệnh cho Deployment tự động tăng số Replicas. Khi tải giảm, HPA sẽ tự động thu hồi bớt Pod để tối ưu chi phí.

### 4. Ví dụ Salon có nhiều khách đặt lịch
Bình thường Backend Salon chỉ chạy **2 Pods**.
Đến dịp lễ, lượng khách đặt lịch làm tóc tăng vọt. CPU của 2 Pod đạt 95%.
**HPA** phát hiện ra, tự động Scale up lên **5 Pods**, rồi lên **10 Pods** (giới hạn tối đa bạn cài đặt). Các request được chia đều, không ai bị lỗi.
Sau dịp lễ, traffic giảm, HPA tự động Scale down thu hồi về lại **2 Pods**.

### 5. Câu hỏi kiểm tra
1. Sự khác biệt giữa Vertical Scaling và Horizontal Scaling là gì?
2. Thành phần nào trong K8s cung cấp số liệu CPU/RAM để HPA hoạt động?

---

## Bài 12: Helm

### 1. Khái niệm chính
* **Helm:** Là công cụ quản lý gói (Package Manager) dành riêng cho Kubernetes. Nó đóng vai trò giống như `npm` trong Node.js hay `apt` trong Ubuntu.
* **Helm Chart:** Một tập hợp các template chứa toàn bộ cấu hình K8s cần thiết để chạy một ứng dụng.

### 2. Helm giúp deploy ứng dụng dễ hơn như thế nào?
Để deploy ứng dụng Salon sang nhiều môi trường (dev, staging, prod), thay vì copy hàng chục file YAML và sửa tay từng biến (dễ sai sót), Helm sử dụng cơ chế Template. Bạn định nghĩa biến (ví dụ `{{ .Values.image.tag }}`) và truyền các giá trị thay đổi thông qua một file duy nhất gọi là **`values.yaml`**.
Khi gõ `helm install`, Helm sẽ render ra các file YAML hoàn chỉnh và ném vào K8s.

### 3. Tóm tắt bài học
Helm giúp gom cụm hàng chục file YAML lại thành một gói (Chart) và dễ dàng cấu hình lại cho nhiều môi trường thông qua file `values.yaml`.

### 4. Câu hỏi kiểm tra
1. Tại sao file `values.yaml` trong Helm lại quan trọng đối với việc quản lý đa môi trường?
2. Kể tên một công cụ quản lý gói khác có vai trò tương tự như Helm nhưng dùng trong thế giới Node.js?

---

## Bài 13: CI/CD với GitHub Actions và Kubernetes

### 1. Khái niệm chính
Luồng tích hợp và triển khai liên tục (CI/CD) nhằm tự động hóa việc đưa code từ máy tính lên hệ thống K8s production một cách an toàn.

### 2. CI/CD trong K8s khác gì với deploy Docker EC2?
* **Deploy EC2 thủ công:** SSH vào máy -> `docker pull` -> `docker run`. Thường gây downtime.
* **Deploy K8s:** GitHub Actions tương tác qua API Server. Nó cập nhật image tag mới, K8s sẽ tự động thực hiện Rolling Update mượt mà.

### 3. Luồng CI/CD chuẩn cho dự án Salon
Đây là một ví dụ luồng công việc thực tế:
1. **Push code:** Bạn push tính năng mới lên nhánh `main`.
2. **Build & Push:** GitHub Actions build Docker image và push lên Docker Hub hoặc GitHub Container Registry.
3. **Image Tagging:** Tuyệt đối không dùng tag `latest`. Image tag phải là mã hash của commit (Commit SHA, vd: `a1b2c3d`) để đảm bảo tính duy nhất và khả năng truy vết.
4. **Deploy:** Kịch bản GitHub Actions gọi `kubectl set image deployment/salon-backend backend=trongdev/salon-api:a1b2c3d` hoặc dùng `kubectl apply -f k8s/`.
5. **Rolling Update:** K8s tự động cuộn (roll) các Pod cũ sang Pod mới.

### 4. Quản lý Kubeconfig và rủi ro bảo mật
**Kubeconfig** là file chứng chỉ cung cấp quyền admin để GitHub Actions gọi vào API Server.
* **Lưu ý cực kỳ quan trọng:** Không bao giờ hardcode file kubeconfig hay token vào repository. Bạn bắt buộc phải lưu file này vào **GitHub Secrets** dưới dạng Base64 và giải mã nó lúc chạy pipeline.

### 5. Câu hỏi kiểm tra
1. Tại sao trong quy trình CI/CD chuyên nghiệp, ta không bao giờ nên dùng tag `latest` cho Docker image?
2. File Kubeconfig dùng trong GitHub Actions cần được lưu trữ ở đâu để đảm bảo an toàn?

---

## Bài 14: Deploy project web salon lên Kubernetes

### 1. Phân tích các file YAML cần thiết
Để đưa dự án Web Salon (Frontend, Backend, Database) lên K8s một cách chuẩn mực, thư mục `k8s/` của bạn cần có danh sách các file YAML sau:

1. **`namespace.yaml`:** Tạo vùng không gian cách ly (vd: `salon-prod`).
2. **`configmap.yaml`:** Chứa cấu hình public (`VITE_API_URL`, `PORT=5000`).
3. **`secret.yaml`:** Chứa dữ liệu nhạy cảm (`MONGO_URI`, `JWT_SECRET`). Lưu ý không commit mật khẩu thật.
4. **`database-pvc.yaml`:** Xin cấp ổ cứng thật (nếu bạn quyết định chạy DB trong K8s).
5. **`backend-deployment.yaml`:** Cấu hình Replicas, Image, Inject biến môi trường từ ConfigMap/Secret cho Node.js.
6. **`backend-service.yaml`:** Cấu hình ClusterIP cho Backend nội bộ.
7. **`frontend-deployment.yaml`:** Cấu hình Replicas, Image cho React/Nginx.
8. **`frontend-service.yaml`:** Cấu hình ClusterIP cho Frontend.
9. **`ingress.yaml`:** Cấu hình trỏ Domain (ví dụ `app.trongdev.me`) vào Frontend Service.

### 2. Thứ tự triển khai
Bạn cần apply YAML theo trình tự phụ thuộc:
Namespace -> Secret & ConfigMap -> PVC -> Database -> Backend -> Frontend -> Ingress.

### 3. Câu hỏi kiểm tra
1. Tại sao file `configmap.yaml` và `secret.yaml` phải được apply vào cụm K8s trước khi apply `backend-deployment.yaml`?

---

## Bài 15: Monitoring, Logging và bảo trì Kubernetes

### 1. Vì sao deploy xong chưa phải là hết?
Hệ thống K8s tự phục hồi rất tốt. Nếu một Pod bị crash do rò rỉ bộ nhớ, nó khởi động lại trong tích tắc. Bạn có thể không nhận ra sự cố cho đến khi khách hàng phàn nàn. Do đó, ta cần hệ thống giám sát và nhật ký (Logging) tập trung.

### 2. Logging & Monitoring
* **Logging (ELK, EFK, Loki):** Thu thập toàn bộ log của hàng trăm Pod về một giao diện tập trung để dễ tìm kiếm lỗi.
* **Monitoring (Prometheus & Grafana):** Prometheus thu thập số liệu (CPU, RAM, tỷ lệ lỗi HTTP), còn Grafana vẽ biểu đồ và thiết lập cảnh báo (Alert) qua Slack/Email.

### 3. Công cụ quản trị của DevOps
Trong thực tế, DevOps thường dùng **`kubectl`**, **`k9s`**, **Prometheus/Grafana** và logging tập trung vì chúng nhanh, mạnh mẽ, có thể script được và dễ dàng tự động hóa thay vì phụ thuộc hoàn toàn vào giao diện Web (K8s Dashboard).

### 4. Checklist Debug Kubernetes thực tế
Khi hệ thống Web Salon gặp sự cố, hãy làm theo quy trình gỡ lỗi chuẩn sau:
1. **`kubectl get pods`**: Xem tổng quan trạng thái. Chú ý các Pod bị `CrashLoopBackOff`, `ImagePullBackOff` hay `Pending`.
2. **`kubectl describe pod <pod-name>`**: Xem luồng sự kiện chi tiết của một Pod (vd: lỗi không mount được Volume, lỗi thiếu Secret).
3. **`kubectl logs <pod-name>`**: Đọc log ứng dụng Node.js/Nginx để bắt lỗi code.
4. **`kubectl get svc`**: Kiểm tra xem Service có mở đúng port không (vd: port 5000 cho Backend).
5. **`kubectl get ingress`**: Kiểm tra rule định tuyến tên miền có trỏ đúng Service và có Controller chưa.
6. **`kubectl get events --sort-by=.metadata.creationTimestamp`**: Liệt kê các cảnh báo và lỗi mới nhất trên toàn bộ Cluster.

### 5. Câu hỏi kiểm tra
1. Lệnh `kubectl describe pod` giúp ích gì hơn so với `kubectl get pods` khi gỡ lỗi?
2. Nếu Pod ở trạng thái `ImagePullBackOff`, nguyên nhân phổ biến nhất là gì?

---

## Tổng kết toàn bộ Kubernetes

```text
[CONTROL PLANE - NÃO BỘ QUẢN LÝ]
  ├── API Server        <--- Cửa ngõ giao tiếp. Mọi công cụ (kubectl, CI/CD) đều đi qua đây.
  ├── etcd              <--- Cơ sở dữ liệu Key-Value lưu trữ trạng thái của K8s.
  ├── Scheduler         <--- Quyết định đặt Pod vào Node nào còn trống tài nguyên.
  └── Controller        <--- Giám sát vòng lặp, đảm bảo thực tế khớp với cấu hình mong muốn.

[WORKER NODE - MÁY TRẠM THỰC THI]
  ├── kubelet           <--- Quản đốc nghe lệnh API Server.
  ├── kube-proxy        <--- Chốt chặn mạng lưới định tuyến.
  └── Container Runtime <--- Động cơ chạy container (containerd, CRI-O).

[CÁC ĐỐI TƯỢNG KUBERNETES CƠ BẢN]
  ├── Pod               ---> Vỏ bọc đơn vị nhỏ nhất chứa container (tạm thời, ephemeral).
  ├── Deployment        ---> Quản lý số lượng Pod, hỗ trợ Rolling Update và Self-healing.
  ├── Service           ---> Điểm truy cập mạng nội bộ ổn định cho các Pod thường xuyên đổi IP.
  ├── Ingress           ---> Bộ rule định tuyến Domain (HTTP/HTTPS) vào Service nội bộ.
  ├── ConfigMap/Secret  ---> Nơi lưu cấu hình và dữ liệu nhạy cảm (Tách biệt khỏi Code).
  └── PVC/PV            ---> Ổ đĩa gắn ngoài để giữ data không bị mất khi Pod bị xóa.
```

## Bảng so sánh nhanh

| Công cụ / Khái niệm | Ý nghĩa cốt lõi |
| :--- | :--- |
| **Docker** | Công cụ dùng để build image, đóng gói ứng dụng. |
| **Kubernetes** | Nền tảng điều phối container (sử dụng containerd/CRI-O) trên nhiều máy chủ. |
| **Docker Compose** | Triển khai nhiều container trên **1 máy chủ duy nhất**. |
| **Helm** | Trình quản lý gói cho K8s (Giống npm/apt). Gom cụm YAML qua template. |
| **Ingress** | Tập hợp các quy tắc định tuyến HTTP/HTTPS từ ngoài vào Cluster. |
| **Ingress Controller** | Phần mềm (như Nginx, Traefik) thực sự thực thi các quy tắc Ingress. |

## Lộ trình học tiếp theo

1. **Thực hành local:** Cài đặt Minikube hoặc Kind. Tập viết và apply các file YAML đơn giản.
2. **Deploy project thật:** Áp dụng checklist Bài 14 để đưa Web Salon lên môi trường Cloud K8s (DigitalOcean K8s, Linode, AWS EKS).
3. **Học Helm & CI/CD:** Tích hợp GitHub Actions để đẩy tự động ứng dụng lên Cluster.
4. **Monitoring:** Tự setup hệ thống Prometheus và Grafana bằng Helm Chart.

## Checklist tự đánh giá

Hãy kiểm tra mức độ hiểu bài của bạn thông qua danh sách sau:
- [ ] Tôi giải thích được sự khác biệt giữa đóng gói (Docker) và điều phối (Kubernetes).
- [ ] Tôi biết rằng Pod là tạm thời và có thể bị xóa, nên phải dùng Deployment.
- [ ] Tôi hiểu vì sao Frontend React (Browser) không thể gọi trực tiếp Service nội bộ mà phải qua Ingress/Public Domain.
- [ ] Tôi nắm được quy trình CI/CD an toàn, sử dụng tag Image theo Commit SHA và giấu kín Kubeconfig.
- [ ] Tôi hiểu rằng Base64 trong Secret không phải là mã hóa an toàn và cần thêm các biện pháp như RBAC, External Secrets.
- [ ] Tôi thuộc nằm lòng danh sách 6 câu lệnh `kubectl` cơ bản để debug khi hệ thống lỗi.
- [ ] Tôi đã liệt kê được danh sách 9 loại file YAML thiết yếu để triển khai dự án Web Salon.

---
**Chúc bạn chinh phục Kubernetes thành công và sớm ứng dụng vào môi trường Production!**
