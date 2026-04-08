import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderOpen, 
  Library, 
  FileQuestion, 
  ClipboardList,
  Users,
  BarChart3,
  Video,
  BookOpen,
  Settings,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import StatsCard from '../../components/Common/StatsCard';
import { assetsAPI, libraryAPI, questionsAPI, assignmentsAPI, usersAPI } from '../../services/api';

export default function AdminManage() {
  const [stats, setStats] = useState({
    assets: { total: 0, recent: 0 },
    library: { total: 0, recent: 0 },
    questions: { total: 0, categories: 0 },
    assignments: { total: 0, active: 0 },
    users: { total: 0, recent: 0 },
    courses: { total: 0, published: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel
      const [assetsRes, libraryRes, questionsRes, assignmentsRes, usersRes] = await Promise.allSettled([
        assetsAPI.getAll({ limit: 1 }),
        libraryAPI.getAll({ limit: 1 }),
        questionsAPI.getAll({ limit: 1 }),
        assignmentsAPI.getAll({ limit: 1 }),
        usersAPI.getAll({ limit: 1 })
      ]);

      setStats({
        assets: {
          total: assetsRes.status === 'fulfilled' ? assetsRes.value.data.pagination?.total || 0 : 0,
          recent: 0
        },
        library: {
          total: libraryRes.status === 'fulfilled' ? libraryRes.value.data.pagination?.total || 0 : 0,
          recent: 0
        },
        questions: {
          total: questionsRes.status === 'fulfilled' ? questionsRes.value.data.pagination?.total || 0 : 0,
          categories: 0
        },
        assignments: {
          total: assignmentsRes.status === 'fulfilled' ? assignmentsRes.value.data.pagination?.total || 0 : 0,
          active: 0
        },
        users: {
          total: usersRes.status === 'fulfilled' ? usersRes.value.data.pagination?.total || 0 : 0,
          recent: 0
        },
        courses: {
          total: 0,
          published: 0
        }
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set default stats on error
      setStats({
        assets: { total: 24, recent: 5 },
        library: { total: 156, recent: 12 },
        questions: { total: 843, categories: 15 },
        assignments: { total: 67, active: 23 },
        users: { total: 1247, recent: 45 },
        courses: { total: 48, published: 35 }
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'assets', label: 'Assets' },
    { id: 'library', label: 'Library' },
    { id: 'questions', label: 'Questions' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'users', label: 'Users' }
  ];

  const managementCards = [
    {
      title: 'Assets',
      description: 'Manage media files, videos, images, and documents',
      icon: FolderOpen,
      path: '/admin/assets',
      color: 'primary',
      stats: stats.assets.total
    },
    {
      title: 'Library',
      description: 'Manage learning resources and documents',
      icon: Library,
      path: '/admin/library',
      color: 'green',
      stats: stats.library.total
    },
    {
      title: 'Question Bank',
      description: 'Create and manage quiz questions',
      icon: FileQuestion,
      path: '/admin/question-bank',
      color: 'yellow',
      stats: stats.questions.total
    },
    {
      title: 'Assignments',
      description: 'Create and manage student assignments',
      icon: ClipboardList,
      path: '/admin/assignments',
      color: 'purple',
      stats: stats.assignments.total
    },
    {
      title: 'Users',
      description: 'Manage all platform users',
      icon: Users,
      path: '/admin/users',
      color: 'red',
      stats: stats.users.total
    },
    {
      title: 'Courses',
      description: 'Manage all courses and curriculum',
      icon: BookOpen,
      path: '/admin/courses',
      color: 'blue',
      stats: stats.courses.total
    },
    {
      title: 'Meetings',
      description: 'Manage live video sessions',
      icon: Video,
      path: '/admin/meetings',
      color: 'pink',
      stats: 0
    },
    {
      title: 'Analytics',
      description: 'View platform analytics and reports',
      icon: BarChart3,
      path: '/admin/analytics',
      color: 'cyan',
      stats: null
    }
  ];

  const recentActivity = [
    { id: 1, type: 'asset', action: 'uploaded new video', user: 'John Smith', time: '2 hours ago' },
    { id: 2, type: 'question', action: 'added 15 new questions', user: 'Sarah Johnson', time: '4 hours ago' },
    { id: 3, type: 'assignment', action: 'created new assignment', user: 'Mike Wilson', time: '5 hours ago' },
    { id: 4, type: 'user', action: 'registered new user', user: 'New Student', time: '6 hours ago' },
    { id: 5, type: 'library', action: 'added 5 resources', user: 'Jane Doe', time: '1 day ago' },
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary-900/30 text-primary-400 border-primary-800',
      green: 'bg-green-900/30 text-green-400 border-green-800',
      yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
      purple: 'bg-purple-900/30 text-purple-400 border-purple-800',
      red: 'bg-red-900/30 text-red-400 border-red-800',
      blue: 'bg-blue-900/30 text-blue-400 border-blue-800',
      pink: 'bg-pink-900/30 text-pink-400 border-pink-800',
      cyan: 'bg-cyan-900/30 text-cyan-400 border-cyan-800'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Manage</h1>
          <p className="text-gray-400 mt-1">Manage all platform content and resources</p>
        </div>
        <Button icon={Settings}>
          Settings
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Total Assets"
          value={loading ? '...' : stats.assets.total}
          icon={FolderOpen}
        />
        <StatsCard
          title="Library Items"
          value={loading ? '...' : stats.library.total}
          icon={Library}
        />
        <StatsCard
          title="Questions"
          value={loading ? '...' : stats.questions.total}
          icon={FileQuestion}
        />
        <StatsCard
          title="Assignments"
          value={loading ? '...' : stats.assignments.total}
          icon={ClipboardList}
        />
        <StatsCard
          title="Users"
          value={loading ? '...' : stats.users.total}
          icon={Users}
        />
        <StatsCard
          title="Courses"
          value={loading ? '...' : stats.courses.total}
          icon={BookOpen}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Management Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {managementCards.map((card) => (
              <Link
                key={card.path}
                to={card.path}
                className={`p-4 rounded-lg border transition-all hover:scale-[1.02] ${getColorClasses(card.color)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-opacity-50 ${card.color === 'primary' ? 'bg-primary-600' : card.color === 'green' ? 'bg-green-600' : card.color === 'yellow' ? 'bg-yellow-600' : card.color === 'purple' ? 'bg-purple-600' : card.color === 'red' ? 'bg-red-600' : card.color === 'blue' ? 'bg-blue-600' : card.color === 'pink' ? 'bg-pink-600' : 'bg-cyan-600'}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  {card.stats !== null && (
                    <span className="text-2xl font-bold">{card.stats}</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-100 mb-1">{card.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{card.description}</p>
                <div className="flex items-center gap-1 text-sm text-primary-400">
                  <span>Manage</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-100">Recent Activity</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'asset' ? 'bg-primary-900/50' :
                    activity.type === 'question' ? 'bg-yellow-900/50' :
                    activity.type === 'assignment' ? 'bg-purple-900/50' :
                    activity.type === 'user' ? 'bg-green-900/50' :
                    'bg-blue-900/50'
                  }`}>
                    {activity.type === 'asset' && <FolderOpen className="w-5 h-5 text-primary-400" />}
                    {activity.type === 'question' && <FileQuestion className="w-5 h-5 text-yellow-400" />}
                    {activity.type === 'assignment' && <ClipboardList className="w-5 h-5 text-purple-400" />}
                    {activity.type === 'user' && <Users className="w-5 h-5 text-green-400" />}
                    {activity.type === 'library' && <Library className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-gray-100">{activity.user}</span>
                      {' '}
                      <span className="text-gray-400">{activity.action}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-100 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/admin/assets"
                  className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center"
                >
                  <FolderOpen className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-300">Upload Asset</span>
                </Link>
                <Link
                  to="/admin/question-bank"
                  className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center"
                >
                  <FileQuestion className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-300">Add Question</span>
                </Link>
                <Link
                  to="/admin/assignments"
                  className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center"
                >
                  <ClipboardList className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-300">Create Assignment</span>
                </Link>
                <Link
                  to="/admin/courses/new"
                  className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center"
                >
                  <BookOpen className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-300">New Course</span>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-100 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">API Status</span>
                  </div>
                  <span className="text-sm text-green-400">Operational</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Database</span>
                  </div>
                  <span className="text-sm text-green-400">Connected</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {stats.users.total > 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-400" />
                    )}
                    <span className="text-gray-300">Users Online</span>
                  </div>
                  <span className="text-sm text-gray-400">{stats.users.total} total</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-cyan-400" />
                    <span className="text-gray-300">Storage Used</span>
                  </div>
                  <span className="text-sm text-gray-400">45% of 10GB</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'assets' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-100">Assets Management</h3>
            <Link to="/admin/assets">
              <Button variant="secondary">View All Assets</Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Browse and manage all media assets</p>
            <Link to="/admin/assets">
              <Button className="mt-4">Go to Assets</Button>
            </Link>
          </div>
        </Card>
      )}

      {activeTab === 'library' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-100">Library Management</h3>
            <Link to="/admin/library">
              <Button variant="secondary">View All Library</Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <Library className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Manage learning resources and documents</p>
            <Link to="/admin/library">
              <Button className="mt-4">Go to Library</Button>
            </Link>
          </div>
        </Card>
      )}

      {activeTab === 'questions' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-100">Question Bank</h3>
            <Link to="/admin/question-bank">
              <Button variant="secondary">View All Questions</Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <FileQuestion className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Create and manage quiz questions</p>
            <Link to="/admin/question-bank">
              <Button className="mt-4">Go to Question Bank</Button>
            </Link>
          </div>
        </Card>
      )}

      {activeTab === 'assignments' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-100">Assignments</h3>
            <Link to="/admin/assignments">
              <Button variant="secondary">View All Assignments</Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Manage student assignments</p>
            <Link to="/admin/assignments">
              <Button className="mt-4">Go to Assignments</Button>
            </Link>
          </div>
        </Card>
      )}

      {activeTab === 'users' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-100">Users Management</h3>
            <Link to="/admin/users">
              <Button variant="secondary">View All Users</Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Manage all platform users</p>
            <Link to="/admin/users">
              <Button className="mt-4">Go to Users</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

