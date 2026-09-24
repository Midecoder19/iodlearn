import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className=" h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Please log in to access this content.",
        }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          message: "You don't have permission to access this page.",
        }}
      />
    );
  }

  return children;
};

export const StudentRoute = ({ children }) => (
  <PrivateRoute allowedRoles={["student"]}><>{children}</></PrivateRoute>
);

export const MentorRoute = ({ children }) => (
  <PrivateRoute allowedRoles={["mentor"]}><>{children}</></PrivateRoute>
);

export const AdminRoute = ({ children }) => (
  <PrivateRoute allowedRoles={["admin"]}><>{children}</></PrivateRoute>
);

export default PrivateRoute;