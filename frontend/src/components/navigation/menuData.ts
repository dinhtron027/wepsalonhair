import type { MenuItem } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Tách riêng để dễ chỉnh sửa nội dung mà không cần đụng logic
// ─────────────────────────────────────────────────────────────────────────────

export const MENU_ITEMS: readonly MenuItem[] = [
  {
    id: "home",
    title: "Trang Chủ",
    path: "/",
  },
  {
    id: "services",
    title: "Dịch Vụ",
    path: "/services",
    children: [
      {
        id: "services-experience",
        title: "Trải Nghiệm",
        path: "/services/experience",
      },
      {
        id: "services-care",
        title: "Chăm Dưỡng",
        path: "/services/care",
      },
      {
        id: "services-pricing",
        title: "Bảng Giá",
        path: "/pricing",
      },
      {
        id: "services-haircut",
        title: "Cắt & Tạo Kiểu Nữ",
        path: "/services/category/haircut",
      },
      {
        id: "services-perm",
        title: "Uốn Tóc Nữ",
        path: "/services/category/perm",
      },
      {
        id: "services-straightening",
        title: "Duỗi Tóc Nữ",
        path: "/services/category/straightening",
      },
      {
        id: "services-color",
        title: "Nhuộm Tóc Nữ",
        path: "/services/category/color",
      },
      {
        id: "services-treatment",
        title: "Phục Hồi Tóc",
        path: "/services/category/treatment",
      },
      {
        id: "services-shampoo",
        title: "Gội Đầu Dưỡng Sinh",
        path: "/services/category/shampoo",
      },
      {
        id: "services-combo",
        title: "Combo Làm Đẹp",
        path: "/services/category/combo",
      },
    ],
  },
  {
    id: "products",
    title: "Sản Phẩm",
    path: "/products",
  },
  {
    id: "blog",
    title: "Blog / Cảm Hứng",
    path: "/news",
  },
  {
    id: "about",
    title: "Về Chúng Tôi",
    path: "/about",
  },
  {
    id: "contact",
    title: "Liên Hệ",
    path: "/contact",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// MenuManager — OOP Class
// Dùng HashMap (Map) để tra cứu O(1), đệ quy để duyệt cây menu
// ─────────────────────────────────────────────────────────────────────────────

export class MenuManager {
  /** HashMap: id → MenuItem, cho phép tra cứu O(1) */
  private readonly itemsMap: Map<string, MenuItem>;
  /** Danh sách gốc để giữ thứ tự hiển thị */
  private readonly items: readonly MenuItem[];

  constructor(items: readonly MenuItem[]) {
    this.items = items;
    this.itemsMap = this.buildHashMap(items);
  }

  /**
   * Xây dựng HashMap bằng đệ quy — duyệt toàn bộ cây menu
   * Complexity: O(n) time, O(n) space
   */
  private buildHashMap(
    items: readonly MenuItem[],
    map: Map<string, MenuItem> = new Map()
  ): Map<string, MenuItem> {
    for (const item of items) {
      map.set(item.id, item);
      // Đệ quy xuống children nếu có
      if (item.children?.length) {
        this.buildHashMap(item.children, map);
      }
    }
    return map;
  }

  /** Lấy toàn bộ menu gốc theo thứ tự */
  getAll(): readonly MenuItem[] {
    return this.items;
  }

  /** Tra cứu O(1) theo id */
  findById(id: string): MenuItem | undefined {
    return this.itemsMap.get(id);
  }

  /** Kiểm tra một item có dropdown không */
  hasDropdown(item: MenuItem): boolean {
    return Boolean(item.children?.length);
  }

  /** Lấy toàn bộ children của một item theo id */
  getChildren(id: string): readonly MenuItem[] {
    return this.itemsMap.get(id)?.children ?? [];
  }

  /**
   * Tìm kiếm nhị phân trong danh sách đã sắp xếp theo title (Binary Search)
   * Dùng khi cần tìm nhanh trong một danh mục con lớn
   * Complexity: O(log n)
   */
  binarySearchByTitle(
    sortedItems: MenuItem[],
    target: string
  ): MenuItem | null {
    let lo = 0;
    let hi = sortedItems.length - 1;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      const cmp = sortedItems[mid].title.localeCompare(target, "vi");

      if (cmp === 0) return sortedItems[mid];
      if (cmp < 0) lo = mid + 1;
      else hi = mid - 1;
    }

    return null;
  }

  /** Đếm tổng số mục (bao gồm nested) bằng đệ quy */
  countAll(items: readonly MenuItem[] = this.items): number {
    return items.reduce(
      (acc, item) =>
        acc + 1 + (item.children ? this.countAll(item.children) : 0),
      0
    );
  }
}

/** Singleton instance — dùng chung toàn app */
export const menuManager = new MenuManager(MENU_ITEMS);
