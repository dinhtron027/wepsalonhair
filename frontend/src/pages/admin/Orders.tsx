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

      <div className="mt-4 overflow-x-auto">
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
                <td className="px-2 py-3 text-slate-700">#{order._id.slice(-6).toUpperCase()}</td>
                <td className="px-2 py-3">
                  <p className="font-semibold text-slate-800">{order.userId?.name || "Khách lẻ"}</p>
                  <p className="text-xs text-slate-500">{order.userId?.phone || "-"}</p>
                </td>
                <td className="px-2 py-3 text-slate-700">{order.products.length} sản phẩm</td>
                <td className="px-2 py-3 font-semibold text-slate-800">{formatCurrency(order.totalPrice)}</td>
                <td className="px-2 py-3 text-slate-700">{order.payment.provider.toUpperCase()}</td>
                <td className="px-2 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
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
