import {
  addDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isToday,
  format as fnsFormat,
} from "date-fns";
import { vi } from "date-fns/locale";

// Luôn sử dụng múi giờ hệ thống của trình duyệt/người dùng
export const getSystemDate = (): Date => {
  return new Date();
};

export const formatInVi = (date: Date, formatStr: string): string => {
  return fnsFormat(date, formatStr, { locale: vi });
};

// Khung giờ hoạt động của Salon: 08:00 -> 20:00
export const getSalonHours = (): string[] => {
  const hours: string[] = [];
  for (let h = 8; h <= 20; h++) {
    hours.push(`${String(h).padStart(2, "0")}:00`);
  }
  return hours;
};

// Lấy danh sách 7 ngày trong tuần chứa ngày đang chọn (Thứ 2 -> Chủ nhật)
export const getDaysInWeek = (date: Date): Date[] => {
  // Bắt đầu tuần từ Thứ hai (weekStartsOn: 1)
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return days;
};

// Lấy danh sách các ngày để hiển thị trên lưới tháng (35 hoặc 42 ngày bao gồm ngày của tháng trước/sau)
export const getDaysInMonthGrid = (date: Date): Date[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  // Bắt đầu lưới từ Thứ hai của tuần chứa ngày đầu tháng
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  // Kết thúc lưới tại Chủ nhật của tuần chứa ngày cuối tháng
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days: Date[] = [];
  let current = gridStart;
  
  // Thêm các ngày từ gridStart đến gridEnd
  while (current <= gridEnd || days.length < 35) {
    days.push(current);
    current = addDays(current, 1);
  }
  
  return days;
};

export const isDateSame = (date1: Date, date2: Date): boolean => {
  return isSameDay(date1, date2);
};

export const isDateToday = (date: Date): boolean => {
  return isToday(date);
};

// Helper để parse chuỗi ngày giờ từ API
export const parseBookingDate = (dateStr: string, timeStr: string): Date => {
  // Tránh việc bị lệch múi giờ khi parse bằng cách chỉ lấy phần YYYY-MM-DD
  const datePart = dateStr.slice(0, 10);
  return new Date(`${datePart}T${timeStr}:00`);
};

import { BookingStatus } from "../../../services/adminApi";

export const statusLabelMap: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  in_service: "Đang phục vụ",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};
