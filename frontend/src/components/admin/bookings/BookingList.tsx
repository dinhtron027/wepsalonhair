import React from "react";
import { BookingEntity } from "../../../services/adminApi";
import BookingStatusBadge from "./BookingStatusBadge";
import { formatInVi } from "./dateUtils";
import { Phone, Calendar, User, Clock, Scissors } from "lucide-react";

type BookingListProps = {
  bookings: BookingEntity[];
  onSelectBooking: (booking: BookingEntity) => void;
  selectedBooking: BookingEntity | null;
};

const BookingList: React.FC<BookingListProps> = ({
  bookings,
  onSelectBooking,
  selectedBooking,
}) => {
  return (
    <div className="space-y-3.5">
      {bookings.map((booking) => {
        const isSelected = selectedBooking?._id === booking._id;
        const bookingDate = new Date(booking.date);
        
        return (
          <div
            key={booking._id}
            onClick={() => onSelectBooking(booking)}
            className={`group relative overflow-hidden rounded-2xl border p-4.5 cursor-pointer transition-all duration-300 active:scale-[0.99] ${
              isSelected
                ? "border-cyan-500 bg-cyan-50/10 shadow-sm"
                : "border-slate-200 bg-white hover:bg-slate-50/50 hover:border-slate-350"
            }`}
          >
            {/* Cột trái chứa thông tin, trên cùng bên phải chứa status badge */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" />
                  <h4 className="font-bold text-slate-800 group-hover:text-cyan-700 transition">
                    {booking.customerName}
                  </h4>
                </div>
                {booking.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone size={12} className="text-slate-400" />
                    <span>SĐT: {booking.phone}</span>
                  </div>
                )}
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>

            {/* Chi tiết cuộc hẹn trong hộp bento mini */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5">
                <Scissors size={12} className="text-slate-400 shrink-0" />
                <span className="truncate font-semibold text-slate-800">
                  {booking.serviceName}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800">{booking.time}</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <Calendar size={12} className="text-slate-400 shrink-0" />
                <span>
                  {formatInVi(bookingDate, "EEEE, dd/MM/yyyy")}
                </span>
              </div>
            </div>

            {/* Metadata bổ sung (stylist/note) nếu có */}
            {(booking.stylist || booking.note) && (
              <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100/60 pt-2.5 flex-wrap gap-2">
                {booking.stylist ? (
                  <div className="flex items-center gap-1 text-slate-500">
                    <span className="font-medium text-slate-400">Thợ:</span>
                    <span className="font-semibold text-slate-700 bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md">
                      {booking.stylist}
                    </span>
                  </div>
                ) : (
                  <span />
                )}
                {booking.note && (
                  <span className="text-slate-400 italic truncate max-w-[200px]" title={booking.note}>
                    "{booking.note}"
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {bookings.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/30">
          <Calendar size={32} className="text-slate-350 mb-2" />
          <p className="text-sm font-medium text-slate-500">
            Không có lịch hẹn nào khớp với bộ lọc.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingList;
