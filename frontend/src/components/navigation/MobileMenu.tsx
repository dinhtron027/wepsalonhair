import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingBag, LogOut, LayoutDashboard } from "lucide-react";
import type { MobileMenuProps } from "./types";
import { menuManager } from "./menuData";
import { useAuth } from "../../hooks/useAuth";
import {
  MobileOverlay,
  MobilePanel,
  MobileNavItem,
  MobileNavButton,
  MobileDropdownSection,
  MobileDropdownItem,
  MobileDivider,
  MobileCTA,
} from "./styled";

/**
 * MobileMenu component hiển thị danh sách điều hướng trên thiết bị di động.
 * Hỗ trợ đệ quy/dropdown mở rộng và tích hợp giỏ hàng, xác thực người dùng.
 */
const MobileMenu: React.FC<MobileMenuProps> = ({
  items,
  isOpen,
  cartCount,
  onClose,
}) => {
  const navigate = useNavigate();
  const token = useAuth((state) => state.token);
  const user = useAuth((state) => state.user);
  const isAdmin = useAuth((state) => state.isAdmin);
  const logout = useAuth((state) => state.logout);

  // Lấy display name giống Navbar
  const displayName = (() => {
    if (!user) return "";
    const name = typeof user.name === "string" ? user.name.trim() : "";
    if (name) {
      return name.length > 16 ? name.split(" ")[0] : name;
    }
    const email = typeof user.email === "string" ? user.email.trim() : "";
    return email.split("@")[0] || "";
  })();

  // State to track which dropdown items are expanded
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      <MobileOverlay $isOpen={isOpen} onClick={onClose} />
      <MobilePanel $isOpen={isOpen}>
        {items.map((item) => {
          const hasDropdown = menuManager.hasDropdown(item);
          const isExpanded = expandedItems[item.id];
          return (
            <div key={item.id}>
              {hasDropdown ? (
                <>
                  <MobileNavButton
                    onClick={() => toggleExpand(item.id)}
                  >
                    <span>{item.title}</span>
                    <span
                      style={{
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        fontSize: "0.75rem",
                        color: "#64748b",
                      }}
                    >
                      ▼
                    </span>
                  </MobileNavButton>
                  {isExpanded && (
                    <MobileDropdownSection>
                      {item.children?.map((child) => (
                        <MobileDropdownItem
                          key={child.id}
                          as={Link}
                          to={child.path}
                          onClick={onClose}
                        >
                          {child.icon && (
                            <span className="mr-1">{child.icon}</span>
                          )}
                          {child.title}
                        </MobileDropdownItem>
                      ))}
                    </MobileDropdownSection>
                  )}
                </>
              ) : (
                <MobileNavItem as={Link} to={item.path} onClick={onClose}>
                  {item.title}
                </MobileNavItem>
              )}
            </div>
          );
        })}

        <MobileDivider />

        {/* User Info / Auth */}
        {token ? (
          <>
            <div
              style={{
                padding: "0.75rem 1rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                marginBottom: "0.5rem",
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={displayName}
                  style={{
                    width: "32px",
                    height: "32px",
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
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#1a1a1a",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {displayName && displayName.charAt(0) ? displayName.charAt(0).toUpperCase() : ""}
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
              <MobileNavItem as={Link} to="/admin" onClick={onClose}>
                <LayoutDashboard size={18} style={{ marginRight: "8px" }} />
                Quản Trị Viên
              </MobileNavItem>
            )}
            <MobileNavItem
              onClick={handleLogout}
              style={{ color: "#ef4444" }}
            >
              <LogOut size={18} style={{ marginRight: "8px" }} />
              Đăng Xuất
            </MobileNavItem>
          </>
        ) : (
          <MobileNavItem as={Link} to="/login" onClick={onClose}>
            Đăng Nhập 
          </MobileNavItem>
        )}

        {/* Cart Link */}
        <MobileNavItem as={Link} to="/cart" onClick={onClose}>
          <ShoppingBag size={18} style={{ marginRight: "8px" }} />
          Giỏ Hàng ({cartCount})
        </MobileNavItem>

        {/* CTA */}
        <MobileCTA as={Link} to="/booking" onClick={onClose}>
          ĐẶT LỊCH NGAY
        </MobileCTA>
      </MobilePanel>
    </>
  );
};

export default MobileMenu;
