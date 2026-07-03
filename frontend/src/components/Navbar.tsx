import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, LogOut, LayoutDashboard } from "lucide-react";
import useCartStore from "../store/useCartStore";
import { useAuth } from "../hooks/useAuth";
import { useClickOutside } from "../hooks/useClickOutside";
import CartDrawer from "./CartDrawer";

// Import navigation-specific assets/modules
import { menuManager } from "./navigation/menuData";
import type { OpenMenuId, MenuItem } from "./navigation/types";
import Dropdown from "./navigation/Dropdown";
import MobileMenu from "./navigation/MobileMenu";
import {
  NavbarWrapper,
  NavbarInner,
  LogoLink,
  DesktopNav,
  NavItemWrapper,
  NavLinkBase,
  NavActions,
  CTAButton,
  CartButton,
  CartBadge,
  MobileActions,
  HamburgerButton,
  UserGreeting,
  UserGreetingText,
} from "./navigation/styled";

/**
 * Navigation Bar Component
 * Áp dụng thiết kế UI/UX hiện đại, kết hợp OOP MenuManager và quản lý trạng thái đồng bộ.
 *
 * SEO note: Items không có dropdown dùng <Link> (có href) để Googlebot crawl được.
 * Items có dropdown dùng <button type="button"> (semantic) — không cần href vì
 * các link trong dropdown đã crawlable.
 */
const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation UI states
  const [scrolled, setScrolled] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<OpenMenuId>(null);
  const [clickedDropdownId, setClickedDropdownId] = useState<OpenMenuId>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Cart Store State
  const { items } = useCartStore();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Auth Store State
  const token = useAuth((state) => state.token);
  const user = useAuth((state) => state.user);
  const isAdmin = useAuth((state) => state.isAdmin);
  const logout = useAuth((state) => state.logout);

  // Lấy first name (tên đầu tiên) để hiển thị gọn trên navbar
  const displayName = (() => {
    if (!user) return "";
    const name = typeof user.name === "string" ? user.name.trim() : "";
    if (name) {
      // Chỉ lấy từ đầu tiên nếu tên quá dài (> 12 ký tự)
      return name.length > 12 ? name.split(" ")[0] : name;
    }
    // Fallback sang phần trước @ của email
    const email = typeof user.email === "string" ? user.email.trim() : "";
    return email.split("@")[0] || "";
  })();

  const checkIsTouch = () => {
    if (typeof window !== "undefined" && window.matchMedia) {
      try {
        return window.matchMedia("(hover: none)").matches;
      } catch (e) {
        console.warn("window.matchMedia failed:", e);
      }
    }
    return false;
  };

  // Close menus when route or hash changes
  useEffect(() => {
    setOpenDropdownId(null);
    setClickedDropdownId(null);
    setMobileMenuOpen(false);
    setCartOpen(false);
  }, [location.pathname, location.hash]);

  // Track window scroll to change background opacity/blur
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Xử lý click outside để đóng bất kỳ dropdown nào đang mở trên desktop
  const navRef = useClickOutside<HTMLDivElement>(() => {
    setOpenDropdownId(null);
    setClickedDropdownId(null);
  }, openDropdownId !== null || clickedDropdownId !== null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /**
   * Xử lý click trên dropdown trigger button.
   * Item có dropdown: toggle dropdown open/close (không navigate).
   * Item không có dropdown: không cần xử lý ở đây (dùng Link trực tiếp).
   */
  const handleDropdownToggle = (item: MenuItem, event: React.MouseEvent) => {
    event.preventDefault();
    const isTouch = checkIsTouch();
    if (isTouch) {
      setOpenDropdownId((prev) => (prev === item.id ? null : item.id));
    } else {
      // Trên Desktop: click sẽ chuyển đổi trạng thái click-lock giữ menu mở cố định
      if (clickedDropdownId === item.id) {
        setClickedDropdownId(null);
        setOpenDropdownId(null);
      } else {
        setClickedDropdownId(item.id);
        setOpenDropdownId(item.id);
      }
    }
  };

  const menuItems = menuManager.getAll();

  return (
    <>
      <NavbarWrapper $scrolled={scrolled} ref={navRef}>
        <NavbarInner>
          {/* Logo (Trang Chủ) */}
          <LogoLink href="/">
            <span>Salon Dương Chi</span>
          </LogoLink>

          {/* Desktop Navigation Links */}
          <DesktopNav>
            {menuItems.map((item) => {
              const hasDropdown = menuManager.hasDropdown(item);
              const isDropdownOpen = openDropdownId === item.id;
              const isActive =
                location.pathname === item.path ||
                (hasDropdown &&
                  item.children?.some((child) => location.pathname === child.path));

              return (
                <NavItemWrapper
                  key={item.id}
                  onMouseEnter={() => {
                    const isTouch = checkIsTouch();
                    if (!isTouch && hasDropdown) {
                      setOpenDropdownId(item.id);
                    }
                  }}
                  onMouseLeave={() => {
                    const isTouch = checkIsTouch();
                    if (!isTouch && hasDropdown) {
                      // Chỉ đóng menu khi di chuột ra ngoài nếu nó không ở trạng thái click giữ cố định
                      if (clickedDropdownId !== item.id) {
                        setOpenDropdownId(null);
                      }
                    }
                  }}
                >
                  {hasDropdown ? (
                    // Dropdown trigger: dùng button (semantic), không cần href
                    // Googlebot crawl các link trong Dropdown component thay thế
                    <NavLinkBase
                      as="button"
                      type="button"
                      $active={isActive}
                      onClick={(e: React.MouseEvent) => handleDropdownToggle(item, e)}
                      data-has-dropdown={hasDropdown}
                      data-dropdown-open={isDropdownOpen}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                    >
                      {item.title}
                    </NavLinkBase>
                  ) : (
                    // Link thông thường: dùng React Router Link (có href) để crawlable
                    <NavLinkBase
                      as={Link}
                      to={item.path}
                      $active={isActive}
                      data-has-dropdown={false}
                      aria-haspopup="false"
                    >
                      {item.title}
                    </NavLinkBase>
                  )}

                  {hasDropdown && item.children && (
                    <Dropdown items={item.children} isOpen={isDropdownOpen} />
                  )}
                </NavItemWrapper>
              );
            })}
          </DesktopNav>

          {/* Desktop Action Items */}
          <NavActions>
            {/* Giỏ Hàng */}
            <CartButton
              onClick={() => setCartOpen(true)}
              aria-label="Xem giỏ hàng"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
            </CartButton>

            {/* Auth / Admin */}
            {token ? (
              <>
                {/* Lời chào + Avatar */}
                <UserGreeting>
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={displayName}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid rgba(0, 0, 0, 0.1)",
                        flexShrink: 0,
                      }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "#1a1a1a",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {displayName && displayName.charAt(0) ? displayName.charAt(0).toUpperCase() : ""}
                    </span>
                  )}
                  <UserGreetingText>
                    Xin chào, {displayName}
                  </UserGreetingText>
                </UserGreeting>

                {isAdmin() && (
                  <NavLinkBase
                    as={Link}
                    to="/admin"
                    style={{ display: "inline-flex", gap: "0.25rem" }}
                  >
                    <LayoutDashboard size={16} />
                    <span>Quản trị</span>
                  </NavLinkBase>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50/20 p-2 text-red-500 hover:bg-red-50 transition-all active:scale-95 min-[1400px]:gap-1.5 min-[1400px]:px-3 min-[1400px]:py-2 min-[1400px]:text-sm"
                  title="Đăng xuất"
                >
                  <LogOut size={15} strokeWidth={1.75} />
                  <span className="hidden min-[1400px]:inline">Đăng xuất</span>
                </button>
              </>
            ) : (
              // Đăng nhập: dùng Link có href để crawlable
              <NavLinkBase as={Link} to="/login">
                Đăng Nhập
              </NavLinkBase>
            )}

            {/* CTA ĐẶT LỊCH NGAY — dùng Link có href để crawlable */}
            <CTAButton as={Link} to="/booking">
              <span className="hidden min-[1400px]:inline">ĐẶT LỊCH NGAY</span>
              <span className="inline min-[1400px]:hidden">Đặt lịch</span>
            </CTAButton>
          </NavActions>

          {/* Mobile Actions: Cart & Hamburger */}
          <MobileActions>
            <CartButton
              onClick={() => setCartOpen(true)}
              aria-label="Xem giỏ hàng"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
            </CartButton>

            <HamburgerButton
              $isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={mobileMenuOpen}
            >
              <span />
              <span />
              <span />
            </HamburgerButton>
          </MobileActions>
        </NavbarInner>
      </NavbarWrapper>

      {/* Mobile Drawer Navigation Menu */}
      <MobileMenu
        items={menuItems}
        isOpen={mobileMenuOpen}
        cartCount={itemCount}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
