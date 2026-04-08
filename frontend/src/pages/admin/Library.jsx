import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, BookOpen, FileText, Video, Download, Star } from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import EmptyState from '../../components/Common/EmptyState';
import { libraryAPI } from '../../services/api';

export default function Library() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'book',
    category: '',
    content: '',
    author: '',
    duration: 0,
    pages: 0,
    difficulty: 'all',
    isPremium: false
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [filters]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await libraryAPI.getAll(filters);
      setItems(response.data.data);
    } catch (error) {
      console.error('Failed to fetch library items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await libraryAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await libraryAPI.create(formData);
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        type: 'book',
        category: '',
        content: '',
        author: '',
        duration: 0,
        pages: 0,
        difficulty: 'all',
        isPremium: false
      });
      fetchItems();
      fetchCategories();
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    try {
      await libraryAPI.delete(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
      fetchItems();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return Video;
      case 'book': return BookOpen;
      default: return FileText;
    }
  };

  const columns = [
    {
      title: 'Title',
      key: 'title',
      render: (value, row) => {
        const Icon = getTypeIcon(row.type);
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-100">{value}</p>
              <p className="text-xs text-gray-500">{row.type} • {row.category}</p>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Author',
      key: 'author',
      render: (value) => <span className="text-gray-300">{value || '-'}</span>
    },
    {
      title: 'Difficulty',
      key: 'difficulty',
      render: (value) => (
        <span className={`badge ${
          value === 'beginner' ? 'badge-success' :
          value === 'intermediate' ? 'badge-warning' :
          value === 'advanced' ? 'badge-danger' : 'badge-gray'
        }`}>
          {value}
        </span>
      )
    },
    {
      title: 'Views',
      key: 'viewCount',
      render: (value) => <span className="text-gray-300">{value}</span>
    },
    {
      title: 'Downloads',
      key: 'downloadCount',
      render: (value) => <span className="text-gray-300">{value}</span>
    },
    {
      title: 'Rating',
      key: 'rating',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-gray-300">{value.average?.toFixed(1) || '0.0'}</span>
          <span className="text-gray-500 text-sm">({value.count})</span>
        </div>
      )
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
          <button
            onClick={() => {
              setSelectedItem(row);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Library</h1>
          <p className="text-gray-400 mt-1">Manage learning resources and materials</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Resource
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Resources</p>
              <p className="text-2xl font-bold text-gray-100">{items.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Articles</p>
              <p className="text-2xl font-bold text-gray-100">
                {items.filter(i => i.type === 'article').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-900/30 rounded-lg">
              <Video className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Videos</p>
              <p className="text-2xl font-bold text-gray-100">
                {items.filter(i => i.type === 'video').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Download className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Downloads</p>
              <p className="text-2xl font-bold text-gray-100">
                {items.reduce((acc, i) => acc + i.downloadCount, 0)}
              </p>
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
            placeholder="Search library..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input pl-10"
          />
        </div>
        <Select
          options={[
            { value: '', label: 'All Types' },
            { value: 'book', label: 'Books' },
            { value: 'article', label: 'Articles' },
            { value: 'video', label: 'Videos' },
            { value: 'tutorial', label: 'Tutorials' }
          ]}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="w-auto"
        />
        <Select
          options={[
            { value: '', label: 'All Categories' },
            ...categories.map(c => ({ value: c, label: c }))
          ]}
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="w-auto"
        />
      </div>

      {/* Table */}
      {items.length > 0 ? (
        <Table
          columns={columns}
          data={items}
          loading={loading}
          pagination
          pageSize={10}
          emptyMessage="No library items found"
        />
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No resources yet"
          description="Add your first learning resource to get started"
          action={
            <Button icon={Plus} onClick={() => setShowAddModal(true)}>
              Add Resource
            </Button>
          }
        />
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Library Resource"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter resource title"
          />
          <div>
            <label className="label">Description</label>
            <textarea
              className="input h-24 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              required
              options={[
                { value: 'book', label: 'Book' },
                { value: 'article', label: 'Article' },
                { value: 'video', label: 'Video' },
                { value: 'tutorial', label: 'Tutorial' },
                { value: 'template', label: 'Template' }
              ]}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            />
            <Input
              label="Category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Enter category"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Enter author name"
            />
            <Select
              label="Difficulty"
              options={[
                { value: 'all', label: 'All Levels' },
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' }
              ]}
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
            />
            <Input
              label="Pages"
              type="number"
              value={formData.pages}
              onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPremium"
              checked={formData.isPremium}
              onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
              className="rounded border-gray-700 bg-gray-800 text-primary-500"
            />
            <label htmlFor="isPremium" className="text-sm text-gray-300">
              Premium Resource
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Resource
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        title="Delete Resource"
        size="sm"
      >
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete "{selectedItem?.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedItem(null);
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

