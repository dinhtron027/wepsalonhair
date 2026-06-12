import { useState } from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import useSalonStore from "../store";

const BookingForm = () => {
  const { stylists, services, addBooking } = useSalonStore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    stylist: stylists[0]?.name || "",
    service: services[0]?.name || "",
    date: "",
    time: "",
    notes: "",
  });

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBooking(form);
    alert("Đã nhận yêu cầu đặt lịch. Concierge sẽ xác nhận trong ít phút!");
  };

  const inputClass =
    "w-full rounded-2xl border border-rose-100 bg-white/70 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100";

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-rose-100 bg-white/70 p-6 shadow-lg shadow-rose-100 backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-slate-700">Họ và tên</label>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
            placeholder="Nhập họ tên"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700">Số điện thoại</label>
          <input
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
            placeholder="+84 ..."
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-slate-700">Stylist</label>
          <select
            value={form.stylist}
            onChange={(e) => update("stylist", e.target.value)}
            className={inputClass}
          >
            {stylists.map((stylist) => (
              <option key={stylist.name}>{stylist.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700">Dịch vụ</label>
          <select
            value={form.service}
            onChange={(e) => update("service", e.target.value)}
            className={inputClass}
          >
            {services.map((service) => (
              <option key={service.id}>{service.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-slate-700">Ngày</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700">Giờ</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-700">Ghi chú</label>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          className={`${inputClass} min-h-[120px]`}
          placeholder="Kiểu tóc mong muốn, tình trạng tóc, lịch trình..."
        />
      </div>
      <Button variant="primary" fullWidth>
        Đặt Lịch Ngay
      </Button>
    </motion.form>
  );
};

export default BookingForm;
