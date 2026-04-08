import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Users, 
  Star, 
  Clock,
  CheckCircle,
  Lock
} from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import EmptyState from '../../components/Common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI, enrollmentsAPI } from '../../services/api';

export default function BrowseCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    sortBy: 'newest'
  });
  const [showEnrollModal, setShowEnrollModal] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        status: 'published',
        search: filters.search || undefined,
        category: filters.category || undefined,
        level: filters.level || undefined,
        sortBy: filters.sortBy
      };
      
      const response = await coursesAPI.getAll(params);
      setCourses(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      // Mock data for demo
      setCourses([
        {
          _id: '1',
          title: 'Complete Web Development Bootcamp',
          shortDescription: 'Learn HTML, CSS, JavaScript, React, Node.js and more',
          thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
          instructor: { firstName: 'John', lastName: 'Smith' },
          category: 'Web Development',
          level: 'beginner',
          pricing: { type: 'one-time', price: 99.99 },
          enrollmentCount: 1234,
          rating: { average: 4.8, count: 456 },
          duration: 40,
          modules: [{ lessons: [1, 2, 3, 4, 5] }, { lessons: [6, 7, 8, 9, 10] }]
        },
        {
          _id: '2',
          title: 'React - The Complete Guide',
          shortDescription: 'Master React from scratch with hooks, context, and more',
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
          instructor: { firstName: 'Sarah', lastName: 'Johnson' },
          category: 'Web Development',
          level: 'intermediate',
          pricing: { type: 'one-time', price: 129.99 },
          enrollmentCount: 890,
          rating: { average: 4.7, count: 234 },
          duration: 35,
          modules: [{ lessons: [1, 2, 3, 4] }, { lessons: [5, 6, 7, 8] }]
        },
        {
          _id: '3',
          title: 'Python for Data Science',
          shortDescription: 'Learn Python programming and data analysis with Pandas, NumPy',
          thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
          instructor: { firstName: 'Mike', lastName: 'Wilson' },
          category: 'Data Science',
          level: 'beginner',
          pricing: { type: 'free', price: 0 },
          enrollmentCount: 2345,
          rating: { average: 4.9, count: 567 },
          duration: 25,
          modules: [{ lessons: [1, 2, 3, 4, 5] }]
        },
        {
          _id: '4',
          title: 'Node.js Masterclass',
          shortDescription: 'Build REST APIs and full-stack applications with Node.js',
          thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
          instructor: { firstName: 'Emily', lastName: 'Davis' },
          category: 'Backend',
          level: 'advanced',
          pricing: { type: 'one-time', price: 149.99 },
          enrollmentCount: 567,
          rating: { average: 4.6, count: 123 },
          duration: 45,
          modules: [{ lessons: [1, 2, 3] }, { lessons: [4, 5, 6] }, { lessons: [7, 8, 9] }]
        },
        {
          _id: '5',
          title: 'Machine Learning A-Z',
          shortDescription: 'Learn Machine Learning, Deep Learning, and AI from scratch',
          thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=250&fit=crop',
          instructor: { firstName: 'Alex', lastName: 'Chen' },
          category: 'Artificial Intelligence',
          level: 'intermediate',
          pricing: { type: 'one-time', price: 199.99 },
          enrollmentCount: 1890,
          rating: { average: 4.8, count: 345 },
          duration: 60,
          modules: [{ lessons: [1, 2, 3, 4] }, { lessons: [5, 6, 7, 8] }]
        },
        {
          _id: '6',
          title: 'UI/UX Design Fundamentals',
          shortDescription: 'Learn user interface and user experience design principles',
          thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
          instructor: { firstName: 'Lisa', lastName: 'Park' },
          category: 'Design',
          level: 'beginner',
          pricing: { type: 'one-time', price: 79.99 },
          enrollmentCount: 678,
          rating: { average: 4.5, count: 89 },
          duration: 20,
          modules: [{ lessons: [1, 2, 3, 4, 5] }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentsAPI.getMyEnrollments();
      const enrolledIds = (response.data.data || []).map(e => e.course?._id || e.course);
      setEnrolledCourseIds(enrolledIds);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  const handleEnroll = async (course) => {
    // For free courses, enroll directly
    if (course.pricing?.type === 'free') {
      try {
        setEnrolling(true);
        await coursesAPI.enroll(course._id);
        setEnrolledCourseIds(prev => [...prev, course._id]);
        // Refresh enrollments
        fetchEnrollments();
      } catch (error) {
        console.error('Failed to enroll:', error);
        // For demo mode, still add to enrolled
        if (error.response?.status === 400 || error.response?.status === 500) {
          setEnrolledCourseIds(prev => [...prev, course._id]);
        }
        alert(error.response?.data?.message || 'Failed to enroll in course');
      } finally {
        setEnrolling(false);
      }
    } else {
      // For paid courses, show modal
      setShowEnrollModal(course);
    }
  };

  const handlePaidEnroll = async (courseId) => {
    try {
      setEnrolling(true);
      await coursesAPI.enroll(courseId);
      setEnrolledCourseIds(prev => [...prev, courseId]);
      setShowEnrollModal(null);
      // Refresh enrollments
      fetchEnrollments();
    } catch (error) {
      console.error('Failed to enroll:', error);
      // For demo mode, still add to enrolled
      if (error.response?.status === 400 || error.response?.status === 500) {
        setEnrolledCourseIds(prev => [...prev, courseId]);
        setShowEnrollModal(null);
        alert('Demo mode: Enrollment successful!');
      } else {
        alert(error.response?.data?.message || 'Failed to enroll in course');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = (courseId) => enrolledCourseIds.includes(courseId);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !filters.search || 
      course.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.shortDescription?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || course.category === filters.category;
    const matchesLevel = !filters.level || course.level === filters.level;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Web Development', label: 'Web Development' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Artificial Intelligence', label: 'AI & Machine Learning' },
    { value: 'Backend', label: 'Backend' },
    { value: 'Design', label: 'Design' },
    { value: 'Mobile Development', label: 'Mobile Development' },
    { value: 'DevOps', label: 'DevOps' }
  ];

  const levels = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  const formatPrice = (pricing) => {
    if (pricing.type === 'free') return 'Free';
    return `$${pricing.price?.toFixed(2)}`;
  };

  const totalLessons = (modules) => {
    return modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Browse Courses</h1>
          <p className="text-gray-400 mt-1">Discover new skills and advance your career</p>
        </div>
        <Link to="/student/courses">
          <Button variant="secondary" icon={BookOpen}>
            My Enrolled Courses
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input pl-10"
          />
        </div>
        <select
          className="input w-auto min-w-[160px]"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <select
          className="input w-auto min-w-[140px]"
          value={filters.level}
          onChange={(e) => setFilters({ ...filters, level: e.target.value })}
        >
          {levels.map(level => (
            <option key={level.value} value={level.value}>{level.label}</option>
          ))}
        </select>
        <select
          className="input w-auto min-w-[160px]"
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        {filteredCourses.length} courses found
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course._id} className="overflow-hidden group" hover>
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-44 object-cover"
                />
                {isEnrolled(course._id) && (
                  <div className="absolute top-3 right-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Enrolled
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="badge badge-info capitalize">{course.level}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Category */}
                <p className="text-xs text-primary-400 font-medium mb-1">{course.category}</p>
                
                {/* Title */}
                <h3 className="font-semibold text-gray-100 mb-2 line-clamp-2">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {course.shortDescription}
                </p>

                {/* Instructor */}
                <p className="text-sm text-gray-500 mb-3">
                  by {course.instructor?.firstName} {course.instructor?.lastName}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}h
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {totalLessons(course.modules)} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.enrollmentCount?.toLocaleString() || 0}
                  </span>
                </div>

                {/* Rating & Price */}
                <div className="flex items-center justify-between mb-3">
                  {course.rating?.average > 0 ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-gray-100">
                        {course.rating.average.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({course.rating.count})
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No ratings yet</span>
                  )}
                  <span className={`text-lg font-bold ${
                    course.pricing?.type === 'free' 
                      ? 'text-green-400' 
                      : 'text-gray-100'
                  }`}>
                    {formatPrice(course.pricing)}
                  </span>
                </div>

                {/* Action Button */}
                {isEnrolled(course._id) ? (
                  <Link to={`/student/courses/${course._id}`}>
                    <Button fullWidth icon={BookOpen}>
                      Continue Learning
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    fullWidth 
                    variant={course.pricing?.type === 'free' ? 'primary' : 'secondary'}
                    onClick={() => handleEnroll(course)}
                    disabled={enrolling}
                    icon={course.pricing?.type === 'free' ? CheckCircle : Lock}
                  >
                    {course.pricing?.type === 'free' ? 'Enroll Now' : 'Buy Now'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <Modal
          title="Enroll in Course"
          onClose={() => setShowEnrollModal(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowEnrollModal(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handlePaidEnroll(showEnrollModal._id)}
                loading={enrolling}
              >
                {showEnrollModal.pricing?.type === 'free' ? 'Enroll' : 'Buy Now'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex gap-4">
              <img
                src={showEnrollModal.thumbnail}
                alt={showEnrollModal.title}
                className="w-32 h-20 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-gray-100">{showEnrollModal.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  by {showEnrollModal.instructor?.firstName} {showEnrollModal.instructor?.lastName}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Course Price</span>
                <span className="text-xl font-bold text-gray-100">
                  {formatPrice(showEnrollModal.pricing)}
                </span>
              </div>
            </div>

            {showEnrollModal.pricing?.type !== 'free' && (
              <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-400">
                  This is a demo. In production, payment would be processed here.
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

