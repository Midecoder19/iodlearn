import React, { useState, useEffect } from "react";
import { Check, X, Search, UserCheck, Eye, DollarSign, Calendar, Briefcase, GraduationCap, Link } from "lucide-react";
import { adminAPI } from "../utils/lmsApi";
import toast from "react-hot-toast";

const MentorManagement = () => {
    const [applications, setApplications] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("applications");
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showApplicationModal, setShowApplicationModal] = useState(false);
    const [commissionRate, setCommissionRate] = useState(10);

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

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
        setCommissionRate(application.commissionRate || 10);
        setShowApplicationModal(true);
    };

    const handleApprove = async () => {
        if (!selectedApplication) return;
        try {
            await adminAPI.approveMentor(selectedApplication._id, commissionRate);
            setApplications(applications.map(app => 
                app._id === selectedApplication._id ? { ...app, status: "approved" } : app
            ));
            toast.success(`Mentor approved with ${commissionRate}% commission!`);
            setShowApplicationModal(false);
            setSelectedApplication(null);
            // Refresh mentors list
            const mentorsRes = await adminAPI.getMentors();
            setMentors(mentorsRes.data || []);
        } catch (err) {
            toast.error("Failed to approve mentor");
        }
    };

    const handleReject = async () => {
        if (!selectedApplication) return;
        const reason = prompt("Enter rejection reason (optional):");
        if (reason === null) return; // User cancelled
        try {
            await adminAPI.rejectMentor(selectedApplication._id, reason || "");
            setApplications(applications.map(app => 
                app._id === selectedApplication._id ? { ...app, status: "rejected" } : app
            ));
            toast.success("Mentor application rejected");
            setShowApplicationModal(false);
            setSelectedApplication(null);
        } catch (err) {
            toast.error("Failed to reject application");
        }
    };

    const handleQuickReject = async (applicationId) => {
        const reason = prompt("Enter rejection reason (optional):");
        if (reason === null) return;
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
                                            <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{app.bio}</p>
                                            <div className="flex gap-2 mt-2">
                                                {app.expertise?.slice(0, 3).map((exp, i) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-xs rounded-lg">
                                                        {exp}
                                                    </span>
                                                ))}
                                                {app.expertise?.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-xs rounded-lg">
                                                        +{app.expertise.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewApplication(app)}
                                            className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                                            title="View full profile"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleQuickReject(app._id)}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                            title="Reject"
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
                                        {mentor.mentorProfile.commissionRate && (
                                            <div className="mt-2 flex items-center gap-2 text-sm">
                                                <DollarSign size={14} className="text-green-500" />
                                                <span className="text-gray-600 dark:text-gray-300">
                                                    Commission: <span className="font-bold text-green-600">{mentor.mentorProfile.commissionRate}%</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Application Detail Modal */}
            {showApplicationModal && selectedApplication && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold dark:text-white">Mentor Application Details</h3>
                            <button
                                onClick={() => setShowApplicationModal(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Personal Info */}
                            <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
                                <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                                    {selectedApplication.fullName?.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl dark:text-white">{selectedApplication.fullName}</h4>
                                    <p className="text-gray-500">{selectedApplication.email}</p>
                                    {selectedApplication.phone && (
                                        <p className="text-gray-500 text-sm">{selectedApplication.phone}</p>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div>
                                <h5 className="font-medium dark:text-white mb-2 flex items-center gap-2">
                                    <Briefcase size={16} />
                                    Bio
                                </h5>
                                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                                    {selectedApplication.bio}
                                </p>
                            </div>

                            {/* Expertise */}
                            <div>
                                <h5 className="font-medium dark:text-white mb-2 flex items-center gap-2">
                                    <GraduationCap size={16} />
                                    Areas of Expertise
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                    {selectedApplication.expertise?.map((exp, i) => (
                                        <span key={i} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-sm rounded-lg">
                                            {exp}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Experience */}
                            {selectedApplication.experience && (
                                <div>
                                    <h5 className="font-medium dark:text-white mb-2 flex items-center gap-2">
                                        <Calendar size={16} />
                                        Experience
                                    </h5>
                                    <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                                        {selectedApplication.experience}
                                    </p>
                                </div>
                            )}

                            {/* Qualifications */}
                            {selectedApplication.qualifications && (
                                <div>
                                    <h5 className="font-medium dark:text-white mb-2">Qualifications</h5>
                                    <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                                        {selectedApplication.qualifications}
                                    </p>
                                </div>
                            )}

                            {/* Social Links */}
                            <div>
                                <h5 className="font-medium dark:text-white mb-2 flex items-center gap-2">
                                    <Link size={16} />
                                    Social Links
                                </h5>
                                <div className="space-y-2">
                                    {selectedApplication.linkedin && (
                                        <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer" 
                                           className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-2">
                                            LinkedIn Profile
                                        </a>
                                    )}
                                    {selectedApplication.twitter && (
                                        <a href={selectedApplication.twitter} target="_blank" rel="noopener noreferrer"
                                           className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-2">
                                            Twitter Profile
                                        </a>
                                    )}
                                    {selectedApplication.portfolio && (
                                        <a href={selectedApplication.portfolio} target="_blank" rel="noopener noreferrer"
                                           className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-2">
                                            Portfolio
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Commission Rate Setting */}
                            <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-xl border border-green-200 dark:border-green-500/20">
                                <h5 className="font-medium dark:text-white mb-3 flex items-center gap-2">
                                    <DollarSign size={16} className="text-green-600" />
                                    Set Commission Rate
                                </h5>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={commissionRate}
                                        onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                                        className="flex-1"
                                    />
                                    <div className="text-2xl font-bold text-green-600 w-16 text-center">
                                        {commissionRate}%
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                    Mentor will keep <span className="font-bold">{100 - commissionRate}%</span> of course sales
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
                                <button
                                    onClick={handleApprove}
                                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                                >
                                    <Check size={20} />
                                    Approve with {commissionRate}% Commission
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
                                >
                                    <X size={20} />
                                    Reject Application
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorManagement;