import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Clock, Calendar, Users, FileVideo, 
  ChevronRight, Search, Filter, PlayCircle
} from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import StatsCard from '../../components/Common/StatsCard';
import Modal from '../../components/Common/Modal';
import { meetingsAPI } from '../../services/api';
import { format } from 'date-fns';

export default function StudentRecordings() {
  const [recordings, setRecordings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchRecordings();
  }, [selectedCourse]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const params = { limit: 50 };
      if (selectedCourse) params.courseId = selectedCourse;

      const response = await meetingsAPI.getPast(params);
      setRecordings(response.data.data);
      setStats({
        totalRecordings: response.data.data.reduce((acc, m) => acc + (m.recordings?.length || 0), 0),
        totalDuration: response.data.data.reduce((acc, m) => 
          acc + (m.recordings?.reduce((r, rec) => r + (rec.duration || 0), 0) || 0), 0),
        totalMeetings: response.data.data.length
      });
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
      // Mock data for demo
      const mockRecordings = [
        {
          _id: '1',
          title: 'JavaScript Fundamentals - Live Q&A',
          description: 'Weekly live session covering JavaScript basics',
          course: { _id: 'c1', title: 'Complete Web Development' },
          host: { firstName: 'John', lastName: 'Doe' },
          actualEnd: new Date(Date.now() - 86400000).toISOString(),
          scheduledDuration: 60,
          participantCount: 25,
          recordings: [
            { 
              _id: 'r1',
              type: 'shared_screen_with_speaker_view', 
              duration: 3600, 
              status: 'ready',
              playUrl: 'https://example.com/video.mp4'
            }
          ]
        },
        {
          _id: '2',
          title: 'React Hooks Deep Dive',
          description: 'Understanding useState and useEffect',
          course: { _id: 'c2', title: 'React - The Complete Guide' },
          host: { firstName: 'John', lastName: 'Doe' },
          actualEnd: new Date(Date.now() - 172800000).toISOString(),
          scheduledDuration: 90,
          participantCount: 18,
          recordings: [
            { 
              _id: 'r2',
              type: 'shared_screen_with_gallery_view', 
              duration: 5400, 
              status: 'ready',
              playUrl: 'https://example.com/video2.mp4'
            }
          ]
        },
        {
          _id: '3',
          title: 'Node.js Backend Development',
          description: 'Building REST APIs with Node.js',
          course: { _id: 'c3', title: 'Node.js Masterclass' },
          host: { firstName: 'Jane', lastName: 'Smith' },
          actualEnd: new Date(Date.now() - 259200000).toISOString(),
          scheduledDuration: 120,
          participantCount: 32,
          recordings: [
            { 
              _id: 'r3',
              type: 'speaker_view', 
              duration: 7200, 
              status: 'ready',
              playUrl: 'https://example.com/video3.mp4'
            }
          ]
        }
      ];
      setRecordings(mockRecordings);
      setStats({
        totalRecordings: 3,
        totalDuration: 16200,
        totalMeetings: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const getRecordingTypeLabel = (type) => {
    const labels = {
      'shared_screen_with_speaker_view': 'Screen + Speaker',
      'shared_screen_with_gallery_view': 'Screen + Gallery',
      'speaker_view': 'Speaker View',
      'gallery_view': 'Gallery View',
      'audio_only': 'Audio Only'
    };
    return labels[type] || type;
  };

  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = 
      recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.course?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleWatchRecording = (meeting, recording) => {
    setSelectedRecording({ meeting, recording });
    setShowVideoModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Video Recordings</h1>
        <p className="text-gray-400 mt-1">Watch recorded video lectures and live sessions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Recordings"
          value={stats?.totalRecordings || 0}
          icon={FileVideo}
        />
        <StatsCard
          title="Total Duration"
          value={formatDuration(stats?.totalDuration || 0)}
          icon={Clock}
        />
        <StatsCard
          title="Video Sessions"
          value={stats?.totalMeetings || 0}
          icon={PlayCircle}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search recordings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            className="input"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recordings Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredRecordings.length === 0 ? (
        <Card className="p-8 text-center">
          <FileVideo className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No recordings available</p>
          <p className="text-sm text-gray-500">
            Recordings will appear here after live sessions end.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecordings.map((meeting) => (
            <Card key={meeting._id} className="overflow-hidden group cursor-pointer"
              onClick={() => {
                if (meeting.recordings?.[0]) {
                  handleWatchRecording(meeting, meeting.recordings[0]);
                }
              }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-4 bg-gray-900/80 rounded-full">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                  {formatDuration(meeting.recordings?.[0]?.duration)}
                </div>
                {meeting.recordings?.length > 1 && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-primary-600 rounded text-xs text-white">
                    {meeting.recordings.length} videos
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-medium text-gray-100 mb-1 line-clamp-1 group-hover:text-primary-400 transition-colors">
                  {meeting.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {meeting.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(meeting.actualEnd)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {meeting.host?.firstName} {meeting.host?.lastName}
                  </span>
                </div>

                {meeting.course && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary-400">
                    <span>{meeting.course.title}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && selectedRecording && (
        <Modal
          title={selectedRecording.meeting.title}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedRecording(null);
          }}
          size="xl"
          footer={
            <Button variant="secondary" onClick={() => {
              setShowVideoModal(false);
              setSelectedRecording(null);
            }}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              {selectedRecording.recording.playUrl ? (
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  src={selectedRecording.recording.playUrl}
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <div className="text-center">
                  <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Video preview not available</p>
                  <a
                    href={selectedRecording.recording.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block"
                  >
                    Download Recording
                  </a>
                </div>
              )}
            </div>

            {/* Recording Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Duration:</span>
                <span className="ml-2 text-gray-100">
                  {formatDuration(selectedRecording.recording.duration)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Type:</span>
                <span className="ml-2 text-gray-100">
                  {getRecordingTypeLabel(selectedRecording.recording.type)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Recorded:</span>
                <span className="ml-2 text-gray-100">
                  {formatDate(selectedRecording.meeting.actualEnd)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Instructor:</span>
                <span className="ml-2 text-gray-100">
                  {selectedRecording.meeting.host?.firstName} {selectedRecording.meeting.host?.lastName}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
              <Button variant="secondary" icon={FileVideo}>
                Download
              </Button>
              <Link 
                to={`/student/courses/${selectedRecording.meeting.course?._id}`}
                className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
              >
                View Course
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

