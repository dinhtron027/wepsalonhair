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
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white transition-transform lg:static lg:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Salon Admin</p>
              <h1 className="mt-1 text-2xl font-semibold">Bảng điều khiển</h1>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
              aria-label="Đóng menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-cyan-400/20 text-cyan-100"
                        : "text-slate-200 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-700 lg:hidden"
                  aria-label="Mở menu"
                >
                  <Menu size={18} />
                </button>
                <div>
                  <p className="text-xs text-slate-500">Khu vực quản trị</p>
                  <h2 className="text-lg font-semibold">{pageTitle}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold">{user?.name || "Quản trị viên"}</p>
                  <p className="text-xs text-slate-500">Vai trò: {user?.role || "admin"}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
