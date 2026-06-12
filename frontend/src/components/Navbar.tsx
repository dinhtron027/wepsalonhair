import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, ShoppingBag, X } from "lucide-react";
import Button from "./Button";
import CartDrawer from "./CartDrawer";
import useCartStore from "../store/useCartStore";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { label: "Trang Chủ", to: "/" },
  { label: "Câu Chuyện", to: "/about" },
  { label: "Trải Nghiệm", to: "/services" },
  { label: "Bảng Giá", to: "/pricing" },
  { label: "Chăm Dưỡng", to: "/products" },
  { label: "Cảm Hứng", to: "/gallery" },
  { label: "Hẹn Gặp", to: "/booking" },
  { label: "Tin Tức", to: "/news" },
  { label: "Kết Nối", to: "/contact" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { items } = useCartStore();

  const token = useAuth((state) => state.token);
  const getCurrentUser = useAuth((state) => state.getCurrentUser);
  const logout = useAuth((state) => state.logout);
  const isAdmin = useAuth((state) => state.isAdmin);
  const user = getCurrentUser();

  useEffect(() => {
    setMobileOpen(false);
    setCartOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all ${
          scrolled ? "bg-white/80 backdrop-blur-lg shadow-lg" : "bg-transparent text-slate-900"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-wide">
            <span className="text-2xl text-rose-500">Salon Dương Chí</span>
          </Link>

          <nav className="hidden items-center gap-4 text-xs font-semibold uppercase tracking-tight lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `transition-all hover:text-rose-500 ${isActive ? "text-rose-500" : "text-slate-700"}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {token ? (
              <>
                {isAdmin() ? (
                  <Button to="/admin" variant="ghost">
                    Quản Trị
                  </Button>
                ) : null}
                <button
                  onClick={handleLogout}
                  className="rounded-full border border-rose-100 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:text-rose-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Button to="/login" variant="ghost">
                Trải nghiệm ngay
              </Button>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full border border-rose-100 bg-white/80 p-2 text-slate-700 shadow-md shadow-rose-100 transition hover:border-rose-200 hover:text-rose-600"
              aria-label="Mo gio hang"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-2 text-xs font-semibold text-white shadow-lg shadow-rose-200">
                  {itemCount}
                </span>
              ) : null}
            </button>
          </nav>

          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setCartOpen(true)}
              className="relative rounded-full border border-rose-100 bg-white/80 p-2 text-slate-700 shadow-md shadow-rose-100"
              aria-label="Mo gio hang"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-2 text-xs font-semibold text-white shadow-lg shadow-rose-200">
                  {itemCount}
                </span>
              ) : null}
            </button>

            <button
              className="rounded-full border border-white/70 bg-white/70 p-2 shadow-lg"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Mo menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-rose-100 bg-white/90 px-4 py-4 backdrop-blur-xl shadow-inner lg:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm ${
                      isActive ? "bg-rose-50 text-rose-500 font-semibold" : "text-slate-700"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="grid grid-cols-2 gap-3">
                {token ? (
                  <>
                    {isAdmin() ? (
                      <Button to="/admin" variant="ghost" fullWidth>
                        Quản trị
                      </Button>
                    ) : null}
                    <button
                      onClick={handleLogout}
                      className="inline-flex w-full items-center justify-center rounded-full border border-rose-100 bg-white/70 px-5 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Button to="/login" variant="ghost" fullWidth>
                    Đăng nhập
                  </Button>
                )}
                <Button to="/cart" variant="primary" fullWidth>
                  Giỏ hàng
                </Button>
              </div>
              {user?.name ? <p className="text-xs text-slate-500">Xin chào, {user.name}</p> : null}
            </div>
          </div>
        ) : null}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
