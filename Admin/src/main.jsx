import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, Navigate, } from "react-router-dom";

import AdminLogin from "./components/AdminLogin.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import UserRole from "./components/UserRole.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<Navigate to="/login" replace />} />
      <Route path="login" element={<AdminLogin />} />
      <Route path="dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="user-role" element={<AdminRoute><UserRole /></AdminRoute>} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
