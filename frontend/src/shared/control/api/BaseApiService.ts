import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { AppError } from "../../entity/AppError";
import { extractApiData } from "../../../services/api";

export abstract class BaseApiService {
  protected constructor(private readonly http: AxiosInstance) {}

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.http.get(url, config);
      return extractApiData<T>(response);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  protected async post<T, B = unknown>(
    url: string,
    payload: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.http.post(url, payload, config);
      return extractApiData<T>(response);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  protected async put<T, B = unknown>(
    url: string,
    payload: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.http.put(url, payload, config);
      return extractApiData<T>(response);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  protected async patch<T, B = unknown>(
    url: string,
    payload: B,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.http.patch(url, payload, config);
      return extractApiData<T>(response);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.http.delete(url, config);
      return extractApiData<T>(response);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private normalizeError(error: unknown): AppError {
    const axiosError = error as AxiosError<{ message?: string }>;
    const statusCode = axiosError.response?.status || 500;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Loi ket noi server";

    return new AppError(statusCode, message);
  }
}
