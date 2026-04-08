import { useState, useEffect } from 'react';
import { BookOpen, Clock, Play, CheckCircle, Award, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import ProgressBar from '../../components/Common/ProgressBar';
import Select from '../../components/Common/Select';
import EmptyState from '../../components/Common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI, enrollmentsAPI } from '../../services/api';

export default function StudentMyCourses() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      // Call real API
      const response = await enrollmentsAPI.getMyEnrollments();
      setEnrollments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      // Fallback to mock data
      setEnrollments([
        {
          _id: 'e1',
          course: {
            _id: 'c1',
            title: 'Complete Web Development Bootcamp',
            thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
            instructor: { firstName: 'John', lastName: 'Smith' },
            totalLessons: 120,
            modules: [
              { lessons: [1, 2, 3, 4, 5] },
              { lessons: [6, 7, 8, 9, 10] },
              { lessons: [11, 12, 13, 14, 15] }
            ]
          },
          progress: {
            percentage: 75,
            completedLessons: ['1', '2', '3', '4', '5', '6', '7', '8', '9']
          },
          lastAccessedAt: '2024-02-14',
          status: 'active'
        },
        {
          _id: 'e2',
          course: {
            _id: 'c2',
            title: 'React - The Complete Guide',
            thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
            instructor: { firstName: 'Sarah', lastName: 'Johnson' },
            totalLessons: 80,
            modules: [
              { lessons: [1, 2, 3, 4] },
              { lessons: [5, 6, 7, 8] },
              { lessons: [9, 10, 11, 12] }
            ]
          },
          progress: {
            percentage: 45,
            completedLessons: ['1', '2', '3', '4', '5', '6', '7', '8']
          },
          lastAccessedAt: '2024-02-13',
          status: 'active'
        },
        {
          _id: 'e3',
          course: {
            _id: 'c3',
            title: 'Python for Data Science',
            thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=300&h=200&fit=crop',
            instructor: { firstName: 'Mike', lastName: 'Wilson' },
            totalLessons: 60,
            modules: [
              { lessons: [1, 2, 3, 4, 5] },
              { lessons: [6, 7, 8, 9, 10] }
            ]
          },
          progress: {
            percentage: 100,
            completedLessons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
          },
          lastAccessedAt: '2024-02-10',
          status: 'completed',
          completion: {
            completedAt: '2024-02-10',
            finalScore: 92
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalLessonsCompleted = enrollments.reduce(
    (acc, e) => acc + (e.progress?.completedLessons?.length || 0), 0
  );

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(e => e.status === 'completed').length;

  const getFilteredEnrollments = () => {
    let filtered = enrollments;
    
    if (filters.status === 'in-progress') {
      filtered = filtered.filter(e => e.status === 'active' && e.progress.percentage < 100);
    } else if (filters.status === 'completed') {
      filtered = filtered.filter(e => e.status === 'completed');
    } else if (filters.status === 'not-started') {
      filtered = filtered.filter(e => e.progress.percentage === 0);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.course.title.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  const formatLastAccessed = (date) => {
    const lastAccess = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastAccess.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (lastAccess.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return lastAccess.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">My Courses</h1>
          <p className="text-gray-400 mt-1">Continue learning where you left off</p>
        </div>
        <Link to="/courses">
          <Button icon={BookOpen}>
            Browse Courses
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-100">{totalCourses}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-100">{completedCourses}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-100">
                {enrollments.filter(e => e.status === 'active' && e.progress.percentage < 100).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Lessons Completed</p>
              <p className="text-2xl font-bold text-gray-100">{totalLessonsCompleted}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input pl-10"
          />
        </div>
        <Select
          options={[
            { value: 'all', label: 'All Courses' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'not-started', label: 'Not Started' }
          ]}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="w-auto"
        />
      </div>

      {/* Course Cards */}
      {getFilteredEnrollments().length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredEnrollments().map((enrollment) => (
            <Card key={enrollment._id} className="overflow-hidden group" hover>
              <div className="relative">
                <img
                  src={enrollment.course.thumbnail}
                  alt={enrollment.course.title}
                  className="w-full h-40 object-cover"
                />
                {enrollment.status === 'completed' && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-100 mb-1 line-clamp-2">
                  {enrollment.course.title}
                </h3>
                <p className="text-sm text-gray-400 mb-3">
                  by {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                </p>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-primary-400 font-medium">{enrollment.progress.percentage}%</span>
                  </div>
                  <ProgressBar 
                    value={enrollment.progress.percentage} 
                    max={100} 
                    showLabel={false}
                    color={enrollment.status === 'completed' ? 'success' : 'primary'}
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>
                    {enrollment.progress.completedLessons?.length || 0} / {enrollment.course.totalLessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatLastAccessed(enrollment.lastAccessedAt)}
                  </span>
                </div>

                <Link to={`/student/courses/${enrollment.course._id}`}>
                  <Button 
                    variant={enrollment.status === 'completed' ? 'secondary' : 'primary'} 
                    fullWidth
                    icon={Play}
                  >
                    {enrollment.status === 'completed' ? 'Review Course' : 'Continue Learning'}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description={
            filters.status !== 'all' || filters.search
              ? "Try adjusting your filters"
              : "Start learning by enrolling in a course"
          }
          action={
            filters.status !== 'all' || filters.search ? (
              <Button variant="secondary" onClick={() => setFilters({ status: 'all', search: '' })}>
                Clear Filters
              </Button>
            ) : (
              <Link to="/courses">
                <Button icon={BookOpen}>
                  Browse Courses
                </Button>
              </Link>
            )
          }
        />
      )}
    </div>
  );
}

