import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

/**
 * Khởi tạo đối tượng QueryClient để quản trị bộ nhớ đệm (Server State Cache) của ứng dụng:
 * - staleTime: Thời gian dữ liệu được coi là mới (30 giây). Trong thời gian này, React Query
 *   sẽ trả về dữ liệu trong cache ngay lập tức mà không cần gọi lại API.
 * - refetchOnWindowFocus: Tắt tự động gọi lại API khi người dùng chuyển tab quay lại web (tiết kiệm băng thông).
 * - retry: Số lần tự động thử gửi lại request nếu API trả về lỗi (tối đa 1 lần).
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

/**
 * Điểm gắn kết (Mounting) cây component của React vào phần tử <div id="root"> trong file index.html:
 * 1. React.StrictMode: Kích hoạt các cảnh báo kiểm tra nghiêm ngặt trong môi trường phát triển.
 * 2. QueryClientProvider: Cung cấp client cache cho toàn bộ các hook useQuery/useMutation con.
 * 3. BrowserRouter: Kích hoạt khả năng định tuyến chuyển trang Single Page Application (SPA).
 * 4. ErrorBoundary: Bắt các ngoại lệ giao diện không mong muốn để hiển thị trang fallback cứu cánh.
 * 5. App: Component gốc chứa cấu hình routes, layout và điều hướng.
 * 6. Toaster: Khu vực hiển thị thông báo pop-up thông minh (thành công, cảnh báo, lỗi) ở góc phải.
 */
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
