import { useState, useEffect } from 'react';
import { 
  ClipboardList, Clock, CheckCircle, FileText, 
  Calendar, AlertCircle, Eye, Send 
} from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import Tabs from '../../components/Common/Tabs';
import EmptyState from '../../components/Common/EmptyState';
import ProgressBar from '../../components/Common/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import { assignmentsAPI } from '../../services/api';

export default function StudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // In production, this would call the API
      // const response = await assignmentsAPI.getAll({ status: 'active' });
      
      // Mock data for demo
      setAssignments([
        {
          _id: 'a1',
          title: 'React Final Project',
          description: 'Build a complete React application with all the concepts learned in this course.',
          course: { title: 'Complete Web Development Bootcamp' },
          dueDate: '2024-02-20',
          points: 100,
          status: 'active',
          type: 'project',
          submissions: 45
        },
        {
          _id: 'a2',
          title: 'JavaScript Quiz #5',
          description: 'Test your knowledge of ES6+ features and modern JavaScript concepts.',
          course: { title: 'Web Development Bootcamp' },
          dueDate: '2024-02-18',
          points: 25,
          status: 'active',
          type: 'quiz',
          submissions: 67
        },
        {
          _id: 'a3',
          title: 'Node.js API Assignment',
          description: 'Create a RESTful API using Node.js and Express with proper error handling.',
          course: { title: 'Node.js Masterclass' },
          dueDate: '2024-02-25',
          points: 50,
          status: 'active',
          type: 'assignment',
          submissions: 28
        },
        {
          _id: 'a4',
          title: 'CSS Layout Challenge',
          description: 'Create complex layouts using CSS Grid and Flexbox.',
          course: { title: 'Complete Web Development Bootcamp' },
          dueDate: '2024-02-15',
          points: 30,
          status: 'closed',
          type: 'assignment',
          submissions: 89
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      // In production, this would call the API
      // const response = await assignmentsAPI.getMySubmissions();
      
      // Mock data for demo
      setMySubmissions([
        {
          _id: 's1',
          assignment: { _id: 'a4', title: 'CSS Layout Challenge' },
          status: 'graded',
          score: 28,
          maxScore: 30,
          submittedAt: '2024-02-14T10:30:00',
          isLate: false
        },
        {
          _id: 's2',
          assignment: { _id: 'a1', title: 'React Final Project' },
          status: 'pending',
          submittedAt: null,
          isLate: false
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const getDaysRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isOverdue = (dueDate) => getDaysRemaining(dueDate) < 0;

  const pendingAssignments = assignments.filter(a => a.status === 'active');
  const submittedAssignments = mySubmissions.filter(s => s.status !== 'pending');
  const overdueAssignments = pendingAssignments.filter(a => isOverdue(a.dueDate));

  const getStatusBadge = (assignment) => {
    const submission = mySubmissions.find(s => s.assignment._id === assignment._id);
    const daysRemaining = getDaysRemaining(assignment.dueDate);

    if (submission) {
      return (
        <span className={`badge ${
          submission.status === 'graded' ? 'badge-success' : 'badge-primary'
        }`}>
          {submission.status === 'graded' ? `Graded: ${submission.score}/${submission.maxScore}` : 'Submitted'}
        </span>
      );
    }

    if (isOverdue(assignment.dueDate)) {
      return <span className="badge badge-danger">Overdue</span>;
    }

    if (daysRemaining <= 3) {
      return <span className="badge badge-warning">Due in {daysRemaining} days</span>;
    }

    return <span className="badge badge-gray">Not started</span>;
  };

  const tabs = [
    { id: 'pending', label: 'Pending', count: pendingAssignments.length },
    { id: 'submitted', label: 'Submitted', count: submittedAssignments.length },
    { id: 'overdue', label: 'Overdue', count: overdueAssignments.length }
  ];

  const getFilteredAssignments = () => {
    if (activeTab === 'pending') {
      return pendingAssignments.filter(a => 
        !mySubmissions.find(s => s.assignment._id === a._id)
      );
    } else if (activeTab === 'submitted') {
      return assignments.filter(a => 
        mySubmissions.find(s => s.assignment._id === a._id)
      );
    } else if (activeTab === 'overdue') {
      return overdueAssignments;
    }
    return pendingAssignments;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In production, this would call the API
    // await assignmentsAPI.submit(selectedAssignment._id, { content, attachments });
    
    setShowSubmitModal(false);
    setSelectedAssignment(null);
    fetchSubmissions();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">My Assignments</h1>
        <p className="text-gray-400 mt-1">View and submit your assignments</p>
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
              <p className="text-2xl font-bold text-gray-100">{pendingAssignments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Submitted</p>
              <p className="text-2xl font-bold text-gray-100">{submittedAssignments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-gray-100">{overdueAssignments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <ClipboardList className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Points</p>
              <p className="text-2xl font-bold text-gray-100">
                {mySubmissions.reduce((acc, s) => acc + (s.score || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Assignment List */}
      {getFilteredAssignments().length > 0 ? (
        <div className="space-y-4">
          {getFilteredAssignments().map((assignment) => {
            const submission = mySubmissions.find(s => s.assignment._id === assignment._id);
            const daysRemaining = getDaysRemaining(assignment.dueDate);

            return (
              <Card key={assignment._id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary-900/30 rounded-lg">
                        <FileText className="w-6 h-6 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-100">{assignment.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{assignment.course.title}</p>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {assignment.description}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-400">
                            <ClipboardList className="w-4 h-4" />
                            {assignment.points} points
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(assignment)}
                      
                      {!submission && assignment.status === 'active' && (
                        <Button 
                          size="sm" 
                          icon={Send}
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowSubmitModal(true);
                          }}
                        >
                          Submit
                        </Button>
                      )}
                      
                      {submission && submission.status === 'graded' && (
                        <Button variant="secondary" size="sm" icon={Eye}>
                          View Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Progress indicator for overdue/near due */}
                {!submission && assignment.status === 'active' && (
                  <div className="h-1 bg-gray-800">
                    <div 
                      className={`h-full transition-all ${
                        daysRemaining < 0 ? 'bg-red-500' :
                        daysRemaining <= 3 ? 'bg-yellow-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${Math.min(100, (7 - daysRemaining) / 7 * 100)}%` }}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title={`No ${activeTab} assignments`}
          description={
            activeTab === 'pending' 
              ? "Great job! You have no pending assignments."
              : activeTab === 'overdue'
                ? "No overdue assignments. You're all caught up!"
                : "You haven't submitted any assignments yet."
          }
        />
      )}

      {/* Submit Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          setSelectedAssignment(null);
        }}
        title="Submit Assignment"
        size="lg"
      >
        {selectedAssignment && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-gray-100">{selectedAssignment.title}</h4>
              <p className="text-sm text-gray-400 mt-1">{selectedAssignment.course.title}</p>
            </div>
            
            <div>
              <label className="label">Your Answer</label>
              <textarea
                className="input h-32 resize-none"
                placeholder="Enter your answer or paste your work here..."
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="late-submission"
                className="rounded border-gray-700 bg-gray-800 text-primary-500"
              />
              <label htmlFor="late-submission" className="text-sm text-gray-300">
                I understand this submission may be marked as late
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="secondary" 
                type="button" 
                onClick={() => {
                  setShowSubmitModal(false);
                  setSelectedAssignment(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" icon={Send}>
                Submit Assignment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

