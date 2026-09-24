# RBAC Enforcement Audit

## Endpoint Mapping and Verification

### Authentication Routes (`/api/auth`)
- `POST /api/auth/register` - Public (no auth required)
- `POST /api/auth/login` - Public (no auth required)  
- `POST /api/auth/verify-otp` - Public (no auth required)
- `POST /api/auth/resend-otp` - Public (no auth required)
- `POST /api/auth/forgot-password` - Public (no auth required)
- `POST /api/auth/reset-password/:token` - Public (no auth required)
- `PUT /api/auth/update-profile` - Authenticated (any role) ✅ `verifyToken`
- `GET /api/auth/profile/:username` - Public (no auth required)
- `POST /api/auth/google` - Public (no auth required)

### Admin Routes (`/api/admin`)
- `PUT /api/admin/users/:id/role` - Admin only ✅ `verifyAdmin`
- `GET /api/admin/users` - Admin only ✅ `verifyAdmin`
- `GET /api/admin/mentors` - Admin only ✅ `verifyAdmin`
- `DELETE /api/admin/users/:id` - Admin only ✅ `verifyAdmin`
- `GET /api/admin/stats` - Admin only ✅ `verifyAdmin`
- `GET /api/admin/mentor-applications` - Admin only ✅ `verifyAdmin`
- `PUT /api/admin/mentor-applications/:id/approve` - Admin only ✅ `verifyAdmin`
- `PUT /api/admin/mentor-applications/:id/reject` - Admin only ✅ `verifyAdmin`
- `GET /api/admin/payments` - Admin only ✅ `verifyAdmin`
- `GET /api/admin/courses` - Admin only ✅ `verifyAdmin`
- `PUT /api/admin/courses/:id` - Admin only ✅ `verifyAdmin`
- `DELETE /api/admin/courses/:id` - Admin only ✅ `verifyAdmin`
- `GET /api/admin/wallets` - Admin only ✅ `verifyAdmin`
- `GET /api/admin/withdrawals` - Admin only ✅ `verifyAdmin`
- `POST /api/admin/withdrawals/:withdrawalId/process` - Admin only ✅ `verifyAdmin`

### Course Routes (`/api/courses`)
- `POST /api/courses` - Authenticated (mentor/admin) ✅ `verifyToken` + role check in handler
- `PUT /api/courses/:id` - Authenticated (mentor/admin + ownership check) ✅ `verifyToken` + ownership check
- `DELETE /api/courses/:id` - Authenticated (mentor/admin + ownership check) ✅ `verifyToken` + ownership check
- `POST /api/courses/:id/lessons` - Mentor only ✅ `verifyToken` + `verifyMentor` + ownership check
- `PUT /api/courses/:courseId/lessons/:lessonId` - Mentor only ✅ `verifyToken` + `verifyMentor` + ownership check
- `DELETE /api/courses/:courseId/lessons/:lessonId` - Mentor only ✅ `verifyToken` + `verifyMentor` + ownership check
- `GET /api/courses` - Public (no auth required)
- `GET /api/courses/my-created` - Authenticated (any role) ✅ `verifyToken`
- `GET /api/courses/my-courses` - Authenticated (any role) ✅ `verifyToken`
- `POST /api/courses/:id/wishlist` - Authenticated (any role) ✅ `verifyToken`
- `GET /api/courses/user/wishlist` - Authenticated (any role) ✅ `verifyToken`
- `POST /api/courses/:id/enroll` - Authenticated (any role) ✅ `verifyToken`
- `POST /api/courses/:id/review` - Authenticated (any role) ✅ `verifyToken`
- `GET /api/courses/:id/enrolled` - Authenticated (any role) ✅ `verifyToken`
- `GET /api/courses/:id` - Public (no auth required)

### Payment Routes (`/api/payments`)
- `POST /api/payments/initialize` - Authenticated (any role) ✅ `verifyToken`
- `POST /api/payments/verify-callback` - Webhook (signature verification) ✅ `verifyPaystackWebhook`
- `POST /api/payments/verify` - Authenticated (any role) ✅ `verifyToken`
- `GET /api/payments/history` - Authenticated (any role) ✅ `verifyToken`
- `GET /api/payments/course/:courseId` - Authenticated (any role) ✅ `verifyToken`
- `GET /api/payments/mentor-earnings` - Mentor only ✅ `verifyToken` + role check in handler
- `POST /api/payments/withdraw` - Mentor only ✅ `verifyToken` + role check in handler
- `POST /api/payments/withdraw/:withdrawalId/approve` - Admin only ✅ `verifyToken` + `verifyAdmin`
- `POST /api/payments/withdraw/:withdrawalId/reject` - Admin only ✅ `verifyToken` + `verifyAdmin`

### Mentorship Routes (`/api/mentorship`)
- `POST /api/mentorship/request` - Authenticated (any role) ✅ `verifyToken`
- `PUT /api/mentorship/:id/accept` - Mentor only ✅ `verifyToken` + `verifyMentor` + ownership check
- `PUT /api/mentorship/:id/decline` - Mentor only ✅ `verifyToken` + `verifyMentor` + ownership check
- `PUT /api/mentorship/:id/complete` - Mentor only ✅ `verifyToken` + `verifyMentor` + ownership check
- `PUT /api/mentorship/:id/cancel` - Authenticated (mentor/student) ✅ `verifyToken` + ownership check
- `GET /api/mentorship/my-sessions` - Authenticated (any role) ✅ `verifyToken`
- `GET /api/mentorship/:id` - Authenticated (mentor/student) ✅ `verifyToken` + ownership check

### Mentor Application Routes (`/api/mentor-application`)
- `POST /api/mentor-application/apply` - Authenticated (any role) ✅ `verifyToken`
- `GET /api/mentor-application/my-application` - Authenticated (any role) ✅ `verifyToken`
- `GET /api/mentor-application/status/:userId` - Public (no auth required)

### Category Routes (`/api/categories`)
- `GET /api/categories` - Public (no auth required)
- `GET /api/categories/admin` - Admin only ✅ `verifyToken` + `verifyAdmin`
- `POST /api/categories` - Admin only ✅ `verifyToken` + `verifyAdmin`
- `PUT /api/categories/:id` - Admin only ✅ `verifyToken` + `verifyAdmin`
- `DELETE /api/categories/:id` - Admin only ✅ `verifyToken` + `verifyAdmin`

### Stats Routes (`/api/stats`)
- `GET /api/stats` - Public (no auth required)

### Progress Routes (`/api/progress`)
- `POST /api/progress/:courseId/complete-lesson` - Authenticated (enrolled students only) ✅ `verifyToken` + enrollment check
- `POST /api/progress/:courseId/complete-resource` - Authenticated (enrolled students only) ✅ `verifyToken` + enrollment check
- `GET /api/progress/:courseId` - Authenticated (enrolled students only) ✅ `verifyToken` + enrollment check
- `GET /api/progress` - Authenticated (any role) ✅ `verifyToken`

### Search Routes (`/api/search`)
- `GET /api/search` - Public (no auth required)

### PDF Routes (`/api/pdf`)
- `GET /api/pdf/download/:branch/:year/:semester/:subjectCode/:unit` - Public (no auth required)
- `GET /api/pdf/subject-catalog/:branch/:year/:semester/:subject` - Public (no auth required)

### Newsletter Routes (`/api/newsletter`)
- `POST /api/newsletter/subscribe` - Public (no auth required)

## Findings
1. All admin routes properly protected with `verifyAdmin` middleware
2. All payment routes properly protected with appropriate role checks
3. All mentorship routes properly protected with mentor-specific checks
4. Course creation/update routes have ownership checks in handlers
5. Progress routes properly protected with enrollment checks
6. Category management routes properly protected with admin checks
7. Public endpoints (search, PDF download, newsletter, stats) are appropriately public
8. ✅ Category update endpoints now protected with explicit field allowlists
