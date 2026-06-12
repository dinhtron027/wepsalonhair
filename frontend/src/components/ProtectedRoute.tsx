import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../hooks/useAuth";

type ProtectedRouteProps = {
  children: ReactNode;
  allowRoles?: UserRole[];
  redirectTo?: string;
  unauthorizedRedirectTo?: string;
};

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

  if (!token) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (allowRoles && allowRoles.length > 0) {
    if (!user || !allowRoles.includes(user.role)) {
      return <Navigate to={unauthorizedRedirectTo} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
