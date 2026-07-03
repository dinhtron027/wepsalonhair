import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  // optimizeDeps.include: bỏ react-facebook-login vì tính năng đăng nhập Facebook
  // đã bị tắt trên giao diện (xem README changelog). Giữ pre-bundle của các dep chính.
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
    // Tăng warning limit để tránh noise (real splits đã được xử lý ở manualChunks)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("react-facebook-login")) {
            // Isolate facebook-login thành chunk riêng để không ảnh hưởng main bundle
            // (Feature đã tắt — chunk này sẽ không được tải trừ khi có import trực tiếp)
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
