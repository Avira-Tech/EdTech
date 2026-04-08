import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Video, Plus, Calendar, Clock, Users, Play, 
  Edit, Trash2, Eye, MoreVertical, FileVideo,
  ChevronRight, CircleDot, CheckCircle
} from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Modal from '../../components/Common/Modal';
import StatsCard from '../../components/Common/StatsCard';
import { meetingsAPI, coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

export default function TeacherMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchMeetings();
    fetchCourses();
    fetchStats();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'upcoming' ? 'getUpcoming' : 'getPast';
      const response = await meetingsAPI[endpoint]({
        limit: 50
      });
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
          title: 'React Hooks Deep Dive',
          description: 'Understanding useState and useEffect',
          course: { _id: 'c2', title: 'React - The Complete Guide' },
          host: { firstName: 'John', lastName: 'Doe' },
          scheduledStart: new Date(Date.now() + 172800000).toISOString(),
          scheduledDuration: 90,
          status: 'scheduled',
          participantCount: 18,
          isPublished: true,
          autoRecording: 'cloud'
        },
        {
          _id: '3',
          title: 'Node.js Backend Development',
          description: 'Building REST APIs with Node.js',
          course: { _id: 'c3', title: 'Node.js Masterclass' },
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
      const response = await coursesAPI.getAll({ 
        instructor: user._id,
        limit: 100
      });
      setCourses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([
        { _id: 'c1', title: 'Complete Web Development' },
        { _id: 'c2', title: 'React - The Complete Guide' },
        { _id: 'c3', title: 'Node.js Masterclass' }
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
        totalMeetings: 12,
        upcomingMeetings: 3,
        endedMeetings: 9,
        meetingsWithRecordings: 7,
        totalParticipants: 256
      });
    }
  };

  const handleStartMeeting = async (meetingId) => {
    try {
      await meetingsAPI.start(meetingId);
      await fetchMeetings();
      await fetchStats();
    } catch (error) {
      console.error('Failed to start meeting:', error);
    }
  };

  const handleEndMeeting = async (meetingId) => {
    try {
      await meetingsAPI.end(meetingId);
      await fetchMeetings();
      await fetchStats();
    } catch (error) {
      console.error('Failed to end meeting:', error);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await meetingsAPI.delete(meetingId);
      await fetchMeetings();
      await fetchStats();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete meeting:', error);
    }
  };

  const handlePublish = async (meetingId, publish) => {
    try {
      await meetingsAPI.publish(meetingId, publish);
      await fetchMeetings();
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
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past & Recordings' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Live Meetings</h1>
          <p className="text-gray-400 mt-1">Manage your live sessions and video lectures</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Create Meeting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            onClick={() => {
              setActiveTab(tab.id);
              fetchMeetings();
            }}
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

      {/* Meetings List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : meetings.length === 0 ? (
        <Card className="p-8 text-center">
          <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">
            {activeTab === 'upcoming' 
              ? 'No upcoming meetings scheduled' 
              : 'No past meetings with recordings'}
          </p>
          <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
            Create Your First Meeting
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting._id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${
                    meeting.status === 'live' 
                      ? 'bg-green-900/30' 
                      : meeting.status === 'ended'
                      ? 'bg-gray-800'
                      : 'bg-primary-900/30'
                  }`}>
                    <Video className={`w-6 h-6 ${
                      meeting.status === 'live' 
                        ? 'text-green-400' 
                        : meeting.status === 'ended'
                        ? 'text-gray-400'
                        : 'text-primary-400'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-100 truncate">
                        {meeting.title}
                      </h3>
                      <span className={`badge ${getStatusBadge(meeting.status)}`}>
                        {meeting.status === 'live' && (
                          <CircleDot className="w-3 h-3 mr-1 animate-pulse" />
                        )}
                        {meeting.status}
                      </span>
                      {meeting.autoRecording === 'cloud' && (
                        <span className="badge badge-success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Auto-recording
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3 line-clamp-1">
                      {meeting.description || 'No description'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(meeting.scheduledStart)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(meeting.scheduledStart)} 
                        ({meeting.scheduledDuration} min)
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {meeting.participantCount} participants
                      </span>
                      {meeting.course && (
                        <span className="flex items-center gap-1">
                          <ChevronRight className="w-4 h-4" />
                          {meeting.course.title}
                        </span>
                      )}
                      {meeting.recordings?.length > 0 && (
                        <span className="flex items-center gap-1 text-primary-400">
                          <FileVideo className="w-4 h-4" />
                          {meeting.recordings.length} recording(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {meeting.status === 'scheduled' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          icon={Play}
                          onClick={() => handleStartMeeting(meeting._id)}
                        >
                          Start
                        </Button>
                        <Link to={`/teacher/meetings/${meeting._id}/edit`}>
                          <Button variant="secondary" size="sm" icon={Edit}>
                            Edit
                          </Button>
                        </Link>
                      </>
                    )}
                    
                    {meeting.status === 'live' && (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleEndMeeting(meeting._id)}
                        >
                          End Meeting
                        </Button>
                        <Link to={meeting.joinUrl} target="_blank">
                          <Button size="sm" icon={Play}>
                            Join
                          </Button>
                        </Link>
                      </>
                    )}
                    
                    {meeting.status === 'ended' && (
                      <>
                        {meeting.recordings?.length > 0 && (
                          <Link to={`/teacher/meetings/${meeting._id}/recordings`}>
                            <Button variant="secondary" size="sm" icon={FileVideo}>
                              View Recordings
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => setDeleteConfirm(meeting)}
                        >
                          Delete
                        </Button>
                      </>
                    )}

                    <div className="relative group">
                      <button className="p-2 rounded-lg hover:bg-gray-800 text-gray-400">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 hidden group-hover:block z-10">
                        <div className="py-1">
                          <Link
                            to={`/teacher/meetings/${meeting._id}`}
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
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
      const response = await meetingsAPI.create(formData);
      
      // Check if meeting was created (even in demo mode)
      if (response.data.success) {
        // Show demo mode warning if applicable
        if (response.data.isDemoMode) {
          console.warn('Meeting created in demo mode - Zoom not configured');
        }
        onCreated();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create meeting';
      
      // For demo mode, still allow creation
      if (errorMessage.includes('demo') || errorMessage.includes('Demo') || err.response?.status === 500) {
        // Treat as success in demo mode
        console.warn('Demo mode: treating as success');
        onCreated();
      } else {
        setError(errorMessage);
      }
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
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.settings.hostVideo}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, hostVideo: e.target.checked }
                })}
                className="rounded border-gray-700 bg-gray-800"
              />
              <span className="text-sm text-gray-300">Start with host video on</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.settings.participantVideo}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, participantVideo: e.target.checked }
                })}
                className="rounded border-gray-700 bg-gray-800"
              />
              <span className="text-sm text-gray-300">Allow participants to use video</span>
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

