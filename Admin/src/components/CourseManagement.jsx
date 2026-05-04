import React, { useState, useEffect } from "react";
import { Search, Trash2, Eye, Users, DollarSign, BookOpen, Edit2 } from "lucide-react";
import { adminAPI } from "../utils/lmsApi";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import AdminCourseCreator from "./AdminCourseCreator";

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [editingCourse, setEditingCourse] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await adminAPI.getCourses();
                setCourses(res.data || []);
            } catch (err) {
                toast.error("Failed to fetch courses");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleDelete = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            await adminAPI.deleteCourse(courseId);
            setCourses(courses.filter(c => c._id !== courseId));
            toast.success("Course deleted");
        } catch (err) {
            toast.error("Failed to delete course");
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
    };

    const handleCourseUpdate = () => {
        setEditingCourse(null);
        refreshCourses();
    };

    const refreshCourses = async () => {
        try {
            const res = await adminAPI.getCourses();
            setCourses(res.data || []);
        } catch (err) {
            toast.error("Failed to refresh courses");
        }
    };

    const filteredCourses = courses.filter(course => {
        if (filter === "published" && !course.isPublished) return false;
        if (filter === "unpublished" && course.isPublished) return false;
        if (filter === "paid" && !course.isPaid) return false;
        if (filter === "free" && course.isPaid) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <AdminCourseCreator 
                onCourseCreated={refreshCourses} 
                editingCourse={editingCourse}
                onCourseUpdated={handleCourseUpdate}
            />
            <div className="flex flex-wrap gap-2">
                {["all", "published", "unpublished", "paid", "free"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                            filter === f
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="p-8 text-center text-indigo-500 animate-pulse">Loading courses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCourses.map(course => (
                        <div key={course._id} className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
                            {course.thumbnail && (
                                <img 
                                    src={course.thumbnail} 
                                    alt={course.title}
                                    className="w-full h-40 object-cover"
                                />
                            )}
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold dark:text-white line-clamp-1">{course.title}</h3>
                                    <div className="flex gap-1">
                                        <span className={`px-2 py-1 text-xs rounded-lg ${
                                            course.isPublished 
                                            ? "bg-green-100 text-green-700" 
                                            : "bg-gray-100 text-gray-700"
                                        }`}>
                                            {course.isPublished ? "Published" : "Draft"}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Users size={14} />
                                        <span>{course.enrolledStudents?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BookOpen size={14} />
                                        <span>{course.lessons?.length || 0} lessons</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DollarSign size={14} />
                                        <span>{course.isPaid ? `₦${(course.price / 100).toLocaleString()}` : "Free"}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-white/10">
                                    <span className="text-xs text-gray-500">
                                        by {course.mentor?.name || "Unknown"}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition"
                                            title="Edit course"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredCourses.length === 0 && (
                        <div className="col-span-full p-8 text-center text-gray-500">No courses found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CourseManagement;