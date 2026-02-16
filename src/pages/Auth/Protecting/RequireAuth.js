import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";
import LoadingScreen from "../../../Components/Loading/Loading";
import Err403 from "../Errors/403";

export default function RequireAuth({ allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (
    allowedRole &&
    !allowedRole.includes(Number(user.role?.id))
  ) {
    return <Err403 />;
  }

  return <Outlet />;
}
