import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  fetchAdminOrders,
  queryKeys,
  OrderEntity,
  confirmAdminOrderPayment,
  rejectAdminOrderPayment,
  cancelAdminOrder
} from "../../services/adminApi";
import { getApiErrorMessage } from "../../services/api";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const statusLabelMap: Record<string, string> = {
  pending: "Chờ xử lý",
  waiting_payment: "Chờ thanh toán",
  confirmed: "Đã xác nhận",
  paid: "Đã thanh toán",
  preparing: "Đang chuẩn bị",
  shipping: "Đang giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  payment_expired: "Hết hạn thanh toán",
  processing: "Đang xử lý",
};

const statusColorMap: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/60",
  waiting_payment: "bg-amber-50/80 text-amber-850 border-amber-200/50",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  preparing: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  shipping: "bg-blue-50 text-blue-700 border-blue-200/60",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200/60",
  payment_expired: "bg-slate-100 text-slate-500 border-slate-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200/60",
};

const OrdersPage = () => {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: [...queryKeys.adminOrders],
    queryFn: fetchAdminOrders,
  });

  const confirmMutation = useMutation({
    mutationFn: confirmAdminOrderPayment,
    onSuccess: () => {
      toast.success("Xác nhận thanh toán đơn hàng thành công!");
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminOrders] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Không thể xác nhận thanh toán."));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectAdminOrderPayment,
    onSuccess: () => {
      toast.success("Đã đánh dấu từ chối thanh toán.");
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminOrders] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Không thể từ chối thanh toán."));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelAdminOrder,
    onSuccess: () => {
      toast.success("Hủy đơn hàng thành công! Đã hoàn trả tồn kho.");
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminOrders] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Không thể hủy đơn hàng."));
    },
  });

  const handleConfirmPayment = (orderId: string) => {
    if (window.confirm("Xác nhận đã nhận đủ tiền chuyển khoản cho đơn hàng này? Trạng thái sẽ được đổi thành Đã thanh toán.")) {
      confirmMutation.mutate(orderId);
    }
  };

  const handleRejectPayment = (orderId: string) => {
    if (window.confirm("Đánh dấu từ chối/chưa nhận được tiền cho giao dịch chuyển khoản này?")) {
      rejectMutation.mutate(orderId);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này? Hộp thoại này sẽ hoàn kho sản phẩm.")) {
      cancelMutation.mutate(orderId);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10">
        <LoadingSpinner size="lg" label="Đang tải đơn hàng..." />
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">Danh sách đơn hàng ({orders?.length || 0})</h3>
      <p className="mt-1 text-sm text-slate-500">Theo dõi toàn bộ đơn hàng, trạng thái thanh toán và thông tin chuyển khoản.</p>

      <div className="mt-6">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-2 py-2 font-semibold">Mã đơn</th>
                <th className="px-2 py-2 font-semibold">Khách hàng</th>
                <th className="px-2 py-2 font-semibold">Sản phẩm</th>
                <th className="px-2 py-2 font-semibold">Tổng tiền</th>
                <th className="px-2 py-2 font-semibold">Thanh toán</th>
                <th className="px-2 py-2 font-semibold">Giao hàng</th>
                <th className="px-2 py-2 font-semibold">Nội dung CK</th>
                <th className="px-2 py-2 font-semibold">Trạng thái</th>
                <th className="px-2 py-2 font-semibold">Thời gian</th>
                <th className="px-2 py-2 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(orders || []).map((order: OrderEntity) => {
                const isBank = order.paymentMethod === "bank_transfer";
                const isPending = order.paymentStatus === "pending";
                
                const canConfirmOrReject = isBank && isPending && order.orderStatus === "waiting_payment";
                const canCancel = order.orderStatus !== "cancelled" && 
                                  order.orderStatus !== "completed" && 
                                  order.orderStatus !== "payment_expired";

                return (
                  <tr key={order._id} className="border-b border-slate-100">
                    <td className="px-2 py-3 text-slate-700 font-medium">#{order.orderCode}</td>
                    <td className="px-2 py-3">
                      <p className="font-semibold text-slate-800">
                        {order.userId?.name || order.customerName || "Khách lẻ"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.userId?.phone || order.phone || "-"}
                      </p>
                    </td>
                    <td className="px-2 py-3 text-slate-700">{(order.items || []).length} sản phẩm</td>
                    <td className="px-2 py-3 font-semibold text-slate-800">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-2 py-3 text-slate-700">
                      <span className="uppercase font-semibold">
                        {order.paymentMethod === "bank_transfer" ? "Chuyển khoản" : order.paymentMethod === "cod" ? "COD" : "Tiền mặt"}
                      </span>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {order.paymentStatus === "paid"
                          ? "Đã thanh toán"
                          : order.paymentStatus === "pay_at_store"
                          ? "Tại cửa hàng"
                          : order.paymentStatus === "waiting_confirmation"
                          ? "Chờ xác nhận"
                          : order.paymentStatus === "pending"
                          ? "Chờ thanh toán"
                          : order.paymentStatus === "expired"
                          ? "Hết hạn"
                          : order.paymentStatus === "failed"
                          ? "Thất bại"
                          : order.paymentStatus === "cancelled"
                          ? "Đã hủy"
                          : "Chưa thanh toán"}
                      </p>
                      {order.customerPaymentNote === "customer_reported_paid" && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1 bg-emerald-50 px-1 py-0.5 rounded animate-pulse inline-block">
                          Báo đã CK lúc: {order.customerReportedPaidAt ? new Date(order.customerReportedPaidAt).toLocaleTimeString("vi-VN") : ""}
                        </p>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {order.shippingMethod === "pickup" ? (
                        <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">Tại Salon</span>
                      ) : (
                        <div>
                          <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">Giao tận nơi</span>
                          {order.shippingMethod === "delivery" && (
                            <>
                              <p className="text-[10px] text-slate-500 mt-1">Phí: {formatCurrency(order.shippingFee || 0)}</p>
                              {order.distanceKm && <p className="text-[10px] text-slate-500">{order.distanceKm} km</p>}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      {order.transferContent ? (
                        <span className="font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                          {order.transferContent}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColorMap[order.orderStatus] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                        {statusLabelMap[order.orderStatus] || order.orderStatus}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-slate-700">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        {canConfirmOrReject && (
                          <>
                            <button
                              onClick={() => handleConfirmPayment(order._id)}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 transition px-2.5 py-1 text-xs font-semibold text-white shadow-sm"
                            >
                              Nhận tiền
                            </button>
                            <button
                              onClick={() => handleRejectPayment(order._id)}
                              className="rounded-lg bg-amber-500 hover:bg-amber-600 transition px-2.5 py-1 text-xs font-semibold text-white shadow-sm"
                            >
                              Từ chối
                            </button>
                          </>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="rounded-lg border border-slate-350 hover:bg-slate-50 transition px-2.5 py-1 text-xs font-semibold text-slate-700"
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {(orders || []).map((order: OrderEntity) => {
            const isBank = order.paymentMethod === "bank_transfer";
            const isPending = order.paymentStatus === "pending";
            
            const canConfirmOrReject = isBank && isPending && order.orderStatus === "waiting_payment";
            const canCancel = order.orderStatus !== "cancelled" && 
                              order.orderStatus !== "completed" && 
                              order.orderStatus !== "payment_expired";

            return (
              <div key={order._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">#{order.orderCode}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusColorMap[order.orderStatus] || "bg-slate-150 text-slate-750 border-slate-200"}`}>
                    {statusLabelMap[order.orderStatus] || order.orderStatus}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Khách hàng</p>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">
                      {order.userId?.name || order.customerName || "Khách lẻ"}
                    </p>
                    {(order.userId?.phone || order.phone) && (
                      <p className="text-xs text-slate-500 mt-0.5">{order.userId?.phone || order.phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-medium">Thời gian</p>
                    <p className="text-xs text-slate-700 mt-1">
                      {new Date(order.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs border-t border-slate-150/70 pt-3">
                  <div>
                    <p className="text-slate-400 font-medium">Sản phẩm</p>
                    <p className="font-semibold text-slate-700 mt-0.5">{(order.items || []).length} món</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Thanh toán</p>
                    <p className="font-semibold text-slate-750 mt-0.5 uppercase">
                      {order.paymentMethod === "bank_transfer" ? "CK" : order.paymentMethod === "cod" ? "COD" : "Tiền mặt"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Giao hàng</p>
                    <p className="font-semibold text-slate-750 mt-0.5">
                      {order.shippingMethod === "pickup" ? "Salon" : "Tận nơi"}
                    </p>
                    {order.shippingMethod === "delivery" && order.shippingFee !== undefined && (
                      <p className="text-[10px] text-slate-500">{formatCurrency(order.shippingFee)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 font-medium">Tổng tiền</p>
                    <p className="font-bold text-cyan-700 mt-0.5">{formatCurrency(order.totalAmount)}</p>
                  </div>
                </div>

                {order.transferContent && (
                  <div className="flex items-center justify-between border-t border-slate-150/70 pt-3 text-xs">
                    <span className="text-slate-400">Nội dung CK:</span>
                    <span className="font-mono font-bold text-slate-750 bg-slate-150 px-2 py-0.5 rounded">
                      {order.transferContent}
                    </span>
                  </div>
                )}

                {order.customerPaymentNote === "customer_reported_paid" && (
                  <div className="p-2 bg-emerald-50/70 border border-emerald-100 rounded-lg text-[10px] text-emerald-800 space-y-0.5">
                    <strong>Khách báo đã chuyển khoản:</strong>
                    <p>Lúc: {order.customerReportedPaidAt ? new Date(order.customerReportedPaidAt).toLocaleString("vi-VN") : ""}</p>
                  </div>
                )}

                {(canConfirmOrReject || canCancel) && (
                  <div className="flex gap-2 justify-end border-t border-slate-150/70 pt-3">
                    {canConfirmOrReject && (
                      <>
                        <button
                          onClick={() => handleConfirmPayment(order._id)}
                          className="flex-1 text-center rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white shadow-sm"
                        >
                          Nhận tiền
                        </button>
                        <button
                          onClick={() => handleRejectPayment(order._id)}
                          className="flex-1 text-center rounded-lg bg-amber-500 py-2 text-xs font-bold text-white shadow-sm"
                        >
                          Từ chối
                        </button>
                      </>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="flex-1 text-center rounded-lg border border-slate-350 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                      >
                        Hủy đơn hàng
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {(orders || []).length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            Chưa có đơn hàng nào.
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default OrdersPage;

