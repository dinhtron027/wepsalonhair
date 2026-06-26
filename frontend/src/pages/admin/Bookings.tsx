import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  subDays,
  addMonths,
  subMonths,
} from "date-fns";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  BookingEntity,
  BookingStatus,
  createBookingFromAdmin,
  fetchAdminBookings,
  fetchAdminServices,
  queryKeys,
  updateAdminBooking,
} from "../../services/adminApi";
import { getApiErrorMessage } from "../../services/api";

// Import các component lịch mới
import CalendarToolbar, { CalendarView } from "../../components/admin/bookings/CalendarToolbar";
import BookingCalendar from "../../components/admin/bookings/BookingCalendar";
import BookingList from "../../components/admin/bookings/BookingList";
import BookingDetailModal from "../../components/admin/bookings/BookingDetailModal";

type NewBookingForm = {
  customerName: string;
  phone: string;
  email: string;
  serviceId: string;
  date: string;
  time: string;
  note: string;
};

const defaultNewBooking: NewBookingForm = {
  customerName: "",
  phone: "",
  email: "",
  serviceId: "",
  date: "",
  time: "",
  note: "",
};

const BookingsPage = () => {
  const queryClient = useQueryClient();

  // State điều khiển ngày hiển thị, chế độ xem, bộ lọc
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("week");
  const [filterStatus, setFilterStatus] = useState<BookingStatus | "all">("all");

  const [selectedBooking, setSelectedBooking] = useState<BookingEntity | null>(null);
  const [newBookingForm, setNewBookingForm] = useState<NewBookingForm>(defaultNewBooking);

  // Responsive: Tự động đổi về view danh sách trên mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCalendarView("list");
      } else {
        setCalendarView("week");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch dữ liệu từ API
  const { data: bookings, isLoading: isBookingsLoading } = useQuery({
    queryKey: [...queryKeys.adminBookings],
    queryFn: fetchAdminBookings,
  });

  const { data: services } = useQuery({
    queryKey: [...queryKeys.adminServices],
    queryFn: fetchAdminServices,
  });

  useEffect(() => {
    if (!services || services.length === 0) {
      return;
    }
    setNewBookingForm((prev) => ({
      ...prev,
      serviceId: prev.serviceId || services[0]._id,
    }));
  }, [services]);

  // Mutation cập nhật lịch hẹn
  const updateMutation = useMutation({
    mutationFn: (payload: {
      bookingId: string;
      data: {
        status: BookingStatus;
        stylist?: string;
        hairColorUsed?: string;
        note?: string;
      };
    }) => updateAdminBooking(payload.bookingId, payload.data),
    onSuccess: (updatedBooking) => {
      toast.success("Thành công: Cập nhật lịch hẹn");
      setSelectedBooking(updatedBooking);
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminBookings] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Thất bại: Không thể cập nhật lịch hẹn"));
    },
  });

  // Mutation tạo lịch hẹn mới từ quầy
  const createMutation = useMutation({
    mutationFn: createBookingFromAdmin,
    onSuccess: () => {
      toast.success("Thành công: Đặt lịch mới");
      setNewBookingForm({
        ...defaultNewBooking,
        serviceId: services?.[0]?._id || "",
      });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.adminBookings] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Thất bại: Không thể tạo lịch"));
    },
  });

  // Lọc và sắp xếp danh sách bookings hiển thị cho chế độ list
  const displayBookings = useMemo(() => {
    const list = bookings || [];
    const filtered = filterStatus === "all" ? list : list.filter((b) => b.status === filterStatus);
    
    return [...filtered].sort((a, b) => {
      const dateA = new Date(`${a.date.slice(0, 10)}T${a.time}:00`).getTime();
      const dateB = new Date(`${b.date.slice(0, 10)}T${b.time}:00`).getTime();
      return dateB - dateA;
    });
  }, [bookings, filterStatus]);

  // Điều hướng thời gian (Lui, Tiến, Hôm nay)
  const handleNavigate = (action: "prev" | "next" | "today") => {
    if (action === "today") {
      setCurrentDate(new Date());
      return;
    }

    const direction = action === "next" ? 1 : -1;

    if (calendarView === "month") {
      setCurrentDate((prev) => (direction === 1 ? addMonths(prev, 1) : subMonths(prev, 1)));
    } else if (calendarView === "week" || calendarView === "list") {
      setCurrentDate((prev) => (direction === 1 ? addDays(prev, 7) : subDays(prev, 7)));
    } else if (calendarView === "day") {
      setCurrentDate((prev) => (direction === 1 ? addDays(prev, 1) : subDays(prev, 1)));
    }
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newBookingForm);
  };

  const handleUpdateBooking = (data: {
    status: BookingStatus;
    stylist?: string;
    hairColorUsed?: string;
    note?: string;
  }) => {
    if (!selectedBooking) return;
    updateMutation.mutate({
      bookingId: selectedBooking._id,
      data,
    });
  };

  if (isBookingsLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm flex items-center justify-center">
        <LoadingSpinner size="lg" label="Đang tải danh sách đặt lịch..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. Panel Tạo lịch hẹn mới từ admin */}
      <section className="rounded-3xl border border-slate-150 bg-white p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-600" />
        <h3 className="text-lg font-bold text-slate-800">Đặt lịch tại quầy</h3>
        <p className="mt-1 text-xs text-slate-500">
          Đặt lịch nhanh cho khách hàng vãng lai. Hệ thống tự động kiểm tra trùng lịch.
        </p>

        <form onSubmit={handleCreateBooking} className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <input
            required
            value={newBookingForm.customerName}
            onChange={(e) =>
              setNewBookingForm((prev) => ({ ...prev, customerName: e.target.value }))
            }
            placeholder="Tên khách hàng"
            className="rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition"
            style={{ minHeight: "42px" }}
          />
          <input
            required
            value={newBookingForm.phone}
            onChange={(e) => setNewBookingForm((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Số điện thoại"
            className="rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition"
            style={{ minHeight: "42px" }}
          />
          <input
            value={newBookingForm.email}
            onChange={(e) => setNewBookingForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email (không bắt buộc)"
            className="rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition"
            style={{ minHeight: "42px" }}
          />
          <select
            required
            value={newBookingForm.serviceId}
            onChange={(e) =>
              setNewBookingForm((prev) => ({ ...prev, serviceId: e.target.value }))
            }
            className="rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition cursor-pointer"
            style={{ minHeight: "42px" }}
          >
            {(services || []).map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} ({(service.price || 0).toLocaleString("vi-VN")}đ)
              </option>
            ))}
          </select>
          <input
            required
            type="date"
            value={newBookingForm.date}
            onChange={(e) => setNewBookingForm((prev) => ({ ...prev, date: e.target.value }))}
            className="rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition cursor-pointer"
            style={{ minHeight: "42px" }}
          />
          <input
            required
            type="time"
            value={newBookingForm.time}
            onChange={(e) => setNewBookingForm((prev) => ({ ...prev, time: e.target.value }))}
            className="rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition cursor-pointer"
            style={{ minHeight: "42px" }}
          />
          <input
            value={newBookingForm.note}
            onChange={(e) => setNewBookingForm((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="Ghi chú thêm về tóc khách hàng..."
            className="rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600 transition sm:col-span-2"
            style={{ minHeight: "42px" }}
          />

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-cyan-700 disabled:opacity-75 transition active:scale-95 flex items-center justify-center cursor-pointer shadow-xs"
            style={{ minHeight: "44px" }}
          >
            {createMutation.isPending ? "Đang đặt..." : "Xác nhận Đặt"}
          </button>
        </form>
      </section>

      {/* 2. Phần Lịch biểu chính */}
      <section className="rounded-3xl border border-slate-150 bg-white p-5 shadow-xs">
        {/* Thanh công cụ (Toolbar) điều hướng ngày, chế độ view và status filter */}
        <CalendarToolbar
          currentDate={currentDate}
          view={calendarView}
          onViewChange={setCalendarView}
          onNavigate={handleNavigate}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
        />

        <div className="mt-5">
          {calendarView === "list" ? (
            /* Chế độ hiển thị danh sách */
            <div className="max-w-2xl mx-auto">
              <BookingList
                bookings={displayBookings}
                onSelectBooking={setSelectedBooking}
                selectedBooking={selectedBooking}
              />
            </div>
          ) : (
            /* Chế độ hiển thị Lịch lưới (Month / Week / Day) */
            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/10 p-1">
              <BookingCalendar
                bookings={bookings || []}
                currentDate={currentDate}
                view={calendarView}
                filterStatus={filterStatus}
                onSelectBooking={setSelectedBooking}
              />
            </div>
          )}
        </div>
      </section>

      {/* 3. Modal xem và cập nhật chi tiết booking */}
      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        onUpdate={handleUpdateBooking}
        isUpdating={updateMutation.isPending}
      />
    </div>
  );
};

export default BookingsPage;
