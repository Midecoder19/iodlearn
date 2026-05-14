const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/User");
const Course = require("./models/Course");
const Category = require("./models/Category");

const generateUsername = async (email) => {
  let baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (baseUsername.length < 3) baseUsername = baseUsername.padEnd(3, "0");
  if (baseUsername.length > 20) baseUsername = baseUsername.substring(0, 20);

  let username = baseUsername;
  let counter = 1;
  let exists = await User.findOne({ username });
  
  while (exists) {
    let suffix = `_${counter}`;
    username = baseUsername.substring(0, 20 - suffix.length) + suffix;
    exists = await User.findOne({ username });
    counter++;
  }

  return username;
};

const demoCourses = [
  {
    title: "Complete Web Development Bootcamp",
    description: "Learn HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects and become a full-stack developer.",
    category: "Web Development",
    level: "beginner",
    price: 49900,
    isPaid: true,
    isPublished: true,
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
    lessons: [
      { title: "Introduction to Web Development", description: "Overview of web development", duration: 15, isFree: true, order: 1 },
      { title: "HTML Fundamentals", description: "Learn HTML basics", duration: 30, isFree: true, order: 2 },
      { title: "CSS Styling", description: "Learn CSS basics", duration: 45, order: 3 },
      { title: "JavaScript Essentials", description: "Learn JavaScript", duration: 60, order: 4 },
    ]
  },
  {
    title: "Python for Data Science",
    description: "Master Python programming and data analysis. Learn Pandas, NumPy, and machine learning basics.",
    category: "Data Science",
    level: "intermediate",
    price: 74900,
    isPaid: true,
    isPublished: true,
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18ca?w=800",
    lessons: [
      { title: "Python Basics", description: "Introduction to Python", duration: 20, isFree: true, order: 1 },
      { title: "Data Types and Variables", description: "Understanding data types", duration: 25, order: 2 },
      { title: "Pandas for Data Analysis", description: "Learn Pandas", duration: 45, order: 3 },
      { title: "NumPy Fundamentals", description: "Learn NumPy", duration: 40, order: 4 },
    ]
  },
  {
    title: "React Native Mobile Development",
    description: "Build cross-platform mobile apps with React Native. Deploy to iOS and Android app stores.",
    category: "Mobile Development",
    level: "intermediate",
    price: 64900,
    isPaid: true,
    isPublished: true,
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
    lessons: [
      { title: "Introduction to React Native", description: "Getting started", duration: 15, isFree: true, order: 1 },
      { title: "Components and Props", description: "React Native components", duration: 30, order: 2 },
      { title: "State and Navigation", description: "Managing state", duration: 45, order: 3 },
    ]
  },
  {
    title: "Machine Learning Fundamentals",
    description: "Understand machine learning algorithms and build AI models. Includes supervised and unsupervised learning.",
    category: "Artificial Intelligence",
    level: "advanced",
    price: 99900,
    isPaid: true,
    isPublished: true,
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79d66d1a7c?w=800",
    lessons: [
      { title: "Introduction to ML", description: "What is machine learning?", duration: 20, isFree: true, order: 1 },
      { title: "Linear Regression", description: "Your first ML algorithm", duration: 40, order: 2 },
      { title: "Classification Algorithms", description: "Binary and multi-class classification", duration: 50, order: 3 },
    ]
  },
  {
    title: "UI/UX Design Masterclass",
    description: "Learn design principles, Figma, and create stunning user interfaces. Perfect for beginners.",
    category: "Design",
    level: "beginner",
    price: 39900,
    isPaid: true,
    isPublished: true,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    lessons: [
      { title: "Design Principles", description: "Fundamentals of design", duration: 20, isFree: true, order: 1 },
      { title: "Color Theory", description: "Using colors effectively", duration: 25, order: 2 },
      { title: "Figma Basics", description: "Getting started with Figma", duration: 35, order: 3 },
    ]
  },
  {
    title: "DevOps & Cloud Computing",
    description: "Master AWS, Docker, Kubernetes and CI/CD pipelines. Essential skills for modern developers.",
    category: "DevOps",
    level: "advanced",
    price: 89900,
    isPaid: true,
    isPublished: true,
    thumbnail: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800",
    lessons: [
      { title: "Introduction to DevOps", description: "What is DevOps?", duration: 15, isFree: true, order: 1 },
      { title: "Docker Fundamentals", description: "Containerization with Docker", duration: 45, order: 2 },
      { title: "AWS Basics", description: "Getting started with AWS", duration: 50, order: 3 },
    ]
  }
];

async function seedDemoCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lms");
    console.log("Connected to MongoDB");

    // Check if courses already exist
    const existingCourses = await Course.countDocuments();
    const skipCourseCreation = existingCourses > 0;
    if (skipCourseCreation) {
      console.log(`Database already has ${existingCourses} courses. Skipping course creation.`);
    }

    // Find or create a demo admin
    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      admin = new User({
        name: "Admin User",
        email: "admin@demo.com",
        password: hashedPassword,
        role: "admin",
        verified: true,
        isMentorApproved: true,
        username: "admin",
        isPublic: true
      });
      await admin.save();
      console.log("Created admin user: admin@demo.com / admin123");
    } else {
      let updated = false;
      if (!admin.password) {
        admin.password = await bcrypt.hash("admin123", 10);
        updated = true;
      }
      if (!admin.username) {
        admin.username = "admin";
        updated = true;
      }
      if (!admin.verified) {
        admin.verified = true;
        updated = true;
      }
      if (updated) {
        await admin.save();
        console.log("Updated admin user credentials for admin@demo.com");
      }
    }

    // Find or create a demo mentor
    let mentor = await User.findOne({ role: "mentor", isMentorApproved: true });
    if (!mentor) {
      const mentorPassword = await bcrypt.hash("mentor123", 10);
      mentor = new User({
        name: "Demo Mentor",
        email: "mentor@demo.com",
        password: mentorPassword,
        role: "mentor",
        verified: true,
        isMentorApproved: true,
        username: "mentor",
        isPublic: true,
        mentorProfile: {
          bio: "Experienced instructor with 10+ years in the industry",
          expertise: ["Web Development", "Programming"],
          experience: "10 years"
        }
      });
      await mentor.save();
      console.log("Created mentor user: mentor@demo.com / mentor123");
    } else {
      let updated = false;
      if (!mentor.password) {
        mentor.password = await bcrypt.hash("mentor123", 10);
        updated = true;
      }
      if (!mentor.username) {
        mentor.username = "mentor";
        updated = true;
      }
      if (!mentor.verified) {
        mentor.verified = true;
        updated = true;
      }
      if (updated) {
        await mentor.save();
        console.log("Updated mentor user credentials for mentor@demo.com");
      }
    }

    // Create demo students
    const demoStudents = [
      { name: "John Student", email: "student@demo.com", password: "student123" },
      { name: "Jane Doe", email: "jane@demo.com", password: "student123" },
      { name: "Bob Smith", email: "bob@demo.com", password: "student123" }
    ];

    for (const studentData of demoStudents) {
      let student = await User.findOne({ email: studentData.email });
      if (!student) {
        const hashedPassword = await bcrypt.hash(studentData.password, 10);
        const username = await generateUsername(studentData.email);
        student = new User({
          name: studentData.name,
          email: studentData.email,
          password: hashedPassword,
          role: "student",
          username,
          verified: true,
          isPublic: true
        });
        await student.save();
        console.log(`Created student user: ${studentData.email} / ${studentData.password}`);
      } else {
        let updated = false;
        if (!student.password) {
          student.password = await bcrypt.hash(studentData.password, 10);
          updated = true;
        }
        if (!student.username) {
          student.username = await generateUsername(studentData.email);
          updated = true;
        }
        if (!student.verified) {
          student.verified = true;
          updated = true;
        }
        if (updated) {
          await student.save();
          console.log(`Updated student user credentials for ${studentData.email}`);
        }
      }
    }

    // Create default categories
    const defaultCategories = [
      { name: "Programming", description: "Learn various programming languages and frameworks", icon: "Code", color: "#6366f1" },
      { name: "Web Development", description: "Frontend and backend web development", icon: "Globe", color: "#10b981" },
      { name: "Mobile Development", description: "iOS and Android app development", icon: "Smartphone", color: "#f59e0b" },
      { name: "Data Science", description: "Data analysis, machine learning, and AI", icon: "BarChart3", color: "#ef4444" },
      { name: "Design", description: "UI/UX design and graphic design", icon: "Palette", color: "#8b5cf6" },
      { name: "Business", description: "Business strategy and entrepreneurship", icon: "Briefcase", color: "#06b6d4" },
      { name: "Marketing", description: "Digital marketing and advertising", icon: "TrendingUp", color: "#84cc16" },
      { name: "Cybersecurity", description: "Network security and ethical hacking", icon: "Shield", color: "#dc2626" },
      { name: "DevOps", description: "Development operations and cloud computing", icon: "Server", color: "#64748b" },
      { name: "AI & Machine Learning", description: "Artificial intelligence and machine learning", icon: "Brain", color: "#7c3aed" }
    ];

    for (const categoryData of defaultCategories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (!existingCategory) {
        const category = new Category(categoryData);
        await category.save();
        console.log(`Created category: ${categoryData.name}`);
      }
    }

    if (!skipCourseCreation) {
      // Create demo courses
      for (const courseData of demoCourses) {
        const course = new Course({
          ...courseData,
          mentor: mentor._id,
          enrolledStudents: [],
          rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
          ratingCount: Math.floor(Math.random() * 100),
          price: Math.round(courseData.price / 100)
        });
        await course.save();
        console.log(`Created: ${course.title} - ₦${course.price.toLocaleString()}`);
      }
    }

    console.log("Demo courses seeded successfully!");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding courses:", error);
    process.exit(1);
  }
}

seedDemoCourses();
