import LiveMeeting from '../models/LiveMeeting.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Asset from '../models/Asset.js';
import Enrollment from '../models/Enrollment.js';
import zoomService from '../services/zoomService.js';

/**
 * Generate unique meeting ID
 */
const generateMeetingId = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
};

// @desc    Create new live meeting
// @route   POST /api/meetings
// @access  Private (Admin, Teacher)
export const createMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      courseId,
      module,
      lesson,
      scheduledStart,
      scheduledDuration,
      autoRecording,
      settings
    } = req.body;

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isOwner = course.instructor.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only create meetings for your own courses.'
      });
    }

    let zoomMeeting;
    let zoomError = null;
    let isDemoMode = false;

    // Try to create Zoom meeting
    try {
      if (zoomService.isZoomConfigured()) {
        zoomMeeting = await zoomService.createMeeting({
          topic: title,
          startTime: scheduledStart,
          duration: scheduledDuration || 60,
          timezone: 'UTC',
          agenda: description,
          settings: {
            waitingRoom: settings?.waitingRoom ?? true,
            muteUponEntry: settings?.muteUponEntry ?? true,
            hostVideo: settings?.hostVideo ?? true,
            participantVideo: settings?.participantVideo ?? true,
            joinBeforeHost: settings?.joinBeforeHost ?? false,
            meetingAuthentication: settings?.meetingAuthentication ?? false,
            registrantsEmailNotification: settings?.registrantsEmailNotification ?? true
          }
        });
      } else {
        // Create mock Zoom meeting for demo
        isDemoMode = true;
        zoomMeeting = {
          meetingId: Math.floor(100000000 + Math.random() * 900000000).toString(),
          joinUrl: `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`,
          startUrl: `https://zoom.us/s/${Math.floor(100000000 + Math.random() * 900000000)}`,
          password: 'demo123'
        };
      }
    } catch (error) {
      console.error('Zoom meeting creation error:', error);
      zoomError = error.message;
      // Create mock data for demo
      isDemoMode = true;
      zoomMeeting = {
        meetingId: Math.floor(100000000 + Math.random() * 900000000).toString(),
        joinUrl: `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`,
        startUrl: `https://zoom.us/s/${Math.floor(100000000 + Math.random() * 900000000)}`,
        password: 'demo123'
      };
    }

    // Create meeting in database
    const meeting = await LiveMeeting.create({
      title,
      description,
      course: courseId,
      module,
      lesson,
      host: req.user._id,
      zoomMeetingId: zoomMeeting.meetingId,
      zoomPassword: zoomMeeting.password,
      joinUrl: zoomMeeting.joinUrl,
      startUrl: zoomMeeting.startUrl,
      scheduledStart: new Date(scheduledStart),
      scheduledDuration: scheduledDuration || 60,
      status: 'scheduled',
      autoRecording: autoRecording || 'cloud',
      recordingConsent: true,
      settings: {
        waitingRoom: settings?.waitingRoom ?? true,
        muteUponEntry: settings?.muteUponEntry ?? true,
        hostVideo: settings?.hostVideo ?? true,
        participantVideo: settings?.participantVideo ?? true,
        joinBeforeHost: settings?.joinBeforeHost ?? false,
        registrantsEmailNotification: settings?.registrantsEmailNotification ?? true,
        meetingAuthentication: settings?.meetingAuthentication ?? false
      },
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    const populatedMeeting = await LiveMeeting.findById(meeting._id)
      .populate('host', 'firstName lastName avatar')
      .populate('course', 'title thumbnail');

    // Construct success message
    let message = isDemoMode 
      ? 'Meeting created successfully in DEMO mode (Zoom not configured)'
      : 'Meeting created successfully with auto-recording enabled';
    
    if (zoomError) {
      message += `. Note: ${zoomError}`;
    }

    res.status(201).json({
      success: true,
      message,
      data: populatedMeeting,
      isDemoMode // Flag to help frontend understand demo mode
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating meeting',
      error: error.message
    });
  }
};

// @desc    Get all meetings
// @route   GET /api/meetings
// @access  Private
export const getMeetings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      courseId,
      status,
      search,
      sortBy = 'scheduledStart',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter by course
    if (courseId) query.course = courseId;

    // Filter by status
    if (status) query.status = status;

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Role-based access
    if (req.user.role === 'teacher') {
      // Teachers see meetings for their courses
      const courses = await Course.find({ instructor: req.user._id }).select('_id');
      query.course = { $in: courses.map(c => c._id) };
    } else if (req.user.role === 'student') {
      // Students only see published meetings for enrolled courses
      query.isPublished = true;
      query.status = { $in: ['scheduled', 'live', 'ended'] };
      const enrollments = await Enrollment.find({ student: req.user._id }).select('course');
      query.course = { $in: enrollments.map(e => e.course) };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const meetings = await LiveMeeting.find(query)
      .populate('host', 'firstName lastName avatar')
      .populate('course', 'title thumbnail')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await LiveMeeting.countDocuments(query);

    res.json({
      success: true,
      data: meetings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meetings',
      error: error.message
    });
  }
};

// @desc    Get meeting by ID
// @route   GET /api/meetings/:id
// @access  Private
export const getMeetingById = async (req, res) => {
  try {
    const meeting = await LiveMeeting.findById(req.params.id)
      .populate('host', 'firstName lastName avatar email')
      .populate('course', 'title thumbnail description')
      .populate('participants.userId', 'firstName lastName email avatar')
      .populate('localRecordings');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check access
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isHost = meeting.host._id.toString() === req.user._id.toString();
    
    if (!isAdmin && !isHost && !meeting.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meeting',
      error: error.message
    });
  }
};

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private (Admin, Teacher - host only)
export const updateMeeting = async (req, res) => {
  try {
    const meeting = await LiveMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isHost = meeting.host.toString() === req.user._id.toString();

    if (!isAdmin && !isHost) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Can't update ended meetings
    if (meeting.status === 'ended') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update ended meetings'
      });
    }

    const allowedFields = [
      'title', 'description', 'scheduledStart', 'scheduledDuration',
      'module', 'lesson', 'isPublished', 'settings'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        meeting[field] = req.body[field];
      }
    });

    meeting.updatedBy = req.user._id;

    // Update Zoom meeting if needed
    if (req.body.title || req.body.scheduledStart || req.body.scheduledDuration) {
      try {
        await zoomService.updateMeeting(meeting.zoomMeetingId, {
          topic: meeting.title,
          startTime: meeting.scheduledStart,
          duration: meeting.scheduledDuration
        });
      } catch (zoomError) {
        console.error('Zoom update error:', zoomError);
      }
    }

    await meeting.save();

    const updatedMeeting = await LiveMeeting.findById(meeting._id)
      .populate('host', 'firstName lastName avatar')
      .populate('course', 'title thumbnail');

    res.json({
      success: true,
      message: 'Meeting updated successfully',
      data: updatedMeeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating meeting',
      error: error.message
    });
  }
};

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private (Admin, Teacher - host only)
export const deleteMeeting = async (req, res) => {
  try {
    const meeting = await LiveMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isHost = meeting.host.toString() === req.user._id.toString();

    if (!isAdmin && !isHost) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete from Zoom
    try {
      await zoomService.deleteMeeting(meeting.zoomMeetingId);
    } catch (zoomError) {
      console.error('Zoom delete error:', zoomError);
    }

    // Delete from database
    await LiveMeeting.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting meeting',
      error: error.message
    });
  }
};

// @desc    Join meeting (generate join URL based on role)
// @route   POST /api/meetings/:id/join
// @access  Private
export const joinMeeting = async (req, res) => {
  try {
    const meeting = await LiveMeeting.findById(req.params.id)
      .populate('host', 'firstName lastName');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if meeting has ended
    if (meeting.status === 'ended') {
      return res.status(400).json({
        success: false,
        message: 'Meeting has ended'
      });
    }

    // Check access for unpublished meetings
    if (!meeting.isPublished && meeting.host.toString() !== req.user._id.toString()) {
      const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Determine join URL and role
    const isHost = meeting.host.toString() === req.user._id.toString();
    const joinData = {
      meetingId: meeting.zoomMeetingId,
      password: meeting.zoomPassword,
      role: isHost ? 1 : 0, // 1 for host, 0 for participant
      joinUrl: isHost ? meeting.startUrl : meeting.joinUrl,
      meeting: {
        _id: meeting._id,
        title: meeting.title,
        status: meeting.status
      },
      user: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email
      }
    };

    // Add user as participant if joining as attendee
    if (!isHost) {
      const existingParticipant = meeting.participants.find(
        p => p.userId?.toString() === req.user._id.toString()
      );

      if (!existingParticipant) {
        meeting.participants.push({
          userId: req.user._id,
          name: `${req.user.firstName} ${req.user.lastName}`,
          email: req.user.email,
          joinTime: new Date(),
          role: 'participant'
        });
        meeting.participantCount = meeting.participants.length;
        await meeting.save();
      }
    }

    res.json({
      success: true,
      data: joinData
    });
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining meeting',
      error: error.message
    });
  }
};

// @desc    Get meeting recordings
// @route   GET /api/meetings/:id/recordings
// @access  Private
export const getRecordings = async (req, res) => {
  try {
    const meeting = await LiveMeeting.findById(req.params.id)
      .populate('localRecordings');

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check access
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isHost = meeting.host.toString() === req.user._id.toString();
    const isPublished = meeting.isPublished;

    if (!isAdmin && !isHost && !isPublished) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Fetch recordings from Zoom if not already fetched
    if (meeting.recordings.length === 0 && meeting.status === 'ended') {
      try {
        const zoomRecordings = await zoomService.getRecordings(meeting.zoomMeetingId);
        
        if (zoomRecordings.length > 0) {
          meeting.recordings = zoomRecordings.map(r => ({
            type: r.type,
            size: r.size,
            duration: r.duration,
            downloadUrl: r.downloadUrl,
            playUrl: r.playUrl,
            status: r.status,
            fileExtension: r.fileExtension
          }));
          await meeting.save();
        }
      } catch (zoomError) {
        console.error('Fetch recordings error:', zoomError);
      }
    }

    res.json({
      success: true,
      data: {
        meetingId: meeting._id,
        title: meeting.title,
        recordings: meeting.recordings,
        localRecordings: meeting.localRecordings,
        publishedAt: meeting.publishedAt
      }
    });
  } catch (error) {
    console.error('Get recordings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recordings',
      error: error.message
    });
  }
};

// @desc    Download recording
// @route   POST /api/meetings/:id/recordings/:recordingId/download
// @access  Private (Admin, Teacher)
export const downloadRecording = async (req, res) => {
  try {
    const meeting = await LiveMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isHost = meeting.host.toString() === req.user._id.toString();

    if (!isAdmin && !isHost) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the recording
    const recording = meeting.recordings.find(r => r._id.toString() === req.params.recordingId);
    
    if (!recording || !recording.downloadUrl) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    // Download from Zoom
    const stream = await zoomService.downloadRecording(recording.downloadUrl);

    res.setHeader('Content-Type', recording.fileExtension || 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="meeting-${meeting.zoomMeetingId}-recording.mp4"`);
    
    stream.pipe(res);
  } catch (error) {
    console.error('Download recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading recording',
      error: error.message
    });
  }
};

// @desc    Store recording locally
// @route   POST /api/meetings/:id/recordings/:recordingId/store
// @access  Private (Admin, Teacher)
export const storeRecording = async (req, res) => {
  try {
    const meeting = await LiveMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isHost = meeting.host.toString() === req.user._id.toString();

    if (!isAdmin && !isHost) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find the recording
    const recording = meeting.recordings.find(r => r._id.toString() === req.params.recordingId);
    
    if (!recording || !recording.downloadUrl) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found'
      });
    }

    // Download the recording
    const stream = await zoomService.downloadRecording(recording.downloadUrl);

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll save to local uploads directory
    const fs = await import('fs');
    const path = await import('path');
    const { v4: uuidv4 } = await import('uuid');
    const { uploadToCloudinary } = await import('../services/cloudStorage.js');

    const uploadDir = './uploads/recordings';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${meeting.zoomMeetingId}-${recording.type}-${uuidv4()}.${recording.fileExtension}`;
    const filepath = path.join(uploadDir, filename);

    // Write file to disk
    await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filepath);
      stream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Create asset record
    const asset = await Asset.create({
      name: `${meeting.title} - ${recording.type}`,
      description: `Recording of meeting: ${meeting.title}`,
      type: 'video',
      mimeType: `video/${recording.fileExtension}`,
      size: recording.size,
      url: `/uploads/recordings/${filename}`,
      path: filename,
      folder: 'meetings',
      uploadedBy: req.user._id,
      usedIn: [{
        type: 'course',
        referenceId: meeting.course
      }]
    });

    // Update meeting with local recording reference
    meeting.localRecordings.push(asset._id);
    recording.localUrl = `/uploads/recordings/${filename}`;
    await meeting.save();

    const populatedAsset = await Asset.findById(asset._id)
      .populate('uploadedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Recording stored successfully',
      data: {
        recording: {
          ...recording.toObject(),
          localUrl: `/uploads/recordings/${filename}`
        },
        asset: populatedAsset
      }
    });
  } catch (error) {
    console.error('Store recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Error storing recording',
      error: error.message
    });
  }
};

// @desc    Start meeting (mark as live)
// @route   POST /api/meetings/:id/start
// @access  Private (Host only)
export const startMeeting = async (req, res) => {
  try {
    const meeting = await LiveMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if user is host
    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can start the meeting'
      });
    }

    meeting.status = 'live';
    meeting.actualStart = new Date();
    await meeting.save();

    // Send notifications to enrolled students
    try {
      const Notification = (await import('../models/Notification.js')).default;
      const Enrollment = (await import('../models/Enrollment.js')).default;

      // Get all enrolled students for this course
      const enrollments = await Enrollment.find({ course: meeting.course }).select('student');
      const recipients = enrollments.map(e => e.student);

      if (recipients.length > 0) {
        await Notification.sendToMany(recipients, {
          sender: req.user._id,
          type: 'live_class_started',
          title: '🔴 Live Class Started!',
          message: `"${meeting.title}" is now live. Join now to participate!`,
          data: {
            meetingId: meeting._id,
            courseId: meeting.course,
            url: `/student/meetings/${meeting._id}`
          },
          channel: 'in_app'
        });
        console.log(`Notifications sent to ${recipients.length} students for meeting ${meeting._id}`);
      }
    } catch (notifyError) {
      console.error('Error sending notifications:', notifyError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      message: 'Meeting started',
      data: meeting
    });
  } catch (error) {
    console.error('Start meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting meeting',
      error: error.message
    });
  }
};

// @desc    End meeting (mark as ended and fetch recordings)
// @route   POST /api/meetings/:id/end
// @access  Private (Host only)
export const endMeeting = async (req, res) => {
  try {
    const meeting = await LiveMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check if user is host
    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can end the meeting'
      });
    }

    meeting.status = 'ended';
    meeting.actualEnd = new Date();
    
    // Update participant leave times
    meeting.participants.forEach(p => {
      if (!p.leaveTime) {
        p.leaveTime = new Date();
        p.duration = Math.floor((p.leaveTime - p.joinTime) / 1000);
      }
    });

    await meeting.save();

    // Fetch recordings from Zoom (they'll be ready shortly after meeting ends)
    setTimeout(async () => {
      try {
        const zoomRecordings = await zoomService.getRecordings(meeting.zoomMeetingId);
        
        if (zoomRecordings.length > 0) {
          meeting.recordings = zoomRecordings.map(r => ({
            type: r.type,
            size: r.size,
            duration: r.duration,
            downloadUrl: r.downloadUrl,
            playUrl: r.playUrl,
            status: r.status,
            fileExtension: r.fileExtension
          }));
          await meeting.save();
          console.log(`Recordings fetched for meeting ${meeting._id}`);
        }
      } catch (zoomError) {
        console.error('Fetch recordings after meeting error:', zoomError);
      }
    }, 30000); // Wait 30 seconds for recordings to be ready

    res.json({
      success: true,
      message: 'Meeting ended. Recordings will be available shortly.',
      data: meeting
    });
  } catch (error) {
    console.error('End meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending meeting',
      error: error.message
    });
  }
};

// @desc    Zoom webhook handler
// @route   POST /api/meetings/webhook
// @access  Public (verified by Zoom signature)
export const webhookHandler = async (req, res) => {
  try {
    const { event, payload } = req.body;

    console.log(`Zoom webhook received: ${event}`);

    switch (event) {
      case 'meeting.started':
        await handleMeetingStarted(payload);
        break;
      case 'meeting.ended':
        await handleMeetingEnded(payload);
        break;
      case 'recording.completed':
        await handleRecordingCompleted(payload);
        break;
      case 'recording.deleted':
        await handleRecordingDeleted(payload);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

// Helper functions for webhook handling
async function handleMeetingStarted(payload) {
  const { object } = payload;
  const meeting = await LiveMeeting.findOne({ zoomMeetingId: object.id.toString() });
  
  if (meeting) {
    meeting.status = 'live';
    meeting.actualStart = new Date(object.start_time);
    await meeting.save();
  }
}

async function handleMeetingEnded(payload) {
  const { object } = payload;
  const meeting = await LiveMeeting.findOne({ zoomMeetingId: object.id.toString() });
  
  if (meeting) {
    meeting.status = 'ended';
    meeting.actualEnd = new Date(object.end_time);
    
    // Fetch recordings
    const zoomRecordings = await zoomService.getRecordings(meeting.zoomMeetingId);
    if (zoomRecordings.length > 0) {
      meeting.recordings = zoomRecordings.map(r => ({
        type: r.type,
        size: r.size,
        duration: r.duration,
        downloadUrl: r.downloadUrl,
        playUrl: r.playUrl,
        status: r.status,
        fileExtension: r.fileExtension
      }));
    }
    
    await meeting.save();
  }
}

async function handleRecordingCompleted(payload) {
  const { object } = payload;
  const meeting = await LiveMeeting.findOne({ zoomMeetingId: object.meeting_id.toString() });
  
  if (meeting) {
    const recordingFile = object.recording_files?.[0];
    if (recordingFile) {
      meeting.recordings.push({
        type: recordingFile.file_type,
        size: recordingFile.file_size,
        duration: recordingFile.recording_duration,
        downloadUrl: recordingFile.download_url,
        playUrl: recordingFile.play_url,
        status: recordingFile.status,
        fileExtension: recordingFile.file_extension
      });
      await meeting.save();
    }
  }
}

async function handleRecordingDeleted(payload) {
  const { object } = payload;
  const meeting = await LiveMeeting.findOne({ zoomMeetingId: object.meeting_id.toString() });
  
  if (meeting) {
    const recordingId = object.recording_files?.[0]?.id;
    if (recordingId) {
      meeting.recordings = meeting.recordings.filter(
        r => r._id.toString() !== recordingId
      );
      await meeting.save();
    }
  }
}

// @desc    Get upcoming meetings
// @route   GET /api/meetings/upcoming
// @access  Private
export const getUpcomingMeetings = async (req, res) => {
  try {
    const { courseId } = req.query;
    
    const meetings = await LiveMeeting.getUpcoming(courseId);

    res.json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error('Get upcoming meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming meetings',
      error: error.message
    });
  }
};

// @desc    Get past meetings with recordings
// @route   GET /api/meetings/past
// @access  Private
export const getPastMeetings = async (req, res) => {
  try {
    const { courseId, page = 1, limit = 10 } = req.query;

    const query = {
      status: 'ended',
      'recordings.0': { $exists: true }
    };

    if (courseId) query.course = courseId;

    // Role-based access for students
    if (req.user.role === 'student') {
      const enrollments = await Enrollment.find({ student: req.user._id }).select('course');
      query.course = { $in: enrollments.map(e => e.course) };
    }

    const meetings = await LiveMeeting.find(query)
      .populate('host', 'firstName lastName avatar')
      .populate('course', 'title thumbnail')
      .sort({ actualEnd: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await LiveMeeting.countDocuments(query);

    res.json({
      success: true,
      data: meetings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get past meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching past meetings',
      error: error.message
    });
  }
};

// @desc    Publish/unpublish meeting
// @route   PUT /api/meetings/:id/publish
// @access  Private (Admin, Teacher - host only)
export const publishMeeting = async (req, res) => {
  try {
    const { publish } = req.body;

    const meeting = await LiveMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isHost = meeting.host.toString() === req.user._id.toString();

    if (!isAdmin && !isHost) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    meeting.isPublished = publish;
    if (publish && !meeting.publishedAt) {
      meeting.publishedAt = new Date();
    }

    await meeting.save();

    const populatedMeeting = await LiveMeeting.findById(meeting._id)
      .populate('host', 'firstName lastName avatar')
      .populate('course', 'title thumbnail');

    res.json({
      success: true,
      message: publish ? 'Meeting published successfully' : 'Meeting unpublished',
      data: populatedMeeting
    });
  } catch (error) {
    console.error('Publish meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing meeting',
      error: error.message
    });
  }
};

// @desc    Add participant manually
// @route   POST /api/meetings/:id/participants
// @access  Private
export const addParticipant = async (req, res) => {
  try {
    const { userId, attended = true } = req.body;

    const meeting = await LiveMeeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    if (meeting.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: 'Meeting is not live'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already a participant
    const existingParticipant = meeting.participants.find(
      p => p.userId?.toString() === userId
    );

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'User is already a participant'
      });
    }

    meeting.participants.push({
      userId,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      joinTime: new Date(),
      role: 'participant',
      attended
    });

    meeting.participantCount = meeting.participants.length;
    await meeting.save();

    res.json({
      success: true,
      message: 'Participant added',
      data: meeting.participants
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding participant',
      error: error.message
    });
  }
};

// @desc    Get meeting statistics
// @route   GET /api/meetings/stats
// @access  Private (Admin, Teacher)
export const getMeetingStats = async (req, res) => {
  try {
    const { courseId, startDate, endDate } = req.query;

    const query = {};

    if (courseId) {
      query.course = courseId;
    } else if (req.user.role === 'teacher') {
      const courses = await Course.find({ instructor: req.user._id }).select('_id');
      query.course = { $in: courses.map(c => c._id) };
    }

    if (startDate || endDate) {
      query.scheduledStart = {};
      if (startDate) query.scheduledStart.$gte = new Date(startDate);
      if (endDate) query.scheduledStart.$lte = new Date(endDate);
    }

    const totalMeetings = await LiveMeeting.countDocuments(query);
    const upcomingMeetings = await LiveMeeting.countDocuments({ ...query, status: 'scheduled' });
    const liveMeetings = await LiveMeeting.countDocuments({ ...query, status: 'live' });
    const endedMeetings = await LiveMeeting.countDocuments({ ...query, status: 'ended' });
    const publishedMeetings = await LiveMeeting.countDocuments({ ...query, isPublished: true });

    // Get recordings stats
    const meetingsWithRecordings = await LiveMeeting.countDocuments({
      ...query,
      'recordings.0': { $exists: true }
    });

    const totalParticipants = await LiveMeeting.aggregate([
      { $match: query },
      { $unwind: '$participants' },
      { $count: 'total' }
    ]);

    const stats = {
      totalMeetings,
      upcomingMeetings,
      liveMeetings,
      endedMeetings,
      publishedMeetings,
      meetingsWithRecordings,
      totalParticipants: totalParticipants[0]?.total || 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get meeting stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meeting statistics',
      error: error.message
    });
  }
};

