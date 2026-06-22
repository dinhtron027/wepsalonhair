import { create } from "zustand";
import { persist } from "zustand/middleware";

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

type CartState = {
  items: CartItem[];
  addToCart: (product: InputProduct, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
};

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

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product, quantity = 1) =>
        set((state) => {
          const normalizedProduct = normalizeProduct(product);
          if (!normalizedProduct) {
            return state;
          }

          const existing = state.items.find((item) => item.product._id === normalizedProduct._id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product._id === normalizedProduct._id
                  ? { ...item, quantity: item.quantity + Math.max(1, quantity) }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product: normalizedProduct, quantity: Math.max(1, quantity) }],
          };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product._id !== productId),
        })),

      increaseQuantity: (productId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.product._id === productId ? { ...item, quantity: item.quantity + 1 } : item
          ),
        })),

      decreaseQuantity: (productId) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.product._id === productId ? { ...item, quantity: item.quantity - 1 } : item
            )
            .filter((item) => item.quantity > 0),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.product._id === productId
                ? { ...item, quantity: Math.max(1, Math.floor(quantity)) }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),

      getTotalAmount: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    }),
    {
      name: "salon-cart-storage",
    }
  )
);

export default useCartStore;
