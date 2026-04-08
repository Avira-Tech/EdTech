import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Video, Plus, Calendar, Clock, Users, Play, 
  Edit, Trash2, Eye, MoreVertical, FileVideo,
  ChevronRight, CircleDot, CheckCircle, BarChart3
} from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import StatsCard from '../../components/Common/StatsCard';
import { meetingsAPI, coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export default function AdminMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchMeetings();
    fetchCourses();
    fetchStats();
  }, [activeTab]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      
      if (activeTab === 'upcoming') {
        params.status = 'scheduled';
      } else if (activeTab === 'live') {
        params.status = 'live';
      } else if (activeTab === 'past') {
        params.status = 'ended';
      }

      const response = await meetingsAPI.getAll(params);
      setMeetings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
      // Mock data for demo
      setMeetings([
        {
          _id: '1',
          title: 'JavaScript Fundamentals - Live Q&A',
          description: 'Weekly live session covering JavaScript basics',
          course: { _id: 'c1', title: 'Complete Web Development' },
          host: { firstName: 'John', lastName: 'Doe' },
          scheduledStart: new Date(Date.now() + 86400000).toISOString(),
          scheduledDuration: 60,
          status: 'scheduled',
          participantCount: 25,
          isPublished: true,
          autoRecording: 'cloud'
        },
        {
          _id: '2',
          title: 'React Advanced Patterns',
          description: 'Advanced React patterns and best practices',
          course: { _id: 'c2', title: 'React - The Complete Guide' },
          host: { firstName: 'Jane', lastName: 'Smith' },
          scheduledStart: new Date(Date.now() + 172800000).toISOString(),
          scheduledDuration: 90,
          status: 'scheduled',
          participantCount: 18,
          isPublished: false,
          autoRecording: 'cloud'
        },
        {
          _id: '3',
          title: 'Python for Data Science',
          description: 'Introduction to Python programming',
          course: { _id: 'c3', title: 'Python Masterclass' },
          host: { firstName: 'Mike', lastName: 'Johnson' },
          scheduledStart: new Date(Date.now() - 3600000).toISOString(),
          scheduledDuration: 120,
          status: 'live',
          participantCount: 45,
          isPublished: true,
          autoRecording: 'cloud'
        },
        {
          _id: '4',
          title: 'Node.js Backend Development',
          description: 'Building REST APIs with Node.js',
          course: { _id: 'c4', title: 'Node.js Masterclass' },
          host: { firstName: 'John', lastName: 'Doe' },
          scheduledStart: new Date(Date.now() - 86400000).toISOString(),
          scheduledDuration: 120,
          status: 'ended',
          participantCount: 32,
          isPublished: true,
          autoRecording: 'cloud',
          recordings: [
            { type: 'shared_screen_with_speaker_view', duration: 7200, status: 'ready' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll({ limit: 100 });
      setCourses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([
        { _id: 'c1', title: 'Complete Web Development' },
        { _id: 'c2', title: 'React - The Complete Guide' },
        { _id: 'c3', title: 'Node.js Masterclass' },
        { _id: 'c4', title: 'Python Masterclass' }
      ]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await meetingsAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({
        totalMeetings: 15,
        upcomingMeetings: 4,
        liveMeetings: 2,
        endedMeetings: 9,
        meetingsWithRecordings: 7,
        totalParticipants: 312
      });
    }
  };

  const handleStartMeeting = async (meetingId) => {
    try {
      await meetingsAPI.start(meetingId);
      fetchMeetings();
      fetchStats();
    } catch (error) {
      console.error('Failed to start meeting:', error);
    }
  };

  const handleEndMeeting = async (meetingId) => {
    try {
      await meetingsAPI.end(meetingId);
      fetchMeetings();
      fetchStats();
    } catch (error) {
      console.error('Failed to end meeting:', error);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await meetingsAPI.delete(meetingId);
      fetchMeetings();
      fetchStats();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete meeting:', error);
    }
  };

  const handlePublish = async (meetingId, publish) => {
    try {
      await meetingsAPI.publish(meetingId, publish);
      fetchMeetings();
    } catch (error) {
      console.error('Failed to publish meeting:', error);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'badge-info',
      live: 'badge-success',
      ended: 'badge-default'
    };
    return badges[status] || 'badge-default';
  };

  const tabs = [
    { id: 'all', label: 'All Meetings' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'live', label: 'Live Now' },
    { id: 'past', label: 'Past' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Live Meetings Management</h1>
          <p className="text-gray-400 mt-1">Manage all video lectures and live sessions across the platform</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Create Meeting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total Meetings"
          value={stats?.totalMeetings || 0}
          icon={Video}
        />
        <StatsCard
          title="Upcoming"
          value={stats?.upcomingMeetings || 0}
          icon={Calendar}
        />
        <StatsCard
          title="Live Now"
          value={stats?.liveMeetings || 0}
          icon={CircleDot}
          className="text-green-400"
        />
        <StatsCard
          title="Recordings"
          value={stats?.meetingsWithRecordings || 0}
          icon={FileVideo}
        />
        <StatsCard
          title="Total Participants"
          value={stats?.totalParticipants || 0}
          icon={Users}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Meetings Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : meetings.length === 0 ? (
        <Card className="p-8 text-center">
          <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No meetings found</p>
          <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
            Create Your First Meeting
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Meeting</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Course</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Host</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Schedule</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Participants</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {meetings.map((meeting) => (
                  <tr key={meeting._id} className="hover:bg-gray-800/50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-100">
                            {meeting.title}
                          </h4>
                          {meeting.autoRecording === 'cloud' && (
                            <CheckCircle className="w-4 h-4 text-green-400" title="Auto-recording enabled" />
                          )}
                        </div>
                        {meeting.recordings?.length > 0 && (
                          <span className="text-xs text-primary-400">
                            {meeting.recordings.length} recording(s)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">
                        {meeting.course?.title || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-300">
                            {meeting.host?.firstName?.[0]}{meeting.host?.lastName?.[0]}
                          </span>
                        </div>
                        <span className="text-sm text-gray-300">
                          {meeting.host?.firstName} {meeting.host?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <span className="text-gray-300">{formatDate(meeting.scheduledStart)}</span>
                        <span className="text-gray-500 ml-2">
                          {formatTime(meeting.scheduledStart)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {meeting.scheduledDuration} min
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">
                        {meeting.participantCount}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`badge ${getStatusBadge(meeting.status)}`}>
                        {meeting.status === 'live' && (
                          <CircleDot className="w-3 h-3 mr-1 animate-pulse" />
                        )}
                        {meeting.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        {meeting.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => handleStartMeeting(meeting._id)}
                              className="p-2 rounded-lg hover:bg-green-900/30 text-green-400"
                              title="Start Meeting"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <Link
                              to={`/admin/meetings/${meeting._id}/edit`}
                              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          </>
                        )}
                        
                        {meeting.status === 'live' && (
                          <>
                            <button
                              onClick={() => handleEndMeeting(meeting._id)}
                              className="p-2 rounded-lg hover:bg-red-900/30 text-red-400"
                              title="End Meeting"
                            >
                              <CircleDot className="w-4 h-4" />
                            </button>
                            <a
                              href={meeting.joinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-gray-700 text-gray-400"
                              title="Join Meeting"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          </>
                        )}
                        
                        {meeting.status === 'ended' && (
                          <>
                            {meeting.recordings?.length > 0 && (
                              <Link
                                to={`/admin/meetings/${meeting._id}/recordings`}
                                className="p-2 rounded-lg hover:bg-gray-700 text-primary-400"
                                title="View Recordings"
                              >
                                <FileVideo className="w-4 h-4" />
                              </Link>
                            )}
                          </>
                        )}

                        <div className="relative group">
                          <button className="p-2 rounded-lg hover:bg-gray-700 text-gray-400">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 hidden group-hover:block z-10">
                            <div className="py-1">
                              <Link
                                to={`/admin/meetings/${meeting._id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </Link>
                              {meeting.isPublished ? (
                                <button
                                  onClick={() => handlePublish(meeting._id, false)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                >
                                  Unpublish
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePublish(meeting._id, true)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                                >
                                  Publish
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteConfirm(meeting)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <CreateMeetingModal
          courses={courses}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchMeetings();
            fetchStats();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Modal
          title="Delete Meeting"
          onClose={() => setDeleteConfirm(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={() => handleDeleteMeeting(deleteConfirm._id)}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-gray-400">
            Are you sure you want to delete "{deleteConfirm.title}"? 
            This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

// Create Meeting Modal Component
function CreateMeetingModal({ courses, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    module: '',
    lesson: '',
    scheduledStart: '',
    scheduledDuration: 60,
    settings: {
      waitingRoom: true,
      muteUponEntry: true,
      hostVideo: true,
      participantVideo: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await meetingsAPI.create(formData);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Live Meeting"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create Meeting
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-900/30 border border-danger-700 rounded-lg">
            <p className="text-danger-400 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="label">Meeting Title *</label>
          <input
            type="text"
            className="input"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., JavaScript Fundamentals - Live Q&A"
            required
          />
        </div>

        <div>
          <label className="label">Course *</label>
          <select
            className="input"
            value={formData.courseId}
            onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
            required
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date & Time *</label>
            <input
              type="datetime-local"
              className="input"
              value={formData.scheduledStart}
              onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Duration (minutes)</label>
            <select
              className="input"
              value={formData.scheduledDuration}
              onChange={(e) => setFormData({ ...formData, scheduledDuration: parseInt(e.target.value) })}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
              <option value={180}>3 hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            className="input h-20"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What will be covered in this session?"
          />
        </div>

        <div className="border-t border-gray-800 pt-4">
          <h4 className="font-medium text-gray-100 mb-3">Meeting Settings</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.settings.waitingRoom}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, waitingRoom: e.target.checked }
                })}
                className="rounded border-gray-700 bg-gray-800"
              />
              <span className="text-sm text-gray-300">Enable waiting room</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.settings.muteUponEntry}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, muteUponEntry: e.target.checked }
                })}
                className="rounded border-gray-700 bg-gray-800"
              />
              <span className="text-sm text-gray-300">Mute participants on entry</span>
            </label>
          </div>
        </div>

        <div className="p-4 bg-primary-900/20 border border-primary-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-primary-400" />
            <span className="font-medium text-primary-400">Auto-Recording Enabled</span>
          </div>
          <p className="text-sm text-gray-400">
            All meetings will be automatically recorded to Zoom cloud storage. 
            Recordings will be available after the meeting ends.
          </p>
        </div>
      </form>
    </Modal>
  );
}

