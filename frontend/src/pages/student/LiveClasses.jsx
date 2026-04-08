import { useState, useEffect } from 'react';
import { Video, Clock, Users, Play, ExternalLink, Calendar, Bell } from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { notificationsAPI, meetingsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function LiveClasses() {
  const [liveMeetings, setLiveMeetings] = useState({ liveNow: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLiveMeetings();
    
    // Poll for live meetings every 30 seconds
    const interval = setInterval(fetchLiveMeetings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveMeetings = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getEnrolledMeetings();
      setLiveMeetings(response.data.data);
    } catch (error) {
      console.error('Failed to fetch live meetings:', error);
      toast.error('Failed to load live classes');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeUntil = (date) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 0) return 'Started';
    if (diffMins < 60) return `In ${diffMins} min`;
    if (diffHours < 24) return `In ${diffHours}h`;
    if (diffDays < 7) return `In ${diffDays}d`;
    return formatDate(date);
  };

  const handleJoinMeeting = async (meetingId) => {
    try {
      const response = await meetingsAPI.join(meetingId);
      if (response.data.data.joinUrl) {
        window.open(response.data.data.joinUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to join meeting:', error);
      toast.error('Failed to join meeting');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Live Classes</h1>
          <p className="text-gray-400 mt-1">Join live sessions from your enrolled courses</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Updates every 30 seconds</span>
        </div>
      </div>

      {/* Live Now Section */}
      {liveMeetings.liveNow && liveMeetings.liveNow.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-gray-100">Live Now</h2>
            <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">
              {liveMeetings.liveNow.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMeetings.liveNow.map((meeting) => (
              <Card key={meeting._id} className="overflow-hidden border-l-4 border-l-red-500">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <Video className="w-5 h-5 text-red-400" />
                      </div>
                      <span className="bg-red-500/20 text-red-400 text-xs font-medium px-2 py-1 rounded">
                        LIVE
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {meeting.participantCount || 0}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-100 mb-1 line-clamp-2">{meeting.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{meeting.course?.title}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={meeting.host?.avatar || `https://ui-avatars.com/api/?name=${meeting.host?.firstName}&background=3b82f6&color=fff`}
                      alt={meeting.host?.firstName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-400">
                      {meeting.host?.firstName} {meeting.host?.lastName}
                    </span>
                  </div>

                  <Button
                    variant="danger"
                    fullWidth
                    icon={Play}
                    onClick={() => handleJoinMeeting(meeting._id)}
                  >
                    Join Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Classes */}
      {liveMeetings.upcoming && liveMeetings.upcoming.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-gray-100">Upcoming Sessions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMeetings.upcoming.map((meeting) => (
              <Card key={meeting._id} className="overflow-hidden hover:border-primary-500/50 transition-colors">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary-500/20 rounded-lg">
                        <Video className="w-5 h-5 text-primary-400" />
                      </div>
                    </div>
                    <span className="text-xs text-primary-400 font-medium px-2 py-1 bg-primary-500/20 rounded">
                      {getTimeUntil(meeting.scheduledStart)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-100 mb-1 line-clamp-2">{meeting.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{meeting.course?.title}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <img
                        src={meeting.host?.avatar || `https://ui-avatars.com/api/?name=${meeting.host?.firstName}&background=3b82f6&color=fff`}
                        alt={meeting.host?.firstName}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-400">
                        {meeting.host?.firstName} {meeting.host?.lastName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(meeting.scheduledStart)}</span>
                    <span className="text-gray-600">•</span>
                    <span>{formatDate(meeting.scheduledStart)}</span>
                  </div>

                  {meeting.scheduledDuration && (
                    <p className="text-xs text-gray-500 mt-2">
                      Duration: {Math.floor(meeting.scheduledDuration / 60)}h {meeting.scheduledDuration % 60}m
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Classes State */}
      {(!liveMeetings.liveNow || liveMeetings.liveNow.length === 0) && 
       (!liveMeetings.upcoming || liveMeetings.upcoming.length === 0) && (
        <Card className="p-8 text-center">
          <div className="p-4 bg-gray-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-100 mb-2">No Live Classes</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            There are no live classes scheduled for your enrolled courses at the moment. 
            Check back later or browse available courses.
          </p>
        </Card>
      )}
    </div>
  );
}

