import React, { useState, useEffect } from "react";
import { Search, DollarSign, Calendar, Filter } from "lucide-react";
import { adminAPI } from "../utils/lmsApi";
import toast from "react-hot-toast";

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [summary, setSummary] = useState({ totalTransactions: 0, totalAmount: 0, totalCommission: 0 });

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await adminAPI.getPayments();
                setPayments(res.data.payments || []);
                setSummary(res.data.summary || {});
            } catch (err) {
                toast.error("Failed to fetch payments");
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

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
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <DollarSign size={20} />
                        <span className="text-sm font-medium">Total Transactions</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">{summary.totalTransactions || 0}</div>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <DollarSign size={20} className="text-green-500" />
                        <span className="text-sm font-medium">Total Amount</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">
                        ₦{(summary.totalAmount || 0).toLocaleString()}
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-3 text-gray-500 mb-2">
                        <DollarSign size={20} className="text-amber-500" />
                        <span className="text-sm font-medium">Total Commission</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">
                        ₦{(summary.totalCommission || 0).toLocaleString()}
                    </div>
                </div>
            </div>

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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
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
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium dark:text-white">
                                        ₦{(payment.amount || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-amber-600">
                                        ₦{(payment.adminCommission || 0).toLocaleString()}
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
        </div>
    );
};

export default PaymentManagement;