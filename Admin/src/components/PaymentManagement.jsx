import React, { useState, useEffect } from "react";
import { Search, DollarSign, Calendar, Filter, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Users, BookOpen, CheckCircle, XCircle, Clock } from "lucide-react";
import { adminAPI } from "../utils/lmsApi";
import toast from "react-hot-toast";

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [revenueData, setRevenueData] = useState(null);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("payments");
    const [filter, setFilter] = useState("all");
    const [summary, setSummary] = useState({ totalTransactions: 0, totalAmount: 0, totalCommission: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [paymentsRes, revenueRes, withdrawalsRes] = await Promise.all([
                    adminAPI.getPayments(),
                    adminAPI.getRevenue(),
                    adminAPI.getWithdrawals("pending")
                ]);
                setPayments(paymentsRes.data.payments || []);
                setSummary(paymentsRes.data.summary || {});
                setRevenueData(revenueRes.data);
                setWithdrawals(withdrawalsRes.data || []);
            } catch (err) {
                toast.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    const filteredPayments = payments.filter(p => {
        if (filter === "all") return true;
        if (filter === "success" && p.paymentStatus !== "success") return false;
        if (filter === "pending" && p.paymentStatus !== "pending") return false;
        if (filter === "failed" && p.paymentStatus !== "failed") return false;
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "success": return "bg-green-100 text-green-700";
            case "pending": return "bg-yellow-100 text-yellow-700";
            case "failed": return "bg-red-100 text-red-700";
            case "approved": return "bg-blue-100 text-blue-700";
            case "rejected": return "bg-red-100 text-red-700";
            case "completed": return "bg-green-100 text-green-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const handleProcessWithdrawal = async (withdrawalId, action) => {
        const adminNotes = action === "reject" ? prompt("Enter rejection reason:") : "";
        if (action === "reject" && adminNotes === null) return;
        
        try {
            await adminAPI.processWithdrawal(withdrawalId, action, adminNotes);
            toast.success(`Withdrawal ${action}d successfully`);
            setWithdrawals(withdrawals.filter(w => w._id !== withdrawalId));
        } catch (err) {
            toast.error("Failed to process withdrawal");
        }
    };

    return (
        <div className="space-y-6">
            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <DollarSign size={20} className="text-green-500" />
                        <span className="text-sm font-medium">Total Revenue</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">
                        ₦{(revenueData?.totalRevenue || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{revenueData?.totalTransactions || 0} transactions</div>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <TrendingUp size={20} className="text-indigo-500" />
                        <span className="text-sm font-medium">Admin Earnings</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">
                        ₦{(revenueData?.adminRevenue || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Platform commission</div>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <Users size={20} className="text-amber-500" />
                        <span className="text-sm font-medium">Mentor Earnings</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">
                        ₦{(revenueData?.mentorRevenue || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">After commission</div>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <Wallet size={20} className="text-purple-500" />
                        <span className="text-sm font-medium">Pending Withdrawals</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">
                        {withdrawals.length}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Awaiting approval</div>
                </div>
            </div>

            {/* Revenue by Uploader */}
            {revenueData?.byUploader && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                        <h4 className="font-medium dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen size={18} />
                            Admin Courses Revenue
                        </h4>
                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                            ₦{(revenueData.byUploader.admin?.revenue || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{revenueData.byUploader.admin?.count || 0} sales</div>
                    </div>
                    <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                        <h4 className="font-medium dark:text-white mb-4 flex items-center gap-2">
                            <Users size={18} />
                            Mentor Courses Revenue
                        </h4>
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                            ₦{(revenueData.byUploader.mentor?.revenue || 0).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">{revenueData.byUploader.mentor?.count || 0} sales</div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 dark:border-white/10">
                <button
                    onClick={() => setActiveTab("payments")}
                    className={`px-4 py-2 text-sm font-medium transition ${
                        activeTab === "payments"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Transactions
                </button>
                <button
                    onClick={() => setActiveTab("withdrawals")}
                    className={`px-4 py-2 text-sm font-medium transition ${
                        activeTab === "withdrawals"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Withdrawals ({withdrawals.length})
                </button>
                <button
                    onClick={() => setActiveTab("revenue")}
                    className={`px-4 py-2 text-sm font-medium transition ${
                        activeTab === "revenue"
                        ? "text-indigo-600 border-b-2 border-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                    Revenue Breakdown
                </button>
            </div>

            {activeTab === "payments" && (
                <>
                    {/* Filters */}
                    <div className="flex gap-2">
                        {["all", "success", "pending", "failed"].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                                    filter === f
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-indigo-500 animate-pulse">Loading payments...</div>
                    ) : (
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-white/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin Share</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentor Share</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                                    {filteredPayments.map(payment => (
                                        <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-mono text-gray-500">{payment.transactionRef}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm dark:text-white">{payment.user?.name}</div>
                                                <div className="text-xs text-gray-500">{payment.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm dark:text-white">
                                                {payment.course?.title}
                                                <div className="text-xs text-gray-500 capitalize">{payment.uploaded_by}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium dark:text-white">
                                                ₦{(payment.amount || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-indigo-600">
                                                ₦{(payment.platformEarnings || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-amber-600">
                                                ₦{(payment.tutorEarnings || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-lg ${getStatusColor(payment.paymentStatus)}`}>
                                                    {payment.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredPayments.length === 0 && (
                                <div className="p-8 text-center text-gray-500">No payments found</div>
                            )}
                        </div>
                    )}
                </>
            )}

            {activeTab === "withdrawals" && (
                <div className="space-y-4">
                    {withdrawals.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No pending withdrawals</div>
                    ) : (
                        withdrawals.map(withdrawal => (
                            <div key={withdrawal._id} className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 font-bold">
                                            {withdrawal.userName?.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold dark:text-white">{withdrawal.userName}</h4>
                                            <p className="text-gray-500 text-sm">{withdrawal.userEmail}</p>
                                            <div className="mt-2 text-sm">
                                                <span className="text-gray-500">Bank:</span> {withdrawal.bankDetails?.bankName}
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-gray-500">Account:</span> {withdrawal.bankDetails?.accountNumber}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            ₦{withdrawal.amount.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                                    <button
                                        onClick={() => handleProcessWithdrawal(withdrawal._id, "approve")}
                                        className="flex-1 bg-green-500 text-white py-2 rounded-xl font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={18} />
                                        Approve & Transfer
                                    </button>
                                    <button
                                        onClick={() => handleProcessWithdrawal(withdrawal._id, "reject")}
                                        className="flex-1 bg-red-500 text-white py-2 rounded-xl font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === "revenue" && revenueData && (
                <div className="space-y-6">
                    {/* Top Mentors */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-6">
                        <h4 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={20} />
                            Top Mentors by Revenue
                        </h4>
                        <div className="space-y-3">
                            {revenueData.byMentor?.map((mentor, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                    <div>
                                        <div className="font-medium dark:text-white">{mentor.mentorName}</div>
                                        <div className="text-sm text-gray-500">{mentor.mentorEmail}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-green-600">₦{mentor.totalRevenue.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">{mentor.transactionCount} sales</div>
                                    </div>
                                </div>
                            ))}
                            {(!revenueData.byMentor || revenueData.byMentor.length === 0) && (
                                <div className="text-center text-gray-500">No mentor revenue data</div>
                            )}
                        </div>
                    </div>

                    {/* Top Courses */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 p-6">
                        <h4 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen size={20} />
                            Top Courses by Revenue
                        </h4>
                        <div className="space-y-3">
                            {revenueData.byCourse?.map((course, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                                    <div>
                                        <div className="font-medium dark:text-white">{course.courseTitle}</div>
                                        <div className="text-sm text-gray-500 capitalize">
                                            {course.uploadedBy === "admin" ? "Admin" : "Mentor"} Course
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-indigo-600">₦{course.totalRevenue.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">{course.salesCount} sales</div>
                                    </div>
                                </div>
                            ))}
                            {(!revenueData.byCourse || revenueData.byCourse.length === 0) && (
                                <div className="text-center text-gray-500">No course revenue data</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentManagement;