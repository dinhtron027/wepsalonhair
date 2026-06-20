import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, X } from "lucide-react";
import type {
  CustomerEntity,
  CustomerFilterOptions,
} from "../../../services/adminApi";
import { fetchBookedSlots, queryKeys } from "../../../services/adminApi";

export type RebookPayload = {
  serviceId: string;
  date: string;
  time: string;
  stylist?: string;
  note?: string;
  status?: "pending" | "confirmed";
};

type RebookModalProps = {
  customer: CustomerEntity;
  options?: CustomerFilterOptions;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: RebookPayload) => void;
};

const buildTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 20; hour += 1) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
    if (hour < 20) slots.push(`${String(hour).padStart(2, "0")}:30`);
  }
  return slots;
};

const timeSlots = buildTimeSlots();
const inputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100";

const RebookModal = ({
  customer,
  options,
  isOpen,
  isSaving,
  onClose,
  onSave,
}: RebookModalProps) => {
  const [form, setForm] = useState<RebookPayload>({
    serviceId: "",
    date: "",
    time: "",
    stylist: customer.preferredStaff || "",
    note: "",
    status: "pending",
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      serviceId: customer.latestService?.serviceId || options?.services[0]?._id || "",
      date: "",
      time: "",
      stylist: customer.preferredStaff || "",
      note: customer.latestService
        ? `Đặt lại dịch vụ: ${customer.latestService.serviceName}`
        : "",
      status: "pending",
    });
  }, [customer, isOpen, options?.services]);

  const { data: bookedSlots = [] } = useQuery({
    queryKey: [...queryKeys.bookingSlots, form.date],
    queryFn: () => fetchBookedSlots(form.date),
    enabled: isOpen && Boolean(form.date),
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
              Tạo lịch hẹn nhanh
            </p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">{customer.fullName}</h3>
            <p className="mt-1 text-sm text-slate-500">{customer.phone}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Đóng"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(form);
          }}
          className="grid gap-3 p-5 md:grid-cols-2"
        >
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-slate-600">Dịch vụ</span>
            <select
              required
              value={form.serviceId}
              onChange={(event) => setForm((prev) => ({ ...prev, serviceId: event.target.value }))}
              className={inputClass}
            >
              {(options?.services || []).map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Ngày</span>
            <input
              required
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value, time: "" }))
              }
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Giờ</span>
            <select
              required
              value={form.time}
              onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
              className={inputClass}
            >
              <option value="">Chọn giờ</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot} disabled={bookedSlots.includes(slot)}>
                  {slot} {bookedSlots.includes(slot) ? "(Đã có lịch)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Thợ</span>
            <select
              value={form.stylist || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, stylist: event.target.value }))}
              className={inputClass}
            >
              <option value="">Chưa chỉ định</option>
              {(options?.staff || []).map((staff) => (
                <option key={staff.id} value={staff.name}>
                  {staff.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Trạng thái ban đầu</span>
            <select
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  status: event.target.value as "pending" | "confirmed",
                }))
              }
              className={inputClass}
            >
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
            </select>
          </label>
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-medium text-slate-600">Ghi chú</span>
            <textarea
              value={form.note || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
              rows={3}
              className={inputClass}
            />
          </label>

          <div className="flex justify-end gap-2 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving || !form.serviceId || !form.date || !form.time}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
            >
              <CalendarPlus size={16} />
              {isSaving ? "Đang tạo..." : "Tạo lịch hẹn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RebookModal;
