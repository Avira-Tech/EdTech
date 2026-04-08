import { useState, useEffect } from 'react';
import { BookOpen, Users, CheckCircle, Clock, TrendingUp, Play, FileText, Plus } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { useAuth } from '../../context/AuthContext';

const studentProgressData = [
  { week: 'Week 1', completed: 45, enrolled: 50 },
  { week: 'Week 2', completed: 38, enrolled: 50 },
  { week: 'Week 3', completed: 42, enrolled: 50 },
  { week: 'Week 4', completed: 35, enrolled: 50 },
  { week: 'Week 5', completed: 48, enrolled: 50 },
  { week: 'Week 6', completed: 40, enrolled: 50 },
];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    avgCompletion: 0,
  });

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalCourses: 5,
        totalStudents: 234,
        pendingSubmissions: 18,
        avgCompletion: 76,
      });
    }, 500);
  }, []);

  const assignedCourses = [
    { id: 1, title: 'Complete Web Development Bootcamp', students: 89, completion: 72 },
    { id: 2, title: 'React - The Complete Guide', students: 67, completion: 68 },
    { id: 3, title: 'Node.js Masterclass', students: 45, completion: 81 },
    { id: 4, title: 'TypeScript Fundamentals', students: 33, completion: 45 },
  ];

  const pendingAssignments = [
    { id: 1, course: 'Web Development Bootcamp', student: 'Alice Brown', task: 'React Project', dueDate: '2024-02-15' },
    { id: 2, course: 'React - The Complete Guide', student: 'Bob Wilson', task: 'Component Quiz', dueDate: '2024-02-16' },
    { id: 3, course: 'Node.js Masterclass', student: 'Carol Davis', task: 'API Assignment', dueDate: '2024-02-17' },
  ];

  const recentSubmissions = [
    { id: 1, student: 'David Lee', course: 'Web Development', assignment: 'Final Project', score: 92, submittedAt: '2 hours ago' },
    { id: 2, student: 'Emma Wilson', course: 'React', assignment: 'Hooks Quiz', score: 88, submittedAt: '3 hours ago' },
    { id: 3, student: 'Frank Miller', course: 'Node.js', assignment: 'Server Setup', score: 95, submittedAt: '5 hours ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Teacher Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, {user?.firstName}! Here's your teaching overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Assigned Courses</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stats.totalCourses}</p>
            </div>
            <div className="p-3 bg-primary-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-green-900/30 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Reviews</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stats.pendingSubmissions}</p>
            </div>
            <div className="p-3 bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg. Completion</p>
              <p className="text-2xl font-bold text-gray-100 mt-1">{stats.avgCompletion}%</p>
            </div>
            <div className="p-3 bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts and Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <Card className="lg:col-span-2">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">Student Progress</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentProgressData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="completed" 
                  stroke="#1086ff" 
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pending Reviews */}
        <Card>
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">Pending Reviews</h3>
          </div>
          <div className="space-y-3">
            {pendingAssignments.map((item) => (
              <div key={item.id} className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-100">{item.student}</span>
                  <span className="text-xs text-yellow-400">Due {item.dueDate}</span>
                </div>
                <p className="text-xs text-gray-400">{item.course}</p>
                <p className="text-sm text-primary-400 mt-1">{item.task}</p>
              </div>
            ))}
            <Button variant="secondary" size="sm" fullWidth>
              View All Reviews
            </Button>
          </div>
        </Card>
      </div>

      {/* Courses and Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Courses */}
        <Card>
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">My Courses</h3>
            <Button size="sm" icon={Plus}>
              New Course
            </Button>
          </div>
          <div className="space-y-3">
            {assignedCourses.map((course) => (
              <div key={course.id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-12 h-12 bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-100 truncate">{course.title}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {course.students} students
                    </span>
                    <span>{course.completion}% completion</span>
                  </div>
                </div>
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${course.completion}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">Recent Submissions</h3>
          </div>
          <div className="space-y-3">
            {recentSubmissions.map((submission) => (
              <div key={submission.id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-10 h-10 bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-400">
                    {submission.student.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-100">{submission.student}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {submission.assignment} • {submission.course}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">{submission.score}</p>
                  <p className="text-xs text-gray-500">{submission.submittedAt}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

