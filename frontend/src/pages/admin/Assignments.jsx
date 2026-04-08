import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Clock, FileText } from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setAssignments([
        {
          _id: '1',
          title: 'React Final Project',
          course: 'Complete Web Development Bootcamp',
          dueDate: '2024-02-20',
          points: 100,
          submissions: 45,
          status: 'active',
        },
        {
          _id: '2',
          title: 'Node.js API Assignment',
          course: 'Node.js Masterclass',
          dueDate: '2024-02-25',
          points: 50,
          submissions: 28,
          status: 'active',
        },
        {
          _id: '3',
          title: 'JavaScript Quiz #5',
          course: 'JavaScript Fundamentals',
          dueDate: '2024-02-15',
          points: 25,
          submissions: 67,
          status: 'closed',
        },
        {
          _id: '4',
          title: 'Database Design Project',
          course: 'SQL & Database Management',
          dueDate: '2024-03-01',
          points: 150,
          submissions: 0,
          status: 'active',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status) => (
    <span className={`badge ${status === 'active' ? 'badge-success' : 'badge-gray'}`}>
      {status === 'active' ? 'Active' : 'Closed'}
    </span>
  );

  const columns = [
    {
      title: 'Assignment',
      key: 'title',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-900/30 rounded-lg">
            <FileText className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p className="font-medium text-gray-100">{value}</p>
            <p className="text-xs text-gray-500">{row.course}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Due Date',
      key: 'dueDate',
      render: (value) => (
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="w-4 h-4 text-gray-500" />
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      title: 'Points',
      key: 'points',
      render: (value) => <span className="font-medium text-gray-100">{value}</span>,
    },
    {
      title: 'Submissions',
      key: 'submissions',
      render: (value) => <span className="text-gray-300">{value}</span>,
    },
    {
      title: 'Status',
      key: 'status',
      render: (value) => getStatusBadge(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <button className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-gray-100">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-gray-100">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-danger-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Assignments</h1>
          <p className="text-gray-400 mt-1">Manage assignments and assessments</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>
          Create Assignment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-400">Total Assignments</p>
          <p className="text-2xl font-bold text-gray-100 mt-1">{assignments.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {assignments.filter(a => a.status === 'active').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400">Total Submissions</p>
          <p className="text-2xl font-bold text-primary-400 mt-1">
            {assignments.reduce((acc, a) => acc + a.submissions, 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-400">Pending Reviews</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">18</p>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search assignments..."
            className="input pl-10"
          />
        </div>
        <select className="select w-auto">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={assignments}
        loading={loading}
        pagination
        pageSize={10}
        emptyMessage="No assignments found"
      />

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Assignment"
        size="lg"
      >
        <form className="space-y-4">
          <Input label="Assignment Title" required placeholder="Enter assignment title" />
          <div>
            <label className="label">Course</label>
            <select className="select">
              <option>Select course</option>
              <option>Web Development Bootcamp</option>
              <option>React - The Complete Guide</option>
              <option>Node.js Masterclass</option>
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-24 resize-none" placeholder="Enter assignment description"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date" type="date" required />
            <Input label="Points" type="number" required placeholder="Enter points" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

