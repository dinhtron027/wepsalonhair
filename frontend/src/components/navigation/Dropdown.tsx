import { Link } from "react-router-dom";
import type { DropdownProps } from "./types";
import { DropdownWrapper, DropdownItem } from "./styled";

/**
 * Dropdown — hiển thị danh sách menu con trên desktop.
 * Dùng <Link> để Google Googlebot có thể crawl các đường dẫn.
 */
const Dropdown: React.FC<DropdownProps> = ({ items, isOpen }) => {
  return (
    <DropdownWrapper $isOpen={isOpen} role="menu" aria-hidden={!isOpen}>
      {items.map((item) => (
        <DropdownItem
          key={item.id}
          as={Link}
          to={item.path}
          role="menuitem"
          tabIndex={isOpen ? 0 : -1}
        >
          {item.icon && <span className="item-icon">{item.icon}</span>}
          {item.title}
        </DropdownItem>
      ))}
    </DropdownWrapper>
  );
};

export default Dropdown;
