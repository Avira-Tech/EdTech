import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreVertical, Mail, Shield, User, BookOpen } from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers([
        {
          _id: '1',
          firstName: 'Alice',
          lastName: 'Brown',
          email: 'alice@student.com',
          role: 'student',
          isActive: true,
          enrolledCourses: 3,
          createdAt: '2024-01-15',
        },
        {
          _id: '2',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@edtech.com',
          role: 'teacher',
          isActive: true,
          assignedCourses: 5,
          createdAt: '2024-01-10',
        },
        {
          _id: '3',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@edtech.com',
          role: 'admin',
          isActive: true,
          assignedCourses: 0,
          createdAt: '2024-01-01',
        },
        {
          _id: '4',
          firstName: 'Bob',
          lastName: 'Wilson',
          email: 'bob@student.com',
          role: 'student',
          isActive: true,
          enrolledCourses: 2,
          createdAt: '2024-01-20',
        },
        {
          _id: '5',
          firstName: 'Carol',
          lastName: 'Davis',
          email: 'carol.davis@edtech.com',
          role: 'teacher',
          isActive: false,
          assignedCourses: 3,
          createdAt: '2024-01-05',
        },
        {
          _id: '6',
          firstName: 'Super',
          lastName: 'Admin',
          email: 'superadmin@edtech.com',
          role: 'superadmin',
          isActive: true,
          assignedCourses: 0,
          createdAt: '2024-01-01',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getRoleBadge = (role) => {
    const styles = {
      superadmin: 'badge-danger',
      admin: 'badge-warning',
      teacher: 'badge-primary',
      student: 'badge-success',
    };
    const labels = {
      superadmin: 'Super Admin',
      admin: 'Admin',
      teacher: 'Teacher',
      student: 'Student',
    };
    return <span className={`badge ${styles[role]}`}>{labels[role]}</span>;
  };

  const getStatusBadge = (isActive) => (
    <span className={`badge ${isActive ? 'badge-success' : 'badge-gray'}`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const columns = [
    {
      title: 'User',
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
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (value) => getRoleBadge(value),
    },
    {
      title: 'Status',
      key: 'isActive',
      render: (value) => getStatusBadge(value),
    },
    {
      title: 'Courses',
      key: 'courses',
      render: (value, row) => (
        <span className="text-gray-300">
          {row.role === 'teacher' ? row.assignedCourses : row.enrolledCourses}
        </span>
      ),
    },
    {
      title: 'Joined',
      key: 'createdAt',
      render: (value) => <span className="text-gray-400">{new Date(value).toLocaleDateString()}</span>,
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

  const tabs = [
    { id: 'all', label: 'All Users', count: users.length },
    { id: 'superadmin', label: 'Super Admins', count: users.filter(u => u.role === 'superadmin').length },
    { id: 'admin', label: 'Admins', count: users.filter(u => u.role === 'admin').length },
    { id: 'teacher', label: 'Teachers', count: users.filter(u => u.role === 'teacher').length },
    { id: 'student', label: 'Students', count: users.filter(u => u.role === 'student').length },
  ];

  const filteredUsers = activeTab === 'all' 
    ? users 
    : users.filter(u => u.role === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Users</h1>
          <p className="text-gray-400 mt-1">Manage users and their permissions</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-900/30 rounded-lg">
              <User className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-100">{users.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Admins</p>
              <p className="text-2xl font-bold text-gray-100">
                {users.filter(u => ['admin', 'superadmin'].includes(u.role)).length}
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
              <p className="text-sm text-gray-400">Teachers</p>
              <p className="text-2xl font-bold text-gray-100">
                {users.filter(u => u.role === 'teacher').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Students</p>
              <p className="text-2xl font-bold text-gray-100">
                {users.filter(u => u.role === 'student').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-100'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-800">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        loading={loading}
        pagination
        pageSize={10}
        emptyMessage="No users found"
      />

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" required placeholder="Enter first name" />
            <Input label="Last Name" required placeholder="Enter last name" />
          </div>
          <Input label="Email" type="email" required placeholder="Enter email address" />
          <Input label="Password" type="password" required placeholder="Enter password" />
          <div>
            <label className="label">Role</label>
            <select className="select">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

