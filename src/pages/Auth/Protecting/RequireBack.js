import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";
import LoadingScreen from "../../../Components/Loading/Loading";

export default function RequireBack() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
}
