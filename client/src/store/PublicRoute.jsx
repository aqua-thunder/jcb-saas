import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // ✅ Already logged in → redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // ❌ Not logged in → allow public pages
  return <Outlet />;
};

export default PublicRoute;
