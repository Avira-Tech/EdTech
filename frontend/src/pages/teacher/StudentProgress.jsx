import { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Clock, TrendingUp, Search, 
  Play, CheckCircle, Eye, Filter 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Select from '../../components/Common/Select';
import ProgressBar from '../../components/Common/ProgressBar';
import Modal from '../../components/Common/Modal';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI } from '../../services/api';

export default function TeacherStudentProgress() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getAll({ instructor: user._id });
      setCourses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      // Mock data for demo
      setCourses([
        {
          _id: '1',
          title: 'Complete Web Development Bootcamp',
          students: [
            {
              _id: 's1',
              firstName: 'Alice',
              lastName: 'Brown',
              email: 'alice@student.com',
              progress: 75,
              lastAccessedAt: '2024-02-14',
              lessonsCompleted: 45,
              totalLessons: 60,
              videoProgress: [
                { lesson: 'Introduction', watched: 100, duration: 600 },
                { lesson: 'HTML Basics', watched: 100, duration: 900 },
                { lesson: 'CSS Styling', watched: 60, duration: 1200 },
                { lesson: 'JavaScript', watched: 30, duration: 1800 }
              ]
            },
            {
              _id: 's2',
              firstName: 'Bob',
              lastName: 'Wilson',
              email: 'bob@student.com',
              progress: 45,
              lastAccessedAt: '2024-02-13',
              lessonsCompleted: 27,
              totalLessons: 60,
              videoProgress: [
                { lesson: 'Introduction', watched: 100, duration: 600 },
                { lesson: 'HTML Basics', watched: 100, duration: 900 },
                { lesson: 'CSS Styling', watched: 0, duration: 1200 },
                { lesson: 'JavaScript', watched: 0, duration: 1800 }
              ]
            },
            {
              _id: 's3',
              firstName: 'Carol',
              lastName: 'Davis',
              email: 'carol@student.com',
              progress: 90,
              lastAccessedAt: '2024-02-14',
              lessonsCompleted: 54,
              totalLessons: 60,
              videoProgress: [
                { lesson: 'Introduction', watched: 100, duration: 600 },
                { lesson: 'HTML Basics', watched: 100, duration: 900 },
                { lesson: 'CSS Styling', watched: 100, duration: 1200 },
                { lesson: 'JavaScript', watched: 80, duration: 1800 }
              ]
            }
          ]
        },
        {
          _id: '2',
          title: 'React - The Complete Guide',
          students: [
            {
              _id: 's4',
              firstName: 'David',
              lastName: 'Lee',
              email: 'david@student.com',
              progress: 60,
              lastAccessedAt: '2024-02-12',
              lessonsCompleted: 24,
              totalLessons: 40
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStudents = () => {
    if (!selectedCourse) return [];
    const course = courses.find(c => c._id === selectedCourse);
    return course?.students || [];
  };

  const getStats = () => {
    const students = getStudents();
    const totalStudents = students.length;
    const avgProgress = totalStudents > 0 
      ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / totalStudents)
      : 0;
    const completedCount = students.filter(s => s.progress === 100).length;
    const activeToday = students.filter(s => {
      const lastAccess = new Date(s.lastAccessedAt);
      const today = new Date();
      return lastAccess.toDateString() === today.toDateString();
    }).length;

    return { totalStudents, avgProgress, completedCount, activeToday };
  };

  const stats = getStats();

  const progressDistribution = [
    { range: '0-25%', count: getStudents().filter(s => s.progress <= 25).length },
    { range: '26-50%', count: getStudents().filter(s => s.progress > 25 && s.progress <= 50).length },
    { range: '51-75%', count: getStudents().filter(s => s.progress > 50 && s.progress <= 75).length },
    { range: '76-99%', count: getStudents().filter(s => s.progress > 75 && s.progress < 100).length },
    { range: '100%', count: getStudents().filter(s => s.progress === 100).length }
  ];

  const columns = [
    {
      title: 'Student',
      key: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-900/30 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-400">
              {row.firstName[0]}{row.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-100">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (value) => (
        <div className="w-32">
          <ProgressBar value={value} max={100} showLabel={false} size="sm" />
          <span className="text-sm text-gray-400 mt-1">{value}%</span>
        </div>
      )
    },
    {
      title: 'Lessons',
      key: 'lessons',
      render: (value, row) => (
        <span className="text-gray-300">
          {row.lessonsCompleted}/{row.totalLessons}
        </span>
      )
    },
    {
      title: 'Last Active',
      key: 'lastAccessedAt',
      render: (value) => {
        const date = new Date(value);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        
        return (
          <span className={isToday ? 'text-green-400' : 'text-gray-400'}>
            {isToday ? 'Today' : date.toLocaleDateString()}
          </span>
        );
      }
    },
    {
      title: 'Status',
      key: 'status',
      render: (value, row) => (
        <span className={`badge ${
          row.progress === 100 ? 'badge-success' :
          row.progress > 50 ? 'badge-primary' :
          row.progress > 0 ? 'badge-warning' : 'badge-gray'
        }`}>
          {row.progress === 100 ? 'Completed' :
           row.progress > 50 ? 'In Progress' :
           row.progress > 0 ? 'Just Started' : 'Not Started'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedStudent(row);
              setShowDetailModal(true);
            }}
            className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-gray-100"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-gray-100">
            <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Student Progress</h1>
        <p className="text-gray-400 mt-1">Track student progress and video lecture completion</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-900/30 rounded-lg">
              <Users className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-100">{stats.totalStudents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg. Progress</p>
              <p className="text-2xl font-bold text-gray-100">{stats.avgProgress}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-100">{stats.completedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Today</p>
              <p className="text-2xl font-bold text-gray-100">{stats.activeToday}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Course Selection & Progress Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Select
            label="Select Course"
            options={[
              { value: '', label: 'All Courses' },
              ...courses.map(c => ({ value: c._id, label: c.title }))
            ]}
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          />
        </div>
        <Card className="p-4">
          <div className="panel-header mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Progress Distribution</h3>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="range" stroke="#757575" fontSize={10} />
                <YAxis stroke="#757575" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f1f1f', 
                    border: '1px solid #404040',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#1086ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Student Table */}
      <Card className="overflow-hidden">
        <div className="panel-header">
          <h3 className="text-lg font-semibold text-gray-100">Students</h3>
        </div>
        {getStudents().length > 0 ? (
          <Table
            columns={columns}
            data={getStudents()}
            loading={loading}
            pagination
            pageSize={10}
            emptyMessage="No students enrolled in this course"
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              {selectedCourse ? 'No students enrolled in this course yet' : 'Select a course to view students'}
            </p>
          </div>
        )}
      </Card>

      {/* Student Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedStudent(null);
        }}
        title="Student Progress Details"
        size="lg"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-primary-400">
                  {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <p className="text-gray-400">{selectedStudent.email}</p>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Overall Progress</span>
                <span className="text-xl font-bold text-primary-400">{selectedStudent.progress}%</span>
              </div>
              <ProgressBar value={selectedStudent.progress} max={100} showLabel={false} size="lg" />
            </div>

            {/* Video Progress */}
            {selectedStudent.videoProgress && (
              <div>
                <h4 className="font-medium text-gray-100 mb-3">Video Lecture Progress</h4>
                <div className="space-y-3">
                  {selectedStudent.videoProgress.map((video, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-gray-800/30 rounded-lg">
                      <div className="p-2 bg-primary-900/20 rounded-lg">
                        <Play className="w-4 h-4 text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-100">{video.lesson}</p>
                        <ProgressBar 
                          value={video.watched} 
                          max={100} 
                          showLabel={false} 
                          size="sm"
                          color={video.watched === 100 ? 'success' : 'primary'}
                        />
                      </div>
                      <div className="text-right">
                        <span className={`text-sm ${video.watched === 100 ? 'text-green-400' : 'text-gray-400'}`}>
                          {video.watched}%
                        </span>
                        <p className="text-xs text-gray-500">
                          {Math.round(video.duration * video.watched / 60)}s / {Math.round(video.duration / 60)}s
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              <Button>
                Send Message
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

