import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { courseAPI, mentorshipAPI } from "../../utils/lmsApi";
import { Link } from "react-router-dom";
import { BookOpen, Clock, DollarSign, CheckCircle } from "lucide-react";

const MentorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [createdCourses, setCreatedCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const [coursesRes, sessionsRes] = await Promise.all([
          courseAPI.getMyCreated(),
          mentorshipAPI.getMySessions("mentor")
        ]);

        setCreatedCourses(coursesRes.data || []);
        setSessions(sessionsRes.data || []);
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
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3 text-indigo-600"><BookOpen size={20} /></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Courses Created</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{createdCourses.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3 text-emerald-600"><CheckCircle size={20} /></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Completed Sessions</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{sessions.filter((s) => s.status === "completed").length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3 text-cyan-600"><Clock size={20} /></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Pending Sessions</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{sessions.filter((s) => s.status === "pending").length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-3 text-amber-600"><DollarSign size={20} /></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Total Sessions</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{sessions.length}</p>
            </div>
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
      </div>
    </div>
  );
};

export default MentorDashboard;
