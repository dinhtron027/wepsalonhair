import axios, { AxiosError, AxiosResponse } from "axios";
import { API_BASE_URL } from "./runtimeConfig";

/**
 * Định nghĩa cấu trúc chuẩn của phản hồi API (API Response Envelope):
 * Backend quy ước trả về dạng chuẩn: { success, message, data, meta }
 */
type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: unknown;
};

/**
 * Khởi tạo Axios Instance dùng chung cho toàn bộ ứng dụng:
 * - baseURL: Đường dẫn gốc của Backend (ví dụ: http://localhost:5000 hoặc https://api.salonduongchi.website).
 * - timeout: Thời gian chờ tối đa 15 giây; nếu server không phản hồi sẽ tự hủy request và báo lỗi.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const decodeText = (value: string) => value.trim().toLowerCase();

/**
 * Kiểm tra xem nội dung trả về có phải là tài liệu HTML hay không (thường do Nginx trả về trang lỗi 404/502).
 */
const looksLikeHtmlDocument = (value: unknown) =>
  typeof value === "string" && /^\s*<(?:!doctype html|html)\b/i.test(value);

const isApiUrl = (value?: string) =>
  typeof value === "string" && (/(?:^|\/)api(?:\/|$)/i.test(value) || /socket\.io/i.test(value));

const createInvalidApiResponseError = () => {
  const error = new Error("Invalid API response format");
  (error as { code?: string }).code = "ERR_BAD_RESPONSE";
  return error;
};

/**
 * Hàm phân tích và trích xuất thông báo lỗi thân thiện cho người dùng:
 * - Ưu tiên thông điệp cụ thể trả về từ Backend (ví dụ: "Sản phẩm hết hàng", "Email đã tồn tại").
 * - Nếu lỗi mạng, server sập hoặc quá thời gian (Timeout), chuyển thành "Lỗi kết nối server".
 * @param error - Đối tượng lỗi bắt được từ catch
 * @param fallback - Thông báo mặc định nếu không xác định được nguyên nhân
 */
export const getApiErrorMessage = (error: unknown, fallback = "Co loi xay ra") => {
  if (error && typeof error === "object" && "statusCode" in error && "message" in error) {
    const appError = error as { statusCode: number; message: string };
    if (appError.statusCode >= 500) {
      const msg = appError.message;
      if (msg && msg !== "Loi ket noi server" && msg !== "Network Error" && !/timeout/i.test(msg)) {
        return msg;
      }
      return "Loi ket noi server";
    }
    return appError.message;
  }

  const axiosError = error as AxiosError<{ message?: string }>;
  const backendMessage = axiosError.response?.data?.message;

  if (typeof backendMessage === "string" && backendMessage.trim()) {
    const normalized = decodeText(backendMessage);
    if (normalized.includes("khong du ton kho") || normalized.includes("het hang")) {
      return "San pham het hang";
    }
    return backendMessage;
  }

  if (axiosError.code === "ECONNABORTED" || !axiosError.response) {
    return "Loi ket noi server";
  }

  if ((axiosError.response?.status || 0) >= 500) {
    return "Loi ket noi server";
  }

  return fallback;
};

/**
 * Hàm giải nén dữ liệu từ Envelope phản hồi của Backend:
 * Nếu response trả về { data: ... } thì lấy data bên trong; nếu trả về data trực tiếp thì lấy trực tiếp.
 * Đồng thời chặn các trường hợp Nginx trả về nhầm file index.html thay vì JSON.
 */
export const extractApiData = <T>(response: AxiosResponse<ApiEnvelope<T> | T>) => {
  const payload = response.data;
  const normalizedPayload =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as ApiEnvelope<T>).data
      : payload;

  if (looksLikeHtmlDocument(normalizedPayload)) {
    throw createInvalidApiResponseError();
  }

  return normalizedPayload as T;
};

/**
 * REQUEST INTERCEPTOR (Bộ đánh chặn yêu cầu gửi đi):
 * Trước khi mỗi request được gửi tới Backend, interceptor tự động kiểm tra xem trong LocalStorage
 * có lưu mã JWT Token hay không. Nếu có, đính kèm vào HTTP Header: `Authorization: Bearer <token>`.
 */
api.interceptors.request.use(
  (config) => {
    let token = null;
    try {
      token = localStorage.getItem("token");
    } catch (e) {
      console.warn("localStorage.getItem is not available in api interceptor:", e);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR (Bộ đánh chặn phản hồi trả về):
 * Xử lý dữ liệu và bắt các lỗi tập trung trước khi trả về cho component:
 * 1. Kiểm tra Content-Type tránh nhận HTML thay vì JSON.
 * 2. Xử lý lỗi 401 Unauthorized (hết hạn token hoặc chưa đăng nhập): Tự động xóa token rác
 *    trong LocalStorage và chuyển hướng người dùng về trang /login kèm đường dẫn hiện tại.
 */
api.interceptors.response.use(
  (response) => {
    const contentTypeValue = response.headers?.["content-type"];
    const contentType = Array.isArray(contentTypeValue)
      ? contentTypeValue.join(";")
      : String(contentTypeValue || "");

    if (
      isApiUrl(response.config?.url) &&
      (looksLikeHtmlDocument(response.data) || contentType.toLowerCase().includes("text/html"))
    ) {
      return Promise.reject(createInvalidApiResponseError());
    }

    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    const message = getApiErrorMessage(error);
    
    // Tự động chuyển hướng về trang Đăng nhập nếu token hết hạn hoặc chưa đăng nhập (HTTP 401)
    if (error.response?.status === 401 || message.toLowerCase().includes("chua dang nhap") || message.toLowerCase().includes("chưa đăng nhập")) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        // Xóa token hết hạn khỏi LocalStorage để tránh vòng lặp chuyển hướng vô tận
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("salon-auth-storage");
        } catch (e) {
          console.warn("Could not clear auth token", e);
        }
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    const normalizedError = error as AxiosError<{ message?: string }> & {
      userMessage?: string;
    };
    normalizedError.userMessage = message;
    return Promise.reject(normalizedError);
  }
);

export default api;
