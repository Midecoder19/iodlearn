import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { courseAPI, paymentAPI } from "../../utils/lmsApi";
import { AuthContext } from "../../context/AuthContext";
import { BookOpen, Users, Star, Clock, Play, FileText, Check, Lock, ArrowLeft, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [course, setCourse] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [activeLesson, setActiveLesson] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await courseAPI.getById(id);
                setCourse(res.data);
                
                // Check if user is enrolled
                if (user) {
                    const userRes = await courseAPI.getMyCourses();
                    const isEnrolled = userRes.data.some(c => c._id === id);
                    setEnrolled(isEnrolled);
                }
            } catch (err) {
                toast.error("Failed to load course");
                navigate("/courses");
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, user]);

    const handlePurchase = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        setPurchasing(true);
        try {
            // Initialize payment
            const res = await paymentAPI.initialize(id);
            
            // Redirect to Paystack payment page
            if (res.data.authorizationUrl) {
                window.location.href = res.data.authorizationUrl;
            } else {
                toast.error("Failed to initialize payment");
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Payment failed");
        } finally {
            setPurchasing(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            navigate("/login");
            return;
        }
        
        // For free courses, enroll directly
        if (course && !course.isPaid) {
            try {
                await courseAPI.enrollFree(id);
                toast.success("Successfully enrolled!");
                setEnrolled(true);
            } catch (err) {
                toast.error(err.response?.data?.error || "Failed to enroll");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Course not found</p>
            </div>
        );
    }

    const isOwner = course.mentor?._id === user?._id || course.mentor === user?._id;

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <Link to="/courses" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-6">
                    <ArrowLeft size={20} /> Back to Courses
                </Link>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Course Header */}
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                            {course.thumbnail && (
                                <img src={course.thumbnail} alt={course.title} className="w-full h-64 object-cover" />
                            )}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    {course.category && (
                                        <span className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full">
                                            {course.category}
                                        </span>
                                    )}
                                    <span className="px-3 py-1 text-sm bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded-full capitalize">
                                        {course.level}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                    {course.title}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    {course.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Users size={16} />
                                        <span>{course.enrolledStudents?.length || 0} students</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <BookOpen size={16} />
                                        <span>{course.lessons?.length || 0} lessons</span>
                                    </div>
                                    {course.rating > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Star size={16} className="text-amber-500 fill-amber-500" />
                                            <span>{course.rating.toFixed(1)} ({course.ratingCount} reviews)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Curriculum */}
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Course Curriculum</h2>
                            <div className="space-y-2">
                                {course.lessons?.length > 0 ? (
                                    course.lessons.map((lesson, idx) => (
                                        <div 
                                            key={lesson._id || idx}
                                            className={`flex items-center gap-4 p-4 rounded-xl border ${
                                                enrolled || lesson.isFree
                                                ? "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                                                : "border-gray-100 dark:border-white/5 opacity-60"
                                            }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 dark:text-white">{lesson.title}</h3>
                                                {lesson.description && (
                                                    <p className="text-sm text-gray-500">{lesson.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {lesson.videoUrl && <Play size={16} className="text-gray-400" />}
                                                {lesson.pdfUrl && <FileText size={16} className="text-gray-400" />}
                                                {lesson.duration && (
                                                    <span className="text-xs text-gray-500">{lesson.duration} min</span>
                                                )}
                                                {(enrolled || lesson.isFree || isOwner) ? (
                                                    <button className="text-indigo-600 text-sm font-medium">Watch</button>
                                                ) : (
                                                    <Lock size={16} className="text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No lessons available yet</p>
                                )}
                            </div>
                        </div>

                        {/* Reviews */}
                        {course.reviews?.length > 0 && (
                            <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Student Reviews</h2>
                                <div className="space-y-4">
                                    {course.reviews.map((review, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 font-bold">
                                                    {review.user?.name?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{review.user?.name || "Anonymous"}</p>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} className={i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-6 sticky top-8">
                            <div className="text-center mb-6">
                                {course.isPaid ? (
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                        ₦{(course.price / 100).toLocaleString()}
                                    </div>
                                ) : (
                                    <div className="text-3xl font-bold text-green-600">Free</div>
                                )}
                            </div>

                            {isOwner ? (
                                <button className="w-full py-3 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-semibold">
                                    You are the mentor
                                </button>
                            ) : enrolled ? (
                                <button className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                                    <Check size={20} /> Enrolled
                                </button>
                            ) : course.isPaid ? (
                                <button 
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {purchasing ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <ShoppingCart size={20} />
                                    )}
                                    {purchasing ? "Processing..." : "Buy Now"}
                                </button>
                            ) : (
                                <button 
                                    onClick={handleEnroll}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
                                >
                                    Enroll for Free
                                </button>
                            )}

                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">This course includes:</h3>
                                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <li className="flex items-center gap-2">
                                        <Play size={16} className="text-indigo-500" /> Video lessons
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <FileText size={16} className="text-indigo-500" /> PDF resources
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <BookOpen size={16} className="text-indigo-500" /> {course.lessons?.length || 0} lessons
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Users size={16} className="text-indigo-500" /> Full lifetime access
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 font-bold">
                                        {course.mentor?.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{course.mentor?.name}</p>
                                        <p className="text-xs text-gray-500">Course Mentor</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;