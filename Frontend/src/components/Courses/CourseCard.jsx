import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, Star, Clock, ArrowRight } from "lucide-react";

const CourseCard = ({ course, onPurchase }) => {
    const isEnrolled = course.isEnrolled || false;
    
    return (
        <div className="group relative bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Thumbnail */}
            {course.thumbnail ? (
                <div className="h-40 overflow-hidden">
                    <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            ) : (
                <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <BookOpen size={40} className="text-white/50" />
                </div>
            )}
            
            <div className="p-5">
                {/* Category & Level */}
                <div className="flex items-center gap-2 mb-2">
                    {course.category && (
                        <span className="px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            {course.category}
                        </span>
                    )}
                    {course.level && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded-lg capitalize">
                            {course.level}
                        </span>
                    )}
                </div>
                
                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {course.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {course.description}
                </p>
                
                {/* Mentor */}
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                    <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 text-xs font-bold">
                        {course.mentor?.name?.charAt(0)}
                    </div>
                    <span>{course.mentor?.name || "Unknown Mentor"}</span>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{course.enrolledStudents?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpen size={14} />
                        <span>{course.lessons?.length || 0} lessons</span>
                    </div>
                    {course.rating > 0 && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-amber-500 fill-amber-500" />
                            <span>{course.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                
                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/10">
                    <div className="font-bold text-lg">
                        {course.isPaid ? (
                            <span className="text-indigo-600 dark:text-indigo-400">₦{(course.price / 100).toLocaleString()}</span>
                        ) : (
                            <span className="text-green-600 dark:text-green-400">Free</span>
                        )}
                    </div>
                    <Link
                        to={`/course/${course._id}`}
                        className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
                    >
                        <span>View</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;