import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://iodlearn.onrender.com/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const courseAPI = {
  getAll: (params) => api.get("/courses", { params }),
  getById: (id) => api.get(`/courses/${id}`),
  getEnrolled: (id) => api.get(`/courses/${id}/enrolled`),
  getMyCourses: () => api.get("/courses/my-courses"),
  getMyCreated: () => api.get("/courses/my-created"),
  create: (data) => api.post("/courses", data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  addLesson: (courseId, data) => api.post(`/courses/${courseId}/lessons`, data),
  updateLesson: (courseId, lessonId, data) => api.put(`/courses/${courseId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId, lessonId) => api.delete(`/courses/${courseId}/lessons/${lessonId}`),
  toggleWishlist: (courseId) => api.post(`/courses/${courseId}/wishlist`),
  enrollFree: (courseId) => api.post(`/courses/${courseId}/enroll`),
  getWishlist: () => api.get("/courses/user/wishlist"),
  submitReview: (courseId, data) => api.post(`/courses/${courseId}/review`, data),
};

export const paymentAPI = {
  initialize: (courseId) => api.post("/payments/initialize", { courseId }),
  verify: (reference, transactionRef) => api.post("/payments/verify", { reference, transactionRef }),
  history: () => api.get("/payments/history"),
  checkCoursePayment: (courseId) => api.get(`/payments/course/${courseId}`),
};

export const authAPI = {
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

export const progressAPI = {
  completeLesson: (courseId, lessonId) => api.post(`/progress/${courseId}/complete-lesson`, { lessonId }),
  completeResource: (courseId, data) => api.post(`/progress/${courseId}/complete-resource`, data),
  getProgress: (courseId) => api.get(`/progress/${courseId}`),
  getAllProgress: () => api.get("/progress"),
};

export const mentorshipAPI = {
  requestSession: (data) => api.post("/mentorship/request", data),
  acceptSession: (id, meetingLink) => api.put(`/mentorship/${id}/accept`, { meetingLink }),
  declineSession: (id, reason) => api.put(`/mentorship/${id}/decline`, { reason }),
  completeSession: (id) => api.put(`/mentorship/${id}/complete`),
  cancelSession: (id) => api.put(`/mentorship/${id}/cancel`),
  getMySessions: (role) => api.get("/mentorship/my-sessions", { params: { role } }),
  getSession: (id) => api.get(`/mentorship/${id}`),
};

export const mentorApplicationAPI = {
  apply: (data) => api.post("/mentor-application/apply", data),
  getMyApplication: () => api.get("/mentor-application/my-application"),
  getStatus: (userId) => api.get(`/mentor-application/status/${userId}`),
};

export const adminAPI = {
  getUsers: () => api.get("/admin/users"),
  getMentors: () => api.get("/admin/mentors"),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get("/admin/stats"),
  getPayments: (params) => api.get("/admin/payments", { params }),
  getCourses: (params) => api.get("/admin/courses", { params }),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  getMentorApplications: (status) => api.get("/admin/mentor-applications", { params: { status } }),
  approveMentor: (id) => api.put(`/admin/mentor-applications/${id}/approve`),
  rejectMentor: (id, adminNotes) => api.put(`/admin/mentor-applications/${id}/reject`, { adminNotes }),
};

export const newsletterAPI = {
  subscribe: (email) => api.post("/newsletter/subscribe", { email }),
};

export const messageAPI = {
  send: (data) => api.post("/messages/send", data),
  getConversation: (userId) => api.get(`/messages/conversation/${userId}`),
  getRoomMessages: (roomId) => api.get(`/messages/room/${roomId}`),
  markRead: (messageId) => api.put(`/messages/read/${messageId}`),
  getUnreadCount: () => api.get("/messages/unread-count"),
};

export default api;
