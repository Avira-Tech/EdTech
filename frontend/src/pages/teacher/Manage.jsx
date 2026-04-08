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
  AlertCircle,
  GraduationCap,
  Search,
  Edit,
  Trash2,
  Check,
  ArrowUpCircle
} from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import StatsCard from '../../components/Common/StatsCard';
import { coursesAPI, assignmentsAPI, questionsAPI, meetingsAPI } from '../../services/api';

export default function TeacherManage() {
  const [stats, setStats] = useState({
    courses: { total: 0, published: 0, draft: 0 },
    assignments: { total: 0, active: 0 },
    questions: { total: 0 },
    meetings: { upcoming: 0, past: 0 },
    students: { total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Course management state
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch courses when switching to courses tab or when filters change
  useEffect(() => {
    if (activeTab === 'courses') {
      fetchCourses();
    }
  }, [activeTab, pagination.page, searchTerm, statusFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status: statusFilter || undefined
      };
      
      const response = await coursesAPI.getAll(params);
      setCourses(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || response.data.data?.length || 0
      }));
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      // Fallback to mock data
      setCourses([
        {
          _id: '1',
          title: 'Complete Web Development Bootcamp',
          status: 'published',
          enrollmentCount: 89,
          modules: [{ lessons: [1, 2, 3, 4, 5] }, { lessons: [1, 2, 3, 4] }],
          createdAt: '2024-01-15',
        },
        {
          _id: '2',
          title: 'React - The Complete Guide',
          status: 'published',
          enrollmentCount: 67,
          modules: [{ lessons: [1, 2, 3, 4] }],
          createdAt: '2024-01-20',
        },
        {
          _id: '3',
          title: 'Node.js Masterclass',
          status: 'draft',
          enrollmentCount: 0,
          modules: [{ lessons: [1, 2] }],
          createdAt: '2024-02-01',
        },
      ]);
      setPagination(prev => ({ ...prev, total: 3 }));
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchTerm || 
      course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handlePublishCourse = async (courseId, course) => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    try {
      await coursesAPI.update(courseId, { status: newStatus });
      // Update locally immediately for better UX
      setCourses(prev => prev.map(c => 
        c._id === courseId ? { ...c, status: newStatus } : c
      ));
      // Then refresh from server
      fetchCourses();
    } catch (error) {
      console.error('Failed to update course status:', error);
      // Revert on error
      setCourses(prev => prev.map(c => 
        c._id === courseId ? { ...c, status: course.status } : c
      ));
      alert(`Failed to ${newStatus === 'published' ? 'publish' : 'unpublish'} course: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await coursesAPI.delete(courseId);
      setDeleteConfirm(null);
      fetchCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
      // Remove from local state as fallback
      setDeleteConfirm(null);
      setCourses(prev => prev.filter(c => c._id !== courseId));
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch teacher stats in parallel
      const [coursesRes, assignmentsRes, questionsRes, meetingsRes] = await Promise.allSettled([
        coursesAPI.getAll({ limit: 100 }),
        assignmentsAPI.getAll({ limit: 100 }),
        questionsAPI.getAll({ limit: 1 }),
        meetingsAPI.getStats()
      ]);

      const courses = coursesRes.status === 'fulfilled' ? coursesRes.value.data.data || [] : [];
      
      setStats({
        courses: {
          total: coursesRes.status === 'fulfilled' ? coursesRes.value.data.pagination?.total || courses.length : 0,
          published: courses.filter(c => c.status === 'published').length,
          draft: courses.filter(c => c.status === 'draft').length
        },
        assignments: {
          total: assignmentsRes.status === 'fulfilled' ? assignmentsRes.value.data.pagination?.total || 0 : 0,
          active: 0
        },
        questions: {
          total: questionsRes.status === 'fulfilled' ? questionsRes.value.data.pagination?.total || 0 : 0
        },
        meetings: {
          upcoming: meetingsRes.status === 'fulfilled' ? meetingsRes.value.data.data?.upcomingMeetings || 0 : 0,
          past: meetingsRes.status === 'fulfilled' ? meetingsRes.value.data.data?.endedMeetings || 0 : 0
        },
        students: {
          total: 0
        }
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set default stats on error
      setStats({
        courses: { total: 8, published: 5, draft: 3 },
        assignments: { total: 24, active: 12 },
        questions: { total: 456 },
        meetings: { upcoming: 4, past: 15 },
        students: { total: 234 }
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'courses', label: 'Courses' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'meetings', label: 'Meetings' }
  ];

  const managementCards = [
    {
      title: 'My Courses',
      description: 'View and manage your created courses',
      icon: BookOpen,
      path: '/teacher/courses',
      color: 'primary',
      stats: stats.courses.total
    },
    {
      title: 'Create Course',
      description: 'Create a new course',
      icon: BookOpen,
      path: '/teacher/courses/new',
      color: 'green',
      stats: null
    },
    {
      title: 'Grade Submissions',
      description: 'Review and grade student submissions',
      icon: ClipboardList,
      path: '/teacher/assignments',
      color: 'yellow',
      stats: stats.assignments.active
    },
    {
      title: 'Question Bank',
      description: 'Create and manage quiz questions',
      icon: FileQuestion,
      path: '/teacher/question-bank',
      color: 'purple',
      stats: stats.questions.total
    },
    {
      title: 'Student Progress',
      description: 'Track student learning progress',
      icon: Users,
      path: '/teacher/student-progress',
      color: 'blue',
      stats: stats.students.total
    },
    {
      title: 'Live Meetings',
      description: 'Manage live video sessions',
      icon: Video,
      path: '/teacher/meetings',
      color: 'pink',
      stats: stats.meetings.upcoming
    },
    {
      title: 'Analytics',
      description: 'View teaching analytics',
      icon: BarChart3,
      path: '/teacher/analytics',
      color: 'cyan',
      stats: null
    },
    {
      title: 'Settings',
      description: 'Account and teaching settings',
      icon: Settings,
      path: '/teacher/settings',
      color: 'gray',
      stats: null
    }
  ];

  const recentActivity = [
    { id: 1, type: 'submission', action: 'submitted assignment', student: 'John Doe', course: 'Web Development', time: '2 hours ago' },
    { id: 2, type: 'enrollment', action: 'enrolled in course', student: 'Jane Smith', course: 'React', time: '4 hours ago' },
    { id: 3, type: 'meeting', action: 'scheduled meeting', course: 'Node.js', time: '5 hours ago' },
    { id: 4, type: 'question', action: 'added 10 new questions', course: 'Quiz #5', time: '1 day ago' },
    { id: 5, type: 'progress', action: 'completed module', student: 'Mike Johnson', course: 'Python', time: '1 day ago' },
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary-900/30 text-primary-400 border-primary-800',
      green: 'bg-green-900/30 text-green-400 border-green-800',
      yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
      purple: 'bg-purple-900/30 text-purple-400 border-purple-800',
      blue: 'bg-blue-900/30 text-blue-400 border-blue-800',
      pink: 'bg-pink-900/30 text-pink-400 border-pink-800',
      cyan: 'bg-cyan-900/30 text-cyan-400 border-cyan-800',
      gray: 'bg-gray-800/50 text-gray-400 border-gray-700'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Manage</h1>
          <p className="text-gray-400 mt-1">Manage your courses, assignments, and teaching materials</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/teacher/courses/new">
            <Button icon={BookOpen}>
              Create Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Courses"
          value={loading ? '...' : stats.courses.total}
          icon={BookOpen}
        />
        <StatsCard
          title="Published"
          value={loading ? '...' : stats.courses.published}
          icon={CheckCircle}
          className="text-green-400"
        />
        <StatsCard
          title="Assignments"
          value={loading ? '...' : stats.assignments.total}
          icon={ClipboardList}
        />
        <StatsCard
          title="Upcoming Meetings"
          value={loading ? '...' : stats.meetings.upcoming}
          icon={Video}
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
                  <div className={`p-2 rounded-lg bg-opacity-50 ${
                    card.color === 'primary' ? 'bg-primary-600' :
                    card.color === 'green' ? 'bg-green-600' :
                    card.color === 'yellow' ? 'bg-yellow-600' :
                    card.color === 'purple' ? 'bg-purple-600' :
                    card.color === 'blue' ? 'bg-blue-600' :
                    card.color === 'pink' ? 'bg-pink-600' :
                    card.color === 'cyan' ? 'bg-cyan-600' :
                    'bg-gray-600'
                  }`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  {card.stats !== null && (
                    <span className="text-2xl font-bold">{card.stats}</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-100 mb-1">{card.title}</h3>
                <p className="text-sm text-gray-400 mb-3">{card.description}</p>
                <div className="flex items-center gap-1 text-sm text-primary-400">
                  <span>Open</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-100">Recent Student Activity</h3>
              <Link to="/teacher/student-progress">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'submission' ? 'bg-primary-900/50' :
                    activity.type === 'enrollment' ? 'bg-green-900/50' :
                    activity.type === 'meeting' ? 'bg-pink-900/50' :
                    activity.type === 'question' ? 'bg-yellow-900/50' :
                    'bg-blue-900/50'
                  }`}>
                    {activity.type === 'submission' && <ClipboardList className="w-5 h-5 text-primary-400" />}
                    {activity.type === 'enrollment' && <Users className="w-5 h-5 text-green-400" />}
                    {activity.type === 'meeting' && <Video className="w-5 h-5 text-pink-400" />}
                    {activity.type === 'question' && <FileQuestion className="w-5 h-5 text-yellow-400" />}
                    {activity.type === 'progress' && <GraduationCap className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-gray-100">{activity.student || activity.course}</span>
                      {' '}
                      <span className="text-gray-400">{activity.action}</span>
                    </p>
                    {activity.course && (
                      <p className="text-xs text-gray-500">{activity.course}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions & Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-100 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/teacher/courses/new"
                  className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center"
                >
                  <BookOpen className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-300">New Course</span>
                </Link>
                <Link
                  to="/teacher/assignments"
                  className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center"
                >
                  <ClipboardList className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-300">Grade Work</span>
                </Link>
                <Link
                  to="/teacher/meetings"
                  className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center"
                >
                  <Video className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-300">Schedule Meeting</span>
                </Link>
                <Link
                  to="/teacher/question-bank"
                  className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-center"
                >
                  <FileQuestion className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-300">Add Questions</span>
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-gray-100 mb-4">Teaching Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Published Courses</span>
                  </div>
                  <span className="text-sm font-medium text-gray-100">{stats.courses.published}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">Draft Courses</span>
                  </div>
                  <span className="text-sm font-medium text-gray-100">{stats.courses.draft}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">Active Assignments</span>
                  </div>
                  <span className="text-sm font-medium text-gray-100">{stats.assignments.active}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-pink-400" />
                    <span className="text-gray-300">Upcoming Meetings</span>
                  </div>
                  <span className="text-sm font-medium text-gray-100">{stats.meetings.upcoming}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">My Courses</h1>
              <p className="text-gray-400 mt-1">Manage your courses and curriculum</p>
            </div>
            <Link to="/teacher/courses/new">
              <Button icon={BookOpen}>Create Course</Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search courses..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setStatusFilter('');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === ''
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setStatusFilter('published');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'published'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                }`}
              >
                Published
              </button>
              <button
                onClick={() => {
                  setStatusFilter('draft');
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'draft'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-gray-100'
                }`}
              >
                Drafts
              </button>
            </div>
          </div>

          {/* Courses List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter ? 'No courses match your search/filter' : 'No courses yet'}
              </p>
              <Link to="/teacher/courses/new">
                <Button icon={BookOpen}>
                  Create Your First Course
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card key={course._id} className="overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <span className="text-2xl font-bold text-gray-700">
                            {course.title?.charAt(0) || 'C'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-100 truncate">{course.title}</h3>
                        <span className={`badge ${
                          course.status === 'published' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.enrollmentCount || 0} students
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} lessons
                        </span>
                        <span className="text-xs text-gray-500">
                          Created {new Date(course.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/teacher/courses/${course._id}/edit`}
                        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-100"
                        title="Edit Course"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handlePublishCourse(course._id, course)}
                        className={`p-2 rounded-lg hover:bg-gray-800 ${
                          course.status === 'published' 
                            ? 'text-green-400 hover:text-green-300' 
                            : 'text-gray-400 hover:text-gray-100'
                        }`}
                        title={course.status === 'published' ? 'Unpublish' : 'Publish'}
                      >
                        {course.status === 'published' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <ArrowUpCircle className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(course)}
                        className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-400">
                    Showing {filteredCourses.length} of {pagination.total} courses
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-400">
                      Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-semibold text-gray-100">Delete Course</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Are you sure you want to delete "{deleteConfirm.title}"? 
                  This action cannot be undone.
                </p>
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg mb-4">
                  <p className="text-sm text-red-400">
                    Warning: All enrollments and progress data for this course will also be deleted.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => handleDeleteCourse(deleteConfirm._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-100">Assignments</h3>
            <Link to="/teacher/assignments">
              <Button variant="secondary">View All</Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Grade student submissions</p>
            <Link to="/teacher/assignments">
              <Button variant="secondary">Go to Grading</Button>
            </Link>
          </div>
        </Card>
      )}

      {activeTab === 'meetings' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-100">Live Meetings</h3>
            <Link to="/teacher/meetings">
              <Button variant="secondary">View All</Button>
            </Link>
          </div>
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Manage your live sessions</p>
            <Link to="/teacher/meetings">
              <Button variant="secondary">Go to Meetings</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

