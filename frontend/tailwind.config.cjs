/** 
 * Tệp cấu hình Tailwind CSS (tailwind.config.cjs):
 * Định nghĩa phạm vi quét file HTML/JSX và mở rộng theme (màu sắc, font chữ) chuẩn nhận diện thương hiệu.
 * @type {import('tailwindcss').Config} 
 */
module.exports = {
  // Đường dẫn các file chứa mã nguồn HTML/JS/TSX để Tailwind quét và lọc class (Purge/Tree-shaking)
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      // Mở rộng bộ font chữ: font-sans cho nội dung chung, font-display cho tiêu đề sang trọng
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      // Bảng màu tùy chỉnh đặc trưng cho Salon tóc nữ:
      colors: {
        blush: "#fef2f4",   // Hồng phấn nhạt cho nền thẻ card
        cream: "#faf9f6",   // Màu kem ấm áp cho nền trang chính
        // taupe: Tăng độ tương phản (ratio ~5.0:1 trên nền trắng)
        // Đạt tiêu chuẩn tiếp cận Web Quốc tế WCAG AA cho văn bản thường (4.5:1) và chữ lớn (3:1)
        taupe: "#8a6e57",
        charcoal: "#1a1a1a", // Xám than đen cho tiêu đề và chữ chính
      },
    },
  },
  plugins: [],
};
