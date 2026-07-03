import axios, { AxiosError, AxiosResponse } from "axios";
import { API_BASE_URL } from "./runtimeConfig";

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: unknown;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const decodeText = (value: string) => value.trim().toLowerCase();
const looksLikeHtmlDocument = (value: unknown) =>
  typeof value === "string" && /^\s*<(?:!doctype html|html)\b/i.test(value);
const isApiUrl = (value?: string) =>
  typeof value === "string" && (/(?:^|\/)api(?:\/|$)/i.test(value) || /socket\.io/i.test(value));
const createInvalidApiResponseError = () => {
  const error = new Error("Invalid API response format");
  (error as { code?: string }).code = "ERR_BAD_RESPONSE";
  return error;
};

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
    const normalizedError = error as AxiosError<{ message?: string }> & {
      userMessage?: string;
    };
    normalizedError.userMessage = message;
    return Promise.reject(normalizedError);
  }
);

export default api;
