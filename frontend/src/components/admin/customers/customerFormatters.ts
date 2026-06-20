import type { BookingStatus, CustomerNoteType } from "../../../services/adminApi";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa có";

export const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString("vi-VN") : "Chưa có";

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  in_service: "Đang phục vụ",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const noteTypeLabels: Record<CustomerNoteType, string> = {
  consultation: "Tư vấn",
  service: "Dịch vụ",
  complaint: "Khiếu nại",
  follow_up: "Chăm sóc lại",
  internal: "Nội bộ",
};
