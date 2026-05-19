import React, { useState, useEffect } from "react";
import { Search, Filter, Trash2, MoreVertical, ChevronDown, User, GraduationCap, Shield, Activity, Calendar, Mail } from "lucide-react";
import { adminAPI } from "../utils/lmsApi";
import toast from "react-hot-toast";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await adminAPI.getUsers();
                setUsers(res.data.users || res.data || []);
            } catch (err) {
                toast.error("Failed to fetch users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await adminAPI.deleteUser(userId);
            setUsers(users.filter(u => u._id !== userId));
            toast.success("User deleted");
        } catch (err) {
            toast.error("Failed to delete user");
        }
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    const filteredUsers = users.filter(user => {
        if (filter !== "all" && user.role !== filter) return false;
        if (search && !user.name?.toLowerCase().includes(search.toLowerCase()) && 
            !user.email?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const getRoleIcon = (role) => {
        switch (role) {
            case "admin": return <Shield size={16} className="text-red-500" />;
            case "mentor": return <GraduationCap size={16} className="text-amber-500" />;
            default: return <User size={16} className="text-blue-500" />;
        }
    };

    const getActivityStatus = (user) => {
        const daysSinceJoin = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
        if (daysSinceJoin < 7) return { status: "New", color: "bg-green-100 text-green-700" };
        if (daysSinceJoin < 30) return { status: "Active", color: "bg-blue-100 text-blue-700" };
        return { status: "Established", color: "bg-gray-100 text-gray-700" };
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5"
                    />
                </div>
                <div className="flex gap-2">
                    {["all", "student", "mentor", "admin"].map(role => (
                        <button
                            key={role}
                            onClick={() => setFilter(role)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                                filter === role 
                                ? "bg-indigo-600 text-white" 
                                : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                            }`}
                        >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-indigo-500 animate-pulse">Loading users...</div>
            ) : (
                <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-white/5">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                            {filteredUsers.map(user => {
                                const activity = getActivityStatus(user);
                                return (
                                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 font-bold">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium dark:text-white">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getRoleIcon(user.role)}
                                                <span className="text-sm capitalize">{user.role}</span>
                                                {user.isMentorApproved && (
                                                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Approved</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${activity.color}`}>
                                                {activity.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewUser(user)}
                                                    className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition"
                                                    title="View details"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="p-8 text-center text-gray-500">No users found</div>
                    )}
                </div>
            )}

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold dark:text-white">User Details</h3>
                            <button
                                onClick={() => setShowUserModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
                                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                    {selectedUser.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg dark:text-white">{selectedUser.name}</h4>
                                    <p className="text-gray-500 text-sm">{selectedUser.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                        <User size={14} />
                                        Role
                                    </div>
                                    <p className="font-medium dark:text-white capitalize">{selectedUser.role}</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                        <Calendar size={14} />
                                        Joined
                                    </div>
                                    <p className="font-medium dark:text-white">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {selectedUser.mentorProfile && (
                                <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                    <h5 className="font-medium dark:text-white mb-2">Mentor Profile</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{selectedUser.mentorProfile.bio}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.mentorProfile.expertise?.map((exp, i) => (
                                            <span key={i} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs rounded-lg">
                                                {exp}
                                            </span>
                                        ))}
                                    </div>
                                    {selectedUser.mentorProfile.commissionRate && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                            <span className="font-medium">Commission Rate:</span> {selectedUser.mentorProfile.commissionRate}%
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                <h5 className="font-medium dark:text-white mb-2">Activity Stats</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Enrolled Courses</p>
                                        <p className="font-medium dark:text-white">{selectedUser.enrolledCourses?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Created Courses</p>
                                        <p className="font-medium dark:text-white">{selectedUser.createdCourses?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Wishlist</p>
                                        <p className="font-medium dark:text-white">{selectedUser.wishlist?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Verified</p>
                                        <p className="font-medium dark:text-white">{selectedUser.verified ? "Yes" : "No"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;