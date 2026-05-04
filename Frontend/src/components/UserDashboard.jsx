import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { courseAPI } from "../utils/lmsApi";
import { Link } from "react-router-dom";
import { BookOpen, Users, Award, UserCheck } from "lucide-react";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mentorCourses, setMentorCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const enrolledRes = await courseAPI.getMyCourses();
        setCourses(enrolledRes.data || []);

        if (user?.role === "mentor") {
          const mentorRes = await courseAPI.getMyCreated();
          setMentorCourses(mentorRes.data || []);
        }
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen px-4 py-10 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Welcome back, {user?.name || "Learner"}</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-300">Your learning dashboard is ready. Continue your progress, view your courses, and access mentor resources.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3 text-indigo-600"><BookOpen size={20} /></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Enrolled Courses</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{courses.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3 text-emerald-600"><Users size={20} /></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Your Role</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{user?.role || "student"}</p>
            </div>
            {user?.role === "mentor" && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center gap-3 text-amber-600"><Award size={20} /></div>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Mentor Courses</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{mentorCourses.length}</p>
              </div>
            )}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3 text-cyan-600"><UserCheck size={20} /></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Account Status</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{user?.isMentorApproved ? "Approved" : "Active"}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Continue learning</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">My Courses</h2>
              </div>
              <Link to="/courses" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Browse</Link>
            </div>
            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-slate-500">Loading course list...</p>
              ) : courses.length > 0 ? (
                courses.slice(0, 3).map((course) => (
                  <Link key={course._id} to={`/course/${course._id}`} className="block rounded-3xl border border-slate-200 dark:border-slate-800 p-4 hover:border-indigo-300 dark:hover:border-indigo-500">
                    <p className="font-semibold text-slate-900 dark:text-white">{course.title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{course.category || "Course"}</p>
                  </Link>
                ))
              ) : (
                <p className="text-slate-500">You have no enrolled courses yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 xl:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile Summary</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{user?.name}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{user?.email}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Username</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{user?.username || "N/A"}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Role</p>
                <p className="mt-2 font-medium text-slate-900 dark:text-white">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
