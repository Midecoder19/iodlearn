import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Upload, X } from "lucide-react";
import { courseAPI, adminAPI } from "../utils/lmsApi";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

const AdminCourseCreator = ({ onCourseCreated, editingCourse, onCourseUpdated }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ thumbnail: false, video: {}, pdf: {} });
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    category: "",
    level: "beginner",
    price: 0,
    isPaid: false,
    isPublished: false
  });

  useEffect(() => {
    if (showForm) {
      fetchCategories();
      if (editingCourse) {
        populateFormWithCourseData();
      }
    }
  }, [showForm, editingCourse]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const populateFormWithCourseData = () => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title || "",
        description: editingCourse.description || "",
        thumbnail: editingCourse.thumbnail || "",
        category: editingCourse.category || "",
        level: editingCourse.level || "beginner",
        price: editingCourse.isPaid ? (editingCourse.price / 100).toFixed(2) : 0,
        isPaid: editingCourse.isPaid || false,
        isPublished: editingCourse.isPublished || false
      });
      setLessons(editingCourse.lessons || []);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const addLesson = () => {
    setLessons([...lessons, {
      title: "",
      description: "",
      videoUrl: "",
      pdfUrl: "",
      duration: 0,
      isFree: false,
      order: lessons.length
    }]);
  };

  const updateLesson = (index, field, value) => {
    const updatedLessons = [...lessons];
    updatedLessons[index][field] = value;
    setLessons(updatedLessons);
  };

  const removeLesson = (index) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      thumbnail: "",
      category: "",
      level: "beginner",
      price: 0,
      isPaid: false,
      isPublished: false
    });
    setLessons([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const courseData = {
        ...formData,
        price: formData.isPaid ? Math.round(parseFloat(formData.price) * 100) : 0,
        lessons: lessons.map((lesson, index) => ({ ...lesson, order: index }))
      };

      if (editingCourse) {
        // Update existing course
        await adminAPI.updateCourse(editingCourse._id, courseData);
        toast.success("Course updated successfully!");
        if (onCourseUpdated) onCourseUpdated();
      } else {
        // Create new course
        await courseAPI.create(courseData);
        toast.success("Course created successfully!");
        if (onCourseCreated) onCourseCreated();
      }

      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Course operation error:", error);
      toast.error(error.response?.data?.error || `Failed to ${editingCourse ? 'update' : 'create'} course`);
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file, folder) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "course_resources"); // You'll need to create this preset in Cloudinary

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Upload failed:", error);
      throw new Error("Failed to upload file");
    }
  };

  const handleFileUpload = async (file, type, lessonIndex = null) => {
    if (!file) return null;

    try {
      if (type === "thumbnail") {
        setUploading(prev => ({ ...prev, thumbnail: true }));
        const url = await uploadToCloudinary(file, "course_thumbnails");
        setFormData(prev => ({ ...prev, thumbnail: url }));
        toast.success("Thumbnail uploaded successfully");
      } else if (type === "video" && lessonIndex !== null) {
        setUploading(prev => ({
          ...prev,
          video: { ...prev.video, [lessonIndex]: true }
        }));
        const url = await uploadToCloudinary(file, "course_videos");
        updateLesson(lessonIndex, "videoUrl", url);
        toast.success("Video uploaded successfully");
      } else if (type === "pdf" && lessonIndex !== null) {
        setUploading(prev => ({
          ...prev,
          pdf: { ...prev.pdf, [lessonIndex]: true }
        }));
        const url = await uploadToCloudinary(file, "course_pdfs");
        updateLesson(lessonIndex, "pdfUrl", url);
        toast.success("PDF uploaded successfully");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      if (type === "thumbnail") {
        setUploading(prev => ({ ...prev, thumbnail: false }));
      } else if (type === "video") {
        setUploading(prev => ({
          ...prev,
          video: { ...prev.video, [lessonIndex]: false }
        }));
      } else if (type === "pdf") {
        setUploading(prev => ({
          ...prev,
          pdf: { ...prev.pdf, [lessonIndex]: false }
        }));
      }
    }
  };

  if (!showForm) {
    return (
      <div className="flex justify-center py-8">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          {editingCourse ? "Edit Course" : "Create New Course"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editingCourse ? "Edit Course" : "Create New Course"}
        </h3>
        <button
          onClick={() => {
            setShowForm(false);
            if (editingCourse && onCourseUpdated) onCourseUpdated();
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter course title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            required
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Describe what students will learn"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty Level *
            </label>
            <select
              name="level"
              required
              value={formData.level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isPaid"
              id="adminIsPaid"
              checked={formData.isPaid}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="adminIsPaid" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Paid Course
            </label>
          </div>

          {formData.isPaid && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (₦ NGN)
              </label>
              <input
                type="number"
                name="price"
                min="1"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="5000"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Thumbnail
          </label>
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files[0], "thumbnail")}
              className="hidden"
              id="thumbnail-upload"
            />
            <label
              htmlFor="thumbnail-upload"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Upload size={16} />
              {uploading.thumbnail ? "Uploading..." : "Upload Image"}
            </label>
            <input
              type="url"
              placeholder="Or enter URL"
              value={formData.thumbnail}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lessons & Resources</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add video and PDF resources for your course.</p>
            </div>
            <button
              type="button"
              onClick={() => addLesson()}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} /> Add Lesson
            </button>
          </div>

          {lessons.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-gray-500 dark:text-gray-400">
              No lessons added yet. Click add lesson to create the first video/pdf lesson.
            </div>
          ) : (
            lessons.map((lesson, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Lesson {index + 1}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Video and PDF content for this lesson.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLesson(index)}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lesson Title *</label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => updateLesson(index, "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter lesson title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lesson Description</label>
                    <textarea
                      rows={2}
                      value={lesson.description}
                      onChange={(e) => updateLesson(index, "description", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Describe the lesson"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video</label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileUpload(e.target.files[0], "video", index)}
                          className="hidden"
                          id={`video-upload-${index}`}
                        />
                        <label
                          htmlFor={`video-upload-${index}`}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                        >
                          <Upload size={14} />
                          {uploading.video[index] ? "Uploading..." : "Upload Video"}
                        </label>
                        <input
                          type="url"
                          placeholder="Or enter URL"
                          value={lesson.videoUrl}
                          onChange={(e) => updateLesson(index, "videoUrl", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PDF Resource</label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(e.target.files[0], "pdf", index)}
                          className="hidden"
                          id={`pdf-upload-${index}`}
                        />
                        <label
                          htmlFor={`pdf-upload-${index}`}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                        >
                          <Upload size={14} />
                          {uploading.pdf[index] ? "Uploading..." : "Upload PDF"}
                        </label>
                        <input
                          type="url"
                          placeholder="Or enter URL"
                          value={lesson.pdfUrl}
                          onChange={(e) => updateLesson(index, "pdfUrl", e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (mins)</label>
                      <input
                        type="number"
                        min="0"
                        value={lesson.duration}
                        onChange={(e) => updateLesson(index, "duration", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="45"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={lesson.isFree}
                        onChange={(e) => updateLesson(index, "isFree", e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300">Mark lesson as free</label>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (editingCourse ? "Updating..." : "Creating...") : (editingCourse ? "Update Course" : "Create Course")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourseCreator;