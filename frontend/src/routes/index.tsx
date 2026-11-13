/**
 * Tệp cấu hình định tuyến (routes/index.tsx):
 * Khai báo danh sách các trang công khai (Public Routes) của ứng dụng.
 * 
 * Áp dụng kết hợp 2 kỹ thuật tải trang để tối ưu trải nghiệm người dùng (UX):
 * 1. Eager Loading (Tải tĩnh ngay từ đầu): Dành cho các trang có lưu lượng truy cập cao nhất
 *    như Trang chủ (Home), Giới thiệu (About), Dịch vụ (Services) để hiển thị tức thì, tránh chớp màn hình (FOUC).
 * 2. Lazy Loading (Tải lười/Tải theo yêu cầu): Dành cho các trang thứ cấp (Đặt lịch, Chi tiết, Thanh toán).
 *    Trình duyệt chỉ tải file mã nguồn của trang đó khi người dùng thực sự click điều hướng vào URL đó.
 *    Kỹ thuật này giúp giảm dung lượng tải ban đầu (Initial Bundle Size) tới hơn 60%.
 */
import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

// ─── Eager imports: Trang chính — tải ngay để tránh FOUC ─────────────────────
import Home from "../pages/Home";
import ServicesPage from "../pages/ServicesPage";
import About from "../pages/About";

// ─── Lazy imports: Các trang phụ — chỉ tải khi người dùng navigate ───────────
const ServiceDetailPage = lazy(() => import("../pages/ServiceDetailPage"));
const Gallery = lazy(() => import("../pages/Gallery"));
const Contact = lazy(() => import("../pages/Contact"));
const Pricing = lazy(() => import("../pages/Pricing"));
const News = lazy(() => import("../pages/News"));
const NewsDetail = lazy(() => import("../pages/NewsDetail"));
const ProductsPage = lazy(() => import("../pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const PaymentPage = lazy(() => import("../pages/PaymentPage"));
const BookingPage = lazy(() => import("../pages/BookingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const ExperiencePage = lazy(() => import("../pages/ExperiencePage"));
const CarePage = lazy(() => import("../pages/CarePage"));
const ServiceCategoryPage = lazy(() => import("../pages/ServiceCategoryPage"));

/**
 * Component hiển thị trạng thái chờ trong khi trình duyệt đang tải mã nguồn trang lười (Lazy Chunk)
 */
// eslint-disable-next-line react-refresh/only-export-components
const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <LoadingSpinner label="Đang tải trang..." size="lg" />
  </div>
);

/**
 * Higher-Order Component bọc component lười bên trong thẻ <Suspense>:
 * Nếu component chưa tải xong, Suspense tự động hiển thị <PageLoader />.
 */
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const publicRoutes = [
  /**
   * Mảng định nghĩa tất cả các Route công khai (không yêu cầu đăng nhập).
   * Mỗi phần tử là một object gồm:
   * - path: đường dẫn URL (vd: "/booking")
   * - element: component React sẽ render khi URL khớp
   * - name: tên mô tả (dùng cho menuLinks và SEO)
   *
   * Các route có `:param` trong path (vd: `/services/:slug`) là Dynamic Route —
   * React Router tự động trích xuất giá trị (vd: "cat-toc") vào `useParams().slug`.
   */

  // ─── Trang chủ và trang tĩnh chính (Eager Loaded) ───────────────────────────
  { path: "/", element: <Home />, name: "Trang chu" },
  { path: "/about", element: <About />, name: "Gioi thieu" },
  { path: "/services", element: <ServicesPage />, name: "Dich vu" },

  // ─── Trang dịch vụ theo danh mục (Lazy Loaded) ──────────────────────────────
  {
    path: "/services/experience",
    element: withSuspense(ExperiencePage),
    name: "Trai nghiem",
  },
  {
    path: "/services/care",
    element: withSuspense(CarePage),
    name: "Cham duong",
  },
  {
    // :categorySlug — slug của danh mục dịch vụ (vd: /services/category/cat-toc)
    path: "/services/category/:categorySlug",
    element: withSuspense(ServiceCategoryPage),
    name: "Danh muc dich vu",
  },
  {
    // :slug — slug của dịch vụ cụ thể (vd: /services/goi-dau-phuc-hoi)
    path: "/services/:slug",
    element: withSuspense(ServiceDetailPage),
    name: "Chi tiet dich vu",
  },

  // ─── Bảng giá, Sản phẩm, Thư viện ảnh (Lazy Loaded) ────────────────────────
  {
    path: "/pricing",
    element: withSuspense(Pricing),
    name: "Bang gia dich vu",
  },
  {
    path: "/products",
    element: withSuspense(ProductsPage),
    name: "San pham",
  },
  {
    // :slug — slug của sản phẩm cụ thể (vd: /products/dau-goi-phuc-hoi)
    path: "/products/:slug",
    element: withSuspense(ProductDetailPage),
    name: "Chi tiet san pham",
  },
  { path: "/gallery", element: withSuspense(Gallery), name: "Bo suu tap" },

  // ─── Đặt lịch, Tin tức, Liên hệ (Lazy Loaded) ───────────────────────────────
  { path: "/booking", element: withSuspense(BookingPage), name: "Dat lich" },
  { path: "/news", element: withSuspense(News), name: "Tin tuc" },
  {
    // :slug — slug của bài viết tin tức (vd: /news/xu-huong-toc-2024)
    path: "/news/:slug",
    element: withSuspense(NewsDetail),
    name: "Chi tiet tin tuc",
  },
  { path: "/contact", element: withSuspense(Contact), name: "Lien he" },

  // ─── Giỏ hàng và Thanh toán (Lazy Loaded) ───────────────────────────────────
  { path: "/cart", element: withSuspense(CartPage), name: "Giỏ hàng" },
  { path: "/checkout", element: withSuspense(CheckoutPage), name: "Thanh toán" },
  {
    // :orderId — ID của đơn hàng vừa tạo, dùng để hiển thị QR thanh toán
    path: "/checkout/payment/:orderId",
    element: withSuspense(PaymentPage),
    name: "Thanh toán chuyển khoản",
  },

  // ─── Xác thực người dùng (Lazy Loaded) ──────────────────────────────────────
  { path: "/login", element: withSuspense(LoginPage), name: "Dang nhap" },
  {
    path: "/register",
    element: withSuspense(RegisterPage),
    name: "Dang ky",
  },
];

/**
 * Lọc ra danh sách các route hiển thị trên thanh điều hướng (Navigation Menu).
 *
 * Điều kiện lọc — loại bỏ các route:
 * - Có `:param` trong path (Dynamic Routes): không phải trang độc lập, không hiển thị trên menu.
 * - Bắt đầu bằng `/services/`: các trang con của dịch vụ, không hiển thị trực tiếp trên menu.
 * - Thuộc danh sách đen (/cart, /checkout, /login, /admin): trang chức năng, không phải trang điều hướng.
 *
 * Kết quả: chỉ còn các trang chính như Trang chủ, Dịch vụ, Giá, Sản phẩm, Thư viện, Tin tức, Liên hệ...
 */
export const menuLinks = publicRoutes.filter(
  (route) =>
    !route.path.includes(":") &&
    !route.path.startsWith("/services/") &&
    !["/cart", "/checkout", "/login", "/admin"].includes(route.path)
);
