import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import useCartStore from "../store/useCartStore";
import Button from "./Button";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, removeFromCart, increaseQuantity, decreaseQuantity } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white/95 shadow-2xl shadow-rose-100 backdrop-blur-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b border-rose-100 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-rose-500">Gio hang</p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {items.length > 0 ? `${items.length} san pham` : "Chua co san pham"}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Dong gio hang"
                className="rounded-full border border-rose-100 bg-white p-2 text-slate-600 shadow-sm hover:text-rose-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-rose-100 bg-rose-50/60 p-6 text-center text-slate-600">
                  <ShoppingBag className="mx-auto mb-2 text-rose-400" />
                  <p>Gio hang dang trong.</p>
                </div>
              ) : (
                items.map((item) => {
                  const productId = item.product._id || item.product.id || "";
                  return (
                    <motion.div
                      key={productId}
                      className="flex gap-3 rounded-2xl border border-rose-100 bg-white/90 p-3 shadow-sm shadow-rose-100"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                    >
                      <div className="h-20 w-20 overflow-hidden rounded-xl">
                        <img
                          src={item.product.image || "https://placehold.co/120x120?text=SP"}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          {productId ? (
                            <Link
                              to={`/products/${productId}`}
                              onClick={onClose}
                              className="font-semibold text-slate-900 hover:text-rose-600"
                            >
                              {item.product.name}
                            </Link>
                          ) : (
                            <p className="font-semibold text-slate-900">{item.product.name}</p>
                          )}
                          <p className="text-sm text-slate-500">{item.product.category || "San pham"}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 rounded-full bg-rose-50 px-2 py-1 text-sm text-slate-700">
                            <button
                              onClick={() => decreaseQuantity(productId)}
                              className="rounded-full p-1 hover:bg-rose-100"
                              aria-label="Giam so luong"
                              disabled={!productId}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-1 font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => increaseQuantity(productId)}
                              className="rounded-full p-1 hover:bg-rose-100"
                              aria-label="Tang so luong"
                              disabled={!productId}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-rose-600">
                              {formatCurrency(item.product.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeFromCart(productId)}
                              className="rounded-full p-2 text-slate-400 hover:bg-rose-100 hover:text-rose-600"
                              aria-label="Xoa khoi gio"
                              disabled={!productId}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div className="space-y-3 border-t border-rose-100 px-6 py-4">
              <div className="flex items-center justify-between text-slate-700">
                <span>Tam tinh</span>
                <span className="text-lg font-semibold text-slate-900">{formatCurrency(total)}</span>
              </div>
              <div className="flex gap-3">
                <Button to="/products" variant="ghost" fullWidth onClick={onClose}>
                  Tiep tuc mua sam
                </Button>
                <Button to="/cart" variant="primary" fullWidth onClick={onClose}>
                  Xem gio hang
                </Button>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default CartDrawer;
