import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import { BACKEND_BASE } from "../utils/lmsApi";

const Backurl = BACKEND_BASE;

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const role = location.state?.role || localStorage.getItem('intendedRole') || 'student';

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resending, setResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState(null);
  const [unblockCountdown, setUnblockCountdown] = useState(0);

  useEffect(() => {
    if (!email) {
      toast.error("Email not found. Please register again.");
      navigate("/register");
    }
    // Log role for debugging
    console.log("VerifyOTP - Role from state:", location.state?.role);
    console.log("VerifyOTP - Role from localStorage:", localStorage.getItem('intendedRole'));
    console.log("VerifyOTP - Final role:", role);
  }, [email, role]);

  // Auto focus on first OTP box
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  // Unblock countdown timer
  useEffect(() => {
    if (!blockedUntil) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.max(Math.ceil((blockedUntil - now) / 1000), 0);
      setUnblockCountdown(secondsLeft);

      if (secondsLeft === 0) {
        setBlocked(false);
        setBlockedUntil(null);
        setResendCount(0);
        setOtpDigits(["", "", "", "", "", ""]);
        toast.info(
          <span className="flex items-center">
            <CheckCircle2 size={16} className="mr-1" /> You are now unblocked. Please try again.
          </span>
        );
        setTimeout(() => {
          navigate("/register");
        }, 1500);
      }
      
    }, 1000);

    return () => clearInterval(interval);
  }, [blockedUntil, navigate]);

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join("");

    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits of the OTP.");
      return;
    }

    const normalizedEmail = (email || "").trim().toLowerCase();

    setLoading(true);
    try {
      const res = await axios.post(`${Backurl}/api/auth/verify-otp`, {
        email: normalizedEmail,
        otp,
      });

      toast.success(res.data.message || "Verified successfully");
      
      console.log("Verification successful, role:", role);
      
      // Clear localStorage after use
      localStorage.removeItem('intendedRole');
      
      // Redirect based on role
      // Mentor-track users land on the normal dashboard with a pending
      // application banner; they are NOT locked into the application form.
      if (role === 'mentor') {
        toast.success("Welcome! Your mentor application is pending review.");
        setTimeout(() => {
          console.log("Redirecting to /dashboard");
          navigate("/dashboard");
        }, 2000);
      } else {
        setTimeout(() => {
          console.log("Redirecting to /login");
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // Always check resend limit locally
    if (resendCount >= 3) {
      if (!blocked) {
        setBlocked(true);
        const unblockAt = Date.now() + 10 * 60 * 1000;
        setBlockedUntil(unblockAt);
        toast.error("You've reached the maximum OTP resend limit. Please try again after 10 minutes.");
      }
      return;
    }

    if (timer > 0 || resending || blocked) return;

    setResending(true);
    try {
      const normalizedEmail = (email || "").trim().toLowerCase();
      const res = await axios.post(`${Backurl}/api/auth/resend-otp`, { email: normalizedEmail });

      toast.success(res.data.message || "OTP resent to your email");

      setTimer(30);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setResendCount((prev) => prev + 1);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend OTP";
      toast.error(msg);

      // If user is already verified, redirect to login
      if (err.response?.status === 400 && msg.includes('already verified')) {
        setTimeout(() => navigate("/login"), 2000);
      }

      if (err.response?.status === 403) {
        setBlocked(true);
        const unblockAt = err.response?.data?.unblockAt;
        if (unblockAt) {
          setBlockedUntil(new Date(unblockAt).getTime());
        }
      }
    } finally {
      setResending(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-200 dark:from-gray-900 dark:to-gray-800 px-4 py-8">

      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
        <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Email Verification
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 text-center">
          Enter the 6-digit OTP sent to{" "}
          <span className="font-semibold">{email}</span>
        </p>

        {blocked && unblockCountdown > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
            <p className="text-center text-sm text-yellow-700 dark:text-yellow-300">
              OTP resend limit reached. You can try again in:{" "}
              {Math.floor(unblockCountdown / 60)}m {unblockCountdown % 60}s
            </p>
          </div>
        )}

        <form onSubmit={handleOTPVerify}>
          <div className="flex justify-center gap-2 mb-6">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={blocked}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg 
                  focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white 
                  transition-all duration-200
                  ${
                    blocked
                      ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-50"
                      : "hover:border-indigo-400"
                  }`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || blocked}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResendOTP}
            disabled={timer > 0 || resending || blocked || resendCount >= 3}
            className={`text-sm font-medium transition duration-200 ${
              timer > 0 || resending || blocked || resendCount >= 3
                ? "text-gray-400 cursor-not-allowed"
                : "text-indigo-600 hover:text-indigo-700 hover:underline"
            }`}
          >
            {resending
              ? "Resending..."
              : timer > 0
              ? `Resend OTP in ${timer}s`
              : "Resend OTP"}
          </button>

          <p className="text-xs mt-2 text-gray-500 dark:text-gray-400 text-center">
            Resend attempts: {resendCount} of 3
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <button
            onClick={() => navigate("/register")}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            ← Back to Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
