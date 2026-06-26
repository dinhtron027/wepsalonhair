import React, { useMemo } from "react";
import { BookingEntity, BookingStatus } from "../../../services/adminApi";
import {
  getDaysInWeek,
  getDaysInMonthGrid,
  getSalonHours,
  isDateSame,
  isDateToday,
  formatInVi,
  statusLabelMap,
} from "./dateUtils";
import { CalendarView } from "./CalendarToolbar";
import { Clock, Phone, Scissors, User } from "lucide-react";

type BookingCalendarProps = {
  bookings: BookingEntity[];
  currentDate: Date;
  view: CalendarView;
  filterStatus: BookingStatus | "all";
  onSelectBooking: (booking: BookingEntity) => void;
};

const HOUR_HEIGHT = 70; // Chiều cao của mỗi giờ (pixel)

const statusColorMap: Record<BookingStatus, string> = {
  pending: "border-l-amber-500 bg-amber-50/70 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/40",
  confirmed: "border-l-blue-500 bg-blue-50/70 text-blue-800 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/40",
  in_service: "border-l-teal-500 bg-teal-50/70 text-teal-800 border-teal-200 dark:bg-teal-950/20 dark:text-teal-300 dark:border-teal-900/40",
  completed: "border-l-emerald-500 bg-emerald-50/70 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/40",
  cancelled: "border-l-rose-500 bg-rose-50/70 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-300 dark:border-rose-900/40",
};

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  currentDate,
  view,
  filterStatus,
  onSelectBooking,
}) => {
  const salonHours = getSalonHours(); // 08:00 -> 20:00

  // 1. Lọc danh sách bookings theo trạng thái đã chọn
  const filteredBookings = useMemo(() => {
    if (filterStatus === "all") return bookings;
    return bookings.filter((b) => b.status === filterStatus);
  }, [bookings, filterStatus]);

  // 2. Tính toán khoảng cách (Top, Height) cho booking card trong ngày/tuần timeline
  const getBookingLayout = (booking: BookingEntity) => {
    const [hour, minute] = booking.time.split(":").map(Number);
    const startMinutes = hour * 60 + minute;
    const baseMinutes = 8 * 60; // Bắt đầu lúc 08:00
    
    // Vị trí Top (so với 08:00)
    const diffMinutes = startMinutes - baseMinutes;
    const top = (diffMinutes / 60) * HOUR_HEIGHT;

    // Chiều cao (dựa trên durationMinutes hoặc mặc định 60p)
    const duration =
      typeof booking.serviceId === "object" && booking.serviceId
        ? (booking.serviceId as { durationMinutes?: number }).durationMinutes || 60
        : 60;
    const height = (duration / 60) * HOUR_HEIGHT;

    return { top, height };
  };

  // 3. Render chế độ xem Tháng (Month View)
  const renderMonthView = () => {
    const days = getDaysInMonthGrid(currentDate);
    const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    return (
      <div className="grid grid-cols-7 border-t border-l border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        {/* Tên các thứ */}
        {weekDays.map((wd) => (
          <div
            key={wd}
            className="border-b border-r border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-bold text-slate-500"
          >
            {wd}
          </div>
        ))}
        {/* Lưới các ngày */}
        {days.map((day, i) => {
          const isToday = isDateToday(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();

          // Lọc booking rơi vào ngày này
          const dayBookings = filteredBookings.filter((b) =>
            isDateSame(new Date(b.date), day)
          );

          return (
            <div
              key={i}
              className={`min-h-[110px] border-b border-r border-slate-200 p-2 flex flex-col justify-between transition ${
                isCurrentMonth ? "bg-white" : "bg-slate-50/50"
              } ${isToday ? "bg-cyan-50/20" : ""}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center text-xs font-bold rounded-full ${
                    isToday
                      ? "bg-cyan-600 text-white font-extrabold"
                      : isCurrentMonth
                      ? "text-slate-800"
                      : "text-slate-400"
                  }`}
                >
                  {day.getDate()}
                </span>
                {dayBookings.length > 0 && (
                  <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded-md">
                    {dayBookings.length} lịch
                  </span>
                )}
              </div>

              {/* Danh sách booking hiển thị nhanh trong ô ngày */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[80px] scrollbar-thin">
                {dayBookings.slice(0, 3).map((b) => (
                  <div
                    key={b._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBooking(b);
                    }}
                    className={`rounded-md border-l-2 px-1.5 py-0.5 text-[10px] font-semibold truncate cursor-pointer transition active:scale-95 ${
                      statusColorMap[b.status] || "bg-slate-100"
                    }`}
                  >
                    {b.time} - {b.customerName}
                  </div>
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-[9px] text-slate-400 font-bold pl-1">
                    + {dayBookings.length - 3} lịch nữa
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 4. Render chế độ xem Tuần (Week View)
  const renderWeekView = () => {
    const days = getDaysInWeek(currentDate);

    // Vị trí đường line thời gian thực (nếu tuần đang xem chứa ngày hôm nay)
    const now = new Date();
    const isThisWeekCurrent = days.some((day) => isDateToday(day));
    const timeLinePosition = (() => {
      if (!isThisWeekCurrent) return null;
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      if (currentHour < 8 || currentHour >= 20) return null;

      const totalMinutes = currentHour * 60 + currentMinute - 8 * 60;
      return (totalMinutes / 60) * HOUR_HEIGHT;
    })();

    return (
      <div className="flex rounded-xl border border-slate-200 bg-white overflow-x-auto shadow-sm min-w-[700px]">
        {/* Cột hiển thị giờ bên trái */}
        <div className="w-16 flex-none border-r border-slate-200 bg-slate-50/50 pt-11 text-center select-none">
          {salonHours.map((hour) => (
            <div
              key={hour}
              className="text-[10px] font-bold text-slate-400"
              style={{ height: HOUR_HEIGHT, lineHeight: "20px" }}
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Lưới các cột ngày trong tuần */}
        <div className="flex flex-1 relative">
          {days.map((day, dayIndex) => {
            const isToday = isDateToday(day);
            const dayBookings = filteredBookings.filter((b) =>
              isDateSame(new Date(b.date), day)
            );

            return (
              <div
                key={dayIndex}
                className={`flex-1 border-r border-slate-100 relative min-w-[90px] ${
                  isToday ? "bg-cyan-50/10" : ""
                }`}
                style={{ height: (salonHours.length - 1) * HOUR_HEIGHT + 35 }}
              >
                {/* Header ngày */}
                <div className="h-11 border-b border-slate-200 flex flex-col items-center justify-center bg-slate-50/50 sticky top-0 z-10">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                    {formatInVi(day, "EEEE")}
                  </span>
                  <span
                    className={`text-xs font-black rounded-full h-5 w-5 flex items-center justify-center mt-0.5 ${
                      isToday ? "bg-cyan-600 text-white" : "text-slate-700"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                {/* Grid nền chứa các đường kẻ ngang chia giờ */}
                <div className="absolute inset-x-0 bottom-0 top-11 pointer-events-none">
                  {salonHours.slice(1).map((_, lineIdx) => (
                    <div
                      key={lineIdx}
                      className="border-b border-slate-100"
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}
                </div>

                {/* Các Booking card tuyệt đối trong ngày */}
                <div className="absolute inset-x-1 bottom-0 top-11">
                  {dayBookings.map((b) => {
                    const { top, height } = getBookingLayout(b);
                    return (
                      <div
                        key={b._id}
                        onClick={() => onSelectBooking(b)}
                        className={`absolute left-0.5 right-0.5 rounded-xl border-l-[3.5px] border p-2 text-left cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] active:scale-[0.98] z-10 flex flex-col justify-between overflow-hidden shadow-xs ${
                          statusColorMap[b.status]
                        }`}
                        style={{ top: top + 2, height: height - 4 }}
                      >
                        <div>
                          <p className="font-extrabold text-xs truncate leading-tight">
                            {b.customerName}
                          </p>
                          <p className="text-[9px] font-bold opacity-80 mt-0.5 truncate">
                            {b.serviceName}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[8px] font-bold opacity-75 mt-1 border-t border-black/5 dark:border-white/5 pt-1">
                          <span className="flex items-center gap-0.5">
                            <Clock size={8} /> {b.time}
                          </span>
                          {b.stylist && <span className="bg-white/40 dark:bg-black/25 px-1 py-0.5 rounded-sm">{b.stylist}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Vạch kẻ thời gian hiện tại trong ngày hôm nay */}
                {isToday && timeLinePosition !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                    style={{ top: timeLinePosition + 44 }} // Cộng thêm 44px của header ngày
                  >
                    <div className="h-2 w-2 rounded-full bg-rose-500 -ml-1 shadow-sm" />
                    <div className="h-px flex-1 bg-rose-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 5. Render chế độ xem Ngày (Day View)
  const renderDayView = () => {
    const isToday = isDateToday(currentDate);
    const dayBookings = filteredBookings.filter((b) =>
      isDateSame(new Date(b.date), currentDate)
    );

    // Tính toán vạch thời gian thực của hôm nay
    const now = new Date();
    const timeLinePosition = (() => {
      if (!isToday) return null;
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      if (currentHour < 8 || currentHour >= 20) return null;

      const totalMinutes = currentHour * 60 + currentMinute - 8 * 60;
      return (totalMinutes / 60) * HOUR_HEIGHT;
    })();

    return (
      <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Cột hiển thị giờ bên trái */}
        <div className="w-16 flex-none border-r border-slate-200 bg-slate-50/50 pt-5 text-center select-none">
          {salonHours.map((hour) => (
            <div
              key={hour}
              className="text-[10px] font-bold text-slate-400"
              style={{ height: HOUR_HEIGHT, lineHeight: "20px" }}
            >
              {hour}
            </div>
          ))}
        </div>

        {/* Khung sự kiện trong ngày */}
        <div
          className="flex-1 relative bg-white"
          style={{ height: (salonHours.length - 1) * HOUR_HEIGHT + 20 }}
        >
          {/* Đường kẻ ngang ngăn giờ */}
          <div className="absolute inset-x-0 bottom-0 top-5 pointer-events-none">
            {salonHours.slice(1).map((_, lineIdx) => (
              <div
                key={lineIdx}
                className="border-b border-slate-100"
                style={{ height: HOUR_HEIGHT }}
              />
            ))}
          </div>

          {/* Các Booking card */}
          <div className="absolute inset-x-3 bottom-0 top-5">
            {dayBookings.map((b) => {
              const { top, height } = getBookingLayout(b);
              return (
                <div
                  key={b._id}
                  onClick={() => onSelectBooking(b)}
                  className={`absolute left-2 right-2 rounded-2xl border-l-[4px] border p-4 text-left cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.005] active:scale-[0.99] z-10 flex flex-col justify-between shadow-sm ${
                    statusColorMap[b.status]
                  }`}
                  style={{ top: top + 4, height: height - 8 }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm md:text-base flex items-center gap-1.5">
                        <User size={13} className="opacity-60" /> {b.customerName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/40 dark:bg-black/25 uppercase tracking-wider">
                        {statusLabelMap[b.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold opacity-90 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Scissors size={12} className="opacity-60" /> {b.serviceName}
                      </span>
                      {b.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={12} className="opacity-60" /> {b.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold opacity-80 border-t border-black/5 dark:border-white/5 pt-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> Bắt đầu lúc {b.time}
                    </span>
                    {b.stylist && (
                      <span className="bg-white/50 dark:bg-black/30 px-2 py-0.5 rounded-md">
                        Stylist: {b.stylist}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vạch kẻ thời gian thực của hôm nay */}
          {isToday && timeLinePosition !== null && (
            <div
              className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
              style={{ top: timeLinePosition + 20 }}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-rose-500 -ml-1.5 shadow-sm" />
              <div className="h-px flex-1 bg-rose-500" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // 6. Chọn bộ render theo View
  switch (view) {
    case "month":
      return renderMonthView();
    case "week":
      return renderWeekView();
    case "day":
      return renderDayView();
    default:
      return null;
  }
};

export default BookingCalendar;
