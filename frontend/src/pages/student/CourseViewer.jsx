import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Play, BookOpen, CheckCircle, Clock,
  ChevronDown, ChevronRight, FileText, Video, 
  Download, Award, Menu, X
} from 'lucide-react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import ProgressBar from '../../components/Common/ProgressBar';
import Modal from '../../components/Common/Modal';

export default function CourseViewer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    if (course && lessonId) {
      const lesson = findLessonById(lessonId);
      setCurrentLesson(lesson || course.modules[0]?.lessons[0]);
    } else if (course && course.modules[0]?.lessons[0]) {
      setCurrentLesson(course.modules[0].lessons[0]);
      // Update URL without reload
      navigate(`/student/courses/${courseId}/${course.modules[0].lessons[0]._id}`, { replace: true });
    }
  }, [course, lessonId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      const mockCourse = {
        _id: 'c1',
        title: 'Complete Web Development Bootcamp',
        instructor: { firstName: 'John', lastName: 'Smith' },
        description: 'Learn web development from scratch with this comprehensive bootcamp.',
        progress: 45,
        modules: [
          {
            _id: 'm1',
            title: 'Getting Started',
            description: 'Introduction to web development',
            order: 1,
            lessons: [
              { 
                _id: 'l1', 
                title: 'Welcome to the Course', 
                type: 'video', 
                duration: 600, 
                content: 'https://example.com/video1.mp4',
                isFree: true,
                completed: true
              },
              { 
                _id: 'l2', 
                title: 'Setting Up Your Environment', 
                type: 'video', 
                duration: 900, 
                content: 'https://example.com/video2.mp4',
                isFree: true,
                completed: true
              },
              { 
                _id: 'l3', 
                title: 'Course Resources', 
                type: 'pdf', 
                content: 'https://example.com/resources.pdf',
                isFree: false,
                completed: false
              }
            ]
          },
          {
            _id: 'm2',
            title: 'HTML Fundamentals',
            description: 'Learn the basics of HTML',
            order: 2,
            lessons: [
              { 
                _id: 'l4', 
                title: 'Introduction to HTML', 
                type: 'video', 
                duration: 1200, 
                content: 'https://example.com/video4.mp4',
                isFree: false,
                completed: false
              },
              { 
                _id: 'l5', 
                title: 'HTML Elements & Tags', 
                type: 'video', 
                duration: 1500, 
                content: 'https://example.com/video5.mp4',
                isFree: false,
                completed: false
              },
              { 
                _id: 'l6', 
                title: 'HTML Quiz', 
                type: 'quiz', 
                content: '',
                isFree: false,
                completed: false
              }
            ]
          },
          {
            _id: 'm3',
            title: 'CSS Styling',
            description: 'Master CSS for beautiful designs',
            order: 3,
            lessons: [
              { 
                _id: 'l7', 
                title: 'CSS Basics', 
                type: 'video', 
                duration: 1800, 
                content: 'https://example.com/video7.mp4',
                isFree: false,
                completed: false
              },
              { 
                _id: 'l8', 
                title: 'Flexbox Layout', 
                type: 'video', 
                duration: 2100, 
                content: 'https://example.com/video8.mp4',
                isFree: false,
                completed: false
              }
            ]
          }
        ]
      };

      setCourse(mockCourse);
      setCompletedLessons(['l1', 'l2']);
      
      if (mockCourse.modules[0]?.lessons[0]) {
        setCurrentLesson(mockCourse.modules[0].lessons[0]);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const findLessonById = (id) => {
    if (!course) return null;
    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l._id === id);
      if (lesson) return lesson;
    }
    return null;
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'quiz': return <CheckCircle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const handleMarkComplete = () => {
    if (currentLesson && !completedLessons.includes(currentLesson._id)) {
      setCompletedLessons([...completedLessons, currentLesson._id]);
    }
    setShowCompleteModal(false);
  };

  const handleNextLesson = () => {
    if (!course || !currentLesson) return;
    
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l._id === currentLesson._id);
    
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setCurrentLesson(nextLesson);
      navigate(`/student/courses/${courseId}/${nextLesson._id}`);
    }
  };

  const handlePrevLesson = () => {
    if (!course || !currentLesson) return;
    
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l._id === currentLesson._id);
    
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      setCurrentLesson(prevLesson);
      navigate(`/student/courses/${courseId}/${prevLesson._id}`);
    }
  };

  const isFirstLesson = () => {
    if (!course || !currentLesson) return true;
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l._id === currentLesson._id);
    return currentIndex === 0;
  };

  const isLastLesson = () => {
    if (!course || !currentLesson) return true;
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentIndex = allLessons.findIndex(l => l._id === currentLesson._id);
    return currentIndex === allLessons.length - 1;
  };

  const isLessonCompleted = (lessonId) => completedLessons.includes(lessonId);

  const calculateProgress = () => {
    if (!course) return 0;
    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    return Math.round((completedLessons.length / totalLessons) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Course not found</p>
        <Link to="/student/courses">
          <Button variant="secondary" className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-950 -m-6">
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link 
            to="/student/courses"
            className="flex items-center gap-2 text-gray-400 hover:text-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Courses</span>
          </Link>
          <div className="h-6 w-px bg-gray-700"></div>
          <h1 className="text-sm font-medium text-gray-100 truncate max-w-xs">
            {course.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <ProgressBar value={progress} max={100} showLabel={false} size="sm" className="w-32" />
            <span className="text-sm text-gray-400">{progress}%</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-gray-900 border-r border-gray-800 flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]`}>
          <div className="p-4 overflow-y-auto h-full">
            <h2 className="font-semibold text-gray-100 mb-4">Course Content</h2>
            
            <div className="space-y-2">
              {course.modules.map((module, moduleIndex) => (
                <div key={module._id} className="border border-gray-800 rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-800/50">
                    <p className="text-xs text-gray-500 mb-1">Module {module.order}</p>
                    <h3 className="font-medium text-gray-100">{module.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {module.lessons.filter(l => isLessonCompleted(l._id)).length}/{module.lessons.length} completed
                    </p>
                  </div>
                  
                  <div className="bg-gray-900">
                    {module.lessons.map((lesson) => (
                      <Link
                        key={lesson._id}
                        to={`/student/courses/${courseId}/${lesson._id}`}
                        className={`flex items-center gap-3 p-3 border-t border-gray-800 hover:bg-gray-800 transition-colors ${
                          currentLesson?._id === lesson._id ? 'bg-gray-800' : ''
                        }`}
                      >
                        <div className={`flex-shrink-0 ${
                          isLessonCompleted(lesson._id) ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {isLessonCompleted(lesson._id) ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            getLessonIcon(lesson.type)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${
                            currentLesson?._id === lesson._id ? 'text-primary-400' : 'text-gray-300'
                          }`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="capitalize">{lesson.type}</span>
                            {lesson.duration > 0 && (
                              <>
                                <span>•</span>
                                <span>{Math.floor(lesson.duration / 60)} min</span>
                              </>
                            )}
                            {lesson.isFree && (
                              <>
                                <span>•</span>
                                <span className="text-green-400">Free</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Completion Stats */}
            <div className="mt-6 p-4 bg-primary-900/20 border border-primary-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-primary-400" />
                <span className="font-medium text-gray-100">Your Progress</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">{completedLessons.length} of {totalLessons} lessons</span>
                <span className="text-primary-400">{progress}%</span>
              </div>
              <ProgressBar value={progress} max={100} showLabel={false} color="primary" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {currentLesson ? (
            <div className="max-w-4xl mx-auto">
              {/* Video/Content Area */}
              <Card className="overflow-hidden mb-6">
                {currentLesson.type === 'video' ? (
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      <p className="text-gray-400">Video Player</p>
                      <p className="text-sm text-gray-500 mt-1">{currentLesson.title}</p>
                    </div>
                  </div>
                ) : currentLesson.type === 'pdf' ? (
                  <div className="p-8 text-center">
                    <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-100 mb-2">{currentLesson.title}</h3>
                    <Button icon={Download} variant="secondary">
                      Download PDF
                    </Button>
                  </div>
                ) : currentLesson.type === 'quiz' ? (
                  <div className="p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-100 mb-2">Quiz: {currentLesson.title}</h3>
                    <Button>Start Quiz</Button>
                  </div>
                ) : (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-100 mb-4">{currentLesson.title}</h2>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300">Lesson content would appear here...</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Lesson Info */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-100">{currentLesson.title}</h1>
                  <p className="text-gray-400 mt-1">{course.instructor.firstName} {course.instructor.lastName}</p>
                </div>
                
                {!isLessonCompleted(currentLesson._id) ? (
                  <Button onClick={() => setShowCompleteModal(true)} icon={CheckCircle}>
                    Mark as Complete
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                <Button 
                  variant="secondary" 
                  onClick={handlePrevLesson}
                  disabled={isFirstLesson()}
                  icon={ArrowLeft}
                >
                  Previous Lesson
                </Button>
                <Button 
                  onClick={handleNextLesson}
                  disabled={isLastLesson()}
                >
                  Next Lesson
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Select a lesson to start learning</p>
            </div>
          )}
        </main>
      </div>

      {/* Complete Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Lesson Complete"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-100 mb-2">Great job!</h3>
          <p className="text-gray-400 mb-6">You've completed this lesson.</p>
          
          {currentLesson && !isLessonCompleted(currentLesson._id) && (
            <p className="text-sm text-gray-500 mb-4">
              {completedLessons.length + 1} of {totalLessons} lessons completed
            </p>
          )}
          
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
              Review Lesson
            </Button>
            <Button onClick={() => {
              handleMarkComplete();
              handleNextLesson();
            }}>
              Next Lesson
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

