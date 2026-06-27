import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { ROUTES } from "@/routes/paths";
import PageLoader from "@/components/ui/PageLoader";

export default function PublicRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={user.role === "ADMIN" ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD} replace />;
  }

  return <Outlet />;
}
