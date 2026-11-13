import { useState } from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import useSalonStore from "../store";

/**
 * Component BookingForm: Biểu mẫu đặt lịch hẹn làm tóc phía giao diện người dùng.
 * 
 * Kiến thức cốt lõi cho bài tiểu luận Web:
 * 1. Controlled Component (Thành phần điều khiển):
 *    - Dữ liệu của các ô nhập liệu (input, select, textarea) được đồng bộ 100% với React State (`form`).
 *    - Mỗi khi người dùng gõ phím, sự kiện `onChange` kích hoạt hàm `update` để cập nhật state,
 *      sau đó React render lại giá trị mới vào thuộc tính `value` của thẻ HTML.
 * 2. Event Handling (Xử lý sự kiện):
 *    - `e.preventDefault()` trong `handleSubmit` ngăn chặn hành vi mặc định của thẻ `<form>` trong HTML
 *      (mặc định form sẽ gửi HTTP GET/POST và làm tải lại toàn bộ trang web).
 * 3. Responsive Web Design:
 *    - Sử dụng Tailwind CSS Grid (`grid gap-4 md:grid-cols-2`) để tự động chuyển từ 1 cột trên điện thoại
 *      sang 2 cột trên màn hình máy tính bảng và desktop (Breakpoint `md: 768px`).
 */
const BookingForm = () => {
  // Trích xuất danh sách stylists, services và hàm addBooking từ Zustand store
  const { stylists, services, addBooking } = useSalonStore();

  // Khởi tạo state cục bộ lưu trữ dữ liệu các trường của form đặt lịch
  const [form, setForm] = useState({
    name: "",
    phone: "",
    stylist: stylists[0]?.name || "",
    service: services[0]?.name || "",
    date: "",
    time: "",
    notes: "",
  });

  /**
   * Hàm cập nhật giá trị của một trường cụ thể trong form:
   * Sử dụng computed property name `[key]: value` kết hợp Spread Operator `...prev`
   * để chỉ thay đổi trường được chọn mà giữ nguyên các trường khác.
   * @param key - Tên trường cần cập nhật (ví dụ: 'name', 'phone', 'service')
   * @param value - Giá trị mới người dùng vừa nhập hoặc chọn
   */
  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  /**
   * Hàm xử lý khi người dùng nhấn nút "Đặt Lịch Ngay":
   * 1. e.preventDefault(): Ngăn chặn reload trình duyệt (Single Page Application UX).
   * 2. addBooking(form): Gọi action của Zustand store để lưu thông tin đặt lịch vào state.
   * 3. alert(): Hiển thị thông báo xác nhận thành công cho người dùng.
   * @param e - Đối tượng FormEvent từ React
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBooking(form);
    alert("Đã nhận yêu cầu đặt lịch. Concierge sẽ xác nhận trong ít phút!");
  };

  // Chuỗi class CSS tái sử dụng cho các ô nhập liệu (Input, Select, Textarea)
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
      {/* Hàng 1: Họ tên và Số điện thoại */}
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

      {/* Hàng 2: Chọn Stylist và Dịch vụ */}
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

      {/* Hàng 3: Chọn Ngày và Giờ hẹn */}
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

      {/* Hàng 4: Ghi chú tình trạng tóc hoặc yêu cầu riêng */}
      <div>
        <label className="text-[10px] font-semibold text-charcoal uppercase tracking-wider">Ghi chú</label>
        <textarea
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          className={`${inputClass} min-h-[120px]`}
          placeholder="Kiểu tóc mong muốn, tình trạng tóc, lịch trình..."
        />
      </div>

      {/* Nút Submit kích hoạt sự kiện onSubmit của form */}
      <Button variant="primary" fullWidth className="rounded-full py-3.5 uppercase tracking-wider text-xs">
        Đặt Lịch Ngay
      </Button>
    </motion.form>
  );
};

export default BookingForm;
