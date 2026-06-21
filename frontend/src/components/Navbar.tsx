import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "./navigation/styled";

/**
 * Navigation Bar Component
 * Áp dụng thiết kế UI/UX hiện đại, kết hợp OOP MenuManager và quản lý trạng thái đồng bộ.
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
    const name = user.name?.trim();
    if (name) {
      // Chỉ lấy từ đầu tiên nếu tên quá dài (> 12 ký tự)
      return name.length > 12 ? name.split(" ")[0] : name;
    }
    // Fallback sang phần trước @ của email
    return user.email?.split("@")[0] ?? "";
  })();

  // Close menus when route changes
  useEffect(() => {
    setOpenDropdownId(null);
    setClickedDropdownId(null);
    setMobileMenuOpen(false);
    setCartOpen(false);
  }, [location.pathname]);

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

  const handleNavItemClick = (item: MenuItem, event: React.MouseEvent) => {
    if (menuManager.hasDropdown(item)) {
      event.preventDefault(); // Ngăn điều hướng lập tức trên cả Desktop để giữ dropdown mở rộng
      const isTouch = window.matchMedia("(hover: none)").matches;
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
    } else {
      navigate(item.path);
      setOpenDropdownId(null);
      setClickedDropdownId(null);
    }
  };

  const menuItems = menuManager.getAll();

  return (
    <>
      <NavbarWrapper $scrolled={scrolled} ref={navRef}>
        <NavbarInner>
          {/* Logo (Trang Chủ - Chỉ cần Logo/Text click để về Home) */}
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
                    const isTouch = window.matchMedia("(hover: none)").matches;
                    if (!isTouch && hasDropdown) {
                      setOpenDropdownId(item.id);
                    }
                  }}
                  onMouseLeave={() => {
                    const isTouch = window.matchMedia("(hover: none)").matches;
                    if (!isTouch && hasDropdown) {
                      // Chỉ đóng menu khi di chuột ra ngoài nếu nó không ở trạng thái click giữ cố định
                      if (clickedDropdownId !== item.id) {
                        setOpenDropdownId(null);
                      }
                    }
                  }}
                >
                  <NavLinkBase
                    $active={isActive}
                    onClick={(e) => handleNavItemClick(item, e)}
                    data-has-dropdown={hasDropdown}
                    data-dropdown-open={isDropdownOpen}
                    aria-expanded={isDropdownOpen}
                    aria-haspopup={hasDropdown ? "true" : "false"}
                  >
                    {item.title}
                  </NavLinkBase>

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
              <ShoppingBag size={18} />
              {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
            </CartButton>

            {/* Auth / Admin */}
            {token ? (
              <>
                {/* Lời chào + Avatar */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#1e293b",
                    maxWidth: "160px",
                  }}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={displayName}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid rgba(244, 63, 94, 0.3)",
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
                        background: "linear-gradient(135deg, #f43f5e, #fb923c)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Xin chào, {displayName}
                  </span>
                </div>

                {isAdmin() && (
                  <NavLinkBase
                    onClick={() => navigate("/admin")}
                    style={{ display: "inline-flex", gap: "0.25rem" }}
                  >
                    <LayoutDashboard size={16} />
                    <span>Quản trị</span>
                  </NavLinkBase>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.5rem 0.875rem",
                    borderRadius: "12px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#ef4444",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    background: "rgba(239, 68, 68, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)";
                  }}
                >
                  <LogOut size={15} />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <NavLinkBase onClick={() => navigate("/login")}>
                Đăng Nhập
              </NavLinkBase>
            )}

            {/* CTA ĐẶT LỊCH NGAY (Nổi bật nhất) */}
            <CTAButton onClick={() => navigate("/booking")}>
              ĐẶT LỊCH NGAY
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
