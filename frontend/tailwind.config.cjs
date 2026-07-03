/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      colors: {
        blush: "#fef2f4",
        cream: "#faf9f6",
        // taupe: tăng từ #d9c5b2 (ratio 1.7:1) → #8a6e57 (ratio ~5.0:1 trên trắng)
        // Đạt WCAG AA cho text thường (4.5:1) và WCAG AA cho large text (3:1)
        taupe: "#8a6e57",
        charcoal: "#1a1a1a",
      },
    },
  },
  plugins: [],
};
