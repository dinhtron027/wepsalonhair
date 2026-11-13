/**
 * Tệp cấu hình Vite (vite.config.ts):
 * Vite là công cụ biên dịch (Bundler) siêu tốc dựa trên ES Modules nguyên bản trong môi trường dev
 * và sử dụng Rollup để đóng gói tối ưu hóa cho môi trường Production.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Kích hoạt plugin React (hỗ trợ JSX, Fast Refresh HMR)
  plugins: [react()],

  // Cấu hình cổng chạy máy chủ Development
  server: {
    port: 5173,
    strictPort: true, // Nếu cổng 5173 bị chiếm thì báo lỗi thay vì tự ý nhảy sang cổng khác
  },

  // Tiền đóng gói (Pre-bundling) các thư viện phụ thuộc chính để tăng tốc khởi động ứng dụng
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "framer-motion",
      "zustand",
      "axios",
    ],
  },

  build: {
    // Ngưỡng cảnh báo dung lượng file chunk (600 KB)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        /**
         * Chiến lược phân tách mã nguồn (Code Splitting với manualChunks):
         * Thay vì đóng gói toàn bộ thư viện node_modules vào một file JS khổng lồ (vài MB)
         * khiến trình duyệt tải rất chậm ở lần đầu tiên, hàm này phân chia thành các file nhỏ độc lập:
         * - vendor-react: React, ReactDOM (thư viện nền tảng, ít khi thay đổi)
         * - vendor-query: TanStack React Query (quản lý server cache)
         * - vendor-motion: Framer Motion (hiệu ứng chuyển động)
         * - vendor-calendar: React Big Calendar & Date-fns (lịch quản trị)
         * - vendor-realtime: Socket.IO Client (kết nối thời gian thực)
         * - vendor-icons: Lucide React (bộ icon SVG)
         * 
         * Lợi ích: Trình duyệt có thể tải song song nhiều file và lưu cache lâu dài (Long-term Caching).
         */
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("react-facebook-login")) {
            return "vendor-facebook";
          }

          if (id.includes("react") || id.includes("scheduler")) {
            return "vendor-react";
          }

          if (id.includes("@tanstack")) {
            return "vendor-query";
          }

          if (id.includes("framer-motion")) {
            return "vendor-motion";
          }

          if (id.includes("react-big-calendar") || id.includes("date-fns")) {
            return "vendor-calendar";
          }

          if (id.includes("socket.io-client") || id.includes("engine.io-client")) {
            return "vendor-realtime";
          }

          if (id.includes("swiper")) {
            return "vendor-swiper";
          }

          if (id.includes("lucide-react")) {
            return "vendor-icons";
          }

          if (id.includes("styled-components")) {
            return "vendor-styled";
          }

          return "vendor";
        },
      },
    },
  },
});
