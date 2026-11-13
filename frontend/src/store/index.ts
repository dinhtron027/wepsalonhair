import { create } from "zustand";
import { stylists } from "../constant/data";
import { services as servicesData, Service } from "../features/services/serviceData";

/**
 * Định nghĩa cấu trúc kiểu dữ liệu của một bản ghi lịch hẹn khách hàng (Booking Entity)
 * phục vụ quản lý trạng thái phía Client.
 */
type Booking = {
  name: string;        // Tên khách hàng đặt lịch
  phone: string;       // Số điện thoại liên hệ
  stylist: string;     // Tên chuyên viên tạo mẫu tóc được chọn
  service: string;     // Tên dịch vụ làm tóc khách lựa chọn
  date: string;        // Ngày hẹn (định dạng YYYY-MM-DD)
  time: string;        // Khung giờ hẹn (ví dụ: 10:00, 14:30)
  notes?: string;      // Ghi chú thêm từ khách hàng (tùy chọn)
};

/**
 * Interface mô tả trạng thái (State) và các hành động (Actions) của Salon Store:
 * Quản lý danh sách dịch vụ, danh sách stylist, mảng lịch hẹn và bộ lọc danh mục.
 */
type SalonState = {
  services: Service[];
  stylists: typeof stylists;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  filter: string;
  setFilter: (category: string) => void;
};

/**
 * useSalonStore: Zustand Store quản lý trạng thái tập trung của Salon phía Client:
 * 
 * Ưu điểm so với Redux truyền thống:
 * - Không cần cấu hình rườm rà (boilerplate), không cần Action Types, Reducers, Dispatchers phức tạp.
 * - Cơ chế hook nhẹ gọn, dễ đọc, chỉ re-render những component nào thực sự lắng nghe dữ liệu bị thay đổi.
 * 
 * Các phương thức:
 * - addBooking: Thêm mới một lịch hẹn vào mảng bookings bằng kỹ thuật Immutability (Spread Operator `[...state.bookings, booking]`).
 * - setFilter: Thay đổi danh mục lọc dịch vụ đang chọn.
 */
const useSalonStore = create<SalonState>((set) => ({
  services: servicesData,
  stylists,
  bookings: [],
  filter: "Tất cả",

  /**
   * Thêm lịch hẹn mới vào danh sách trạng thái cục bộ:
   * Áp dụng nguyên tắc Bất biến (Immutability): Tạo mảng mới kết hợp mảng cũ và bản ghi mới.
   * @param booking - Đối tượng thông tin lịch hẹn vừa tạo
   */
  addBooking: (booking) =>
    set((state) => ({
      bookings: [...state.bookings, booking],
    })),

  /**
   * Cập nhật danh mục dịch vụ đang được lọc.
   * @param category - Tên danh mục được chọn (ví dụ: "Cắt & Tạo Kiểu", "Tất cả")
   */
  setFilter: (category) => set(() => ({ filter: category })),
}));

export default useSalonStore;
