import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../services/api";
import { createOrder } from "../services/adminApi";
import useCartStore from "../store/useCartStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { optimizeCloudinaryUrl } from "../utils/cloudinary";


const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const CartPage = () => {
  const navigate = useNavigate();
  const { items, increaseQuantity, decreaseQuantity, removeFromCart, getTotalAmount, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    try {
      await createOrder({
        products: items.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        totalPrice: getTotalAmount(),
        payment: { provider: "cash" },
      });
      toast.success("Tạo đơn hàng thành công!");
      clearCart();
      navigate("/");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Đặt hàng thất bại, vui lòng thử lại."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-rose-500">Giỏ hàng của bạn</h1>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-10 text-center text-slate-500">
          Giỏ hàng trống. Hãy chọn thêm sản phẩm nhé!
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.product._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-4">
                {item.product.image && <img src={optimizeCloudinaryUrl(item.product.image, 160)} alt={item.product.name} className="h-16 w-16 rounded-md object-cover" />}
                <div>
                  <h3 className="font-semibold text-slate-800">{item.product.name}</h3>
                  <p className="font-medium text-rose-500">{formatCurrency(item.product.price)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => decreaseQuantity(item.product._id)} className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 font-bold hover:bg-slate-200">-</button>
                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                <button onClick={() => increaseQuantity(item.product._id)} className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 font-bold hover:bg-slate-200">+</button>
                <button onClick={() => removeFromCart(item.product._id)} className="ml-4 text-sm font-semibold text-red-500 hover:text-red-700">Xóa</button>
              </div>
            </div>
          ))}
          <div className="mt-6 flex items-center justify-between rounded-xl bg-rose-50 p-6">
            <span className="text-xl font-bold text-slate-800">Tổng cộng:</span>
            <span className="text-2xl font-bold text-rose-600">{formatCurrency(getTotalAmount())}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="mt-4 flex w-full justify-center items-center gap-2 rounded-lg bg-rose-500 py-4 font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <LoadingSpinner size="sm" className="text-white" /> : null}
            {isSubmitting ? "Đang xử lý..." : "Xác nhận Thanh toán"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;