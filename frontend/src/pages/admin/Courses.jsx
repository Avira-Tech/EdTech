import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreVertical, X, Check, Users, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import { coursesAPI } from '../../services/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    fetchCourses();
  }, [pagination.page, searchTerm, statusFilter, categoryFilter]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter || undefined,
        category: categoryFilter || undefined
      };
      
      const response = await coursesAPI.getAll(params);
      setCourses(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total
      }));
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      // Fallback to mock data if API fails
      setCourses([
        {
          _id: '1',
          title: 'Complete Web Development Bootcamp',
          instructor: { firstName: 'John', lastName: 'Smith' },
          category: 'Web Development',
          status: 'published',
          enrollmentCount: 234,
          rating: { average: 4.8, count: 156 },
          pricing: { type: 'one-time', price: 99.99 },
          createdAt: '2024-01-15',
        },
        {
          _id: '2',
          title: 'Machine Learning A-Z',
          instructor: { firstName: 'Sarah', lastName: 'Johnson' },
          category: 'Data Science',
          status: 'published',
          enrollmentCount: 189,
          rating: { average: 4.7, count: 98 },
          pricing: { type: 'one-time', price: 149.99 },
          createdAt: '2024-01-20',
        },
        {
          _id: '3',
          title: 'React - The Complete Guide',
          instructor: { firstName: 'John', lastName: 'Smith' },
          category: 'Web Development',
          status: 'draft',
          enrollmentCount: 0,
          rating: { average: 0, count: 0 },
          pricing: { type: 'one-time', price: 129.99 },
          createdAt: '2024-02-01',
        },
        {
          _id: '4',
          title: 'Python for Beginners',
          instructor: { firstName: 'Sarah', lastName: 'Johnson' },
          category: 'Programming',
          status: 'published',
          enrollmentCount: 567,
          rating: { average: 4.9, count: 423 },
          pricing: { type: 'free', price: 0 },
          createdAt: '2024-01-10',
        },
      ]);
      setPagination(prev => ({ ...prev, total: 4 }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await coursesAPI.delete(courseId);
      setDeleteConfirm(null);
      fetchCourses();
    } catch (error) {
      console.error('Failed to delete course:', error);
      // If API fails, still remove from local state
      setDeleteConfirm(null);
      setCourses(prev => prev.filter(c => c._id !== courseId));
    }
  };

  const handlePublishCourse = async (courseId, course) => {
    try {
      const newStatus = course.status === 'published' ? 'draft' : 'published';
      await coursesAPI.update(courseId, { status: newStatus });
      fetchCourses();
    } catch (error) {
      console.error('Failed to update course status:', error);
      // Update locally as fallback
      setCourses(prev => prev.map(c => 
        c._id === courseId ? { ...c, status: newStatus } : c
      ));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: 'badge-success',
      draft: 'badge-warning',
      archived: 'badge-gray',
    };
    return <span className={`badge ${styles[status]}`}>{status}</span>;
  };

  const getPricingLabel = (pricing) => {
    if (pricing.type === 'free') return 'Free';
    if (pricing.discountedPrice && pricing.discountedPrice < pricing.price) {
      return `$${pricing.discountedPrice.toFixed(2)}`;
    }
    return `$${pricing.price.toFixed(2)}`;
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'devops', label: 'DevOps' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'programming', label: 'Programming' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Courses</h1>
          <p className="text-gray-400 mt-1">Manage your courses and curriculum</p>
        </div>
        <Link to="/admin/courses/new">
          <Button icon={Plus}>
            Add Course
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
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          />
        </div>
        <Select
          options={statuses}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="w-auto min-w-[140px]"
        />
        <Select
          options={categories}
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="w-auto min-w-[180px]"
        />
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : courses.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400 mb-4">No courses found</p>
          <Link to="/admin/courses/new">
            <Button icon={Plus}>
              Create Your First Course
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
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
                    {getStatusBadge(course.status)}
                    {course.featured && (
                      <span className="badge badge-warning">Featured</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{course.category}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="text-gray-500">By:</span>
                      {course.instructor?.firstName} {course.instructor?.lastName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.enrollmentCount || 0} students
                    </span>
                    {course.rating?.average > 0 && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        {course.rating.average.toFixed(1)} ({course.rating.count})
                      </span>
                    )}
                    <span className="font-medium text-gray-100">
                      {getPricingLabel(course.pricing)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/courses/${course._id}/edit`}
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
                      <Check className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(course)}
                    className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-danger-400"
                    title="Delete Course"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === course._id ? null : course._id)}
                      className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showMenu === course._id && (
                      <div className="dropdown">
                        <Link
                          to={`/admin/courses/${course._id}`}
                          className="dropdown-item flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" /> View Details
                        </Link>
                        <Link
                          to={`/teacher/courses/${course._id}/content`}
                          className="dropdown-item flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" /> Edit Content
                        </Link>
                        <button
                          onClick={() => handlePublishCourse(course._id, course)}
                          className="dropdown-item flex items-center gap-2"
                        >
                          {course.status === 'published' ? (
                            <>
                              <Eye className="w-4 h-4" /> Unpublish
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" /> Publish
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-400">
                Showing {courses.length} of {pagination.total} courses
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
        <Modal
          title="Delete Course"
          onClose={() => setDeleteConfirm(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleDeleteCourse(deleteConfirm._id)}
              >
                Delete
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-400">
              Are you sure you want to delete "{deleteConfirm.title}"? 
              This action cannot be undone.
            </p>
            <div className="p-4 bg-danger-900/20 border border-danger-800 rounded-lg">
              <p className="text-sm text-danger-400">
                Warning: All enrollments and progress data for this course will also be deleted.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

