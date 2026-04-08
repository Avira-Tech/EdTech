import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, FileQuestion, CheckCircle, XCircle, Filter } from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Table from '../../components/Common/Table';
import Modal from '../../components/Common/Modal';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Tabs from '../../components/Common/Tabs';
import EmptyState from '../../components/Common/EmptyState';
import { questionsAPI } from '../../services/api';

const difficultyColors = {
  easy: 'badge-success',
  medium: 'badge-warning',
  hard: 'badge-danger'
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
    search: ''
  });
  const [formData, setFormData] = useState({
    question: '',
    type: 'multiple-choice',
    course: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    correctAnswer: '',
    explanation: '',
    points: 1,
    difficulty: 'medium',
    tags: ''
  });

  useEffect(() => {
    fetchQuestions();
    fetchStats();
  }, [filters, activeTab]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (activeTab !== 'all') {
        params.type = activeTab;
      }
      const response = await questionsAPI.getAll(params);
      setQuestions(response.data.data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await questionsAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        options: formData.type === 'multiple-choice' ? formData.options : []
      };
      await questionsAPI.create(data);
      setShowAddModal(false);
      resetForm();
      fetchQuestions();
      fetchStats();
    } catch (error) {
      console.error('Failed to create question:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedQuestion) return;
    
    try {
      await questionsAPI.delete(selectedQuestion._id);
      setShowDeleteModal(false);
      setSelectedQuestion(null);
      fetchQuestions();
      fetchStats();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      type: 'multiple-choice',
      course: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ],
      correctAnswer: '',
      explanation: '',
      points: 1,
      difficulty: 'medium',
      tags: ''
    });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', isCorrect: false }]
    });
  };

  const removeOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  const columns = [
    {
      title: 'Question',
      key: 'question',
      render: (value) => (
        <div className="max-w-md">
          <p className="font-medium text-gray-100 truncate">{value}</p>
        </div>
      )
    },
    {
      title: 'Type',
      key: 'type',
      render: (value) => (
        <span className="badge badge-primary capitalize">
          {value.replace('-', ' ')}
        </span>
      )
    },
    {
      title: 'Course',
      key: 'course',
      render: (value) => <span className="text-gray-300">{value?.title || '-'}</span>
    },
    {
      title: 'Points',
      key: 'points',
      render: (value) => <span className="text-gray-300">{value}</span>
    },
    {
      title: 'Difficulty',
      key: 'difficulty',
      render: (value) => (
        <span className={`badge ${difficultyColors[value]}`}>
          {value}
        </span>
      )
    },
    {
      title: 'Times Used',
      key: 'timesUsed',
      render: (value) => <span className="text-gray-300">{value}</span>
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
              setSelectedQuestion(row);
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
    { id: 'all', label: 'All Questions', count: stats?.totalQuestions || 0 },
    { id: 'multiple-choice', label: 'Multiple Choice', count: questions.filter(q => q.type === 'multiple-choice').length },
    { id: 'true-false', label: 'True/False', count: questions.filter(q => q.type === 'true-false').length },
    { id: 'essay', label: 'Essay', count: questions.filter(q => q.type === 'essay').length }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Question Bank</h1>
          <p className="text-gray-400 mt-1">Create and manage questions for your courses</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Question
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-900/30 rounded-lg">
                <FileQuestion className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Questions</p>
                <p className="text-2xl font-bold text-gray-100">{stats.totalQuestions}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Easy</p>
                <p className="text-2xl font-bold text-gray-100">
                  {stats.byDifficulty?.find(d => d._id === 'easy')?.count || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-900/30 rounded-lg">
                <Filter className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Medium</p>
                <p className="text-2xl font-bold text-gray-100">
                  {stats.byDifficulty?.find(d => d._id === 'medium')?.count || 0}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-900/30 rounded-lg">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Hard</p>
                <p className="text-2xl font-bold text-gray-100">
                  {stats.byDifficulty?.find(d => d._id === 'hard')?.count || 0}
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
            placeholder="Search questions..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="input pl-10"
          />
        </div>
        <Select
          options={[
            { value: '', label: 'All Difficulties' },
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' }
          ]}
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          className="w-auto"
        />
      </div>

      {/* Table */}
      {questions.length > 0 ? (
        <Table
          columns={columns}
          data={questions}
          loading={loading}
          pagination
          pageSize={10}
          emptyMessage="No questions found"
        />
      ) : (
        <EmptyState
          icon={FileQuestion}
          title="No questions yet"
          description="Create your first question to start building your question bank"
          action={
            <Button icon={Plus} onClick={() => setShowAddModal(true)}>
              Add Question
            </Button>
          }
        />
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Question"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Question</label>
            <textarea
              className="input h-20 resize-none"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter your question"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              required
              options={[
                { value: 'multiple-choice', label: 'Multiple Choice' },
                { value: 'true-false', label: 'True/False' },
                { value: 'short-answer', label: 'Short Answer' },
                { value: 'essay', label: 'Essay' }
              ]}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            />
            <Select
              label="Difficulty"
              required
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' }
              ]}
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            />
          </div>

          {formData.type === 'multiple-choice' && (
            <div>
              <label className="label">Options</label>
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="correct"
                    checked={option.isCorrect}
                    onChange={() => {
                      const newOptions = formData.options.map((opt, i) => ({
                        ...opt,
                        isCorrect: i === index
                      }));
                      setFormData({ ...formData, options: newOptions });
                    }}
                    className="rounded border-gray-700 bg-gray-800 text-primary-500"
                  />
                  <input
                    type="text"
                    className="input flex-1"
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index].text = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-1 text-gray-400 hover:text-danger-400"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addOption}>
                Add Option
              </Button>
            </div>
          )}

          {formData.type === 'true-false' && (
            <Select
              label="Correct Answer"
              required
              options={[
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' }
              ]}
              value={formData.correctAnswer}
              onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
            />
          )}

          <Input
            label="Tags (comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="e.g., javascript, fundamentals"
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Question
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedQuestion(null);
        }}
        title="Delete Question"
        size="sm"
      >
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete this question? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedQuestion(null);
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

