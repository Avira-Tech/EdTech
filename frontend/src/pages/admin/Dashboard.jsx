import { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  TrendingUp,
  DollarSign,
  Activity,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../../components/Common/Card';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, change, changeType, trend }) => (
  <Card className="relative overflow-hidden">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold mt-1 text-gray-100">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 transform rotate-180" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-primary-900/30 rounded-lg">
        <Icon className="w-6 h-6 text-primary-400" />
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600/50"></div>
  </Card>
);

const enrollmentData = [
  { month: 'Jan', students: 120, revenue: 4500 },
  { month: 'Feb', students: 180, revenue: 6800 },
  { month: 'Mar', students: 250, revenue: 9200 },
  { month: 'Apr', students: 320, revenue: 12000 },
  { month: 'May', students: 380, revenue: 14500 },
  { month: 'Jun', students: 450, revenue: 17800 },
];

const courseDistribution = [
  { name: 'Web Development', value: 35, color: '#1086ff' },
  { name: 'Data Science', value: 25, color: '#3cc13b' },
  { name: 'Mobile Apps', value: 20, color: '#f5b400' },
  { name: 'Design', value: 12, color: '#e02f44' },
  { name: 'Other', value: 8, color: '#757575' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalUsers: 1247,
        totalCourses: 48,
        totalEnrollments: 892,
        totalRevenue: 45680,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const recentActivity = [
    { id: 1, user: 'Alice Brown', action: 'enrolled in', target: 'Web Development Bootcamp', time: '2 hours ago' },
    { id: 2, user: 'Bob Wilson', action: 'completed', target: 'React Fundamentals', time: '3 hours ago' },
    { id: 3, user: 'Carol Davis', action: 'registered as', target: 'New Student', time: '5 hours ago' },
    { id: 4, user: 'John Smith', action: 'published', target: 'Node.js Masterclass', time: '1 day ago' },
    { id: 5, user: 'Sarah Johnson', action: 'created assignment', target: 'ML Quiz #5', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, {user?.firstName}! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={loading ? '...' : stats.totalUsers.toLocaleString()}
          icon={Users}
          change="+12.5%"
          changeType="positive"
          trend="up"
        />
        <StatCard
          title="Total Courses"
          value={loading ? '...' : stats.totalCourses}
          icon={BookOpen}
          change="+3"
          changeType="positive"
          trend="up"
        />
        <StatCard
          title="Active Enrollments"
          value={loading ? '...' : stats.totalEnrollments}
          icon={GraduationCap}
          change="+8.2%"
          changeType="positive"
          trend="up"
        />
        <StatCard
          title="Total Revenue"
          value={loading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change="+15.3%"
          changeType="positive"
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment Chart */}
        <Card className="lg:col-span-2">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">Enrollment & Revenue</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs rounded bg-primary-900/50 text-primary-400">6M</button>
              <button className="px-3 py-1 text-xs rounded bg-gray-800 text-gray-400 hover:text-gray-100">1Y</button>
              <button className="px-3 py-1 text-xs rounded bg-gray-800 text-gray-400 hover:text-gray-100">All</button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1086ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1086ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="month" stroke="#757575" fontSize={12} />
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
                  dataKey="revenue" 
                  stroke="#1086ff" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Course Distribution */}
        <Card>
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">Course Distribution</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={courseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {courseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f1f1f', 
                    border: '1px solid #404040',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {courseDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="text-gray-100">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">Recent Activity</h3>
            <button className="text-sm text-primary-400 hover:text-primary-300">View all</button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                <div className="w-8 h-8 bg-primary-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-gray-100">{activity.user}</span>
                    {' '}
                    <span className="text-gray-400">{activity.action}</span>
                    {' '}
                    <span className="text-primary-400">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gray-800/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors text-left">
              <UserPlus className="w-6 h-6 text-primary-400 mb-2" />
              <p className="font-medium text-gray-100">Add User</p>
              <p className="text-xs text-gray-500">Create new account</p>
            </button>
            <button className="p-4 bg-gray-800/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors text-left">
              <BookOpen className="w-6 h-6 text-green-400 mb-2" />
              <p className="font-medium text-gray-100">New Course</p>
              <p className="text-xs text-gray-500">Create course</p>
            </button>
            <button className="p-4 bg-gray-800/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors text-left">
              <UserCheck className="w-6 h-6 text-yellow-400 mb-2" />
              <p className="font-medium text-gray-100">Enrollments</p>
              <p className="text-xs text-gray-500">Manage students</p>
            </button>
            <button className="p-4 bg-gray-800/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors text-left">
              <Activity className="w-6 h-6 text-purple-400 mb-2" />
              <p className="font-medium text-gray-100">Analytics</p>
              <p className="text-xs text-gray-500">View reports</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

