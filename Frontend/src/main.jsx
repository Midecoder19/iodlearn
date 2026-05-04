import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements, Navigate, } from "react-router-dom";

import Home from "./components/Home/Home.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import About from "./components/About/About.jsx";
import VerifyOTP from "./components/VerifyOTP.jsx";
import ForgotPassword from "./components/Authentication/ForgotPassword.jsx";
import ResetPassword from "./components/Authentication/ResetPassword.jsx";
import UserProfile from "./components/Profile/UserProfile.jsx";
import PublicProfile from "./components/Profile/PublicProfile.jsx";
import PPolicy from "./components/Footer/PPolicy.jsx";
import TOS from "./components/Footer/TOS.jsx";
import CoursesPage from "./components/Courses/CoursesPage.jsx";
import CourseDetailPage from "./components/Courses/CourseDetailPage.jsx";
import ApplyAsMentor from "./components/Mentor/ApplyAsMentor.jsx";
import PaymentCallback from "./components/PaymentCallback.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import MentorDashboard from "./components/Mentor/MentorDashboard.jsx";
import CreateCourse from "./components/Mentor/CreateCourse.jsx";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onOfflineReady() {
    console.log("PWA is ready for offline use.");
  },
  onNeedRefresh() {
    console.log("New content is available and will be used on reload.");
  }
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <>


      <Route path="/" element={<App />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/u/:username" element={<PublicProfile />} />
        <Route path="/privacy-policy" element={<PPolicy />} />
        <Route path="/terms-of-service" element={<TOS />} />


        {/* Private Routes */}
        <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />

        {/* Course Routes */}
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/course/:id" element={<CourseDetailPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
        <Route path="/mentor" element={<PrivateRoute><MentorDashboard /></PrivateRoute>} />
        <Route path="/create-course" element={<PrivateRoute><CreateCourse /></PrivateRoute>} />
        <Route path="/become-mentor" element={<PrivateRoute><ApplyAsMentor /></PrivateRoute>} />




        {/* Redirect to login if route does not exist */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </>
  )
);


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>


    <AuthProvider>
      <RouterProvider router={router} />

    </AuthProvider>
  </React.StrictMode>
);
