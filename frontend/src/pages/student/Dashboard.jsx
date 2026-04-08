import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Trophy, Play, CheckCircle, Award, TrendingUp, Calendar, Video, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { useAuth } from '../../context/AuthContext';
import { enrollmentsAPI, notificationsAPI, meetingsAPI } from '../../services/api';

const learningProgressData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 1.8 },
  { day: 'Wed', hours: 3.2 },
  { day: 'Thu', hours: 2.0 },
  { day: 'Fri', hours: 1.5 },
  { day: 'Sat', hours: 4.0 },
  { day: 'Sun', hours: 3.5 },
];

const skillProgress = [
  { skill: 'JavaScript', progress: 85 },
  { skill: 'React', progress: 72 },
  { skill: 'Node.js', progress: 58 },
  { skill: 'Python', progress: 45 },
];

const overallProgress = 68;

export default function StudentDashboard() {
  const { user } = useAuth();
  const [progress] = useState(overallProgress);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [liveClasses, setLiveClasses] = useState({ liveNow: [], upcoming: [] });
  const [loadingLiveClasses, setLoadingLiveClasses] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
    fetchLiveClasses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await enrollmentsAPI.getMyEnrollments();
      const courses = (response.data.data || []).map(e => ({
        id: e.course?._id || e.course,
        title: e.course?.title || 'Unknown Course',
        instructor: e.course?.instructor ? `${e.course.instructor.firstName} ${e.course.instructor.lastName}` : 'Unknown Instructor',
        progress: e.progress?.percentage || 0,
        totalLessons: e.course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0,
        completedLessons: e.progress?.completedLessons?.length || 0,
        thumbnail: e.course?.thumbnail || ''
      }));
      setEnrolledCourses(courses);
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    }
  };

  const fetchLiveClasses = async () => {
    try {
      setLoadingLiveClasses(true);
      const response = await notificationsAPI.getEnrolledMeetings();
      setLiveClasses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch live classes:', error);
    } finally {
      setLoadingLiveClasses(false);
    }
  };

  const handleJoinMeeting = async (meetingId) => {
    try {
      const response = await meetingsAPI.join(meetingId);
      if (response.data.data.joinUrl) {
        window.open(response.data.data.joinUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to join meeting:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcomingDeadlines = [
    { id: 1, task: 'React Project Submission', course: 'React - The Complete Guide', dueDate: '2024-02-20', type: 'assignment' },
    { id: 2, task: 'JavaScript Quiz', course: 'Web Development', dueDate: '2024-02-22', type: 'quiz' },
    { id: 3, task: 'Node.js API Build', course: 'Node.js Masterclass', dueDate: '2024-02-25', type: 'project' },
  ];

  const achievements = [
    { id: 1, title: 'First Course Started', icon: '🎯', date: 'Jan 15, 2024' },
    { id: 2, title: '7-Day Streak', icon: '🔥', date: 'Jan 22, 2024' },
    { id: 3, title: 'First Certificate', icon: '📜', date: 'Feb 1, 2024' },
    { id: 4, title: 'Quiz Master', icon: '⭐', date: 'Feb 10, 2024' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">My Learning</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.firstName}! Keep up the great work.</p>
        </div>
        <Link to="/courses">
          <Button icon={BookOpen}>
            Browse Courses
          </Button>
        </Link>
      </div>

      {/* Progress Circle */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#374151"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#1086ff"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${progress * 1.76} 176`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-gray-100">{progress}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400">Overall Progress</p>
            <p className="text-lg font-semibold text-gray-100">Keep going!</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-100">{enrolledCourses.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Completed Lessons</p>
              <p className="text-2xl font-bold text-gray-100">
                {enrolledCourses.reduce((acc, c) => acc + c.completedLessons, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-900/30 rounded-lg">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Achievements</p>
              <p className="text-2xl font-bold text-gray-100">{achievements.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Classes Section */}
      {liveClasses.liveNow && liveClasses.liveNow.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-gray-100">Live Now</h3>
            </div>
            <Link to="/student/live-classes" className="text-sm text-primary-400 hover:text-primary-300">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {liveClasses.liveNow.slice(0, 3).map((meeting) => (
              <div key={meeting._id} className="p-4 bg-gray-800/50 rounded-lg border border-red-500/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Video className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        LIVE
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-100 truncate">{meeting.title}</h4>
                    <p className="text-sm text-gray-400 truncate">{meeting.course?.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={meeting.host?.avatar || `https://ui-avatars.com/api/?name=${meeting.host?.firstName}&background=3b82f6&color=fff`}
                        alt={meeting.host?.firstName}
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs text-gray-400">
                        {meeting.host?.firstName} {meeting.host?.lastName}
                      </span>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      fullWidth
                      icon={Play}
                      className="mt-3"
                      onClick={() => handleJoinMeeting(meeting._id)}
                    >
                      Join Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Learning Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">Learning Activity</h3>
            <select className="select w-auto text-sm">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={learningProgressData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3cc13b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3cc13b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="day" stroke="#757575" fontSize={12} />
                <YAxis stroke="#757575" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f1f1f', 
                    border: '1px solid #404040',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value} hours`, 'Study Time']}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#3cc13b" 
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Skill Progress */}
        <Card>
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">Skill Progress</h3>
          </div>
          <div className="space-y-4">
            {skillProgress.map((item) => (
              <div key={item.skill}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-300">{item.skill}</span>
                  <span className="text-gray-500">{item.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Courses and Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <Card>
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">Continue Learning</h3>
          </div>
          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="flex gap-4 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-100 truncate">{course.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">by {course.instructor}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400">{course.progress}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {course.completedLessons}/{course.totalLessons} lessons
                  </p>
                </div>
                <button className="self-center p-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
                  <Play className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <div className="panel-header">
            <h3 className="text-lg font-semibold text-gray-100">Upcoming Deadlines</h3>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className={`p-2 rounded-lg ${
                  item.type === 'quiz' ? 'bg-yellow-900/30' :
                  item.type === 'project' ? 'bg-blue-900/30' : 'bg-green-900/30'
                }`}>
                  {item.type === 'quiz' ? <Clock className="w-4 h-4 text-yellow-400" /> :
                   item.type === 'project' ? <Trophy className="w-4 h-4 text-blue-400" /> :
                   <Calendar className="w-4 h-4 text-green-400" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-100">{item.task}</p>
                  <p className="text-xs text-gray-500">{item.course}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-danger-400">
                    <Clock className="w-3 h-3" />
                    Due {item.dueDate}
                  </div>
                </div>
              </div>
            ))}
            <Button variant="secondary" size="sm" fullWidth>
              View All Assignments
            </Button>
          </div>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <div className="panel-header">
          <h3 className="text-lg font-semibold text-gray-100">Recent Achievements</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="p-4 bg-gray-800/50 rounded-lg text-center">
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <p className="font-medium text-gray-100 text-sm">{achievement.title}</p>
              <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

