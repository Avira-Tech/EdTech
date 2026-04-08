import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Download, 
  Folder, Image, Video, FileText, Archive, Upload
} from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import EmptyState from '../../components/Common/EmptyState';
import { assetsAPI } from '../../services/api';

const getFileIcon = (type) => {
  switch (type) {
    case 'image': return Image;
    case 'video': return Video;
    case 'document': return FileText;
    case 'archive': return Archive;
    default: return FileText;
  }
};

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [folders, setFolders] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    folder: '',
    search: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchAssets();
    fetchFolders();
  }, [filters]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await assetsAPI.getAll(filters);
      setAssets(response.data.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await assetsAPI.getFolders();
      setFolders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    formData.append('folder', filters.folder || 'general');

    try {
      setUploadProgress(0);
      await assetsAPI.upload(formData);
      setUploadProgress(100);
      setShowAddModal(false);
      fetchAssets();
      fetchFolders();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedAsset) return;
    
    try {
      await assetsAPI.delete(selectedAsset._id);
      setShowDeleteModal(false);
      setSelectedAsset(null);
      fetchAssets();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const columns = [
    {
      title: 'Asset',
      key: 'name',
      render: (value, row) => {
        const Icon = getFileIcon(row.type);
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-gray-400" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-100 truncate">{value}</p>
              <p className="text-xs text-gray-500 capitalize">{row.type} • {row.formattedSize}</p>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Folder',
      key: 'folder',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-gray-500" />
          <span className="text-gray-300">{value}</span>
        </div>
      )
    },
    {
      title: 'Uploaded By',
      key: 'uploadedBy',
      render: (value) => (
        <span className="text-gray-300">
          {value?.firstName} {value?.lastName}
        </span>
      )
    },
    {
      title: 'Downloads',
      key: 'downloads',
      render: (value) => <span className="text-gray-300">{value}</span>
    },
    {
      title: 'Date',
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
          <a
            href={row.signedUrl || row.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-gray-100"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </a>
          <button
            onClick={() => assetsAPI.trackDownload(row._id)}
            className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-gray-100"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedAsset(row);
              setShowDeleteModal(true);
            }}
            className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-danger-400"
            title="Delete"
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
          <h1 className="text-2xl font-bold text-gray-100">Assets</h1>
          <p className="text-gray-400 mt-1">Manage your media files and documents</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>
          Upload Asset
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-900/30 rounded-lg">
              <Folder className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Assets</p>
              <p className="text-2xl font-bold text-gray-100">{assets.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <Image className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Images</p>
              <p className="text-2xl font-bold text-gray-100">
                {assets.filter(a => a.type === 'image').length}
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
                {assets.filter(a => a.type === 'video').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Documents</p>
              <p className="text-2xl font-bold text-gray-100">
                {assets.filter(a => a.type === 'document').length}
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
            placeholder="Search assets..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input pl-10"
          />
        </div>
        <Select
          options={[
            { value: '', label: 'All Types' },
            { value: 'image', label: 'Images' },
            { value: 'video', label: 'Videos' },
            { value: 'document', label: 'Documents' },
            { value: 'audio', label: 'Audio' },
            { value: 'archive', label: 'Archives' }
          ]}
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="w-auto"
        />
        <Select
          options={[
            { value: '', label: 'All Folders' },
            ...folders.map(f => ({ value: f, label: f }))
          ]}
          value={filters.folder}
          onChange={(e) => setFilters({ ...filters, folder: e.target.value })}
          className="w-auto"
        />
      </div>

      {/* Table */}
      {assets.length > 0 ? (
        <Table
          columns={columns}
          data={assets}
          loading={loading}
          pagination
          pageSize={12}
          emptyMessage="No assets found"
        />
      ) : (
        <EmptyState
          icon={Folder}
          title="No assets yet"
          description="Upload your first asset to get started"
          action={
            <Button icon={Upload} onClick={() => setShowAddModal(true)}>
              Upload Asset
            </Button>
          }
        />
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Upload Asset"
        size="md"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">Drag and drop your file here, or click to browse</p>
            <input
              type="file"
              onChange={handleUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button as="span" variant="secondary">
                Choose File
              </Button>
            </label>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>
          <Select
            label="Folder"
            options={[
              { value: 'general', label: 'General' },
              ...folders.map(f => ({ value: f, label: f }))
            ]}
            value={filters.folder}
            onChange={(e) => setFilters({ ...filters, folder: e.target.value })}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAsset(null);
        }}
        title="Delete Asset"
        size="sm"
      >
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete "{selectedAsset?.name}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedAsset(null);
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

