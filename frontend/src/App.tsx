import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/admin/Dashboard";
import BookingsPage from "./pages/admin/Bookings";
import ServicesAdminPage from "./pages/admin/Services";
import ProductsAdminPage from "./pages/admin/Products";
import OrdersPage from "./pages/admin/Orders";
import CustomersPage from "./pages/admin/Customers";
import InventoryPage from "./pages/admin/Inventory";
import { publicRoutes } from "./routes";
import { useRealtimeSync } from "./hooks/useRealtimeSync";
import "./App.css";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  useRealtimeSync(isAdminPath);

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
              <AdminLayout />
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
    return routesElement;
  }

  return <MainLayout>{routesElement}</MainLayout>;
}

export default App;
