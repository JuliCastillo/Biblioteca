import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "administrador" | "usuario";
}
const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (requiredRole && user?.rol !== requiredRole) return <Navigate to="/" replace />;
  return <>{children}</>;
};
export default ProtectedRoute;
