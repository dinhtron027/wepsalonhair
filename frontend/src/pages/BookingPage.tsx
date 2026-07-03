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
import SectionTitle from "../components/SectionTitle";
import ServiceImage from "../components/ServiceImage";
import useSEO from "../hooks/useSEO";

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
  useSEO({
    title: "Đặt Lịch Dịch Vụ Tóc — Salon Dương Chi",
    description:
      "Đặt lịch làm tóc trực tuyến tại Salon Dương Chi, Lộc Ninh, Bình Phước. Chọn dịch vụ, ngày giờ và nhận xác nhận ngay. Phục vụ từ 9:00 – 21:00 hằng ngày.",
    canonical: "/booking",
    ogUrl: "/booking",
  });
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
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8">
      <div className="mb-10">
        <SectionTitle
          eyebrow="Đặt Lịch Hẹn"
          title="Giữ Chỗ Cho Trải Nghiệm Của Bạn"
          description="Vui lòng cung cấp thông tin liên hệ và lựa chọn dịch vụ cùng khung giờ phù hợp. Chúng tôi sẽ liên hệ xác nhận ngay lập tức."
          align="center"
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-sm font-sans"
      >
        {isLoadingServices ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 flex justify-center items-center">
            <LoadingSpinner label="Đang chuẩn bị danh sách dịch vụ..." size="sm" />
          </div>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold text-charcoal uppercase tracking-wider">Họ và tên</label>
            <input
              type="text"
              name="customerName"
              value={bookingData.customerName}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/20 px-4 py-3 text-sm text-charcoal placeholder-slate-400 outline-none focus:border-taupe focus:ring-1 focus:ring-taupe transition-all duration-200 font-light"
              placeholder="Nhập họ và tên"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold text-charcoal uppercase tracking-wider">Số điện thoại</label>
            <input
              type="text"
              name="phone"
              value={bookingData.phone}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/20 px-4 py-3 text-sm text-charcoal placeholder-slate-400 outline-none focus:border-taupe focus:ring-1 focus:ring-taupe transition-all duration-200 font-light"
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold text-charcoal uppercase tracking-wider">Email (không bắt buộc)</label>
          <input
            type="email"
            name="email"
            value={bookingData.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/20 px-4 py-3 text-sm text-charcoal placeholder-slate-400 outline-none focus:border-taupe focus:ring-1 focus:ring-taupe transition-all duration-200 font-light"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-semibold text-charcoal uppercase tracking-wider">Dịch vụ mong muốn</label>
          <select
            name="serviceId"
            value={bookingData.serviceId}
            onChange={handleChange}
            required
            disabled={isLoadingServices || !services?.length}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/20 px-4 py-3 text-sm text-charcoal outline-none focus:border-taupe focus:ring-1 focus:ring-taupe transition-all duration-200 font-light"
          >
            {(services || []).map((service) => (
              <option key={service._id} value={service._id}>
                {service.name} — {new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(service.price)} VND ({service.durationMinutes} phút)
              </option>
            ))}
          </select>
        </div>

        {(() => {
          const selectedService = services?.find((s) => s._id === bookingData.serviceId);
          if (!selectedService) return null;
          return (
            <div className="flex gap-4 rounded-xl border border-neutral-100 bg-neutral-50/30 p-4 items-start sm:items-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200/55">
                <ServiceImage
                  src={selectedService.imageUrl || selectedService.image}
                  alt={selectedService.name}
                  aspectRatio="h-full w-full"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">{selectedService.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-light flex-wrap">
                  <span>{selectedService.durationMinutes} phút</span>
                  <span>•</span>
                  <span className="font-semibold text-charcoal">
                    {new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(selectedService.price)} VND
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-light line-clamp-2 leading-relaxed">
                  {selectedService.description || "Liệu trình chăm sóc tóc tận tâm chuyên nghiệp bởi đội ngũ stylist Dương Chi."}
                </p>
              </div>
            </div>
          );
        })()}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold text-charcoal uppercase tracking-wider">Ngày hẹn</label>
            <input
              type="date"
              name="date"
              value={bookingData.date}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/20 px-4 py-3 text-sm text-charcoal outline-none focus:border-taupe focus:ring-1 focus:ring-taupe transition-all duration-200 font-light"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-semibold text-charcoal uppercase tracking-wider">Giờ hẹn</label>
            <select
              name="time"
              value={bookingData.time}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50/20 px-4 py-3 text-sm text-charcoal outline-none focus:border-taupe focus:ring-1 focus:ring-taupe transition-all duration-200 font-light"
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
          <label className="mb-1.5 block text-[10px] font-semibold text-charcoal uppercase tracking-wider">Ghi chú thêm</label>
          <textarea
            name="note"
            value={bookingData.note}
            onChange={handleChange}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/20 p-4 text-sm text-charcoal placeholder-slate-400 outline-none focus:border-taupe focus:ring-1 focus:ring-taupe transition-all duration-200 font-light"
            rows={4}
            placeholder="Yêu cầu đặc biệt hoặc tình trạng tóc hiện tại..."
          />
        </div>

        <button
          type="submit"
          disabled={createBookingMutation.isPending || isLoadingServices || !services?.length}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-charcoal py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-taupe disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createBookingMutation.isPending ? <LoadingSpinner className="text-white" size="sm" /> : null}
          {createBookingMutation.isPending ? "Đang gửi yêu cầu..." : "Xác nhận giữ lịch hẹn"}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;
