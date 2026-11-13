import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Landmark,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  Shield,
  ShoppingBag,
} from "lucide-react";
import AddressFormModal from "../components/AddressFormModal";
import type { AddressFormPayload } from "../components/AddressFormModal";
import useCartStore from "../store/useCartStore";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  calculateShippingFee,
  AddressEntity,
  OrderEntity,
  queryKeys,
} from "../services/adminApi";
import api, { extractApiData, getApiErrorMessage } from "../services/api";
import { useAuth } from "../modules/auth/control/store/authStore";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const token = useAuth((state) => state.token);
  const { items, getTotalAmount, clearCart, fetchCart } = useCartStore();

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để thanh toán.");
      navigate(`/login?redirect=${encodeURIComponent("/checkout")}`);
    } else {
      fetchCart();
    }
  }, [token, navigate, fetchCart]);

  // States
  const [selectedAddress, setSelectedAddress] = useState<AddressEntity | null>(null);
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cod">("bank_transfer");
  const [shippingMethod, setShippingMethod] = useState<"delivery" | "pickup">("delivery");

  // Modal control states
  const [showAddressListModal, setShowAddressListModal] = useState(false);
  const [showAddressFormModal, setShowAddressFormModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressEntity | null>(null);

  // Queries & Mutations
  const { data: addresses = [], refetch: refetchAddresses } = useQuery({
    queryKey: [...queryKeys.userAddresses],
    queryFn: fetchAddresses,
    enabled: !!token,
  });

  const { data: shippingInfo, isLoading: isCalculatingShipping } = useQuery({
    queryKey: ["shippingFee", selectedAddress?._id],
    queryFn: () => calculateShippingFee(selectedAddress!._id),
    enabled: !!selectedAddress && shippingMethod === "delivery",
  });

  // Set default address when addresses load
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddr);
    }
  }, [addresses, selectedAddress]);

  const addAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: (newAddr) => {
      toast.success("Thêm địa chỉ mới thành công!");
      refetchAddresses();
      setSelectedAddress(newAddr);
      closeAddressForm();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Không thể thêm địa chỉ"));
    },
  });

  const editAddressMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<AddressEntity, "_id" | "userId">> }) =>
      updateAddress(id, payload),
    onSuccess: (updated) => {
      toast.success("Cập nhật địa chỉ thành công!");
      refetchAddresses();
      if (selectedAddress?._id === updated._id) {
        setSelectedAddress(updated);
      }
      closeAddressForm();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Không thể cập nhật địa chỉ"));
    },
  });

  const removeAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      toast.success("Xóa địa chỉ thành công!");
      refetchAddresses();
      setSelectedAddress(null);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Không thể xóa địa chỉ"));
    },
  });

  const makeDefaultAddressMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: (updated) => {
      toast.success("Đã đặt làm địa chỉ mặc định!");
      refetchAddresses();
      setSelectedAddress(updated);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Không thể thiết lập địa chỉ mặc định"));
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (payload: { addressId?: string; paymentMethod: string; note: string; shippingMethod: string; }) => {
      const res = await api.post("/api/orders", payload);
      return extractApiData<OrderEntity>(res);
    },
    onSuccess: (order) => {
      toast.success("Đặt hàng thành công!");
      clearCart();
      navigate(`/checkout/payment/${order._id}`);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Không thể tạo đơn hàng"));
    },
  });

  // Action helper functions
  const openAddressForm = (addr: AddressEntity | null = null) => {
    setEditingAddress(addr);
    setShowAddressFormModal(true);
  };

  const closeAddressForm = () => {
    setShowAddressFormModal(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = (payload: AddressFormPayload) => {
    if (editingAddress) {
      editAddressMutation.mutate({ id: editingAddress._id, payload });
    } else {
      addAddressMutation.mutate(payload);
    }
  };

  const handlePlaceOrder = () => {
    if (shippingMethod === "delivery" && !selectedAddress) {
      toast.error("Vui lòng chọn hoặc thêm địa chỉ nhận hàng trước khi đặt hàng!");
      return;
    }
    if (items.length === 0) {
      toast.error("Giỏ hàng của bạn trống!");
      return;
    }

    orderMutation.mutate({
      addressId: shippingMethod === "delivery" ? selectedAddress?._id : undefined,
      paymentMethod,
      shippingMethod,
      note,
    });
  };



  const subtotal = getTotalAmount();
  const shippingFee = shippingMethod === "pickup" ? 0 : (shippingInfo?.fee || 0);
  const totalAmount = subtotal + shippingFee;

  // View: Checkout page form view

  return (
    <div className="min-h-screen bg-[#FAF9F8] pb-32">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-4 bg-white px-4 py-4 shadow-xs border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-1 text-slate-600 hover:bg-slate-50 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-900 font-display">Thanh toán</h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-4 space-y-4">
        {/* Card 1: Địa chỉ nhận hàng */}
        {shippingMethod === "delivery" && (
        <div
          onClick={() => (addresses.length > 0 ? setShowAddressListModal(true) : openAddressForm())}
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs flex items-start gap-3 cursor-pointer hover:border-slate-300 transition"
        >
          <MapPin className="text-rose-500 shrink-0 mt-1" size={18} />
          <div className="flex-1 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Địa chỉ nhận hàng</p>
            {selectedAddress ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{selectedAddress.fullName}</span>
                  <span className="text-xs text-slate-500 font-medium">{selectedAddress.phone}</span>
                  {selectedAddress.isDefault && (
                    <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 uppercase">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {selectedAddress.street}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                  {selectedAddress.detail && ` (${selectedAddress.detail})`}
                </p>
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-700 py-1 flex items-center gap-1">
                <Plus size={16} /> Thêm địa chỉ giao hàng mới
              </p>
            )}
          </div>
          <ChevronRight className="text-slate-400 shrink-0 self-center" size={18} />
        </div>

        )}

        {/* Card 2: Danh sách sản phẩm */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
            <ShoppingBag size={16} className="text-slate-500" />
            <h2 className="text-sm font-bold text-slate-950">Sản phẩm mua</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {items.map((item) => (
              <div key={item.product._id} className="flex gap-3 py-3 items-center">
                <img
                  src={item.product.image || "https://placehold.co/80x80?text=SP"}
                  alt={item.product.name}
                  className="h-14 w-14 rounded-lg object-cover bg-slate-50 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-0.5">
                  <h3 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h3>
                  <p className="text-[10px] text-slate-500">{item.product.category || "Sản phẩm"}</p>
                  <p className="text-xs font-semibold text-rose-600">{formatCurrency(item.product.price)}</p>
                </div>
                <span className="text-xs font-medium text-slate-500">x{item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Lời nhắn cho shop */}
          <div className="border-t border-slate-50 pt-2 flex gap-2 items-center">
            <span className="text-xs font-medium text-slate-500 shrink-0">Lời nhắn:</span>
            <input
              type="text"
              placeholder="Lưu ý cho người bán (nếu có)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="flex-1 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-lg border border-slate-200 focus:border-slate-400 px-3 py-1.5 text-xs outline-none transition"
            />
          </div>
        </div>

        {/* Card 3: Phương thức vận chuyển */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phương thức nhận hàng</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setShippingMethod("pickup")}
              className={`rounded-xl border p-3.5 text-center flex flex-col items-center justify-center gap-1.5 transition ${
                shippingMethod === "pickup"
                  ? "border-emerald-500 bg-emerald-50/20 text-emerald-600"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Landmark size={18} />
              <span className="text-xs font-bold">Nhận tại Salon</span>
              <span className="text-[10px] text-slate-500">Miễn phí</span>
            </button>
            <button
              type="button"
              onClick={() => setShippingMethod("delivery")}
              className={`rounded-xl border p-3.5 text-center flex flex-col items-center justify-center gap-1.5 transition ${
                shippingMethod === "delivery"
                  ? "border-emerald-500 bg-emerald-50/20 text-emerald-600"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <MapPin size={18} />
              <span className="text-xs font-bold">Giao hàng tận nơi</span>
              <span className="text-[10px] text-slate-500">
                {shippingMethod === "delivery" ? (shippingInfo ? formatCurrency(shippingInfo.fee) : (isCalculatingShipping ? "Đang tính phí..." : "Chọn địa chỉ")) : "Tính phí"}
              </span>
            </button>
          </div>
          {shippingMethod === "delivery" && shippingInfo && (
            <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <span>Khoảng cách: <strong className="text-slate-800">{shippingInfo.distanceKm} km</strong></span>
              {shippingInfo.fee === 0 ? (
                <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Miễn phí giao hàng</span>
              ) : null}
            </div>
          )}
        </div>

        {/* Card 4: Phương thức thanh toán */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phương thức thanh toán</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("bank_transfer")}
              className={`rounded-xl border p-3.5 text-center flex flex-col items-center justify-center gap-1.5 transition ${
                paymentMethod === "bank_transfer"
                  ? "border-rose-500 bg-rose-50/20 text-rose-600"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Landmark size={18} />
              <span className="text-xs font-bold">Chuyển khoản VietQR</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`rounded-xl border p-3.5 text-center flex flex-col items-center justify-center gap-1.5 transition ${
                paymentMethod === "cod"
                  ? "border-rose-500 bg-rose-50/20 text-rose-600"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Shield size={18} />
              <span className="text-xs font-bold">Thanh toán COD</span>
            </button>
          </div>
        </div>

        {/* Card 5: Chi tiết hóa đơn */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Tổng tiền hàng (Tạm tính)</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Phí vận chuyển</span>
            <span className="font-semibold">{formatCurrency(shippingFee)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Voucher giảm giá</span>
            <span className="font-semibold">- {formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100 pt-2.5">
            <span className="text-sm font-bold text-slate-900">Tổng thanh toán</span>
            <span className="text-base font-black text-rose-600">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-150 px-4 py-3 shadow-lg flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Tổng thanh toán</p>
          <p className="text-lg font-black text-rose-600">{formatCurrency(totalAmount)}</p>
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={orderMutation.isPending}
          className="rounded-full bg-slate-950 hover:bg-slate-900 active:scale-95 disabled:opacity-50 text-white font-extrabold text-sm px-8 py-3.5 transition flex items-center justify-center min-w-[180px]"
        >
          {orderMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              Đang xử lý...
            </span>
          ) : paymentMethod === "bank_transfer" ? (
            "Tạo đơn và thanh toán"
          ) : (
            "Đặt hàng"
          )}
        </button>
      </div>

      {/* MODAL 1: Address List Selector */}
      {showAddressListModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/40 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4 animate-slideUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Địa chỉ của tôi</h3>
              <button
                onClick={() => setShowAddressListModal(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-650"
              >
                Đóng
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => {
                    setSelectedAddress(addr);
                    setShowAddressListModal(false);
                  }}
                  className={`border rounded-2xl p-4 cursor-pointer relative hover:border-slate-300 transition ${
                    selectedAddress?._id === addr._id ? "border-rose-500 bg-rose-50/10" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{addr.fullName}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{addr.phone}</span>
                    {addr.isDefault && (
                      <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[8px] font-bold text-rose-600 uppercase">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                    {addr.detail && ` (${addr.detail})`}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {addr.type === "home" ? "Nhà riêng" : "Văn phòng"}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddressForm(addr);
                        }}
                        className="text-cyan-600 hover:text-cyan-700 flex items-center gap-0.5 text-[11px] font-bold"
                      >
                        <Edit2 size={11} /> Sửa
                      </button>
                      {!addr.isDefault && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              makeDefaultAddressMutation.mutate(addr._id);
                            }}
                            className="text-slate-600 hover:text-slate-700 text-[11px] font-bold"
                          >
                            Đặt mặc định
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAddressMutation.mutate(addr._id);
                            }}
                            className="text-rose-600 hover:text-rose-700 flex items-center gap-0.5 text-[11px] font-bold"
                          >
                            <Trash2 size={11} /> Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setShowAddressListModal(false);
                openAddressForm();
              }}
              className="w-full border border-slate-350 border-dashed rounded-xl py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1"
            >
              <Plus size={14} /> Thêm địa chỉ nhận hàng mới
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Add/Edit Address Form — Vietnamese cascading selects */}
      <AddressFormModal
        isOpen={showAddressFormModal}
        onClose={closeAddressForm}
        onSubmit={handleSaveAddress}
        editingAddress={editingAddress}
        isFirstAddress={addresses.length === 0}
        isLoading={addAddressMutation.isPending || editAddressMutation.isPending}
      />
    </div>
  );
};

export default CheckoutPage;
