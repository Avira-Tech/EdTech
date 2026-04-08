import { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, User, BookOpen, 
  Search, Filter, Eye, Send, MessageSquare,
  Award, AlertCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Tabs from '../../components/Common/Tabs';
import ProgressBar from '../../components/Common/ProgressBar';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#1086ff', '#3cc13b', '#f5b400', '#e02f44'];

export default function GradeSubmissions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradingData, setGradingData] = useState({
    score: 0,
    maxScore: 100,
    feedback: '',
    status: 'graded'
  });

  useEffect(() => {
    fetchSubmissions();
  }, [activeTab]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      const mockSubmissions = [
        {
          _id: 's1',
          student: { firstName: 'Alice', lastName: 'Brown', email: 'alice@student.com', avatar: null },
          assignment: { 
            _id: 'a1', 
            title: 'React Final Project', 
            course: { title: 'Web Development Bootcamp' },
            maxScore: 100,
            dueDate: '2024-02-20'
          },
          content: 'Here is my React project. I implemented a full-stack application with authentication...',
          submittedAt: '2024-02-14T10:30:00',
          isLate: false,
          status: 'pending',
          attachments: [
            { name: 'project.zip', size: '2.4 MB', type: 'application/zip' }
          ]
        },
        {
          _id: 's2',
          student: { firstName: 'Bob', lastName: 'Wilson', email: 'bob@student.com', avatar: null },
          assignment: { 
            _id: 'a1', 
            title: 'React Final Project', 
            course: { title: 'Web Development Bootcamp' },
            maxScore: 100,
            dueDate: '2024-02-20'
          },
          content: 'My submission for the React project. Features include: component-based architecture...',
          submittedAt: '2024-02-13T15:45:00',
          isLate: true,
          status: 'pending',
          attachments: []
        },
        {
          _id: 's3',
          student: { firstName: 'Carol', lastName: 'Davis', email: 'carol@student.com', avatar: null },
          assignment: { 
            _id: 'a2', 
            title: 'JavaScript Quiz #5', 
            course: { title: 'Web Development Bootcamp' },
            maxScore: 50,
            dueDate: '2024-02-18'
          },
          content: 'Quiz answers attached.',
          submittedAt: '2024-02-18T09:15:00',
          isLate: false,
          status: 'graded',
          score: 45,
          feedback: 'Excellent work! You demonstrated a strong understanding of ES6+ features.',
          gradedAt: '2024-02-19T14:20:00'
        },
        {
          _id: 's4',
          student: { firstName: 'David', lastName: 'Lee', email: 'david@student.com', avatar: null },
          assignment: { 
            _id: 'a3', 
            title: 'Node.js API Assignment', 
            course: { title: 'Node.js Masterclass' },
            maxScore: 100,
            dueDate: '2024-02-25'
          },
          content: 'I created a RESTful API with Express and MongoDB. The code includes authentication...',
          submittedAt: '2024-02-14T08:00:00',
          isLate: false,
          status: 'pending',
          attachments: [
            { name: 'api.js', size: '15 KB', type: 'application/javascript' },
            { name: 'README.md', size: '2 KB', type: 'text/markdown' }
          ]
        }
      ];

      if (activeTab === 'pending') {
        setSubmissions(mockSubmissions.filter(s => s.status === 'pending'));
      } else if (activeTab === 'graded') {
        setSubmissions(mockSubmissions.filter(s => s.status === 'graded'));
      } else {
        setSubmissions(mockSubmissions);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    // In production, this would call the API
    // await assignmentsAPI.grade(selectedSubmission.assignment._id, selectedSubmission._id, gradingData);
    
    setShowGradeModal(false);
    setSelectedSubmission(null);
    setGradingData({ score: 0, maxScore: 100, feedback: '', status: 'graded' });
    fetchSubmissions();
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setGradingData({
      score: submission.score || 0,
      maxScore: submission.assignment.maxScore,
      feedback: submission.feedback || '',
      status: 'graded'
    });
    setShowGradeModal(true);
  };

  const getStatusBadge = (status, isLate) => {
    if (status === 'graded') {
      return <span className="badge badge-success">Graded</span>;
    }
    if (isLate) {
      return <span className="badge badge-warning">Late</span>;
    }
    return <span className="badge badge-primary">Pending</span>;
  };

  const columns = [
    {
      title: 'Student',
      key: 'student',
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-900/30 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-400">
              {value.firstName[0]}{value.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-100">{value.firstName} {value.lastName}</p>
            <p className="text-xs text-gray-500">{value.email}</p>
          </div>
        </div>
      )
    },
    {
      title: 'Assignment',
      key: 'assignment',
      render: (value) => (
        <div>
          <p className="font-medium text-gray-100">{value.title}</p>
          <p className="text-xs text-gray-500">{value.course.title}</p>
        </div>
      )
    },
    {
      title: 'Submitted',
      key: 'submittedAt',
      render: (value, row) => (
        <div>
          <p className="text-gray-300">{new Date(value).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500">{new Date(value).toLocaleTimeString()}</p>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (value, row) => getStatusBadge(value, row.isLate)
    },
    {
      title: 'Score',
      key: 'score',
      render: (value, row) => (
        <span className="text-gray-300">
          {row.status === 'graded' ? `${value}/${row.assignment.maxScore}` : '-'}
        </span>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openGradeModal(row)}
            className={`p-1 rounded hover:bg-gray-800 ${
              row.status === 'graded' ? 'text-gray-400' : 'text-primary-400 hover:text-primary-300'
            }`}
            title={row.status === 'graded' ? 'View Grade' : 'Grade'}
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.attachments.length > 0 && (
            <button className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-gray-100" title="Download">
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const stats = {
    pending: submissions.filter(s => s.status === 'pending').length,
    graded: submissions.filter(s => s.status === 'graded').length,
    late: submissions.filter(s => s.isLate).length,
    avgScore: 85
  };

  const scoreDistribution = [
    { range: '0-20', count: 2 },
    { range: '21-40', count: 5 },
    { range: '41-60', count: 8 },
    { range: '61-80', count: 15 },
    { range: '81-100', count: 25 }
  ];

  const tabs = [
    { id: 'pending', label: 'Pending Review', count: stats.pending },
    { id: 'graded', label: 'Graded', count: stats.graded },
    { id: 'all', label: 'All', count: submissions.length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Grade Submissions</h1>
        <p className="text-gray-400 mt-1">Review and grade student assignments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-100">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Graded</p>
              <p className="text-2xl font-bold text-gray-100">{stats.graded}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Late Submissions</p>
              <p className="text-2xl font-bold text-gray-100">{stats.late}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-100">{stats.avgScore}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Submissions Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-100">Submissions</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="input pl-10 w-64"
              />
            </div>
            <Select
              options={[
                { value: '', label: 'All Assignments' },
                { value: 'a1', label: 'React Final Project' },
                { value: 'a2', label: 'JavaScript Quiz' },
                { value: 'a3', label: 'Node.js API' }
              ]}
              className="w-auto"
            />
          </div>
        </div>
        <Table
          columns={columns}
          data={submissions}
          loading={loading}
          pagination
          pageSize={10}
          emptyMessage="No submissions found"
        />
      </Card>

      {/* Grade Modal */}
      <Modal
        isOpen={showGradeModal}
        onClose={() => {
          setShowGradeModal(false);
          setSelectedSubmission(null);
        }}
        title="Grade Submission"
        size="lg"
      >
        {selectedSubmission && (
          <form onSubmit={handleGrade} className="space-y-6">
            {/* Student Info */}
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-900/30 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-400">
                    {selectedSubmission.student.firstName[0]}{selectedSubmission.student.lastName[0]}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-100">
                    {selectedSubmission.student.firstName} {selectedSubmission.student.lastName}
                  </h4>
                  <p className="text-sm text-gray-400">{selectedSubmission.student.email}</p>
                </div>
                {selectedSubmission.isLate && (
                  <span className="ml-auto badge badge-warning">Late Submission</span>
                )}
              </div>
            </div>

            {/* Assignment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Assignment</p>
                <p className="font-medium text-gray-100">{selectedSubmission.assignment.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium text-gray-100">
                  {new Date(selectedSubmission.assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Submission Content */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Student Submission</p>
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <p className="text-gray-300 whitespace-pre-wrap">{selectedSubmission.content}</p>
              </div>
            </div>

            {/* Attachments */}
            {selectedSubmission.attachments.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Attachments</p>
                <div className="space-y-2">
                  {selectedSubmission.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                      <div className="p-2 bg-primary-900/20 rounded">
                        <Send className="w-4 h-4 text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-100">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grading Form */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Score"
                type="number"
                min="0"
                max={selectedSubmission.assignment.maxScore}
                value={gradingData.score}
                onChange={(e) => setGradingData({ ...gradingData, score: parseFloat(e.target.value) })}
                required
              />
              <div className="pt-6">
                <p className="text-sm text-gray-500">Maximum Score: {selectedSubmission.assignment.maxScore}</p>
              </div>
            </div>

            <div>
              <label className="label">Feedback</label>
              <textarea
                className="input h-24 resize-none"
                value={gradingData.feedback}
                onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                placeholder="Provide constructive feedback for the student..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notify-student"
                className="rounded border-gray-700 bg-gray-800 text-primary-500"
              />
              <label htmlFor="notify-student" className="text-sm text-gray-300">
                Send email notification to student
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <Button 
                variant="secondary" 
                type="button" 
                onClick={() => {
                  setShowGradeModal(false);
                  setSelectedSubmission(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" icon={Send}>
                Submit Grade
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

