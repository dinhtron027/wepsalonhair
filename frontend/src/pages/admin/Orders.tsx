import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../components/LoadingSpinner";
import { fetchAdminOrders, queryKeys } from "../../services/adminApi";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const statusLabelMap: Record<string, string> = {
  pending: "Chờ xử lý",
  paid: "Đã thanh toán",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Hủy",
};

const statusColorMap: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/60",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  processing: "bg-blue-50 text-blue-700 border-blue-200/60",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200/60",
};

const OrdersPage = () => {
  const { data: orders, isLoading } = useQuery({
    queryKey: [...queryKeys.adminOrders],
    queryFn: fetchAdminOrders,
  });

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
      <p className="mt-1 text-sm text-slate-500">Theo dõi toàn bộ đơn hàng và trạng thái thanh toán.</p>

      <div className="mt-4">
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
                <th className="px-2 py-2 font-semibold">Trạng thái</th>
                <th className="px-2 py-2 font-semibold">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {(orders || []).map((order) => (
                <tr key={order._id} className="border-b border-slate-100">
                  <td className="px-2 py-3 text-slate-700 font-medium">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="px-2 py-3">
                    <p className="font-semibold text-slate-800">{order.userId?.name || "Khách lẻ"}</p>
                    <p className="text-xs text-slate-500">{order.userId?.phone || "-"}</p>
                  </td>
                  <td className="px-2 py-3 text-slate-700">{order.products.length} sản phẩm</td>
                  <td className="px-2 py-3 font-semibold text-slate-800">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-2 py-3 text-slate-700">{order.payment.provider.toUpperCase()}</td>
                  <td className="px-2 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColorMap[order.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                      {statusLabelMap[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-slate-700">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {(orders || []).map((order) => (
            <div key={order._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">#{order._id.slice(-6).toUpperCase()}</span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusColorMap[order.status] || "bg-slate-150 text-slate-750 border-slate-200"}`}>
                  {statusLabelMap[order.status] || order.status}
                </span>
              </div>

              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Khách hàng</p>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">{order.userId?.name || "Khách lẻ"}</p>
                  {order.userId?.phone && <p className="text-xs text-slate-500 mt-0.5">{order.userId.phone}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium">Thời gian</p>
                  <p className="text-xs text-slate-700 mt-1">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-150/70 pt-3">
                <div>
                  <p className="text-slate-400 font-medium">Sản phẩm</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{order.products.length} món</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Thanh toán</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{order.payment.provider.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-medium">Tổng tiền</p>
                  <p className="font-bold text-cyan-700 mt-0.5">{formatCurrency(order.totalPrice)}</p>
                </div>
              </div>
            </div>
          ))}
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
