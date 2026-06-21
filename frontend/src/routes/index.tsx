import Home from "../pages/Home";
import ServicesPage from "../pages/ServicesPage";
import ServiceDetailPage from "../pages/ServiceDetailPage";
import Gallery from "../pages/Gallery";
import Contact from "../pages/Contact";
import About from "../pages/About";
import Pricing from "../pages/Pricing";
import News from "../pages/News";
import ProductsPage from "../pages/ProductsPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CartPage from "../pages/CartPage";
import BookingPage from "../pages/BookingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ExperiencePage from "../pages/ExperiencePage";
import CarePage from "../pages/CarePage";
import ServiceCategoryPage from "../pages/ServiceCategoryPage";

export const publicRoutes = [
  { path: "/", element: <Home />, name: "Trang chu" },
  { path: "/about", element: <About />, name: "Gioi thieu" },
  { path: "/services", element: <ServicesPage />, name: "Dich vu" },
  { path: "/services/experience", element: <ExperiencePage />, name: "Trai nghiem" },
  { path: "/services/care", element: <CarePage />, name: "Cham duong" },
  { path: "/services/category/:categorySlug", element: <ServiceCategoryPage />, name: "Danh muc dich vu" },
  { path: "/services/:slug", element: <ServiceDetailPage />, name: "Chi tiet dich vu" },
  { path: "/pricing", element: <Pricing />, name: "Bang gia dich vu" },
  { path: "/products", element: <ProductsPage />, name: "San pham" },
  { path: "/products/:slug", element: <ProductDetailPage />, name: "Chi tiet san pham" },
  { path: "/gallery", element: <Gallery />, name: "Bo suu tap" },
  { path: "/booking", element: <BookingPage />, name: "Dat lich" },
  { path: "/news", element: <News />, name: "Tin tuc" },
  { path: "/contact", element: <Contact />, name: "Lien he" },
  { path: "/cart", element: <CartPage />, name: "Gio hang" },
  { path: "/login", element: <LoginPage />, name: "Dang nhap" },
  { path: "/register", element: <RegisterPage />, name: "Dang ky" },
];

export const menuLinks = publicRoutes.filter(
  (route) =>
    !route.path.includes(":") &&
    !route.path.startsWith("/services/") &&
    !["/cart", "/login", "/admin"].includes(route.path)
);
