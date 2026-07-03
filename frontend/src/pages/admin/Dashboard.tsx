import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "../../components/LoadingSpinner";
import { fetchRevenueStats, queryKeys } from "../../services/adminApi";

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

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.adminStats],
    queryFn: fetchRevenueStats,
  });

  const maxMonthlyRevenue = useMemo(() => {
    if (!data?.monthlyRevenue?.length) {
      return 0;
    }

    return Math.max(...data.monthlyRevenue.map((item) => item.revenue), 0);
  }, [data?.monthlyRevenue]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10">
        <LoadingSpinner size="lg" label="Đang tải dữ liệu tổng quan..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tổng doanh thu</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(data?.totalRevenue || 0)}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Đơn hàng thành công</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{data?.totalOrders || 0}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tổng lịch hẹn</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{data?.totalBookings || 0}</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Giá trị đơn trung bình</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {formatCurrency(data?.averageOrderValue || 0)}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h3 className="text-lg font-semibold">Doanh thu theo tháng</h3>
          <p className="mt-1 text-sm text-slate-500">Theo dõi xu hướng doanh thu của salon</p>

          <div className="mt-6 space-y-3">
            {(data?.monthlyRevenue || []).map((item) => {
              const width =
                maxMonthlyRevenue > 0 ? Math.max((item.revenue / maxMonthlyRevenue) * 100, 6) : 0;

              return (
                <div key={`${item.year}-${item.month}`} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      Tháng {item.month}/{item.year}
                    </span>
                    <span className="text-slate-500">{formatCurrency(item.revenue)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {data?.monthlyRevenue?.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                Chưa có dữ liệu doanh thu theo tháng.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Trạng thái lịch hẹn</h3>
          <div className="mt-4 space-y-3">
            {(data?.bookingStatusSummary || []).map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <span>{statusLabelMap[item.status] || item.status}</span>
                <span className="font-semibold text-slate-800">{item.total}</span>
              </div>
            ))}
            {data?.bookingStatusSummary?.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có dữ liệu trạng thái.</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
