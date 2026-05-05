// App.jsx
import "./index.css";
import React from "react";
import { useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import CookieConsent from "react-cookie-consent";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import LoadingBar from "./components/Header/LoadingBar.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ScrollToTop from "./components/Home/ScrollToTop.jsx";

function App() {
  const location = useLocation();

  const googleClientId = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID || "";
  if (!googleClientId) {
    console.warn("Missing VITE_APP_GOOGLE_CLIENT_ID. Set this environment variable in Vercel for Google login to work.");
  }

  return (
    <>
      <Toaster position="top-center" />
      <GoogleOAuthProvider clientId={googleClientId}>
        <ThemeProvider>
          <LoadingBar />

          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-black dark:via-indigo-950 dark:to-black text-gray-900 dark:text-white">
            <Header />

            {/* ScrollToTop handles both auto-scroll and floating button */}
            <ScrollToTop showButton={true} threshold={50} />

            <Outlet />
            <Footer />
          </div>

          <CookieConsent
            location="bottom"
            buttonText="Accept Cookies"
            declineButtonText="Decline"
            cookieName="iodlearn-cookie-consent"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              fontSize: "14px",
              padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            buttonStyle={{
              background: "#fff",
              color: "#667eea",
              fontSize: "14px",
              fontWeight: "600",
              borderRadius: "8px",
              padding: "10px 20px",
              margin: "0 10px",
            }}
            declineButtonStyle={{
              background: "transparent",
              color: "#fff",
              fontSize: "14px",
              border: "1px solid #fff",
              borderRadius: "8px",
              padding: "10px 20px",
            }}
            expires={365}
            onAccept={() => {
              // Optional: Enable analytics or other cookies
              console.log("Cookies accepted");
            }}
            onDecline={() => {
              // Optional: Disable non-essential cookies
              console.log("Cookies declined");
            }}
          >
            🍪 This website uses cookies to improve your experience. By accepting, you agree to our use of cookies.{" "}
            <a
              href="/privacy-policy"
              style={{ color: "#fff", textDecoration: "underline" }}
            >
              Privacy Policy
            </a>
          </CookieConsent>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
