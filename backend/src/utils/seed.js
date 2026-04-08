import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import Question from '../models/Question.js';
import Enrollment from '../models/Enrollment.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');
    
    await User.deleteMany({});
    await Course.deleteMany({});
    await Assignment.deleteMany({});
    await Question.deleteMany({});
    await Enrollment.deleteMany({});
    
    console.log('✅ Creating users...');
    
    // Create users
    const users = await User.create([
      {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@edtech.com',
        password: 'admin123',
        role: 'superadmin',
        isActive: true,
        isVerified: true,
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@edtech.com',
        password: 'admin123',
        role: 'admin',
        isActive: true,
        isVerified: true,
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@edtech.com',
        password: 'teacher123',
        role: 'teacher',
        bio: 'Senior Full Stack Developer with 10+ years of experience in web development.',
        isActive: true,
        isVerified: true,
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@edtech.com',
        password: 'teacher123',
        role: 'teacher',
        bio: 'Data Scientist and Machine Learning expert.',
        isActive: true,
        isVerified: true,
      },
      {
        firstName: 'Alice',
        lastName: 'Brown',
        email: 'alice@student.com',
        password: 'student123',
        role: 'student',
        isActive: true,
        isVerified: true,
      },
      {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob@student.com',
        password: 'student123',
        role: 'student',
        isActive: true,
        isVerified: true,
      },
      {
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol@student.com',
        password: 'student123',
        role: 'student',
        isActive: true,
        isVerified: true,
      },
      {
        firstName: 'David',
        lastName: 'Lee',
        email: 'david@student.com',
        password: 'student123',
        role: 'student',
        isActive: true,
        isVerified: true,
      },
    ]);
    
    console.log(`✅ Created ${users.length} users`);
    
    console.log('✅ Creating courses...');
    
    const teacher1 = users.find(u => u.email === 'john.smith@edtech.com');
    const teacher2 = users.find(u => u.email === 'sarah.johnson@edtech.com');
    
    const courses = await Course.create([
      {
        title: 'Complete Web Development Bootcamp',
        description: 'Become a full-stack web developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB and more!',
        shortDescription: 'Master web development from scratch',
        category: 'Web Development',
        subcategory: 'Full Stack',
        instructor: teacher1._id,
        level: 'beginner',
        language: 'English',
        status: 'published',
        featured: true,
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
        duration: 4200, // 70 hours
        pricing: {
          type: 'one-time',
          price: 99.99,
          discountType: 'percentage',
          discountValue: 20,
        },
        tags: ['web development', 'html', 'css', 'javascript', 'react', 'node'],
        objectives: [
          'Build 16 web development projects',
          'Master HTML5, CSS3, and JavaScript',
          'Build React applications from scratch',
          'Create backend APIs with Node.js and Express',
        ],
        requirements: [
          'No programming experience needed',
          'A computer with internet access',
          'Willingness to learn',
        ],
        modules: [
          {
            title: 'Getting Started with Web Development',
            description: 'Introduction to web development fundamentals',
            order: 1,
            lessons: [
              { title: 'Course Introduction', type: 'video', duration: 10, isFree: true },
              { title: 'How the Web Works', type: 'video', duration: 15 },
              { title: 'Setting Up Your Development Environment', type: 'video', duration: 20 },
              { title: 'HTML Basics Quiz', type: 'quiz', duration: 15 },
            ],
          },
          {
            title: 'HTML5 Fundamentals',
            description: 'Learn HTML5 from scratch',
            order: 2,
            lessons: [
              { title: 'HTML Document Structure', type: 'video', duration: 25 },
              { title: 'Working with Text', type: 'video', duration: 20 },
              { title: 'Links and Images', type: 'video', duration: 30 },
              { title: 'Forms and Input Elements', type: 'video', duration: 35 },
            ],
          },
          {
            title: 'CSS3 Styling',
            description: 'Master CSS3 for beautiful designs',
            order: 3,
            lessons: [
              { title: 'CSS Selectors', type: 'video', duration: 25 },
              { title: 'Box Model Deep Dive', type: 'video', duration: 30 },
              { title: 'Flexbox Layout', type: 'video', duration: 45 },
              { title: 'CSS Grid', type: 'video', duration: 50 },
            ],
          },
        ],
        createdBy: teacher1._id,
        publishedAt: new Date(),
      },
      {
        title: 'React - The Complete Guide',
        description: 'Master React.js fundamentals, hooks, context API, and build modern web applications.',
        shortDescription: 'Complete React.js course for beginners',
        category: 'Web Development',
        subcategory: 'Frontend',
        instructor: teacher1._id,
        level: 'intermediate',
        language: 'English',
        status: 'published',
        featured: true,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        duration: 3000, // 50 hours
        pricing: {
          type: 'one-time',
          price: 129.99,
          discountType: 'none',
        },
        tags: ['react', 'javascript', 'frontend', 'web development'],
        objectives: [
          'Build React applications from scratch',
          'Master React Hooks and Context API',
          'Understand state management',
          'Connect to backend APIs',
        ],
        modules: [
          {
            title: 'React Fundamentals',
            description: 'Core React concepts',
            order: 1,
            lessons: [
              { title: 'What is React?', type: 'video', duration: 15, isFree: true },
              { title: 'Setting Up React', type: 'video', duration: 20 },
              { title: 'JSX Syntax', type: 'video', duration: 25 },
              { title: 'Components and Props', type: 'video', duration: 30 },
            ],
          },
        ],
        createdBy: teacher1._id,
        publishedAt: new Date(),
      },
      {
        title: 'Machine Learning A-Z',
        description: 'Learn Machine Learning from scratch with Python, R, and TensorFlow.',
        shortDescription: 'Complete ML course with Python and R',
        category: 'Data Science',
        subcategory: 'Machine Learning',
        instructor: teacher2._id,
        level: 'intermediate',
        language: 'English',
        status: 'published',
        featured: true,
        thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
        duration: 3600, // 60 hours
        pricing: {
          type: 'one-time',
          price: 149.99,
          discountType: 'percentage',
          discountValue: 15,
        },
        tags: ['machine learning', 'python', 'data science', 'AI'],
        objectives: [
          'Understand ML algorithms intuitively',
          'Build predictive models',
          'Master Python for ML',
          'Work with real datasets',
        ],
        modules: [
          {
            title: 'Data Preprocessing',
            description: 'Prepare data for ML models',
            order: 1,
            lessons: [
              { title: 'Importing Libraries', type: 'video', duration: 20, isFree: true },
              { title: 'Handling Missing Data', type: 'video', duration: 30 },
              { title: 'Encoding Categorical Data', type: 'video', duration: 25 },
            ],
          },
        ],
        createdBy: teacher2._id,
        publishedAt: new Date(),
      },
      {
        title: 'Python for Beginners',
        description: 'Start your programming journey with Python. Learn fundamentals, data structures, and more.',
        shortDescription: 'Learn Python from scratch',
        category: 'Programming',
        subcategory: 'Python',
        instructor: teacher2._id,
        level: 'beginner',
        language: 'English',
        status: 'published',
        featured: false,
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
        duration: 1800, // 30 hours
        pricing: {
          type: 'free',
          price: 0,
        },
        tags: ['python', 'programming', 'beginner'],
        objectives: [
          'Master Python fundamentals',
          'Write clean Python code',
          'Work with data structures',
          'Build simple applications',
        ],
        modules: [
          {
            title: 'Getting Started with Python',
            description: 'Introduction to Python',
            order: 1,
            lessons: [
              { title: 'What is Python?', type: 'video', duration: 10, isFree: true },
              { title: 'Installing Python', type: 'video', duration: 15 },
              { title: 'Your First Python Program', type: 'video', duration: 20 },
            ],
          },
        ],
        createdBy: teacher2._id,
        publishedAt: new Date(),
      },
      {
        title: 'Node.js Masterclass',
        description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
        shortDescription: 'Complete Node.js backend development',
        category: 'Web Development',
        subcategory: 'Backend',
        instructor: teacher1._id,
        level: 'intermediate',
        language: 'English',
        status: 'draft',
        featured: false,
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
        duration: 2400, // 40 hours
        pricing: {
          type: 'one-time',
          price: 89.99,
          discountType: 'none',
        },
        modules: [],
        createdBy: teacher1._id,
      },
    ]);
    
    console.log(`✅ Created ${courses.length} courses`);
    
    console.log('✅ Creating assignments...');
    
    const assignment1 = await Assignment.create({
      title: 'Build a Responsive Landing Page',
      description: 'Create a responsive landing page using HTML, CSS, and JavaScript. The page should include a navigation bar, hero section, features section, and footer.',
      course: courses[0]._id,
      type: 'assignment',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      points: 100,
      passingScore: 70,
      attempts: 3,
      instructions: 'Submit a zip file containing all your HTML, CSS, and JavaScript files. Include a README file with instructions on how to run your project.',
      createdBy: teacher1._id,
    });
    
    const assignment2 = await Assignment.create({
      title: 'React Todo App',
      description: 'Build a todo application using React. The app should allow users to add, edit, delete, and mark tasks as complete.',
      course: courses[1]._id,
      type: 'assignment',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      points: 50,
      passingScore: 60,
      attempts: 2,
      instructions: 'Create a new React app and implement the todo functionality. Use local state management.',
      createdBy: teacher1._id,
    });
    
    console.log('✅ Created assignments');
    
    console.log('✅ Creating questions...');
    
    await Question.create([
      {
        question: 'What does HTML stand for?',
        type: 'multiple-choice',
        course: courses[0]._id,
        options: [
          { text: 'Hyper Text Markup Language', isCorrect: true },
          { text: 'High Tech Modern Language', isCorrect: false },
          { text: 'Hyper Transfer Markup Language', isCorrect: false },
          { text: 'Home Tool Markup Language', isCorrect: false },
        ],
        explanation: 'HTML stands for Hyper Text Markup Language, which is the standard markup language for creating web pages.',
        points: 5,
        difficulty: 'easy',
        createdBy: teacher1._id,
      },
      {
        question: 'CSS stands for Cascading Style Sheets.',
        type: 'true-false',
        course: courses[0]._id,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
        explanation: 'CSS indeed stands for Cascading Style Sheets and is used to style HTML elements.',
        points: 5,
        difficulty: 'easy',
        createdBy: teacher1._id,
      },
      {
        question: 'What is the correct way to create a function in JavaScript?',
        type: 'multiple-choice',
        course: courses[1]._id,
        options: [
          { text: 'function:myFunction()', isCorrect: false },
          { text: 'function myFunction()', isCorrect: true },
          { text: 'create myFunction()', isCorrect: false },
          { text: 'function = myFunction()', isCorrect: false },
        ],
        explanation: 'The correct syntax to create a function in JavaScript is: function myFunction() { }',
        points: 10,
        difficulty: 'easy',
        createdBy: teacher1._id,
      },
    ]);
    
    console.log('✅ Created questions');
    
    console.log('✅ Creating enrollments...');
    
    const students = users.filter(u => u.role === 'student');
    
    await Enrollment.create([
      {
        student: students[0]._id,
        course: courses[0]._id,
        progress: {
          percentage: 75,
          completedLessons: ['lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson5', 'lesson6', 'lesson7'],
        },
        enrollmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        student: students[0]._id,
        course: courses[1]._id,
        progress: {
          percentage: 45,
          completedLessons: ['lesson1', 'lesson2', 'lesson3'],
        },
        enrollmentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        student: students[1]._id,
        course: courses[0]._id,
        progress: {
          percentage: 90,
          completedLessons: ['lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson5', 'lesson6', 'lesson7', 'lesson8', 'lesson9'],
        },
        enrollmentDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        student: students[2]._id,
        course: courses[2]._id,
        progress: {
          percentage: 30,
          completedLessons: ['lesson1', 'lesson2'],
        },
        enrollmentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        student: students[3]._id,
        course: courses[3]._id,
        progress: {
          percentage: 100,
          completedLessons: ['lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson5'],
        },
        status: 'completed',
        enrollmentDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        completion: {
          completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      },
    ]);
    
    console.log('✅ Created enrollments');
    
    // Update teachers with assigned courses
    await User.findByIdAndUpdate(teacher1._id, {
      assignedCourses: [courses[0]._id, courses[1]._id, courses[4]._id],
    });
    
    await User.findByIdAndUpdate(teacher2._id, {
      assignedCourses: [courses[2]._id, courses[3]._id],
    });
    
    // Update students with enrolled courses
    await User.findByIdAndUpdate(students[0]._id, {
      enrolledCourses: [courses[0]._id, courses[1]._id],
    });
    
    await User.findByIdAndUpdate(students[1]._id, {
      enrolledCourses: [courses[0]._id],
    });
    
    await User.findByIdAndUpdate(students[2]._id, {
      enrolledCourses: [courses[2]._id],
    });
    
    await User.findByIdAndUpdate(students[3]._id, {
      enrolledCourses: [courses[3]._id],
    });
    
    console.log('\n🎉 Seed data created successfully!\n');
    console.log('📧 Demo Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Super Admin: superadmin@edtech.com / admin123');
    console.log('🔑 Admin:        admin@edtech.com / admin123');
    console.log('🔑 Teacher:      john.smith@edtech.com / teacher123');
    console.log('🔑 Student:      alice@student.com / student123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

