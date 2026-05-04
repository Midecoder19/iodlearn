import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { XCircle, Hand, Notebook, Plus, FolderOpen, Users, ArrowRight, HelpCircle, FileText, LayoutDashboard, Settings, BookOpen, DollarSign, GraduationCap, UserCog } from "lucide-react";
import Breadcrumbs from "./Common/Breadcrumbs";
import AdminOverview from "./AdminOverview";
import UserManagement from "./UserManagement";
import MentorManagement from "./MentorManagement";
import CourseManagement from "./CourseManagement";
import CategoryManager from "./CategoryManager";
import PaymentManagement from "./PaymentManagement";
import { useState } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");

  const adminActions = [
    {
      id: "overview",
      icon: LayoutDashboard,
      title: "Dashboard Overview",
      desc: "View platform stats and analytics.",
      color: "from-indigo-500 to-blue-500",
    },
    {
      id: "users",
      icon: UserCog,
      title: "User Management",
      desc: "Manage students, mentors, and admins.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "mentors",
      icon: GraduationCap,
      title: "Mentor Management",
      desc: "Review and approve mentor applications.",
      color: "from-amber-500 to-orange-500",
    },
    {
      id: "courses",
      icon: BookOpen,
      title: "Course Management",
      desc: "View and manage all platform courses.",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "categories",
      icon: FolderOpen,
      title: "Category Management",
      desc: "Create and manage course categories.",
      color: "from-cyan-500 to-blue-500",
    },
    {
      id: "payments",
      icon: DollarSign,
      title: "Payments & Revenue",
      desc: "Track payments and commission earnings.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview />;
      case "users":
        return <UserManagement />;
      case "mentors":
        return <MentorManagement />;
      case "courses":
        return <CourseManagement />;
      case "categories":
        return <CategoryManager />;
      case "payments":
        return <PaymentManagement />;
      default:
        // For legacy routes, navigate to them
        return null;
    }
  };

  const handleTabClick = (tabId) => {
    const legacyRoutes = [];
    if (legacyRoutes.includes(tabId)) {
      window.location.href = `/${tabId}`;
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Elements */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-80 -left-40 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <Breadcrumbs items={[{ label: "Admin Dashboard" }]} />

        <motion.div {...fadeUp} className="mt-12 mb-8">
          <span className="inline-flex items-center mb-4 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-white/10 dark:text-indigo-300 text-xs font-medium">
            Administrative Control Panel
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            Welcome, Admin
            <motion.span
              animate={{ rotate: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Hand size={40} className="text-amber-400" />
            </motion.span>
          </h1>
          <p className="mt-4 text-gray-600 dark:text-indigo-200 max-w-2xl">
            Manage your platform content, users, and revenue efficiently.
          </p>
        </motion.div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {adminActions.map((action, idx) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <button
                onClick={() => handleTabClick(action.id)}
                className={`group relative w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-300 text-left ${
                  activeTab === action.id
                  ? "border-indigo-500 shadow-lg"
                  : "border-gray-100 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500"
                }`}
              >
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity blur-2xl`} />
                <div className={`p-2 rounded-xl bg-gradient-to-br ${action.color} text-white inline-flex mb-3`}>
                  <action.icon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{action.title}</h3>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Content Area */}
        <div className="relative">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;