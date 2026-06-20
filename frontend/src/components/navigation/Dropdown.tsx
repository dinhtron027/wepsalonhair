import { useNavigate } from "react-router-dom";
import type { DropdownProps } from "./types";
import { DropdownWrapper, DropdownItem } from "./styled";

/**
 * Dropdown — hiển thị danh sách menu con trên desktop.
 * Render bằng đệ quy nếu cần hỗ trợ menu nhiều cấp.
 */
const Dropdown: React.FC<DropdownProps> = ({ items, isOpen }) => {
  const navigate = useNavigate();

  return (
    <DropdownWrapper $isOpen={isOpen} role="menu" aria-hidden={!isOpen}>
      {items.map((item) => (
        <DropdownItem
          key={item.id}
          role="menuitem"
          tabIndex={isOpen ? 0 : -1}
          onClick={() => navigate(item.path)}
          onKeyDown={(e) => e.key === "Enter" && navigate(item.path)}
        >
          {item.icon && <span className="item-icon">{item.icon}</span>}
          {item.title}
        </DropdownItem>
      ))}
    </DropdownWrapper>
  );
};

export default Dropdown;
