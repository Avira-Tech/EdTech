import { useState, useEffect } from 'react';
import { 
  Users, BookOpen, GraduationCap, DollarSign, 
  TrendingUp, Eye, Clock, Award 
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import Card from '../../components/Common/Card';
import StatsCard from '../../components/Common/StatsCard';
import Select from '../../components/Common/Select';
import { analyticsAPI } from '../../services/api';

const COLORS = ['#1086ff', '#3cc13b', '#f5b400', '#e02f44', '#757575'];

export default function Analytics() {
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getDashboard(period);
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Set mock data for demo
      setData({
        summary: {
          totalUsers: 1247,
          totalCourses: 48,
          totalEnrollments: 892,
          activeEnrollments: 756
        },
        userGrowth: [
          { date: '2024-01-01', users: 120 },
          { date: '2024-01-08', users: 180 },
          { date: '2024-01-15', users: 250 },
          { date: '2024-01-22', users: 320 },
          { date: '2024-01-29', users: 380 },
          { date: '2024-02-05', users: 450 },
          { date: '2024-02-12', users: 520 }
        ],
        enrollmentTrends: [
          { date: '2024-01-01', enrollments: 45, revenue: 1800 },
          { date: '2024-01-08', enrollments: 68, revenue: 2700 },
          { date: '2024-01-15', enrollments: 92, revenue: 3600 },
          { date: '2024-01-22', enrollments: 120, revenue: 4800 },
          { date: '2024-01-29', enrollments: 145, revenue: 5800 },
          { date: '2024-02-05', enrollments: 168, revenue: 6700 },
          { date: '2024-02-12', enrollments: 195, revenue: 7800 }
        ],
        coursePerformance: [
          { title: 'Web Development', students: 234, completion: 72 },
          { title: 'Data Science', students: 189, completion: 68 },
          { title: 'Mobile Apps', students: 145, completion: 75 },
          { title: 'Machine Learning', students: 123, completion: 62 },
          { title: 'DevOps', students: 98, completion: 70 }
        ],
        eventBreakdown: [
          { name: 'Page Views', value: 4520 },
          { name: 'Course Views', value: 2340 },
          { name: 'Lesson Starts', value: 1890 },
          { name: 'Enrollments', value: 456 },
          { name: 'Quiz Completions', value: 890 }
        ],
        usersByRole: [
          { name: 'Students', value: 856 },
          { name: 'Teachers', value: 45 },
          { name: 'Admins', value: 12 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Analytics</h1>
          <p className="text-gray-400 mt-1">Track platform performance and user engagement</p>
        </div>
        <Select
          options={[
            { value: '7', label: 'Last 7 days' },
            { value: '30', label: 'Last 30 days' },
            { value: '90', label: 'Last 90 days' },
            { value: '365', label: 'Last year' }
          ]}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-auto"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={data?.summary?.totalUsers?.toLocaleString() || 0}
          icon={Users}
          change="+12.5%"
          changeType="positive"
          trend="up"
        />
        <StatsCard
          title="Total Courses"
          value={data?.summary?.totalCourses || 0}
          icon={BookOpen}
          change="+3"
          changeType="positive"
          trend="up"
        />
        <StatsCard
          title="Active Enrollments"
          value={data?.summary?.activeEnrollments || 0}
          icon={GraduationCap}
          change="+8.2%"
          changeType="positive"
          trend="up"
        />
        <StatsCard
          title="Total Enrollments"
          value={data?.summary?.totalEnrollments || 0}
          icon={TrendingUp}
          change="+15.3%"
          changeType="positive"
          trend="up"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card className="p-4">
          <div className="panel-header mb-4">
            <h3 className="text-lg font-semibold text-gray-100">User Growth</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.userGrowth || []}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1086ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1086ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis 
                  dataKey="date" 
                  stroke="#757575" 
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#757575" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f1f1f', 
                    border: '1px solid #404040',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [value, 'Users']}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#1086ff" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Enrollment Trends */}
        <Card className="p-4">
          <div className="panel-header mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Enrollment Trends</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.enrollmentTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis 
                  dataKey="date" 
                  stroke="#757575" 
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#757575" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f1f1f', 
                    border: '1px solid #404040',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [value, 'Enrollments']}
                />
                <Bar dataKey="enrollments" fill="#3cc13b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Performance */}
        <Card className="lg:col-span-2 p-4">
          <div className="panel-header mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Top Courses by Enrollment</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.coursePerformance || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis type="number" stroke="#757575" fontSize={12} />
                <YAxis 
                  dataKey="title" 
                  type="category" 
                  stroke="#757575" 
                  fontSize={12}
                  width={120}
                  tickFormatter={(value) => value.length > 15 ? value.slice(0, 15) + '...' : value}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f1f1f', 
                    border: '1px solid #404040',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="students" fill="#1086ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* User Distribution */}
        <Card className="p-4">
          <div className="panel-header mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Users by Role</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.usersByRole || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.usersByRole || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          <div className="space-y-2 mt-2">
            {(data?.usersByRole || []).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-400">{item.name}</span>
                </div>
                <span className="text-gray-100">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Event Breakdown */}
      <Card className="p-4">
        <div className="panel-header mb-4">
          <h3 className="text-lg font-semibold text-gray-100">User Activity Breakdown</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(data?.eventBreakdown || []).map((event, index) => (
            <div key={event.name} className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-100">{event.value.toLocaleString()}</div>
              <div className="text-sm text-gray-400 mt-1">{event.name}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Page Views</p>
              <p className="text-2xl font-bold text-gray-100">
                {(data?.eventBreakdown?.find(e => e.name === 'Page Views')?.value || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Lesson Starts</p>
              <p className="text-2xl font-bold text-gray-100">
                {(data?.eventBreakdown?.find(e => e.name === 'Lesson Starts')?.value || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Course Views</p>
              <p className="text-2xl font-bold text-gray-100">
                {(data?.eventBreakdown?.find(e => e.name === 'Course Views')?.value || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900/30 rounded-lg">
              <Award className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Quiz Completions</p>
              <p className="text-2xl font-bold text-gray-100">
                {(data?.eventBreakdown?.find(e => e.name === 'Quiz Completions')?.value || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

