/**
 * Navigation Types
 * Định nghĩa rõ ràng kiểu dữ liệu cho toàn bộ navigation module.
 */

export interface MenuItem {
  /** Định danh duy nhất cho mỗi mục menu */
  readonly id: string;
  /** Tiêu đề hiển thị */
  readonly title: string;
  /** Đường dẫn URL */
  readonly path: string;
  /** Mục menu con (cho Dropdown) */
  readonly children?: readonly MenuItem[];
  /** Icon tùy chọn */
  readonly icon?: string;
  /** Đánh dấu mục cần highlight (VD: CTA) */
  readonly isCTA?: boolean;
}

export interface NavItemProps {
  item: MenuItem;
  /** Trạng thái dropdown đang mở (chỉ dùng trên desktop) */
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

export interface DropdownProps {
  items: readonly MenuItem[];
  isOpen: boolean;
}

export interface MobileMenuProps {
  items: readonly MenuItem[];
  isOpen: boolean;
  cartCount: number;
  onClose: () => void;
}

export type OpenMenuId = string | null;
