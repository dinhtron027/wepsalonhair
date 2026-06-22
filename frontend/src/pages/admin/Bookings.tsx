import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addMinutes, format, getDay, parse, startOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import { dateFnsLocalizer, View, Calendar } from "react-big-calendar";
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
import "react-big-calendar/lib/css/react-big-calendar.css";

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: BookingEntity;
};

type NewBookingForm = {
  customerName: string;
  phone: string;
  email: string;
  serviceId: string;
  date: string;
  time: string;
  note: string;
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: vi }),
  getDay,
  locales: { vi },
});

const statusOptions: Array<{ value: BookingStatus; label: string }> = [
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "in_service", label: "Đang phục vụ" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Hủy" },
];

const statusColorMap: Record<BookingStatus, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  in_service: "#14b8a6",
  completed: "#22c55e",
  cancelled: "#ef4444",
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

const parseBookingStart = (date: string, time: string) => {
  const dateOnly = new Date(date).toISOString().slice(0, 10);
  return new Date(`${dateOnly}T${time}:00`);
};

const BookingsPage = () => {
  const queryClient = useQueryClient();
  const [calendarView, setCalendarView] = useState<View>("month");
  const [selectedBooking, setSelectedBooking] = useState<BookingEntity | null>(null);
  const [newBookingForm, setNewBookingForm] = useState<NewBookingForm>(defaultNewBooking);
  const [updateForm, setUpdateForm] = useState<{
    status: BookingStatus;
    stylist: string;
    hairColorUsed: string;
    note: string;
  }>({
    status: "pending",
    stylist: "",
    hairColorUsed: "",
    note: "",
  });
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [calendarHeight, setCalendarHeight] = useState(640);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setActiveTab("list");
    }

    const handleResize = () => {
      setCalendarHeight(window.innerWidth < 768 ? 480 : 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    if (!selectedBooking) {
      return;
    }

    setUpdateForm({
      status: selectedBooking.status,
      stylist: selectedBooking.stylist || "",
      hairColorUsed: selectedBooking.hairColorUsed || "",
      note: selectedBooking.note || "",
    });
  }, [selectedBooking]);

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

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    const serviceDurationMap = new Map(
      (services || []).map((service) => [service._id, service.durationMinutes || 60])
    );

    return (bookings || []).map((booking) => {
      const bookingStart = parseBookingStart(booking.date, booking.time);
      const serviceFromBooking =
        typeof booking.serviceId === "string" ? null : booking.serviceId.durationMinutes || null;
      const durationMinutes =
        serviceFromBooking ||
        serviceDurationMap.get(
          typeof booking.serviceId === "string" ? booking.serviceId : booking.serviceId._id
        ) ||
        60;

      return {
        id: booking._id,
        title: `${booking.customerName} - ${booking.serviceName}`,
        start: bookingStart,
        end: addMinutes(bookingStart, durationMinutes),
        resource: booking,
      };
    });
  }, [bookings, services]);

  const sortedBookings = useMemo(() => {
    return [...(bookings || [])].sort((a, b) => {
      const dateA = new Date(`${a.date.slice(0, 10)}T${a.time}:00`).getTime();
      const dateB = new Date(`${b.date.slice(0, 10)}T${b.time}:00`).getTime();
      return dateB - dateA;
    });
  }, [bookings]);

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newBookingForm);
  };

  const handleUpdateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) {
      return;
    }

    updateMutation.mutate({
      bookingId: selectedBooking._id,
      data: updateForm,
    });
  };

  if (isBookingsLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10">
        <LoadingSpinner size="lg" label="Đang tải lịch hẹn..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Tạo lịch hẹn mới</h3>
        <p className="mt-1 text-sm text-slate-500">
          Đặt lịch nhanh cho khách tại quầy, hệ thống sẽ tự kiểm tra trùng lịch.
        </p>

        <form onSubmit={handleCreateBooking} className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input
            required
            value={newBookingForm.customerName}
            onChange={(event) =>
              setNewBookingForm((prev) => ({ ...prev, customerName: event.target.value }))
            }
            placeholder="Tên khách hàng"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            value={newBookingForm.phone}
            onChange={(event) => setNewBookingForm((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder="Số điện thoại"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={newBookingForm.email}
            onChange={(event) => setNewBookingForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Email (không bắt buộc)"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            required
            value={newBookingForm.serviceId}
            onChange={(event) =>
              setNewBookingForm((prev) => ({ ...prev, serviceId: event.target.value }))
            }
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {(services || []).map((service) => (
              <option key={service._id} value={service._id}>
                {service.name}
              </option>
            ))}
          </select>
          <input
            required
            type="date"
            value={newBookingForm.date}
            onChange={(event) => setNewBookingForm((prev) => ({ ...prev, date: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            required
            type="time"
            value={newBookingForm.time}
            onChange={(event) => setNewBookingForm((prev) => ({ ...prev, time: event.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={newBookingForm.note}
            onChange={(event) => setNewBookingForm((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Ghi chú"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm md:col-span-2"
          />

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-70"
          >
            {createMutation.isPending ? "Đang xử lý..." : "Tạo lịch hẹn"}
          </button>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
          {/* Tab Selector and Status Badges */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 mb-4 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map((status) => (
                <span
                  key={status.value}
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: statusColorMap[status.value] }}
                >
                  {status.label}
                </span>
              ))}
            </div>
            <div className="flex rounded-xl bg-slate-100 p-1 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("calendar")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "calendar"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Lịch biểu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "list"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Danh sách
              </button>
            </div>
          </div>

          {activeTab === "calendar" ? (
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={calendarView}
              onView={(view) => setCalendarView(view)}
              views={["month", "week", "day"]}
              onSelectEvent={(event) => setSelectedBooking(event.resource)}
              style={{ height: calendarHeight }}
              messages={{
                today: "Hôm nay",
                previous: "Trước",
                next: "Sau",
                month: "Tháng",
                week: "Tuần",
                day: "Ngày",
                agenda: "Lịch biểu",
                date: "Ngày",
                time: "Giờ",
                event: "Lịch hẹn",
                noEventsInRange: "Không có lịch hẹn trong khoảng này",
              }}
              eventPropGetter={(event) => {
                const status = event.resource.status;
                return {
                  style: {
                    backgroundColor: statusColorMap[status],
                    color: "white",
                    borderRadius: "8px",
                    border: "none",
                    opacity: 0.95,
                  },
                };
              }}
            />
          ) : (
            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {sortedBookings.map((booking) => (
                <div
                  key={booking._id}
                  onClick={() => setSelectedBooking(booking)}
                  className={`rounded-xl border p-4 space-y-3 cursor-pointer transition hover:bg-slate-50/50 ${
                    selectedBooking?._id === booking._id
                      ? "border-cyan-500 bg-cyan-50/10"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800 text-base">{booking.customerName}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        SĐT: <span className="font-medium text-slate-700">{booking.phone}</span>
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: statusColorMap[booking.status] }}
                    >
                      {statusOptions.find((o) => o.value === booking.status)?.label || booking.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-2.5 rounded-lg">
                    <p>Dịch vụ: <span className="font-semibold text-slate-800">{booking.serviceName}</span></p>
                    <p>Thời gian: <span className="font-semibold text-slate-800">{new Date(booking.date).toLocaleDateString("vi-VN")} - {booking.time}</span></p>
                    {booking.stylist && <p>Thợ phục vụ: <span className="font-semibold text-slate-800">{booking.stylist}</span></p>}
                    {booking.note && <p>Ghi chú: <span className="text-slate-500 italic">{booking.note}</span></p>}
                  </div>
                </div>
              ))}

              {sortedBookings.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 text-center">
                  Chưa có lịch hẹn nào.
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Chi tiết lịch hẹn</h3>
          {selectedBooking ? (
            <form onSubmit={handleUpdateBooking} className="mt-4 space-y-3">
              <div>
                <p className="text-sm text-slate-500">Khách hàng</p>
                <p className="font-semibold">{selectedBooking.customerName}</p>
                <p className="text-sm text-slate-500">{selectedBooking.phone}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <p>Dịch vụ: {selectedBooking.serviceName}</p>
                <p>
                  Thời gian: {new Date(selectedBooking.date).toLocaleDateString("vi-VN")} -{" "}
                  {selectedBooking.time}
                </p>
              </div>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Trạng thái</span>
                <select
                  value={updateForm.status}
                  onChange={(event) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      status: event.target.value as BookingStatus,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Thợ phục vụ</span>
                <input
                  value={updateForm.stylist}
                  onChange={(event) =>
                    setUpdateForm((prev) => ({ ...prev, stylist: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  placeholder="Tên thợ"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Màu nhuộm đã dùng</span>
                <input
                  value={updateForm.hairColorUsed}
                  onChange={(event) =>
                    setUpdateForm((prev) => ({ ...prev, hairColorUsed: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  placeholder="Ví dụ: Nâu lạnh 6.11"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-slate-600">Ghi chú</span>
                <textarea
                  value={updateForm.note}
                  onChange={(event) => setUpdateForm((prev) => ({ ...prev, note: event.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                  rows={4}
                />
              </label>

              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70"
              >
                {updateMutation.isPending ? "Đang cập nhật..." : "Lưu thay đổi"}
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Chọn một lịch hẹn trên lịch để xem chi tiết và cập nhật trạng thái.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default BookingsPage;
