import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Trash2, GripVertical, 
  Upload, X, BookOpen, DollarSign, Clock, Users, 
  ChevronDown, ChevronUp, Video, Calendar, Play
} from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Select from '../../components/Common/Select';
import Tabs from '../../components/Common/Tabs';
import { coursesAPI, meetingsAPI } from '../../services/api';

const defaultModule = {
  title: '',
  description: '',
  lessons: []
};

const defaultLesson = {
  title: '',
  description: '',
  type: 'video',
  content: '',
  duration: 0,
  isFree: false
};

export default function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    level: 'beginner',
    language: 'English',
    pricing: {
      type: 'free',
      price: 0,
      currency: 'USD'
    },
    thumbnail: null,
    previewVideo: '',
    requirements: [''],
    objectives: [''],
    modules: []
  });

  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    if (isEditing) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getById(id);
      const course = response.data.data;
      
      setFormData({
        title: course.title || '',
        shortDescription: course.shortDescription || '',
        description: course.description || '',
        category: course.category || '',
        level: course.level || 'beginner',
        language: course.language || 'English',
        pricing: course.pricing || { type: 'free', price: 0, currency: 'USD' },
        thumbnail: course.thumbnail || null,
        previewVideo: course.previewVideo || '',
        requirements: course.requirements || [''],
        objectives: course.objectives || [''],
        modules: course.modules || []
      });
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handlePricingChange = (field, value) => {
    setFormData({
      ...formData,
      pricing: { ...formData.pricing, [field]: value }
    });
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field, defaultValue = '') => {
    setFormData({ ...formData, [field]: [...formData[field], defaultValue] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [...formData.modules, { ...defaultModule, lessons: [] }]
    });
    setExpandedModules({ ...expandedModules, [formData.modules.length]: true });
  };

  const removeModule = (index) => {
    const newModules = formData.modules.filter((_, i) => i !== index);
    setFormData({ ...formData, modules: newModules });
  };

  const updateModule = (index, field, value) => {
    const newModules = [...formData.modules];
    newModules[index][field] = value;
    setFormData({ ...formData, modules: newModules });
  };

  const addLesson = (moduleIndex) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons.push({ ...defaultLesson });
    setFormData({ ...formData, modules: newModules });
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
    setFormData({ ...formData, modules: newModules });
  };

  const updateLesson = (moduleIndex, lessonIndex, field, value) => {
    const newModules = [...formData.modules];
    newModules[moduleIndex].lessons[lessonIndex][field] = value;
    setFormData({ ...formData, modules: newModules });
  };

  const toggleModule = (index) => {
    setExpandedModules({
      ...expandedModules,
      [index]: !expandedModules[index]
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    
    if (formData.pricing.type !== 'free' && formData.pricing.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      // Clean up empty array items
      const data = {
        ...formData,
        requirements: formData.requirements.filter(r => r.trim()),
        objectives: formData.objectives.filter(o => o.trim()),
        modules: formData.modules.map(m => ({
          ...m,
          lessons: m.lessons.filter(l => l.title.trim())
        }))
      };

      if (isEditing) {
        await coursesAPI.update(id, data);
      } else {
        await coursesAPI.create(data);
      }

      navigate('/admin/courses');
    } catch (error) {
      console.error('Failed to save course:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to save course' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'content', label: 'Content' },
    { id: 'meetings', label: 'Live Meetings' },
    { id: 'requirements', label: 'Requirements' }
  ];

  const tabOrder = ['basic', 'pricing', 'content', 'meetings', 'requirements'];
  const currentTabIndex = tabOrder.indexOf(activeTab);

  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabOrder[currentTabIndex - 1]);
    }
  };

  const goToNextTab = () => {
    if (currentTabIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentTabIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-800 rounded mb-4"></div>
          <div className="h-64 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/courses')}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              {isEditing ? 'Edit Course' : 'Create New Course'}
            </h1>
            <p className="text-gray-400 mt-1">
              {isEditing ? 'Update course information and content' : 'Fill in the details to create a new course'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/admin/courses')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving} icon={Save}>
            {isEditing ? 'Save Changes' : 'Create Course'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {errors.submit && (
        <div className="p-4 bg-danger-900/30 border border-danger-700 rounded-lg">
          <p className="text-danger-400">{errors.submit}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <Card className="p-6 space-y-6">
            <Input
              label="Course Title"
              required
              value={formData.title}
              onChange={(e) => handleBasicChange('title', e.target.value)}
              placeholder="e.g., Complete Web Development Bootcamp"
              error={errors.title}
            />

            <div>
              <label className="label">Short Description</label>
              <textarea
                className="input h-20 resize-none"
                value={formData.shortDescription}
                onChange={(e) => handleBasicChange('shortDescription', e.target.value)}
                placeholder="A brief description for course cards (max 300 characters)"
                maxLength={300}
              />
            </div>

            <div>
              <label className="label">Full Description</label>
              <textarea
                className="input h-40 resize-none"
                value={formData.description}
                onChange={(e) => handleBasicChange('description', e.target.value)}
                placeholder="Detailed course description..."
                required
                error={errors.description}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                required
                options={[
                  { value: '', label: 'Select Category' },
                  { value: 'web-development', label: 'Web Development' },
                  { value: 'mobile-development', label: 'Mobile Development' },
                  { value: 'data-science', label: 'Data Science' },
                  { value: 'machine-learning', label: 'Machine Learning' },
                  { value: 'devops', label: 'DevOps' },
                  { value: 'design', label: 'Design' },
                  { value: 'business', label: 'Business' },
                  { value: 'other', label: 'Other' }
                ]}
                value={formData.category}
                onChange={(e) => handleBasicChange('category', e.target.value)}
                error={errors.category}
              />
              <Select
                label="Level"
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' }
                ]}
                value={formData.level}
                onChange={(e) => handleBasicChange('level', e.target.value)}
              />
            </div>

            <Select
              label="Language"
              options={[
                { value: 'English', label: 'English' },
                { value: 'Spanish', label: 'Spanish' },
                { value: 'French', label: 'French' },
                { value: 'German', label: 'German' },
                { value: 'Chinese', label: 'Chinese' },
                { value: 'Hindi', label: 'Hindi' }
              ]}
              value={formData.language}
              onChange={(e) => handleBasicChange('language', e.target.value)}
            />

            <div>
              <label className="label">Thumbnail</label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">
                  Drag and drop an image or click to browse
                </p>
                <input type="file" className="hidden" accept="image/*" />
                <Button variant="secondary" size="sm" className="mt-2">
                  Upload Image
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-100">Pricing Options</h3>
            </div>

            <Select
              label="Pricing Type"
              options={[
                { value: 'free', label: 'Free' },
                { value: 'one-time', label: 'One-time Payment' },
                { value: 'subscription', label: 'Subscription' }
              ]}
              value={formData.pricing.type}
              onChange={(e) => handlePricingChange('type', e.target.value)}
            />

            {formData.pricing.type !== 'free' && (
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (USD)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricing.price}
                  onChange={(e) => handlePricingChange('price', parseFloat(e.target.value))}
                  error={errors.price}
                />
                <Select
                  label="Currency"
                  options={[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                    { value: 'INR', label: 'INR (₹)' }
                  ]}
                  value={formData.pricing.currency}
                  onChange={(e) => handlePricingChange('currency', e.target.value)}
                />
              </div>
            )}

            {formData.pricing.type === 'subscription' && (
              <Input
                label="Subscription Duration (days)"
                type="number"
                min="1"
                placeholder="e.g., 365 for 1 year"
              />
            )}

            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h4 className="font-medium text-gray-100 mb-2">Price Preview</h4>
              <p className="text-2xl font-bold text-primary-400">
                {formData.pricing.type === 'free' 
                  ? 'Free' 
                  : `${formData.pricing.currency} ${formData.pricing.price}`}
              </p>
            </div>
          </Card>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-100">Course Modules & Lessons</h3>
              <Button variant="secondary" size="sm" icon={Plus} onClick={addModule}>
                Add Module
              </Button>
            </div>

            {formData.modules.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">No modules yet. Add your first module to start building your course.</p>
                <Button variant="secondary" icon={Plus} onClick={addModule}>
                  Add First Module
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {formData.modules.map((module, moduleIndex) => (
                  <Card key={moduleIndex} className="overflow-hidden">
                    {/* Module Header */}
                    <div className="p-4 bg-gray-800/50 flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-600 cursor-move" />
                      <button
                        type="button"
                        onClick={() => toggleModule(moduleIndex)}
                        className="p-1 rounded hover:bg-gray-700 text-gray-400"
                      >
                        {expandedModules[moduleIndex] ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        type="text"
                        className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-100 font-medium"
                        value={module.title}
                        onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                        placeholder="Module Title"
                      />
                      <span className="text-sm text-gray-500">
                        {module.lessons.length} lessons
                      </span>
                      <button
                        type="button"
                        onClick={() => removeModule(moduleIndex)}
                        className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-danger-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Module Content */}
                    {expandedModules[moduleIndex] && (
                      <div className="p-4 space-y-4">
                        <Input
                          label="Module Description"
                          value={module.description}
                          onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                          placeholder="What will students learn in this module?"
                        />

                        {/* Lessons */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-300">Lessons</label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              icon={Plus}
                              onClick={() => addLesson(moduleIndex)}
                            >
                              Add Lesson
                            </Button>
                          </div>

                          {module.lessons.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No lessons in this module
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div key={lessonIndex} className="p-3 bg-gray-800/30 rounded-lg flex items-center gap-3">
                                  <GripVertical className="w-4 h-4 text-gray-600 cursor-move" />
                                  <input
                                    type="text"
                                    className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-100 text-sm"
                                    value={lesson.title}
                                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                    placeholder="Lesson Title"
                                  />
                                  <Select
                                    options={[
                                      { value: 'video', label: 'Video' },
                                      { value: 'pdf', label: 'PDF' },
                                      { value: 'text', label: 'Text' },
                                      { value: 'quiz', label: 'Quiz' },
                                      { value: 'assignment', label: 'Assignment' }
                                    ]}
                                    value={lesson.type}
                                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'type', e.target.value)}
                                    className="w-28"
                                  />
                                  <label className="flex items-center gap-1 text-xs text-gray-400">
                                    <input
                                      type="checkbox"
                                      checked={lesson.isFree}
                                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'isFree', e.target.checked)}
                                      className="rounded border-gray-700 bg-gray-800"
                                    />
                                    Free
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                    className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-danger-400"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && (
          <Card className="p-6 space-y-6">
            <div>
              <label className="label">Course Requirements</label>
              <p className="text-sm text-gray-400 mb-3">What students need before taking this course</p>
              <div className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input flex-1"
                      value={req}
                      onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                      placeholder="e.g., Basic JavaScript knowledge"
                    />
                    {formData.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('requirements', index)}
                        className="p-2 text-gray-400 hover:text-danger-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={() => addArrayItem('requirements', '')}
                >
                  Add Requirement
                </Button>
              </div>
            </div>

            <div>
              <label className="label">Learning Objectives</label>
              <p className="text-sm text-gray-400 mb-3">What students will learn after completing this course</p>
              <div className="space-y-2">
                {formData.objectives.map((obj, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input flex-1"
                      value={obj}
                      onChange={(e) => handleArrayChange('objectives', index, e.target.value)}
                      placeholder="e.g., Build responsive websites"
                    />
                    {formData.objectives.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('objectives', index)}
                        className="p-2 text-gray-400 hover:text-danger-400"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Plus}
                  onClick={() => addArrayItem('objectives', '')}
                >
                  Add Objective
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Live Meetings Tab */}
        {activeTab === 'meetings' && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-900/30 rounded-lg">
                  <Video className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100">Live Video Lectures</h3>
                  <p className="text-sm text-gray-400">Schedule Zoom meetings for live sessions</p>
                </div>
              </div>
              <Link 
                to={isEditing ? `/teacher/meetings?courseId=${id}` : '/teacher/meetings'}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                Manage All Meetings →
              </Link>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <p className="text-gray-400">
                  This course has the following live meeting features:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-4 h-4 text-primary-400" />
                      <span className="font-medium text-gray-100">Auto-Recording</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      All meetings are automatically recorded to cloud storage
                    </p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-gray-100">Schedule</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Schedule meetings with date and time
                    </p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Play className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium text-gray-100">Recordings</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      Students can watch recordings anytime
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <h4 className="font-medium text-gray-100 mb-3">Quick Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <Link to={`/teacher/meetings/new?courseId=${id}`}>
                      <Button icon={Plus}>
                        Schedule New Meeting
                      </Button>
                    </Link>
                    <Link to={`/teacher/meetings?courseId=${id}&status=upcoming`}>
                      <Button variant="secondary" icon={Calendar}>
                        View Upcoming Meetings
                      </Button>
                    </Link>
                    <Link to={`/student/recordings?courseId=${id}`}>
                      <Button variant="secondary" icon={Video}>
                        View Recordings
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">
                  Save the course first to add live meetings
                </p>
                <p className="text-sm text-gray-500">
                  After creating the course, you can schedule Zoom meetings 
                  with auto-recording for live video lectures.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate('/admin/courses')}>
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              onClick={goToPrevTab}
              disabled={currentTabIndex === 0}
              icon={ArrowLeft}
            >
              Previous
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              type="button"
              variant="secondary" 
              onClick={goToNextTab}
              disabled={currentTabIndex === tabOrder.length - 1}
              icon={ChevronDown}
              className="rotate-90"
            >
              Next
            </Button>
            <Button type="submit" loading={saving} icon={Save}>
              {isEditing ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

