import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../hooks/useAuth";

/**
 * Kiểu dữ liệu Props cho component bảo vệ tuyến đường ProtectedRoute:
 * - children: Nội dung/Giao diện cần bảo vệ (ví dụ: AdminLayout).
 * - allowRoles: Danh sách các quyền được phép truy cập (ví dụ: ["admin"]).
 * - redirectTo: Trang chuyển hướng khi chưa đăng nhập (mặc định: "/login").
 * - unauthorizedRedirectTo: Trang chuyển hướng khi đã đăng nhập nhưng không đủ quyền (mặc định: "/").
 */
type ProtectedRouteProps = {
  children: ReactNode;
  allowRoles?: UserRole[];
  redirectTo?: string;
  unauthorizedRedirectTo?: string;
};

/**
 * Component ProtectedRoute (Bộ định tuyến bảo vệ):
 * Đóng vai trò 'người gác cổng' trong React Router DOM.
 * Ngăn chặn người dùng truy cập trái phép vào các trang nội bộ (Admin Dashboard):
 * 1. Kiểm tra mã Token đăng nhập: Nếu chưa đăng nhập -> chuyển hướng về /login kèm vị trí trang hiện tại.
 * 2. Kiểm tra vai trò (Role): Nếu tài khoản không thuộc allowRoles -> đẩy về trang chủ /.
 * 3. Nếu thỏa mãn cả 2 điều kiện -> Render component con bên trong (children).
 */
const ProtectedRoute = ({
  children,
  allowRoles,
  redirectTo = "/login",
  unauthorizedRedirectTo = "/",
}: ProtectedRouteProps) => {
  const location = useLocation();
  const token = useAuth((state) => state.token);
  const getCurrentUser = useAuth((state) => state.getCurrentUser);
  const user = getCurrentUser();

  // Trường hợp 1: Người dùng chưa có token (chưa đăng nhập)
  if (!token) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  // Trường hợp 2: Có yêu cầu phân quyền cụ thể nhưng vai trò người dùng không khớp
  if (allowRoles && allowRoles.length > 0) {
    if (!user || !allowRoles.includes(user.role)) {
      return <Navigate to={unauthorizedRedirectTo} replace />;
    }
  }

  // Thỏa mãn quyền truy cập: hiển thị nội dung được bảo vệ
  return <>{children}</>;
};

export default ProtectedRoute;
