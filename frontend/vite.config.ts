import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      "react-facebook-login/dist/facebook-login-render-props",
      "react-facebook-login",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
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

          return "vendor";
        },
      },
    },
  },
});
