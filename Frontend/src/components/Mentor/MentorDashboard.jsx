import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { courseAPI, mentorshipAPI, paymentAPI } from "../../utils/lmsApi";
import { Link } from "react-router-dom";
import { BookOpen, Clock, DollarSign, CheckCircle, Wallet, ArrowUpRight, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

const MentorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [createdCourses, setCreatedCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: ""
  });

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const [coursesRes, sessionsRes, walletRes] = await Promise.all([
          courseAPI.getMyCreated(),
          mentorshipAPI.getMySessions("mentor"),
          paymentAPI.getMentorEarnings()
        ]);

        setCreatedCourses(coursesRes.data || []);
        setSessions(sessionsRes.data || []);
        setWalletData(walletRes.data);
      } catch (err) {
        console.error("Mentor dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "mentor") {
      fetchMentorData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 500) {
      toast.error("Minimum withdrawal is ₦500");
      return;
    }
    if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName) {
      toast.error("Please fill in all bank details");
      return;
    }
    if (parseFloat(withdrawAmount) > (walletData?.availableBalance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    try {
      await paymentAPI.withdraw(parseFloat(withdrawAmount), bankDetails.bankName, bankDetails.accountNumber, bankDetails.accountName);
      toast.success("Withdrawal request submitted successfully");
      setShowWithdrawModal(false);
      setWithdrawAmount("");
      setBankDetails({ bankName: "", accountNumber: "", accountName: "" });
      // Refresh wallet data
      const walletRes = await paymentAPI.getMentorEarnings();
      setWalletData(walletRes.data);
    } catch (err) {
      toast.error("Failed to submit withdrawal request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (user?.role !== "mentor") {
    return (
      <div className="min-h-screen px-4 py-10 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Mentor Access Required</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">You need an approved mentor account to view this dashboard.</p>
          <Link to="/become-mentor" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700">
            Apply to Become a Mentor
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Mentor Dashboard</h1>
              <p className="mt-3 text-slate-600 dark:text-slate-300">Manage your courses, view booked sessions, and track your earnings.</p>
            </div>
            <Link
              to="/create-course"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700 transition-colors"
            >
              <BookOpen size={20} />
              Create Course
            </Link>
          </div>
          
          {/* Wallet & Earnings Section */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <div className="flex items-center gap-3 text-green-600"><Wallet size={20} /></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Available Balance</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                ₦{(walletData?.availableBalance || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center gap-3 text-blue-600"><TrendingUp size={20} /></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Total Earnings</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                ₦{(walletData?.totalEarnings || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <div className="flex items-center gap-3 text-amber-600"><Clock size={20} /></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Pending Balance</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                ₦{(walletData?.pendingBalance || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="flex items-center gap-3 text-purple-600"><ArrowUpRight size={20} /></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Total Withdrawn</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                ₦{(walletData?.totalWithdrawn || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Commission Rate Display */}
          {user?.mentorProfile?.commissionRate && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Your commission rate: <span className="font-bold">{user.mentorProfile.commissionRate}%</span> 
                  (You keep {100 - user.mentorProfile.commissionRate}% of course sales)
                </span>
              </div>
            </div>
          )}

          {/* Withdraw Button */}
          <div className="mt-4">
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={(walletData?.availableBalance || 0) < 500}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-white hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <ArrowUpRight size={20} />
              Request Withdrawal
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Courses</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Created by you</h2>
              </div>
              <Link to="/courses" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Browse Courses</Link>
            </div>
            <div className="mt-6 space-y-4">
              {createdCourses.length > 0 ? (createdCourses.slice(0, 4).map((course) => (
                <Link key={course._id} to={`/course/${course._id}`} className="block rounded-3xl border border-slate-200 dark:border-slate-800 p-4 hover:border-indigo-300 dark:hover:border-indigo-500">
                  <p className="font-semibold text-slate-900 dark:text-white">{course.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.category || course.level}</p>
                </Link>
              ))) : (
                <p className="text-slate-500">No courses created yet. Start building one.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mentorship</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Session requests</h2>
              </div>
              <Link to="/mentor" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Refresh</Link>
            </div>
            <div className="mt-6 space-y-4">
              {sessions.length > 0 ? sessions.slice(0, 4).map((session) => (
                <div key={session._id} className="rounded-3xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950">
                  <p className="font-semibold text-slate-900 dark:text-white">{session.title || "Session request"}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{session.status} · {session.duration} mins</p>
                </div>
              )) : (
                <p className="text-slate-500">No mentorship sessions yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        {walletData?.transactions && walletData.transactions.length > 0 && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {walletData.transactions.slice(-5).reverse().map((txn, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{txn.description}</p>
                    <p className="text-sm text-slate-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-semibold ${txn.type === 'earning' ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.type === 'earning' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold dark:text-white">Request Withdrawal</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Available Balance: <span className="font-bold">₦{(walletData?.availableBalance || 0).toLocaleString()}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="500"
                  max={walletData?.availableBalance || 0}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                  placeholder="Enter amount (min ₦500)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                  placeholder="e.g., Access Bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                  placeholder="10-digit account number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                  placeholder="Account holder name"
                />
              </div>

              <button
                onClick={handleWithdraw}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition"
              >
                Submit Withdrawal Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
