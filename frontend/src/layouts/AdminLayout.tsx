import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Boxes,
  CalendarClock,
  Package,
  ShoppingCart,
  Users,
  Wrench,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useRealtimeSync } from "../hooks/useRealtimeSync";

const navItems = [
  { to: "/admin", label: "Tổng quan", icon: BarChart3 },
  { to: "/admin/bookings", label: "Lịch hẹn", icon: CalendarClock },
  { to: "/admin/services", label: "Dịch vụ", icon: Wrench },
  { to: "/admin/products", label: "Sản phẩm", icon: Package },
  { to: "/admin/orders", label: "Đơn hàng", icon: ShoppingCart },
  { to: "/admin/customers", label: "Khách hàng", icon: Users },
  { to: "/admin/inventory", label: "Kho hàng", icon: Boxes },
];

const getPageTitle = (pathname: string) => {
  const matched = navItems.find((item) => pathname === item.to);
  return matched?.label || "Quản trị salon";
};

const AdminLayout = () => {
  useRealtimeSync(); // Bật realtime sync cho admin
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuth((state) => state.logout);
  const getCurrentUser = useAuth((state) => state.getCurrentUser);
  const user = getCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        {/* Backdrop overlay for mobile */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white px-5 py-6 text-slate-800 transition-transform lg:static lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold">Salon Dương Chi</p>
              <h1 className="mt-0.5 text-lg font-bold text-slate-950">Quản Trị Viên</h1>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 lg:hidden flex items-center justify-center"
              style={{ minHeight: "44px", minWidth: "44px" }}
              aria-label="Đóng menu"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 lg:py-2 text-sm lg:text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                  style={{ minHeight: "44px" }}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8 lg:py-4.5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="rounded-lg border border-slate-200 p-2.5 text-slate-600 lg:hidden flex items-center justify-center"
                  style={{ minHeight: "44px", minWidth: "44px" }}
                  aria-label="Mở menu"
                >
                  <Menu size={18} strokeWidth={1.5} />
                </button>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Bảng điều khiển</p>
                  <h2 className="text-sm font-semibold text-slate-950">{pageTitle}</h2>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-semibold text-slate-900">{user?.name || "Quản trị viên"}</p>
                  <p className="text-[10px] text-slate-400 capitalize">Quyền: {user?.role || "admin"}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 md:px-3.5 md:py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150"
                  style={{ minHeight: "40px" }}
                  aria-label="Đăng xuất"
                >
                  <LogOut size={14} strokeWidth={1.5} />
                  <span className="hidden md:inline">Đăng xuất</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-slate-50/50 px-4 py-4 md:px-6 lg:px-8 lg:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
