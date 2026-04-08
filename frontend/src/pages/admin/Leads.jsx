import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Mail, Phone, Calendar, UserPlus } from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Tabs from '../../components/Common/Tabs';
import EmptyState from '../../components/Common/EmptyState';
import { leadsAPI } from '../../services/api';

const statusColors = {
  new: 'badge-primary',
  contacted: 'badge-warning',
  qualified: 'badge-success',
  converted: 'badge-success',
  lost: 'badge-gray',
  unsubscribed: 'badge-danger'
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    search: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: 'website',
    tags: ''
  });

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [filters, activeTab]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      const response = await leadsAPI.getAll(params);
      setLeads(response.data.data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await leadsAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await leadsAPI.create(formData);
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        source: 'website',
        tags: ''
      });
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Failed to create lead:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedLead) return;
    
    try {
      await leadsAPI.delete(selectedLead._id);
      setShowDeleteModal(false);
      setSelectedLead(null);
      fetchLeads();
      fetchStats();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await leadsAPI.updateStatus(leadId, newStatus);
      fetchLeads();
      if (selectedLead?._id === leadId) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const columns = [
    {
      title: 'Lead',
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
      title: 'Source',
      key: 'source',
      render: (value) => (
        <span className="badge badge-gray capitalize">{value}</span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (value) => (
        <span className={`badge ${statusColors[value]}`}>
          {value}
        </span>
      )
    },
    {
      title: 'Assigned To',
      key: 'assignedTo',
      render: (value) => (
        <span className="text-gray-300">
          {value ? `${value.firstName} ${value.lastName}` : '-'}
        </span>
      )
    },
    {
      title: 'Created',
      key: 'createdAt',
      render: (value) => (
        <span className="text-gray-400">
          {new Date(value).toLocaleDateString()}
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
              setSelectedLead(row);
              setShowDetailModal(true);
            }}
            className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-gray-100"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-gray-100">
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedLead(row);
              setShowDeleteModal(true);
            }}
            className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-danger-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Leads', count: stats?.totalLeads || 0 },
    { id: 'new', label: 'New', count: stats?.byStatus?.find(s => s._id === 'new')?.count || 0 },
    { id: 'contacted', label: 'Contacted', count: stats?.byStatus?.find(s => s._id === 'contacted')?.count || 0 },
    { id: 'qualified', label: 'Qualified', count: stats?.byStatus?.find(s => s._id === 'qualified')?.count || 0 },
    { id: 'converted', label: 'Converted', count: stats?.byStatus?.find(s => s._id === 'converted')?.count || 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Leads</h1>
          <p className="text-gray-400 mt-1">Manage potential customers and track conversions</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Lead
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-900/30 rounded-lg">
                <UserPlus className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Leads</p>
                <p className="text-2xl font-bold text-gray-100">{stats.totalLeads}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">New This Month</p>
                <p className="text-2xl font-bold text-gray-100">{stats.newThisMonth}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <UserPlus className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Converted</p>
                <p className="text-2xl font-bold text-gray-100">{stats.convertedThisMonth}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-900/30 rounded-lg">
                <Phone className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Contacted</p>
                <p className="text-2xl font-bold text-gray-100">
                  {stats.byStatus?.find(s => s._id === 'contacted')?.count || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search leads..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input pl-10"
          />
        </div>
        <Select
          options={[
            { value: '', label: 'All Sources' },
            { value: 'website', label: 'Website' },
            { value: 'social-media', label: 'Social Media' },
            { value: 'referral', label: 'Referral' },
            { value: 'advertisement', label: 'Advertisement' },
            { value: 'webinar', label: 'Webinar' }
          ]}
          value={filters.source}
          onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          className="w-auto"
        />
      </div>

      {/* Table */}
      {leads.length > 0 ? (
        <Table
          columns={columns}
          data={leads}
          loading={loading}
          pagination
          pageSize={10}
          emptyMessage="No leads found"
        />
      ) : (
        <EmptyState
          icon={UserPlus}
          title="No leads yet"
          description="Add your first lead to start tracking potential customers"
          action={
            <Button icon={Plus} onClick={() => setShowAddModal(true)}>
              Add Lead
            </Button>
          }
        />
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Lead"
        size="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Enter first name"
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Enter last name"
            />
          </div>
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
          />
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />
          <Select
            label="Source"
            options={[
              { value: 'website', label: 'Website' },
              { value: 'social-media', label: 'Social Media' },
              { value: 'referral', label: 'Referral' },
              { value: 'advertisement', label: 'Advertisement' },
              { value: 'webinar', label: 'Webinar' },
              { value: 'other', label: 'Other' }
            ]}
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedLead(null);
        }}
        title="Lead Details"
        size="lg"
      >
        {selectedLead && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-primary-400">
                  {selectedLead.firstName[0]}{selectedLead.lastName[0]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">
                  {selectedLead.firstName} {selectedLead.lastName}
                </h3>
                <p className="text-gray-400">{selectedLead.email}</p>
                <p className="text-gray-400">{selectedLead.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="text-gray-100 capitalize">{selectedLead.source}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Select
                  options={[
                    { value: 'new', label: 'New' },
                    { value: 'contacted', label: 'Contacted' },
                    { value: 'qualified', label: 'Qualified' },
                    { value: 'converted', label: 'Converted' },
                    { value: 'lost', label: 'Lost' },
                    { value: 'unsubscribed', label: 'Unsubscribed' }
                  ]}
                  value={selectedLead.status}
                  onChange={(e) => handleStatusChange(selectedLead._id, e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {selectedLead.tags && selectedLead.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLead.tags.map((tag, index) => (
                    <span key={index} className="badge badge-gray">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </Button>
              <Button>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedLead(null);
        }}
        title="Delete Lead"
        size="sm"
      >
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete this lead? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedLead(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

