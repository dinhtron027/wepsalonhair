import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, LogOut, LayoutDashboard, User } from "lucide-react";
import type { MobileMenuProps } from "./types";
import { menuManager } from "./menuData";
import { useAuth } from "../../hooks/useAuth";
import {
  MobileOverlay,
  MobilePanel,
  MobileNavItem,
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
  const isAdmin = useAuth((state) => state.isAdmin);
  const getCurrentUser = useAuth((state) => state.getCurrentUser);
  const logout = useAuth((state) => state.logout);
  const user = getCurrentUser();

  // State to track which dropdown items are expanded
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const handleItemClick = (path: string) => {
    navigate(path);
    onClose();
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
                  <MobileNavItem
                    as="button"
                    onClick={() => toggleExpand(item.id)}
                    style={{
                      cursor: "pointer",
                      color: "#1e293b",
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "none",
                      background: "none",
                      font: "inherit",
                    }}
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
                  </MobileNavItem>
                  {isExpanded && (
                    <MobileDropdownSection>
                      {item.children?.map((child) => (
                        <MobileDropdownItem
                          key={child.id}
                          onClick={() => handleItemClick(child.path)}
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
                <MobileNavItem onClick={() => handleItemClick(item.path)}>
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
            {user?.name && (
              <div
                style={{
                  padding: "0.5rem 1rem",
                  fontSize: "0.875rem",
                  color: "#64748b",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <User size={16} />
                <span>Xin chào, {user.name}</span>
              </div>
            )}
            {isAdmin() && (
              <MobileNavItem onClick={() => handleItemClick("/admin")}>
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
          <MobileNavItem onClick={() => handleItemClick("/login")}>
            Đăng Nhập / Trải Nghiệm
          </MobileNavItem>
        )}

        {/* Cart Link */}
        <MobileNavItem onClick={() => handleItemClick("/cart")}>
          <ShoppingBag size={18} style={{ marginRight: "8px" }} />
          Giỏ Hàng ({cartCount})
        </MobileNavItem>

        {/* CTA */}
        <MobileCTA onClick={() => handleItemClick("/booking")}>
          ĐẶT LỊCH NGAY
        </MobileCTA>
      </MobilePanel>
    </>
  );
};

export default MobileMenu;
