import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

type AdminRouteProps = {
  children: ReactNode;
};

const AdminRoute = ({ children }: AdminRouteProps) => {
  const location = useLocation();
  const token = useAuth((state) => state.token);
  const isAdmin = useAuth((state) => state.isAdmin);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
