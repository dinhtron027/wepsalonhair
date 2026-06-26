import React from "react";
import { formatInVi, statusLabelMap } from "./dateUtils";
import { BookingStatus } from "../../../services/adminApi";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from "lucide-react";

export type CalendarView = "month" | "week" | "day" | "list";

type CalendarToolbarProps = {
  currentDate: Date;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (action: "prev" | "next" | "today") => void;
  filterStatus: BookingStatus | "all";
  onFilterStatusChange: (status: BookingStatus | "all") => void;
};

const viewOptions: Array<{ value: CalendarView; label: string }> = [
  { value: "month", label: "Tháng" },
  { value: "week", label: "Tuần" },
  { value: "day", label: "Ngày" },
  { value: "list", label: "Danh sách" },
];

const statusOptions: Array<{ value: BookingStatus | "all"; label: string }> = [
  { value: "all", label: "Tất cả trạng thái" },
  ...Object.entries(statusLabelMap).map(([k, v]) => ({
    value: k as BookingStatus,
    label: v,
  })),
];

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  filterStatus,
  onFilterStatusChange,
}) => {
  // Định dạng tiêu đề hiển thị tháng/năm hoặc tuần/ngày
  const title = React.useMemo(() => {
    if (view === "month") {
      return formatInVi(currentDate, "MMMM yyyy");
    } else if (view === "week") {
      return `Tháng ${formatInVi(currentDate, "MM/yyyy")}`;
    } else {
      return formatInVi(currentDate, "EEEE, dd/MM/yyyy");
    }
  }, [currentDate, view]);

  return (
    <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
      {/* Cụm điều hướng ngày tháng */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-xl bg-slate-50 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => onNavigate("prev")}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-white hover:shadow-sm active:scale-95 transition"
            aria-label="Thời gian trước"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate("today")}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-sm rounded-lg active:scale-95 transition"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => onNavigate("next")}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-white hover:shadow-sm active:scale-95 transition"
            aria-label="Thời gian sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-slate-400" />
          <h2 className="text-md font-bold text-slate-800 capitalize first-letter:uppercase">
            {title}
          </h2>
        </div>
      </div>

      {/* Cụm bộ lọc và chọn chế độ xem */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {/* Bộ lọc trạng thái */}
        <div className="relative flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5">
          <Filter size={14} className="mr-2 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value as BookingStatus | "all")}
            className="bg-transparent pr-8 text-xs font-medium text-slate-700 outline-none cursor-pointer appearance-none"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l border-t border-slate-400 p-1 rotate-45" style={{ borderWidth: '1px 1px 0 0', width: '6px', height: '6px' }} />
        </div>

        {/* Chuyển đổi View */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          {viewOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onViewChange(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold active:scale-95 transition-all ${
                view === opt.value
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarToolbar;
