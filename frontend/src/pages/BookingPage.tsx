import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  createPublicBooking,
  fetchBookedSlots,
  fetchPublicServices,
  queryKeys,
} from "../services/adminApi";
import { getApiErrorMessage } from "../services/api";

type BookingFormData = {
  customerName: string;
  phone: string;
  email: string;
  serviceId: string;
  date: string;
  time: string;
  note: string;
};

const defaultFormState: BookingFormData = {
  customerName: "",
  phone: "",
  email: "",
  serviceId: "",
  date: "",
  time: "",
  note: "",
};

const buildTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 20; hour += 1) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    if (hour < 20) {
      slots.push(`${String(hour).padStart(2, "0")}:30`);
    }
  }
  return slots;
};

const timeSlots = buildTimeSlots();

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const [bookingData, setBookingData] = useState<BookingFormData>(defaultFormState);

  const {
    data: services,
    isLoading: isLoadingServices,
    error: servicesError,
  } = useQuery({
    queryKey: [...queryKeys.publicServices],
    queryFn: fetchPublicServices,
  });

  const { data: bookedSlots } = useQuery({
    queryKey: [...queryKeys.bookingSlots, bookingData.date],
    queryFn: () => fetchBookedSlots(bookingData.date),
    enabled: Boolean(bookingData.date),
  });

  const createBookingMutation = useMutation({
    mutationFn: createPublicBooking,
    onSuccess: () => {
      toast.success("Hoàn hảo rùi! Lịch hẹn đã được giữ thành công.");
      setBookingData({
        ...defaultFormState,
        serviceId: services?.[0]?._id || "",
      });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Có chút gián đoạn nhỏ, bạn thử lại nhé."));
    },
  });

  useEffect(() => {
    if (!servicesError) {
      return;
    }

    toast.error(getApiErrorMessage(servicesError, "Ái chà, đường truyền vừa chợp mắt. Bạn thử lại nhé."));
  }, [servicesError]);

  useEffect(() => {
    if (!services || services.length === 0) {
      return;
    }

    const serviceParam = searchParams.get("service");
    let matchedServiceId = "";
    if (serviceParam) {
      const matched = services.find((s) => s.slug === serviceParam || s._id === serviceParam);
      if (matched) {
        matchedServiceId = matched._id;
      }
    }

    setBookingData((prev) => ({
      ...prev,
      serviceId: prev.serviceId || matchedServiceId || services[0]._id,
    }));
  }, [services, searchParams]);

  useEffect(() => {
    if (!bookingData.time || !bookedSlots?.includes(bookingData.time)) {
      return;
    }

    setBookingData((prev) => ({ ...prev, time: "" }));
    toast("Khung giờ bạn chọn vừa có người giữ mất rồi. Bạn đổi giờ khác giúp Dương Chi nhé!");
  }, [bookedSlots, bookingData.time]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createBookingMutation.mutate(bookingData);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setBookingData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h2 className="mb-6 text-center text-3xl font-bold text-rose-500">Giữ Lịch Tại Dương Chi</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-rose-100 bg-white p-6 shadow-lg"
      >
        {isLoadingServices ? (
          <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
            <LoadingSpinner label="Đang chuẩn bị điều tuyệt vời..." />
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Họ và tên</label>
            <input
              type="text"
              name="customerName"
              value={bookingData.customerName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Nhập họ và tên"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={bookingData.phone}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email (không bắt buộc)</label>
          <input
            type="email"
            name="email"
            value={bookingData.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:ring-2 focus:ring-rose-200"
            placeholder="example@email.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Dịch vụ</label>
          <select
            name="serviceId"
            value={bookingData.serviceId}
            onChange={handleChange}
            required
            disabled={isLoadingServices || !services?.length}
            className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:ring-2 focus:ring-rose-200"
          >
            {(services || []).map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} -{" "}
                {new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(service.price)} VND (
                {service.durationMinutes} phút)
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Ngày hẹn</label>
            <input
              type="date"
              name="date"
              value={bookingData.date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Giờ hẹn</label>
            <select
              name="time"
              value={bookingData.time}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:ring-2 focus:ring-rose-200"
            >
              <option value="">Chọn khung giờ</option>
              {timeSlots.map((slot) => {
                const isBooked = bookedSlots?.includes(slot);
                return (
                  <option key={slot} value={slot} disabled={isBooked}>
                    {slot} {isBooked ? "(Đã đặt)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Ghi chú thêm</label>
          <textarea
            name="note"
            value={bookingData.note}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 p-2 outline-none focus:ring-2 focus:ring-rose-200"
            rows={3}
          />
        </div>
        <button
          type="submit"
          disabled={createBookingMutation.isPending || isLoadingServices || !services?.length}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {createBookingMutation.isPending ? <LoadingSpinner className="text-white" size="sm" /> : null}
          {createBookingMutation.isPending ? "Đang chuẩn bị điều tuyệt vời..." : "Xác nhận giữ lịch hẹn"}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;
