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
    "w-full mt-1.5 rounded-xl border border-neutral-200 bg-neutral-50/20 px-4 py-3 text-sm text-charcoal placeholder:text-slate-400 outline-none focus:border-taupe focus:ring-1 focus:ring-taupe transition-all duration-200 font-light";

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-sm font-sans"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-[10px] font-semibold text-charcoal uppercase tracking-wider">Họ và tên</label>
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
            placeholder="Nhập họ tên"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-charcoal uppercase tracking-wider">Số điện thoại</label>
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
          <label className="text-[10px] font-semibold text-charcoal uppercase tracking-wider">Stylist</label>
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
          <label className="text-[10px] font-semibold text-charcoal uppercase tracking-wider">Dịch vụ</label>
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
          <label className="text-[10px] font-semibold text-charcoal uppercase tracking-wider">Ngày</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-charcoal uppercase tracking-wider">Giờ</label>
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
        <label className="text-[10px] font-semibold text-charcoal uppercase tracking-wider">Ghi chú</label>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          className={`${inputClass} min-h-[120px]`}
          placeholder="Kiểu tóc mong muốn, tình trạng tóc, lịch trình..."
        />
      </div>
      <Button variant="primary" fullWidth className="rounded-full py-3.5 uppercase tracking-wider text-xs">
        Đặt Lịch Ngay
      </Button>
    </motion.form>
  );
};

export default BookingForm;
