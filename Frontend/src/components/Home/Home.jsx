import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import toast from "react-hot-toast";
import { courseAPI } from "../../utils/lmsApi";
import BlurFade from "../ui/BlurFade";
import SEO from "../SEO";
import {
  GraduationCap,
  BookOpen,
  Users,
  Star,
  ArrowRight,
  Shield,
  Zap,
  Award
} from "lucide-react";
import hero3d from "../../assets/hero_3d.png";

const float = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function Home() {
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    courseAPI.getAll({ limit: 8 })
      .then((res) => setCourses(res.data.courses || []))
      .catch(() => { });
  }, []);

  const featuredCourses = courses.slice(0, 4);
  const popularCourses = courses.slice(0, 6);

  return (
    <div className="relative">
      <SEO 
        title="Home"
        description="Iodlearn - Your gateway to online learning. Discover expert-led courses in programming, web development, data science, and more. Start your learning journey today."
        keywords="online learning, courses, programming, web development, data science, mentorship, education"
        ogUrl="https://iodlearn.vercel.app/"
      />
      <main className="relative z-1 text-gray-900 dark:text-white overflow-hidden">
        {/* ================= HERO ================= */}
        <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-32">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-500/30 blur-[80px] rounded-full pointer-events-none z-0" />
          <div className="absolute top-20 -left-40 w-[400px] h-[400px] bg-pink-500/20 blur-[80px] rounded-full pointer-events-none z-0" />

          <BlurFade inView className="grid lg:grid-cols-2 gap-20 items-center relative z-20">
            <div>
              <span className="inline-flex items-center mb-5 px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-white/10 dark:text-gray-100 text-xs tracking-wide">
                <GraduationCap size={16} className="mr-2" /> Learning Platform
              </span>

              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white">
                Learn from
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-amber-200 dark:to-cyan-200">
                  Expert Mentors
                </span>
              </h1>

              <p className="mt-6 text-gray-600 dark:text-indigo-200 max-w-xl">
                Access high-quality courses taught by industry experts. 
                Build your skills and advance your career with our curated learning path.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/courses")}
                  className="flex items-center px-6 py-4 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 dark:bg-white dark:text-indigo-700 dark:hover:bg-gray-100 hover:scale-105 transition"
                >
                  <BookOpen size={18} className="mr-2" /> Browse Courses
                </button>
                <button
                  onClick={() => navigate("/become-mentor")}
                  className="flex items-center px-6 py-4 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/20 transition"
                >
                  Become a Tutor
                </button>
              </div>
            </div>

            <div className="relative h-auto md:h-[500px] flex flex-col items-center justify-center mt-12 md:mt-0">
              <motion.div {...float} className="relative z-10 w-full max-w-[280px] sm:max-w-[350px] md:max-w-[450px]">
                <img src={hero3d} alt="Learning Platform" className="w-full h-auto drop-shadow-[0_20px_50px_rgba(79,70,229,0.3)]" />
              </motion.div>
            </div>
          </BlurFade>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Why Choose Our Platform?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                <BookOpen size={28} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert-Led Courses</h3>
              <p className="text-gray-600 dark:text-gray-300">Learn from industry professionals with years of experience.</p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <Shield size={28} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Certificate of Completion</h3>
              <p className="text-gray-600 dark:text-gray-300">Earn recognized certificates upon course completion.</p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <Zap size={28} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lifetime Access</h3>
              <p className="text-gray-600 dark:text-gray-300">Access your courses anytime, anywhere with lifetime updates.</p>
            </div>
          </div>
        </section>

        {/* ================= FEATURED COURSES ================= */}
        {courses.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 py-20 bg-gray-50 dark:bg-white/5">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <span className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">featured</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
                Featured Courses
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-3">
                Start learning from expert mentors
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCourses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:shadow-xl transition-all"
                >
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <BookOpen size={32} className="text-white/50" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users size={14} />
                        <span>{course.enrolledStudents?.length || 0}</span>
                      </div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {course.isPaid ? `₦${(course.price / 100).toLocaleString()}` : "Free"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => navigate("/courses")}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                View All Courses →
              </button>
            </div>
          </section>
        )}

        {/* ================= POPULAR COURSES ================= */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Popular Courses</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Most popular courses among students</p>
          </div>

          {courses.length === 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularCourses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:shadow-xl transition-all"
                >
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <BookOpen size={32} className="text-white/50" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {course.category && (
                        <span className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                          {course.category}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{course.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users size={14} />
                        <span>{course.enrolledStudents?.length || 0}</span>
                      </div>
                      {course.rating > 0 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={14} className="fill-amber-500" />
                          <span>{course.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= CTA ================= */}
        <section className="relative text-center py-32 bg-indigo-600">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-pink-500/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-5xl font-extrabold mb-6 text-white">
              Start Learning Today
            </h2>
            <p className="text-indigo-100 mb-10 max-w-xl mx-auto">
              Join thousands of students already learning on our platform.
            </p>
            <button
              onClick={() => navigate("/courses")}
              className="flex items-center mx-auto px-10 py-4 rounded-xl bg-white text-indigo-700 font-semibold shadow-xl hover:scale-105 transition"
            >
              Browse Courses <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;