import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Loại bỏ ký tự '#' để tìm element ID
      const elementId = hash.replace("#", "");
      
      const timer = setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          // Tính toán chiều cao của navbar fixed (lên tới 96px trên màn hình lớn và 80px trên di động)
          const navbarOffset = window.innerWidth >= 1024 ? 96 : 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - navbarOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        } else {
          // Nếu không tìm thấy element, fallback scroll lên đầu trang
          window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        }
      }, 100);

      return () => clearTimeout(timer);
    } else {
      // Không có hash link -> scroll lên đầu trang ngay lập tức
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
