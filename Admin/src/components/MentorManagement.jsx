import React, { useState, useEffect } from "react";
import { Check, X, Search, UserCheck } from "lucide-react";
import { adminAPI } from "../utils/lmsApi";
import toast from "react-hot-toast";

const MentorManagement = () => {
    const [applications, setApplications] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("applications");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appsRes, mentorsRes] = await Promise.all([
                    adminAPI.getMentorApplications(),
                    adminAPI.getMentors()
                ]);
                setApplications(appsRes.data || []);
                setMentors(mentorsRes.data || []);
            } catch (err) {
                toast.error("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApprove = async (applicationId) => {
        try {
            await adminAPI.approveMentor(applicationId);
            setApplications(applications.map(app => 
                app._id === applicationId ? { ...app, status: "approved" } : app
            ));
            toast.success("Mentor approved!");
            // Refresh mentors list
            const mentorsRes = await adminAPI.getMentors();
            setMentors(mentorsRes.data || []);
        } catch (err) {
            toast.error("Failed to approve mentor");
        }
    };

    const handleReject = async (applicationId) => {
        const reason = prompt("Enter rejection reason (optional):");
        try {
            await adminAPI.rejectMentor(applicationId, reason || "");
            setApplications(applications.map(app => 
                app._id === applicationId ? { ...app, status: "rejected" } : app
            ));
            toast.success("Mentor application rejected");
        } catch (err) {
            toast.error("Failed to reject application");
        }
    };

    const pendingApps = applications.filter(app => app.status === "pending");
    const reviewedApps = applications.filter(app => app.status !== "pending");

    return (
        <div className="space-y-6">
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab("applications")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                        activeTab === "applications"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                    }`}
                >
                    Applications ({pendingApps.length})
                </button>
                <button
                    onClick={() => setActiveTab("mentors")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                        activeTab === "mentors"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                    }`}
                >
                    Approved Mentors ({mentors.length})
                </button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-indigo-500 animate-pulse">Loading...</div>
            ) : activeTab === "applications" ? (
                <div className="space-y-4">
                    {pendingApps.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No pending applications</div>
                    ) : (
                        pendingApps.map(app => (
                            <div key={app._id} className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 text-xl font-bold">
                                            {app.fullName?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg dark:text-white">{app.fullName}</h3>
                                            <p className="text-gray-500 text-sm">{app.email}</p>
                                            <p className="text-gray-600 dark:text-gray-300 mt-2">{app.bio}</p>
                                            <div className="flex gap-2 mt-2">
                                                {app.expertise?.map((exp, i) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-xs rounded-lg">
                                                        {exp}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(app._id)}
                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleReject(app._id)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mentors.length === 0 ? (
                        <div className="col-span-full p-8 text-center text-gray-500">No approved mentors</div>
                    ) : (
                        mentors.map(mentor => (
                            <div key={mentor._id} className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 font-bold">
                                        {mentor.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold dark:text-white">{mentor.name}</h3>
                                        <p className="text-gray-500 text-sm">{mentor.email}</p>
                                    </div>
                                </div>
                                {mentor.mentorProfile && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/10">
                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                            {mentor.mentorProfile.bio}
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            {mentor.mentorProfile.expertise?.slice(0, 3).map((exp, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-xs rounded-lg">
                                                    {exp}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MentorManagement;