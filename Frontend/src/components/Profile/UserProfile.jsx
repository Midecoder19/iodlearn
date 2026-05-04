import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
    FaBook, FaGraduationCap, FaClock, FaCheckCircle,
    FaPlayCircle, FaExternalLinkAlt, FaShieldAlt, FaUser
} from "react-icons/fa";
import EditProfileModal from "./EditProfileModal";
import { Link } from "react-router-dom";
import { progressAPI, courseAPI } from "../../utils/lmsApi";
import toast from "react-hot-toast";

const Backurl = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

const UserProfile = () => {
  const { user, setUser, updateUser } = useContext(AuthContext);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserCourses();
  }, []);

  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      const [coursesRes, progressRes] = await Promise.all([
        courseAPI.getMyCourses(),
        progressAPI.getAllProgress()
      ]);

      const courses = coursesRes.data;
      const progressData = progressRes.data;

      // Combine course data with progress
      const coursesWithProgress = courses.map(course => {
        const progress = progressData.find(p => p.course._id === course._id);
        return {
          ...course,
          progress: progress || { progressPercent: 0, completedLessons: [], isCompleted: false }
        };
      });

      setEnrolledCourses(coursesWithProgress);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Failed to load course data");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const totalCourses = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(course => course.progress.isCompleted).length;
  const totalProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress.progressPercent, 0) / enrolledCourses.length)
    : 0;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black/95 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Identity Card */}
            <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-zinc-800 p-8"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                             <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
                                <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden">
                                     {user.avatar ? (
                                        <img src={user.avatar} className="w-full h-full object-cover" />
                                     ) : <span className="text-3xl font-bold uppercase">{user.name[0]}</span>}
                                </div>
                             </div>
                             {user.isPublic && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 shadow-sm" title="Publicly visible" />
                             )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{user.name}</h1>
                            <div className="flex items-center gap-3">
                                <span className="text-indigo-500 font-bold">@{user.username}</span>
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-[10px] rounded-md font-bold uppercase text-gray-500">{user.role}</span>
                            </div>
                            <div className="mt-3 flex gap-2">
                                {user.isPublic ? (
                                    <Link to={`/u/${user.username}`} className="flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-indigo-500 transition-colors">
                                        <FaExternalLinkAlt /> VIEW PUBLIC PROFILE
                                    </Link>
                                ) : (
                                    <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1"><FaShieldAlt /> PRIVATE PROFILE</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end justify-center bg-indigo-50 dark:bg-indigo-900/10 px-8 py-4 rounded-3xl">
                         <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
                            {totalCourses}
                         </div>
                         <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-1">Enrolled Courses</div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 dark:border-zinc-800">
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl italic">"{user.bio || "Learning is a journey. Share your learning goals and achievements!"}"</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95">Edit Profile</button>
                        <Link to="/courses" className="px-5 py-2 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">Browse Courses</Link>
                    </div>
                </div>
            </motion.div>

            {/* Learning Stats Card */}
            <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8 flex flex-col justify-between"
            >
                <div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Learning Progress</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Courses Completed</span>
                            <span className="text-sm font-bold text-green-500">{completedCourses} / {totalCourses}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                            <span className="text-sm font-bold text-indigo-500">{totalProgress}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Enrolled</span>
                            <span className="text-sm font-bold text-purple-500">{totalCourses}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white">
                     <h4 className="text-xs font-black uppercase opacity-70 mb-2 tracking-wide">Learning Streak</h4>
                     <div className="text-2xl font-bold">Keep Learning!</div>
                     <p className="text-[10px] opacity-80 mt-1">Complete lessons daily to build consistent learning habits.</p>
                </div>
            </motion.div>
        </div>

        {/* Enrolled Courses Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 p-8"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight border-l-4 border-indigo-500 pl-4">My Courses</h3>
                <Link to="/courses" className="text-sm font-bold text-indigo-500 hover:underline">Browse More Courses →</Link>
            </div>

            {loading ? (
                <div className="py-12 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
            ) : enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledCourses.map((course) => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50/50 dark:bg-zinc-800/20 rounded-2xl border-2 border-dashed border-gray-100 dark:border-zinc-800">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                        <FaBook size={32} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">No courses enrolled yet</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">Start your learning journey by enrolling in courses that interest you.</p>
                    </div>
                    <Link to="/courses" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all">Explore Courses</Link>
                </div>
            )}
        </motion.div>

        {/* Learning Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<FaBook className="text-blue-500"/>} label="Courses Enrolled" value={totalCourses} color="blue" />
            <StatCard icon={<FaCheckCircle className="text-green-500" />} label="Courses Completed" value={completedCourses} color="green" />
            <StatCard icon={<FaGraduationCap className="text-purple-500" />} label="Overall Progress" value={`${totalProgress}%`} color="purple" />
        </div>

      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={user}
        onUpdate={(updatedUser) => updateUser(updatedUser)}
      />
    </div>
  );
};

const CourseCard = ({ course }) => {
    const progressPercent = course.progress?.progressPercent || 0;
    const isCompleted = course.progress?.isCompleted || false;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all"
        >
            <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-zinc-700 flex-shrink-0">
                    {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaBook size={24} />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-1 line-clamp-2">{course.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{course.category}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FaClock size={10} />
                        <span>{course.totalLessons || 0} lessons</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className={`font-bold ${isCompleted ? 'text-green-500' : 'text-indigo-500'}`}>
                        {progressPercent}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{course.progress?.completedLessons?.length || 0} / {course.totalLessons || 0} lessons</span>
                    {isCompleted && <FaCheckCircle className="text-green-500" size={12} />}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-600">
                <Link
                    to={`/course/${course._id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all"
                >
                    {isCompleted ? (
                        <>
                            <FaCheckCircle size={14} />
                            Review Course
                        </>
                    ) : (
                        <>
                            <FaPlayCircle size={14} />
                            Continue Learning
                        </>
                    )}
                </Link>
            </div>
        </motion.div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        blue: "bg-blue-50 dark:bg-blue-900/10 text-blue-600 border-blue-100 dark:border-blue-900/20",
        green: "bg-green-50 dark:bg-green-900/10 text-green-600 border-green-100 dark:border-green-900/20",
        purple: "bg-purple-50 dark:bg-purple-900/10 text-purple-600 border-purple-100 dark:border-purple-900/20"
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-6 rounded-3xl border ${colorClasses[color] || colorClasses.blue} transition-all shadow-sm`}
        >
            <div className="flex items-center gap-4">
                <div className="text-2xl">{icon}</div>
                <div>
                    <div className="text-2xl font-black">{value || 0}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-60">{label || ''}</div>
                </div>
            </div>
        </motion.div>
    );
};

export default UserProfile;
