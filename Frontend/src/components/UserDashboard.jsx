import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { courseAPI } from "../utils/lmsApi";
import { Link } from "react-router-dom";
import { BookOpen, Users, Award, UserCheck, Clock, CheckCircle, XCircle, GraduationCap } from "lucide-react";
import { mentorApplicationAPI } from "../utils/lmsApi";

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mentorCourses, setMentorCourses] = useState([]);
  const [mentorApp, setMentorApp] = useState(null);
  const [appLoading, setAppLoading] = useState(false);

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

  // Fetch mentor application status for mentor-track users so the
  // pending application can be surfaced as a banner instead of a lockout.
  useEffect(() => {
    if (!user || user.role !== "mentor") return;
    let cancelled = false;
    setAppLoading(true);
    mentorApplicationAPI
      .getMyApplication()
      .then((res) => {
        if (!cancelled) setMentorApp(res.data?.application || res.data || null);
      })
      .catch(() => { /* no application yet — that's fine */ })
      .finally(() => { if (!cancelled) setAppLoading(false); });
    return () => { cancelled = true; };
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

        {/* Mentor application status banner — mentor-track users stay on the
        normal dashboard; their pending application is surfaced here. */}
        {user?.role === "mentor" && mentorApp && (
          <div className={`rounded-3xl border p-6 mt-6 flex items-center justify-between gap-4 flex-wrap ${
            mentorApp.status === "pending"
              ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700"
              : mentorApp.status === "approved"
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700"
                : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-700"
          }`}>
            <div className="flex items-center gap-3">
              {mentorApp.status === "pending" ? (
                <Clock size={22} className="text-amber-600" />
              ) : mentorApp.status === "approved" ? (
                <CheckCircle size={22} className="text-emerald-600" />
              ) : (
                <XCircle size={22} className="text-rose-600" />
              )}
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Mentor Application — {mentorApp.status.charAt(0).toUpperCase() + mentorApp.status.slice(1)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {mentorApp.status === "pending"
                    ? "Your mentor application is under review. You can still browse and purchase courses as a student."
                    : mentorApp.status === "approved"
                      ? "You are approved as a mentor. Visit the mentor dashboard to create courses."
                      : "Your mentor application was rejected. You can still use the platform as a student."}
                </p>
              </div>
            </div>
            <Link
              to="/become-mentor"
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              {mentorApp.status === "approved" ? "Mentor Dashboard" : "View Application"}
            </Link>
          </div>
        )}

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
