/**
 * Shared site information used by Contact, Footer, and any other
 * user-facing component. Single source of truth so the "get in touch"
 * details can never drift apart between pages.
 */
export const SITE_INFO = {
  name: "Iodlearn",
  tagline: "Academic Center",
  email: "iodlearn.com@gmail.com",
  supportEmail: "iodlearn.com@gmail.com",
  partnershipsEmail: "iodlearn.com@gmail.com",
  phone: "+2348101657673",
  phoneDisplay: "08101657673",
  address: "Ibadan, Nigeria",
  location: "Ibadan, Nigeria",
  founded: 2026,
  social: {
    linkedin: "",
    github: "",
    twitter: "",
    facebook: "",
    instagram: "",
  },
  links: {
    home: "/",
    courses: "/courses",
    about: "/about",
    contact: "/contact",
    privacyPolicy: "/privacy-policy",
    termsOfService: "/terms-of-service",
    register: "/register",
    login: "/login",
    becomeMentor: "/become-mentor",
  },
  supportHours: "24 hours",
};

export default SITE_INFO;