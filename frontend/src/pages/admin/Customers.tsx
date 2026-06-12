import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../components/LoadingSpinner";
import { fetchAdminCustomers, queryKeys } from "../../services/adminApi";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

const statusLabelMap: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  in_service: "Đang phục vụ",
  completed: "Hoàn thành",
  cancelled: "Hủy",
};

const CustomersPage = () => {
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: [...queryKeys.adminCustomers],
    queryFn: fetchAdminCustomers,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10">
        <LoadingSpinner size="lg" label="Đang tải dữ liệu khách hàng..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">CRM khách hàng ({customers?.length || 0})</h3>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi lịch sử dịch vụ, thợ đã phục vụ và màu nhuộm đã dùng để tư vấn lại hiệu quả.
        </p>
      </section>

      {(customers || []).map((customer) => {
        const isExpanded = expandedCustomerId === customer.id;

        return (
          <article key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h4 className="text-lg font-semibold">{customer.name || "Khách lẻ"}</h4>
                <p className="text-sm text-slate-500">
                  {customer.phone || "Chưa có số"} {customer.email ? `• ${customer.email}` : ""}
                </p>
              </div>

              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-slate-500">Lịch hẹn</p>
                  <p className="font-semibold">{customer.totalBookings}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-slate-500">Tổng chi tiêu</p>
                  <p className="font-semibold">{formatCurrency(customer.totalSpent)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-slate-500">Lần gần nhất</p>
                  <p className="font-semibold">
                    {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString("vi-VN") : "-"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setExpandedCustomerId(isExpanded ? null : customer.id)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {isExpanded ? "Thu gọn" : "Xem chi tiết"}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-700">
                Thợ đã phục vụ: {customer.stylists.length ? customer.stylists.join(", ") : "Chưa có"}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                Màu nhuộm: {customer.hairColors.length ? customer.hairColors.join(", ") : "Chưa có"}
              </span>
            </div>

            {isExpanded ? (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-2 py-2 font-semibold">Ngày giờ</th>
                      <th className="px-2 py-2 font-semibold">Dịch vụ</th>
                      <th className="px-2 py-2 font-semibold">Thợ</th>
                      <th className="px-2 py-2 font-semibold">Màu nhuộm</th>
                      <th className="px-2 py-2 font-semibold">Trạng thái</th>
                      <th className="px-2 py-2 font-semibold">Chi phí</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.history.map((history) => (
                      <tr key={history.bookingId} className="border-b border-slate-100">
                        <td className="px-2 py-2 text-slate-700">
                          {new Date(history.date).toLocaleDateString("vi-VN")} {history.time}
                        </td>
                        <td className="px-2 py-2 text-slate-700">{history.serviceName}</td>
                        <td className="px-2 py-2 text-slate-700">{history.stylist || "-"}</td>
                        <td className="px-2 py-2 text-slate-700">{history.hairColorUsed || "-"}</td>
                        <td className="px-2 py-2">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                            {statusLabelMap[history.status] || history.status}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-slate-700">{formatCurrency(history.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {customer.history.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                    Chưa có lịch sử dịch vụ.
                  </p>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}

      {(customers || []).length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          Chưa có dữ liệu khách hàng.
        </section>
      ) : null}
    </div>
  );
};

export default CustomersPage;
