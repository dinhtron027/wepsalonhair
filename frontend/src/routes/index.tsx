import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

// ─── Eager imports: Trang chính — tải ngay để tránh FOUC ─────────────────────
import Home from "../pages/Home";
import ServicesPage from "../pages/ServicesPage";
import About from "../pages/About";

// ─── Lazy imports: Các trang phụ — chỉ tải khi người dùng navigate ───────────
// Giảm initial bundle size đáng kể (loại trừ các trang ít dùng khỏi main chunk)
const ServiceDetailPage = lazy(() => import("../pages/ServiceDetailPage"));
const Gallery = lazy(() => import("../pages/Gallery"));
const Contact = lazy(() => import("../pages/Contact"));
const Pricing = lazy(() => import("../pages/Pricing"));
const News = lazy(() => import("../pages/News"));
const NewsDetail = lazy(() => import("../pages/NewsDetail"));
const ProductsPage = lazy(() => import("../pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const BookingPage = lazy(() => import("../pages/BookingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const ExperiencePage = lazy(() => import("../pages/ExperiencePage"));
const CarePage = lazy(() => import("../pages/CarePage"));
const ServiceCategoryPage = lazy(() => import("../pages/ServiceCategoryPage"));

// ─── Suspense fallback chung ──────────────────────────────────────────────────
// eslint-disable-next-line react-refresh/only-export-components
const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <LoadingSpinner label="Đang tải trang..." size="lg" />
  </div>
);

// ─── Wrapper: bọc lazy component trong Suspense ───────────────────────────────
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const publicRoutes = [
  { path: "/", element: <Home />, name: "Trang chu" },
  { path: "/about", element: <About />, name: "Gioi thieu" },
  { path: "/services", element: <ServicesPage />, name: "Dich vu" },
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
    path: "/services/category/:categorySlug",
    element: withSuspense(ServiceCategoryPage),
    name: "Danh muc dich vu",
  },
  {
    path: "/services/:slug",
    element: withSuspense(ServiceDetailPage),
    name: "Chi tiet dich vu",
  },
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
    path: "/products/:slug",
    element: withSuspense(ProductDetailPage),
    name: "Chi tiet san pham",
  },
  { path: "/gallery", element: withSuspense(Gallery), name: "Bo suu tap" },
  { path: "/booking", element: withSuspense(BookingPage), name: "Dat lich" },
  { path: "/news", element: withSuspense(News), name: "Tin tuc" },
  {
    path: "/news/:slug",
    element: withSuspense(NewsDetail),
    name: "Chi tiet tin tuc",
  },
  { path: "/contact", element: withSuspense(Contact), name: "Lien he" },
  { path: "/cart", element: withSuspense(CartPage), name: "Giỏ hàng" },
  { path: "/login", element: withSuspense(LoginPage), name: "Dang nhap" },
  {
    path: "/register",
    element: withSuspense(RegisterPage),
    name: "Dang ky",
  },
];

export const menuLinks = publicRoutes.filter(
  (route) =>
    !route.path.includes(":") &&
    !route.path.startsWith("/services/") &&
    !["/cart", "/login", "/admin"].includes(route.path)
);
