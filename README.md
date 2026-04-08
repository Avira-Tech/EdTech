# Grafana-Style Education Platform

A comprehensive, production-ready education management platform inspired by Grafana's UI/UX philosophy.

## 🎯 Features

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full system access, user management, course management, system settings |
| **Admin** | Manage users & courses, view analytics, content approval |
| **Teacher** | Manage assigned courses, upload content, create assignments, view student progress |
| **Student** | View enrolled courses, access content, submit assignments, track progress |

### Course Management

- **Pricing Plans**
  - Free Plan
  - One-Time Payment Plan
  - Subscription Plan with duration
  - Discount support (percentage or flat)

- **Rich Content**
  - Video lessons
  - PDF documents
  - Quizzes & Assessments
  - Assignments

- **Course Features**
  - Module-based curriculum
  - Progress tracking
  - Rating & reviews
  - Featured courses

### Grafana-Inspired UI

- 🌙 **Dark theme** by default
- 📐 **Collapsible sidebar** navigation
- 🎨 **Clean panels** and cards
- 🍞 **Breadcrumb navigation**
- 📱 **Responsive design**
- ⚡ **Real-time updates**

## 🛠 Tech Stack

### Frontend
- React 18 with JSX
- Vite (build tool)
- Tailwind CSS
- React Router v6
- Axios for API calls
- Recharts for analytics
- Context API for state management
- Lucide React for icons

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT Authentication with refresh tokens
- Multer for file uploads
- Bcrypt for password hashing
- Helmet for security
- Rate limiting

## 📁 Project Structure

```
edtech-platform/
├── docker-compose.yml          # Docker orchestration
├── README.md                   # This file
├── .gitignore                  # Git ignore rules
│
├── backend/
│   ├── Dockerfile              # Docker image
│   ├── package.json            # Dependencies
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   ├── uploads/                # Uploaded files
│   └── src/
│       ├── server.js           # Entry point
│       ├── app.js              # Express setup
│       ├── config/             # Configuration
│       │   ├── database.js     # MongoDB connection
│       │   ├── jwt.js          # JWT utilities
│       │   └── multer.js       # File upload config
│       ├── controllers/        # Route controllers
│       │   ├── authController.js
│       │   ├── userController.js
│       │   └── courseController.js
│       ├── middleware/         # Custom middleware
│       │   ├── auth.js         # JWT verification
│       │   ├── role.js         # Role-based access
│       │   └── validate.js     # Request validation
│       ├── models/             # Mongoose models
│       │   ├── User.js
│       │   ├── Course.js
│       │   ├── Assignment.js
│       │   ├── Question.js
│       │   └── Enrollment.js
│       ├── routes/             # API routes
│       │   ├── auth.js
│       │   ├── users.js
│       │   └── courses.js
│       └── utils/              # Utilities
│           └── seed.js         # Database seeder
│
└── frontend/
    ├── Dockerfile              # Docker image
    ├── nginx.conf              # Nginx config
    ├── package.json            # Dependencies
    ├── vite.config.js          # Vite config
    ├── tailwind.config.js      # Tailwind config
    ├── index.html              # Entry HTML
    └── src/
        ├── main.jsx            # Entry point
        ├── App.jsx             # Root component
        ├── index.css           # Global styles
        ├── services/           # API services
        │   └── api.js
        ├── context/            # React Context
        │   └── AuthContext.jsx
        ├── components/         # Reusable components
        │   ├── Layout/
        │   │   ├── Sidebar.jsx
        │   │   ├── Header.jsx
        │   │   ├── Breadcrumb.jsx
        │   │   └── MainLayout.jsx
        │   └── Common/
        │       ├── Button.jsx
        │       ├── Card.jsx
        │       ├── Input.jsx
        │       ├── Modal.jsx
        │       └── Table.jsx
        └── pages/              # Page components
            ├── Login.jsx
            ├── Register.jsx
            ├── admin/
            │   ├── Dashboard.jsx
            │   ├── Courses.jsx
            │   ├── Users.jsx
            │   └── Assignments.jsx
            ├── teacher/
            │   └── Dashboard.jsx
            └── student/
                └── Dashboard.jsx
```

## 🚀 Getting Started

### Option 1: Local Development

#### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

#### Seed Database

```bash
cd backend
npm run seed
```

### Option 2: Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/edtech
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| GET | `/api/auth/profile` | Get user profile | Protected |
| PUT | `/api/auth/profile` | Update profile | Protected |
| POST | `/api/auth/logout` | Logout user | Protected |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PUT | `/api/users/:id` | Update user | Admin/Self |
| DELETE | `/api/users/:id` | Delete user | Super Admin |
| PUT | `/api/users/:id/role` | Update user role | Super Admin |

### Course Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/courses` | Get all courses | Public |
| GET | `/api/courses/:id` | Get course details | Public |
| POST | `/api/courses` | Create course | Teacher/Admin |
| PUT | `/api/courses/:id` | Update course | Teacher/Admin |
| DELETE | `/api/courses/:id` | Delete course | Teacher/Admin |
| POST | `/api/courses/:id/enroll` | Enroll in course | Student |

### Assignment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/assignments` | Get assignments | Public |
| GET | `/api/assignments/:id` | Get assignment details | Public |
| POST | `/api/assignments` | Create assignment | Teacher/Admin |
| PUT | `/api/assignments/:id` | Update assignment | Teacher/Admin |
| DELETE | `/api/assignments/:id` | Delete assignment | Teacher/Admin |
| POST | `/api/assignments/:id/submit` | Submit assignment | Student |

## 🎨 UI Components

### Layout Components

| Component | Description |
|-----------|-------------|
| **Sidebar** | Collapsible navigation with role-based menu items |
| **Header** | User info, notifications, search, settings |
| **Breadcrumb** | Navigation trail for better UX |
| **MainLayout** | Wrapper for all authenticated pages |

### Common Components

| Component | Description |
|-----------|-------------|
| **Card** | Panel-style containers with header/footer support |
| **Table** | Sortable, searchable, paginated data tables |
| **Modal** | Dialog windows with animations |
| **Button** | Multiple variants (primary, secondary, danger, ghost) |
| **Input** | Form inputs with validation and icons |

## 🔐 Security Features

- ✅ JWT-based authentication with access/refresh tokens
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- ✅ Rate limiting on API endpoints
- ✅ Helmet for security headers
- ✅ CORS configuration
- ✅ Secure file uploads

## 📦 Included Seed Data

The platform includes sample data for testing:

### Users
| Email | Role | Password |
|-------|------|----------|
| superadmin@edtech.com | Super Admin | admin123 |
| admin@edtech.com | Admin | admin123 |
| john.smith@edtech.com | Teacher | teacher123 |
| sarah.johnson@edtech.com | Teacher | teacher123 |
| alice@student.com | Student | student123 |
| bob@student.com | Student | student123 |

### Courses
- Complete Web Development Bootcamp (Paid)
- React - The Complete Guide (Paid)
- Machine Learning A-Z (Paid)
- Python for Beginners (Free)
- Node.js Masterclass (Draft)

## 🚀 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Docker Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Checklist
- [ ] Change JWT secrets
- [ ] Configure MongoDB replica set for production
- [ ] Set up SSL/TLS certificates
- [ ] Configure cloud storage (AWS S3/Cloudinary)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

---

Built with ❤️ using React, Node.js, and MongoDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

