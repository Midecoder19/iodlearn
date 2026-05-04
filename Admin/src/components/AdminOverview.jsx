import React, { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { Users, BookOpen, DollarSign, Award, GraduationCap, TrendingUp } from "lucide-react";
import { courseAPI, adminAPI } from "../utils/lmsApi";

const AdminOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [adminStats, coursesData, paymentsData] = await Promise.all([
                    adminAPI.getStats(),
                    courseAPI.getAll({ limit: 10 }),
                    adminAPI.getPayments({ status: "success" })
                ]);
                
                setStats({
                    ...adminStats.summary,
                    courses: coursesData.courses?.length || 0,
                    totalRevenue: paymentsData.data?.summary?.totalAmount || 0,
                    userGrowth: adminStats.userGrowth || [],
                    platforms: adminStats.platforms || { github: 0, leetcode: 0 }
                });
            } catch (err) {
                console.error("Failed to fetch admin stats:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-indigo-500 animate-pulse">Loading Analytics...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load stats: {error}</div>;
    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load stats.</div>;

    const COLORS = ["#6366F1", "#EC4899", "#10B981", "#F59E0B"];

    const platformData = [
        { name: "Students", value: stats.totalUsers - (stats.totalMentors || 0) },
        { name: "Mentors", value: stats.totalMentors || 0 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <Users size={20} />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">{stats.totalUsers || 0}</div>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400">
                            <GraduationCap size={20} />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Mentors</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">{stats.totalMentors || 0}</div>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <BookOpen size={20} />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Courses</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">{stats.courses || 0}</div>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                            <DollarSign size={20} />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</span>
                    </div>
                    <div className="text-2xl font-bold dark:text-white">
                        ₦{(stats.totalRevenue || 0).toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Chart */}
                <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Users size={20} className="text-indigo-500" /> User Growth Trends
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.userGrowth || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Distribution */}
                <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-pink-500" /> User Distribution
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={platformData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {platformData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;