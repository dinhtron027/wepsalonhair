import React, { useEffect, useState } from "react";
import { BookingEntity, BookingStatus } from "../../../services/adminApi";
import BookingStatusBadge from "./BookingStatusBadge";
import { formatInVi, statusLabelMap } from "./dateUtils";
import { X, User, Phone, Mail, Clock, Calendar, Scissors, Sparkles, Paintbrush, BookOpen } from "lucide-react";

type BookingDetailModalProps = {
  booking: BookingEntity | null;
  onClose: () => void;
  onUpdate: (data: {
    status: BookingStatus;
    stylist?: string;
    hairColorUsed?: string;
    note?: string;
  }) => void;
  isUpdating: boolean;
};

const statusOptions: Array<{ value: BookingStatus; label: string }> = Object.entries(
  statusLabelMap
).map(([k, v]) => ({
  value: k as BookingStatus,
  label: v,
}));

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
  onUpdate,
  isUpdating,
}) => {
  const [status, setStatus] = useState<BookingStatus>("pending");
  const [stylist, setStylist] = useState("");
  const [hairColorUsed, setHairColorUsed] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      setStylist(booking.stylist || "");
      setHairColorUsed(booking.hairColorUsed || "");
      setNote(booking.note || "");
    }
  }, [booking]);

  if (!booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      status,
      stylist,
      hairColorUsed,
      note,
    });
  };

  const bookingDate = new Date(booking.date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs animate-fadeIn">
      {/* Outer Shell (Double Bezel) */}
      <div className="relative w-full max-w-lg rounded-[2rem] bg-slate-100/80 p-2 shadow-2xl ring-1 ring-black/5 animate-scaleUp">
        
        {/* Inner Core */}
        <div className="rounded-[calc(2rem-0.5rem)] bg-white p-6 shadow-inner relative max-h-[90vh] overflow-y-auto">
          {/* Nút Đóng */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition flex items-center justify-center active:scale-95"
            style={{ minHeight: "38px", minWidth: "38px" }}
            aria-label="Đóng cửa sổ"
          >
            <X size={18} />
          </button>

          <div className="border-b border-slate-100 pb-4 pr-8">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-600 mb-1 block">
              Thông tin chi tiết
            </span>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              Lịch Hẹn <BookingStatusBadge status={booking.status} />
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            
            {/* Thông tin khách hàng */}
            <div className="space-y-2.5 rounded-2xl border border-slate-150 bg-slate-50/50 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <User size={15} className="text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800">{booking.customerName}</span>
              </div>
              {booking.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-650">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <a href={`tel:${booking.phone}`} className="hover:text-cyan-700 hover:underline">
                    {booking.phone}
                  </a>
                </div>
              )}
              {booking.email && (
                <div className="flex items-center gap-2 text-xs text-slate-650">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{booking.email}</span>
                </div>
              )}
            </div>

            {/* Thông tin dịch vụ & Thời gian */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="rounded-xl border border-slate-150 p-3 bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Scissors size={13} />
                  <span>Dịch vụ</span>
                </div>
                <p className="text-sm font-bold text-slate-800 truncate" title={booking.serviceName}>
                  {booking.serviceName}
                </p>
              </div>

              <div className="rounded-xl border border-slate-150 p-3 bg-white space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock size={13} />
                  <span>Thời gian</span>
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {booking.time}
                </p>
              </div>

              <div className="rounded-xl border border-slate-150 p-3 bg-white space-y-1 col-span-2">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Calendar size={13} />
                  <span>Ngày hẹn</span>
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {formatInVi(bookingDate, "EEEE, dd/MM/yyyy")}
                </p>
              </div>
            </div>

            {/* Form sửa thông tin */}
            <div className="space-y-3.5 border-t border-slate-100 pt-4.5">
              
              {/* Trạng thái */}
              <label className="block text-sm">
                <span className="mb-1.5 block font-bold text-slate-600 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-slate-400" />
                  Trạng thái lịch hẹn
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BookingStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Thợ làm tóc */}
              <label className="block text-sm">
                <span className="mb-1.5 block font-bold text-slate-600 flex items-center gap-1.5">
                  <Paintbrush size={13} className="text-slate-400" />
                  Thợ phục vụ (Stylist)
                </span>
                <input
                  type="text"
                  value={stylist}
                  onChange={(e) => setStylist(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                  placeholder="Nhập tên thợ làm tóc"
                />
              </label>

              {/* Màu nhuộm đã dùng */}
              <label className="block text-sm">
                <span className="mb-1.5 block font-bold text-slate-600 flex items-center gap-1.5">
                  <Paintbrush size={13} className="text-slate-400" />
                  Công thức màu nhuộm đã dùng
                </span>
                <input
                  type="text"
                  value={hairColorUsed}
                  onChange={(e) => setHairColorUsed(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition"
                  placeholder="Ví dụ: Nâu lạnh 6.11 + Oxy 6%"
                />
              </label>

              {/* Ghi chú */}
              <label className="block text-sm">
                <span className="mb-1.5 block font-bold text-slate-600 flex items-center gap-1.5">
                  <BookOpen size={13} className="text-slate-400" />
                  Ghi chú lịch hẹn
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition resize-none"
                  placeholder="Nhập ghi chú chi tiết về yêu cầu hoặc tình trạng tóc khách hàng..."
                />
              </label>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
                style={{ minHeight: "44px" }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50 transition active:scale-95 flex items-center justify-center"
                style={{ minHeight: "44px" }}
              >
                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
