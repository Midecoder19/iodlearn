import React, { useState } from "react";

const LessonManager = ({ courseId, initialLessons = [] }) => {
  const [lessons, setLessons] = useState(initialLessons);
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    pdfUrl: "",
    duration: "",
    isFree: true
  });
  const [saving, setSaving] = useState(false);

  const resetForm = () =>
    setForm({ title: "", description: "", videoUrl: "", pdfUrl: "", duration: "", isFree: true });

  const addLesson = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to add lesson");
      const data = await res.json();
      setLessons(data.course.lessons || []);
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete lesson");
      const data = await res.json();
      setLessons(data.course.lessons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Course Lessons</h3>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 space-y-3">
        <input
          placeholder="Lesson title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
          rows={2}
        />
        <input
          placeholder="Video URL (Cloudinary)"
          value={form.videoUrl}
          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
        />
        <input
          placeholder="PDF URL (Cloudinary, optional)"
          value={form.pdfUrl}
          onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm"
        />
        <div className="flex items-center gap-4">
          <label className="text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
              className="mr-2"
            />
            Free (no payment required)
          </label>
        </div>
        <button
          onClick={addLesson}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Adding..." : "Add Lesson"}
        </button>
      </div>

      {lessons.length === 0 ? (
        <p className="text-sm text-slate-500">No lessons yet.</p>
      ) : (
        <ul className="space-y-2">
          {lessons.map((lesson, idx) => (
            <li
              key={lesson._id}
              className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {idx + 1}. {lesson.title}
                </p>
                <p className="text-xs text-slate-500">
                  {lesson.duration ? `${lesson.duration} min` : "No duration"}
                  {lesson.isFree ? " · Free" : " · Paid"}
                </p>
              </div>
              <button
                onClick={() => deleteLesson(lesson._id)}
                disabled={saving}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LessonManager;