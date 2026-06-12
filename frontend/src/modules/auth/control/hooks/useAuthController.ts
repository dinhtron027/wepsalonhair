import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../store/authStore";
import { getApiErrorMessage } from "../../../../services/api";
import type { LoginCredentials } from "../ports/IAuthService";
import { AppError } from "../../../../shared/entity/AppError";

const NETWORK_ERROR_TOAST =
  "Lỗi kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc backend.";

const isNetworkError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  if (error instanceof AppError) {
    if (error.statusCode === 0) {
      return true;
    }

    return /network error/i.test(error.message);
  }

  if (error instanceof Error) {
    return /network error/i.test(error.message);
  }

  return false;
};

export const useAuthController = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = useAuth((state) => state.token);
  const login = useAuth((state) => state.login);
  const loginWithGoogle = useAuth((state) => state.loginWithGoogle);
  const loginWithFacebook = useAuth((state) => state.loginWithFacebook);
  const getCurrentUser = useAuth((state) => state.getCurrentUser);
  const isLoading = useAuth((state) => state.isLoading);

  useEffect(() => {
    if (!token) {
      return;
    }

    const currentUser = getCurrentUser();
    if (currentUser?.role?.toLowerCase() === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    navigate("/", { replace: true });
  }, [token, getCurrentUser, navigate]);

  const submitLogin = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const user = await login(credentials);
      toast.success("Đăng nhập thành công!");

      if (user.role.toLowerCase() === "admin") {
        navigate("/admin", { replace: true });
        return true;
      }

      const fromPath = (location.state as { from?: string } | null)?.from || "/";
      navigate(fromPath, { replace: true });
      return true;
    } catch (error) {
      if (isNetworkError(error)) {
        toast.error(NETWORK_ERROR_TOAST);
        return false;
      }

      toast.error(getApiErrorMessage(error, "Xác thực không thành công. Kiểm tra lại thông tin nhé."));
      return false;
    }
  };

  const submitGoogleLogin = async (idToken: string): Promise<boolean> => {
    try {
      const user = await loginWithGoogle(idToken);
      toast.success("Đăng nhập bằng Google thành công!");

      if (user.role.toLowerCase() === "admin") {
        navigate("/admin", { replace: true });
        return true;
      }

      const fromPath = (location.state as { from?: string } | null)?.from || "/";
      navigate(fromPath, { replace: true });
      return true;
    } catch (error) {
      if (isNetworkError(error)) {
        toast.error(NETWORK_ERROR_TOAST);
        return false;
      }

      toast.error(getApiErrorMessage(error, "Không thể kết nối Google/Facebook"));
      return false;
    }
  };

  const submitFacebookLogin = async (accessToken: string): Promise<boolean> => {
    try {
      const user = await loginWithFacebook(accessToken);
      toast.success("Đăng nhập bằng Facebook thành công!");

      if (user.role.toLowerCase() === "admin") {
        navigate("/admin", { replace: true });
        return true;
      }

      const fromPath = (location.state as { from?: string } | null)?.from || "/";
      navigate(fromPath, { replace: true });
      return true;
    } catch (error) {
      if (isNetworkError(error)) {
        toast.error(NETWORK_ERROR_TOAST);
        return false;
      }

      toast.error(getApiErrorMessage(error, "Không thể kết nối Google/Facebook"));
      return false;
    }
  };

  return {
    isLoading,
    submitLogin,
    submitGoogleLogin,
    submitFacebookLogin
  };
};
