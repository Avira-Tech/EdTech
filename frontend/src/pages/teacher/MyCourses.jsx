import { useState, useEffect } from 'react';
import { BookOpen, Users, TrendingUp, Plus, Play, Clock, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import ProgressBar from '../../components/Common/ProgressBar';
import EmptyState from '../../components/Common/EmptyState';
import StatsCard from '../../components/Common/StatsCard';
import { coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function TeacherMyCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAll({ instructor: user._id });
      setCourses(response.data.data);
      
      // Calculate stats
      const courseData = response.data.data;
      setStats({
        totalCourses: courseData.length,
        totalStudents: courseData.reduce((acc, c) => acc + (c.enrollmentCount || 0), 0),
        publishedCourses: courseData.filter(c => c.status === 'published').length,
        draftCourses: courseData.filter(c => c.status === 'draft').length
      });
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      // Mock data for demo
      setCourses([
        {
          _id: '1',
          title: 'Complete Web Development Bootcamp',
          status: 'published',
          enrollmentCount: 89,
          rating: { average: 4.8, count: 56 },
          modules: [
            { lessons: [1, 2, 3, 4, 5] },
            { lessons: [1, 2, 3, 4] },
            { lessons: [1, 2, 3] }
          ]
        },
        {
          _id: '2',
          title: 'React - The Complete Guide',
          status: 'published',
          enrollmentCount: 67,
          rating: { average: 4.7, count: 42 },
          modules: [
            { lessons: [1, 2, 3, 4] },
            { lessons: [1, 2, 3, 4, 5] }
          ]
        },
        {
          _id: '3',
          title: 'Node.js Masterclass',
          status: 'draft',
          enrollmentCount: 0,
          rating: { average: 0, count: 0 },
          modules: [
            { lessons: [1, 2] }
          ]
        }
      ]);
      setStats({
        totalCourses: 3,
        totalStudents: 156,
        publishedCourses: 2,
        draftCourses: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const totalLessons = courses.reduce((acc, course) => {
    return acc + (course.modules?.reduce((m, mod) => m + (mod.lessons?.length || 0), 0) || 0);
  }, 0);

  const progressData = [
    { week: 'Week 1', students: 45 },
    { week: 'Week 2', students: 52 },
    { week: 'Week 3', students: 48 },
    { week: 'Week 4', students: 61 },
    { week: 'Week 5', students: 55 },
    { week: 'Week 6', students: 67 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">My Courses</h1>
          <p className="text-gray-400 mt-1">Manage your assigned courses and track performance</p>
        </div>
        <Link to="/teacher/courses/new">
          <Button icon={Plus}>
            Create Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Courses"
          value={stats?.totalCourses || 0}
          icon={BookOpen}
        />
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
        />
        <StatsCard
          title="Published"
          value={stats?.publishedCourses || 0}
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Lessons"
          value={totalLessons}
          icon={Clock}
        />
      </div>

      {/* Course Progress Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4">
          <div className="panel-header mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Student Enrollment Trend</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progressData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1086ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1086ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="week" stroke="#757575" fontSize={12} />
                <YAxis stroke="#757575" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f1f1f', 
                    border: '1px solid #404040',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="students" 
                  stroke="#1086ff" 
                  fillOpacity={1} 
                  fill="url(#colorStudents)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4">
          <div className="panel-header mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Quick Actions</h3>
          </div>
          <div className="space-y-3">
            <Link to="/teacher/courses/new">
              <button className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors text-left flex items-center gap-3">
                <div className="p-2 bg-primary-900/30 rounded-lg">
                  <Plus className="w-4 h-4 text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-100">Create New Course</p>
                  <p className="text-xs text-gray-500">Start building a new course</p>
                </div>
              </button>
            </Link>
            <Link to="/teacher/assignments">
              <button className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors text-left flex items-center gap-3">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-100">View Assignments</p>
                  <p className="text-xs text-gray-500">Manage student submissions</p>
                </div>
              </button>
            </Link>
            <Link to="/teacher/analytics">
              <button className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors text-left flex items-center gap-3">
                <div className="p-2 bg-yellow-900/30 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-100">Analytics</p>
                  <p className="text-xs text-gray-500">View detailed analytics</p>
                </div>
              </button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Courses List */}
      <Card className="overflow-hidden">
        <div className="panel-header">
          <h3 className="text-lg font-semibold text-gray-100">All Courses</h3>
        </div>
        {courses.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {courses.map((course) => (
              <div key={course._id} className="p-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-100 truncate">{course.title}</h4>
                      <span className={`badge ${
                        course.status === 'published' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> {course.enrollmentCount || 0} students
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" /> {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} lessons
                      </span>
                      {course.rating?.average > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          ★ {course.rating.average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/teacher/courses/${course._id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Link to={`/teacher/courses/${course._id}`}>
                      <Button size="sm" icon={Play}>
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Create your first course to start teaching"
            action={
              <Link to="/teacher/courses/new">
                <Button icon={Plus}>
                  Create Course
                </Button>
              </Link>
            }
          />
        )}
      </Card>
    </div>
  );
}

