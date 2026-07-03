import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import { publicRoutes } from "./routes";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const DashboardPage = lazy(() => import("./pages/admin/Dashboard"));
const BookingsPage = lazy(() => import("./pages/admin/Bookings"));
const ServicesAdminPage = lazy(() => import("./pages/admin/Services"));
const ProductsAdminPage = lazy(() => import("./pages/admin/Products"));
const OrdersPage = lazy(() => import("./pages/admin/Orders"));
const CustomersPage = lazy(() => import("./pages/admin/Customers"));
const InventoryPage = lazy(() => import("./pages/admin/Inventory"));

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");


  const routesElement = (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {publicRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {element}
              </motion.div>
            }
          />
        ))}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowRoles={["admin"]}>
              <Suspense fallback={<LoadingSpinner label="Dang tai trang quan tri..." />}>
                <AdminLayout />
              </Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="services" element={<ServicesAdminPage />} />
          <Route path="products" element={<ProductsAdminPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="inventory" element={<InventoryPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );

  if (isAdminPath) {
    return (
      <>
        <ScrollToTop />
        {routesElement}
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <MainLayout>{routesElement}</MainLayout>
    </>
  );
}

export default App;
