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
        taupe: "#d9c5b2",
        charcoal: "#1a1a1a",
      },
    },
  },
  plugins: [],
};
