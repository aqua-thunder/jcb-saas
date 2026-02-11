import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // ❌ Not logged in → redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // ✅ Logged in
  return <Outlet />;
};

export default ProtectedRoute;
