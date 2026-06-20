import { Filter, RotateCcw, Search } from "lucide-react";
import type {
  BookingStatus,
  CustomerFilterOptions,
  CustomerFilterParams,
  CustomerSegment,
} from "../../../services/adminApi";

type CustomerFiltersProps = {
  value: CustomerFilterParams;
  options?: CustomerFilterOptions;
  onChange: (value: CustomerFilterParams) => void;
  onApply: () => void;
  onReset: () => void;
};

const segmentOptions: Array<{ value: CustomerSegment; label: string }> = [
  { value: "new", label: "Khách mới" },
  { value: "regular", label: "Khách quen" },
  { value: "vip", label: "VIP" },
  { value: "inactive", label: "Lâu chưa quay lại" },
  { value: "high_value", label: "Chi tiêu cao" },
  { value: "color_customer", label: "Hay nhuộm" },
  { value: "treatment_needed", label: "Nên phục hồi" },
];

const statusOptions: Array<{ value: BookingStatus; label: string }> = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "in_service", label: "Đang phục vụ" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100";

const CustomerFilters = ({
  value,
  options,
  onChange,
  onApply,
  onReset,
}: CustomerFiltersProps) => {
  const update = <K extends keyof CustomerFilterParams>(
    key: K,
    nextValue: CustomerFilterParams[K]
  ) => onChange({ ...value, [key]: nextValue });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative md:col-span-2">
          <Search
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={value.search || ""}
            onChange={(event) => update("search", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onApply();
            }}
            placeholder="Tìm theo tên, số điện thoại hoặc email"
            className={`${inputClass} pl-10`}
          />
        </label>

        <select
          value={value.segment || ""}
          onChange={(event) => update("segment", event.target.value as CustomerSegment | "")}
          className={inputClass}
        >
          <option value="">Tất cả phân loại</option>
          {segmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={value.serviceCategory || ""}
          onChange={(event) => update("serviceCategory", event.target.value)}
          className={inputClass}
        >
          <option value="">Tất cả nhóm dịch vụ</option>
          {(options?.serviceCategories || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={value.staffId || ""}
          onChange={(event) => update("staffId", event.target.value)}
          className={inputClass}
        >
          <option value="">Tất cả thợ phục vụ</option>
          {(options?.staff || []).map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.name}
            </option>
          ))}
        </select>

        <select
          value={value.status || ""}
          onChange={(event) => update("status", event.target.value as BookingStatus | "")}
          className={inputClass}
        >
          <option value="">Tất cả trạng thái lịch</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={value.dateFrom || ""}
          onChange={(event) => update("dateFrom", event.target.value)}
          className={inputClass}
          aria-label="Từ ngày"
        />

        <input
          type="date"
          value={value.dateTo || ""}
          onChange={(event) => update("dateTo", event.target.value)}
          className={inputClass}
          aria-label="Đến ngày"
        />

        <select
          value={value.sortBy || "lastVisitAt"}
          onChange={(event) =>
            update("sortBy", event.target.value as CustomerFilterParams["sortBy"])
          }
          className={inputClass}
        >
          <option value="lastVisitAt">Sắp xếp: Lần gần nhất</option>
          <option value="totalSpent">Sắp xếp: Tổng chi tiêu</option>
          <option value="totalAppointments">Sắp xếp: Số lịch hẹn</option>
          <option value="fullName">Sắp xếp: Tên khách hàng</option>
        </select>

        <select
          value={value.sortOrder || "desc"}
          onChange={(event) =>
            update("sortOrder", event.target.value as CustomerFilterParams["sortOrder"])
          }
          className={inputClass}
        >
          <option value="desc">Giảm dần / Mới nhất</option>
          <option value="asc">Tăng dần / Cũ nhất</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onApply}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
        >
          <Filter size={16} />
          Áp dụng bộ lọc
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw size={16} />
          Đặt lại
        </button>
      </div>
    </section>
  );
};

export default CustomerFilters;
