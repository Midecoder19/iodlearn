import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentAPI } from "../utils/lmsApi";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

// Render/state logger for reproducing the callback state sequence.
const logState = (label, state) => {
  const ts = performance.now().toFixed(1);
  console.log(`%c[PAYCALLBACK ${ts}ms] ${label}`, "color:#0ea5e9;font-weight:bold", state);
};

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState("Verifying payment...");
  const [loading, setLoading] = useState(true);

  logState("RENDER", { status, loading, ref: searchParams.get("reference") });

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");
      logState("VERIFY_START", { reference });

      if (!reference) {
        setStatus("No payment reference provided.");
        setLoading(false);
        toast.error("Missing payment reference.");
        return;
      }

      try {
        const response = await paymentAPI.verify(reference);
        logState("VERIFY_RESOLVED", { status: response.status, body: response.data });
        setStatus(response.data.message || "Payment verified successfully.");
        setLoading(false);
        toast.success("Payment verified successfully.");

        const courseId = response.data.course?.id;
        setTimeout(() => {
          if (courseId) {
            navigate(`/course/${courseId}`);
          } else {
            navigate("/courses");
          }
        }, 1800);
      } catch (err) {
        logState("VERIFY_REJECTED", { status: err.response?.status, body: err.response?.data });
        setStatus(err.response?.data?.error || "Payment verification failed.");
        setLoading(false);
        toast.error(err.response?.data?.error || "Payment verification failed.");
      }
    };

    verifyPayment();
  }, [navigate, searchParams, user]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 shadow-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Payment Status</h1>
        <div className="mb-6 text-slate-600 dark:text-slate-300">
          {loading ? "Checking your payment on Paystack..." : status}
        </div>
        <div className="space-x-2">
          <button
            onClick={() => navigate("/courses")}
            className="px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Browse Courses
          </button>
          {!loading && (
            <button
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {user ? "Go to Dashboard" : "Sign in"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
