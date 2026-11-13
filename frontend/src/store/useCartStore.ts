import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import api, { extractApiData } from "../services/api";
import { useAuth } from "../modules/auth/control/store/authStore";
import toast from "react-hot-toast";

/**
 * Đối tượng safeStorage: Cầu nối tùy biến cho LocalStorage.
 * Bọc các thao tác getItem, setItem, removeItem trong khối try/catch
 * nhằm ngăn chặn ứng dụng bị crash khi trình duyệt chặn lưu trữ (như chế độ ẩn danh Private Browsing
 * hoặc bộ nhớ thiết bị đã đầy).
 */
const safeStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch (e) {
      console.warn("localStorage.getItem is not available for cart:", e);
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      console.warn("localStorage.setItem is not available for cart:", e);
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (e) {
      console.warn("localStorage.removeItem is not available for cart:", e);
    }
  },
};

export type ProductEntity = {
  _id: string;
  id?: string;
  slug?: string;
  name: string;
  price: number;
  image?: string;
  imageUrl?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  stock?: number;
  isActive?: boolean;
};

export type CartItem = {
  product: ProductEntity;
  quantity: number;
};

type InputProduct = Partial<ProductEntity> & {
  id?: string;
  _id?: string;
  name: string;
  price: number;
};

interface BackendCartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

interface BackendCartResponse {
  items: BackendCartItem[];
}

type CartState = {
  items: CartItem[];
  pendingCartItem?: { product: ProductEntity; quantity: number };
  fetchCart: () => Promise<void>;
  handlePendingItem: () => Promise<void>;
  addToCart: (product: InputProduct, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  increaseQuantity: (productId: string) => Promise<void>;
  decreaseQuantity: (productId: string) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalAmount: () => number;
};

/**
 * Hàm chuẩn hóa thông tin sản phẩm:
 * Hợp nhất _id và id, chuẩn hóa đường dẫn ảnh (image/imageUrl)
 * để đảm bảo tính đồng nhất giữa dữ liệu Client và Backend MongoDB.
 */
const normalizeProduct = (product: InputProduct): ProductEntity | null => {
  const normalizedId = product._id || product.id;
  if (!normalizedId) {
    return null;
  }

  const finalImg = product.imageUrl || product.image || "";

  return {
    _id: normalizedId,
    id: normalizedId,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: finalImg,
    imageUrl: finalImg,
    description: product.description || "",
    shortDescription: product.shortDescription || "",
    category: product.category || "",
    stock: typeof product.stock === "number" ? product.stock : undefined,
    isActive: product.isActive ?? true,
  };
};

/**
 * Ánh xạ dữ liệu giỏ hàng trả về từ Backend sang định dạng CartItem của Frontend.
 */
const mapBackendCartToItems = (backendItems: BackendCartItem[]): CartItem[] => {
  if (!backendItems) return [];
  return backendItems.map((item) => ({
    product: {
      _id: item.productId,
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      imageUrl: item.image,
      isActive: true,
      description: "",
      shortDescription: "",
      category: "",
    },
    quantity: item.quantity,
  }));
};

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  const err = error as ErrorResponse;
  return err.response?.data?.message || fallback;
};

/**
 * useCartStore: Quản lý giỏ hàng toàn cục (Global State) với Zustand kết hợp Persist Middleware.
 * Dữ liệu tự động lưu vào LocalStorage dưới key 'salon-cart-storage' và đồng bộ với API Database.
 */
const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      pendingCartItem: undefined,

      /**
       * Tải giỏ hàng từ server khi người dùng đã có token đăng nhập.
       */
      fetchCart: async () => {
        const token = useAuth.getState().token;
        if (!token) return;
        try {
          const res = await api.get("/api/cart");
          const cart = extractApiData<BackendCartResponse>(res);
          set({ items: mapBackendCartToItems(cart.items) });
        } catch (e) {
          console.error("Failed to fetch backend cart:", e);
        }
      },

      /**
       * Xử lý sản phẩm đang chờ (Pending Item):
       * Khi khách chưa đăng nhập bấm thêm vào giỏ -> hệ thống lưu tạm -> chuyển sang đăng nhập.
       * Sau khi đăng nhập thành công, hàm này tự động gửi API để đưa món hàng đó vào Database.
       */
      handlePendingItem: async () => {
        const token = useAuth.getState().token;
        const pending = get().pendingCartItem;
        if (token && pending) {
          try {
            const res = await api.post("/api/cart/items", {
              productId: pending.product._id,
              quantity: pending.quantity,
            });
            const cart = extractApiData<BackendCartResponse>(res);
            set({ items: mapBackendCartToItems(cart.items), pendingCartItem: undefined });
            toast.success(`Đã thêm "${pending.product.name}" vào giỏ hàng`);
          } catch (e) {
            console.error("Failed to add pending item to cart:", e);
          }
        }
      },

      /**
       * Thêm sản phẩm vào giỏ hàng:
       * - Nếu chưa đăng nhập: Lưu vào state tạm và chuyển hướng sang trang /login.
       * - Nếu đã đăng nhập: Gửi request POST /api/cart/items lên Backend và cập nhật lại state.
       */
      addToCart: async (product, quantity = 1) => {
        const normalized = normalizeProduct(product);
        if (!normalized) return;

        const token = useAuth.getState().token;
        if (!token) {
          // Chưa đăng nhập: Lưu vào pending
          set({ pendingCartItem: { product: normalized, quantity } });
          // Chuyển hướng sang login
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }

        try {
          const res = await api.post("/api/cart/items", {
            productId: normalized._id,
            quantity,
          });
          const cart = extractApiData<BackendCartResponse>(res);
          set({ items: mapBackendCartToItems(cart.items) });
          toast.success(`Đã thêm "${normalized.name}" vào giỏ hàng`);
        } catch (error) {
          toast.error(getErrorMessage(error, "Không thể thêm vào giỏ hàng"));
        }
      },

      /**
       * Xóa một sản phẩm khỏi giỏ hàng theo productId.
       */
      removeFromCart: async (productId) => {
        const token = useAuth.getState().token;
        if (!token) {
          set((state) => ({ items: state.items.filter((item) => item.product._id !== productId) }));
          return;
        }

        try {
          const res = await api.delete(`/api/cart/items/${productId}`);
          const cart = extractApiData<BackendCartResponse>(res);
          set({ items: mapBackendCartToItems(cart.items) });
          toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
        } catch {
          toast.error("Không thể xóa sản phẩm");
        }
      },

      /**
       * Tăng số lượng sản phẩm lên 1 đơn vị.
       */
      increaseQuantity: async (productId) => {
        const item = get().items.find((i) => i.product._id === productId);
        if (!item) return;

        const token = useAuth.getState().token;
        if (!token) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product._id === productId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          }));
          return;
        }

        try {
          const res = await api.put(`/api/cart/items/${productId}`, {
            quantity: item.quantity + 1,
          });
          const cart = extractApiData<BackendCartResponse>(res);
          set({ items: mapBackendCartToItems(cart.items) });
        } catch (error) {
          toast.error(getErrorMessage(error, "Không thể cập nhật số lượng"));
        }
      },

      /**
       * Giảm số lượng sản phẩm. Nếu số lượng hiện tại là 1 thì gọi xóa khỏi giỏ hàng.
       */
      decreaseQuantity: async (productId) => {
        const item = get().items.find((i) => i.product._id === productId);
        if (!item) return;
        if (item.quantity <= 1) {
          await get().removeFromCart(productId);
          return;
        }

        const token = useAuth.getState().token;
        if (!token) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product._id === productId ? { ...i, quantity: i.quantity - 1 } : i
            ),
          }));
          return;
        }

        try {
          const res = await api.put(`/api/cart/items/${productId}`, {
            quantity: item.quantity - 1,
          });
          const cart = extractApiData<BackendCartResponse>(res);
          set({ items: mapBackendCartToItems(cart.items) });
        } catch (error) {
          toast.error(getErrorMessage(error, "Không thể cập nhật số lượng"));
        }
      },

      /**
       * Thiết lập số lượng sản phẩm trực tiếp từ ô nhập input (đảm bảo số nguyên >= 1).
       */
      setQuantity: async (productId, quantity) => {
        const finalQty = Math.max(1, Math.floor(quantity));
        const token = useAuth.getState().token;
        if (!token) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product._id === productId ? { ...i, quantity: finalQty } : i
            ),
          }));
          return;
        }

        try {
          const res = await api.put(`/api/cart/items/${productId}`, {
            quantity: finalQty,
          });
          const cart = extractApiData<BackendCartResponse>(res);
          set({ items: mapBackendCartToItems(cart.items) });
        } catch (error) {
          toast.error(getErrorMessage(error, "Không thể cập nhật số lượng"));
        }
      },

      /**
       * Xóa sạch toàn bộ sản phẩm trong giỏ hàng (sau khi đặt hàng thành công).
       */
      clearCart: async () => {
        const token = useAuth.getState().token;
        if (!token) {
          set({ items: [] });
          return;
        }

        try {
          const res = await api.delete("/api/cart/clear");
          const cart = extractApiData<BackendCartResponse>(res);
          set({ items: mapBackendCartToItems(cart.items) });
        } catch (error) {
          console.error("Failed to clear cart:", error);
        }
      },

      /**
       * Tính tổng số tiền đơn hàng:
       * Sử dụng hàm reduce() duyệt qua từng mục, lấy đơn giá nhân số lượng rồi cộng dồn.
       */
      getTotalAmount: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    {
      name: "salon-cart-storage",
      storage: createJSONStorage(() => safeStorage),
    }
  )
);

export default useCartStore;
