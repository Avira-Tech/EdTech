import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ZOOM_API_BASE = 'https://api.zoom.us/v2';

/**
 * ZoomService - Handles all Zoom API interactions
 * Uses Server-to-Server OAuth for authentication
 */
class ZoomService {
  constructor() {
    this.accountId = process.env.ZOOM_ACCOUNT_ID;
    this.clientId = process.env.ZOOM_CLIENT_ID;
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.isConfigured = !!(this.accountId && this.clientId && this.clientSecret);
  }

  /**
   * Check if Zoom is properly configured
   */
  isZoomConfigured() {
    return this.isConfigured;
  }

  /**
   * Get access token using Server-to-Server OAuth
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.isConfigured) {
      throw new Error('Zoom credentials not configured. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET environment variables.');
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post(
        'https://zoom.us/oauth/token',
        new URLSearchParams({
          grant_type: 'account_credentials',
          account_id: this.accountId
        }),
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Zoom OAuth Error:', error.response?.data || error.message);
      throw new Error('Failed to obtain Zoom access token');
    }
  }

  /**
   * Make authenticated request to Zoom API
   */
  async makeRequest(method, endpoint, data = null) {
    const token = await this.getAccessToken();

    const config = {
      method,
      url: `${ZOOM_API_BASE}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Zoom API Error [${method} ${endpoint}]:`, 
        error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Zoom API request failed');
    }
  }

  /**
   * Create a new Zoom meeting with auto-recording
   */
  async createMeeting(options) {
    const {
      topic,
      type = 2, // Scheduled meeting
      startTime,
      duration = 60,
      timezone = 'UTC',
      password,
      agenda = '',
      settings = {}
    } = options;

    // Check if Zoom is configured
    if (!this.isConfigured) {
      // Return mock meeting data for development/demo
      console.warn('Zoom not configured. Creating mock meeting data.');
      return {
        meetingId: Math.floor(100000000 + Math.random() * 900000000).toString(),
        joinUrl: `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`,
        startUrl: `https://zoom.us/s/${Math.floor(100000000 + Math.random() * 900000000)}`,
        password: 'demo123',
        hostEmail: 'demo@example.com'
      };
    }

    // Meeting settings with auto-recording enabled
    const meeting_settings = {
      // Recording settings
      auto_recording: 'cloud', // Auto-record to cloud
      cloud_recording: true,
      local_recording: false,
      
      // Participant settings
      waiting_room: settings.waitingRoom ?? true,
      mute_upon_entry: settings.muteUponEntry ?? true,
      host_video: settings.hostVideo ?? true,
      participant_video: settings.participantVideo ?? true,
      join_before_host: settings.joinBeforeHost ?? false,
      
      // Authentication
      meeting_authentication: settings.meetingAuthentication ?? false,
      
      // Notifications
      registrants_email_notification: settings.registrantsEmailNotification ?? true,
      
      // Additional settings
      approval_type: 0, // Automatically approve
      registration_type: 1, // Attendees register once and can attend any occurrence
      audio: 'both',
      auto_delete_meeting: false, // Keep meeting recordings
      enforce_login: false
    };

    const meetingData = {
      topic,
      type,
      start_time: startTime, // ISO 8601 format
      duration,
      timezone,
      password: password || this.generatePassword(),
      agenda,
      settings: meeting_settings
    };

    const response = await this.makeRequest('POST', '/users/me/meetings', meetingData);

    return {
      meetingId: response.id.toString(),
      joinUrl: response.join_url,
      startUrl: response.start_url,
      password: response.password,
      hostEmail: response.host_email
    };
  }

  /**
   * Get meeting details
   */
  async getMeeting(meetingId) {
    if (!this.isConfigured) {
      throw new Error('Zoom not configured');
    }
    return await this.makeRequest('GET', `/meetings/${meetingId}`);
  }

  /**
   * Update meeting
   */
  async updateMeeting(meetingId, options) {
    if (!this.isConfigured) {
      console.warn('Zoom not configured. Meeting update skipped.');
      return { success: true };
    }
    const {
      topic,
      startTime,
      duration,
      timezone,
      agenda,
      settings
    } = options;

    const updateData = {};
    if (topic) updateData.topic = topic;
    if (startTime) updateData.start_time = startTime;
    if (duration) updateData.duration = duration;
    if (timezone) updateData.timezone = timezone;
    if (agenda) updateData.agenda = agenda;
    if (settings) updateData.settings = settings;

    return await this.makeRequest('PATCH', `/meetings/${meetingId}`, updateData);
  }

  /**
   * Delete meeting
   */
  async deleteMeeting(meetingId, options = {}) {
    if (!this.isConfigured) {
      console.warn('Zoom not configured. Meeting deletion skipped.');
      return { success: true };
    }
    const { notifyHost = true, notifyRegistrants = true } = options;
    return await this.makeRequest('DELETE', 
      `/meetings/${meetingId}?notify_h=${notifyHost ? 1 : 0}&notify_registrants=${notifyRegistrants ? 1 : 0}`);
  }

  /**
   * Get meeting recordings
   */
  async getRecordings(meetingId) {
    if (!this.isConfigured) {
      console.warn('Zoom not configured. Returning empty recordings.');
      return [];
    }
    try {
      const response = await this.makeRequest('GET', `/meetings/${meetingId}/recordings`);
      
      if (!response.recording_files || response.recording_files.length === 0) {
        return [];
      }

      return response.recording_files.map(file => ({
        id: file.id,
        meetingId: file.meeting_id,
        type: file.file_type,
        fileType: file.file_type,
        fileExtension: file.file_extension,
        size: file.file_size,
        duration: file.recording_duration,
        downloadUrl: file.download_url,
        playUrl: file.play_url,
        status: file.status,
        createdAt: file.recording_start,
        endTime: file.recording_end
      }));
    } catch (error) {
      console.error('Get recordings error:', error.message);
      return [];
    }
  }

  /**
   * Download recording file
   */
  async downloadRecording(downloadUrl) {
    if (!this.isConfigured) {
      throw new Error('Zoom not configured');
    }
    try {
      const token = await this.getAccessToken();
      
      const response = await axios({
        method: 'GET',
        url: downloadUrl,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'stream'
      });

      return response.data;
    } catch (error) {
      console.error('Download recording error:', error.message);
      throw new Error('Failed to download recording');
    }
  }

  /**
   * Delete recording
   */
  async deleteRecording(meetingId, recordingId) {
    if (!this.isConfigured) {
      console.warn('Zoom not configured. Recording deletion skipped.');
      return { success: true };
    }
    return await this.makeRequest('DELETE', 
      `/meetings/${meetingId}/recordings/${recordingId}`);
  }

  /**
   * Start meeting livestream
   */
  async startLivestream(meetingId, streamUrl, streamKey, pageUrl) {
    if (!this.isConfigured) {
      throw new Error('Zoom not configured');
    }
    return await this.makeRequest('PATCH', `/meetings/${meetingId}/livestream`, {
      stream_url: streamUrl,
      stream_key: streamKey,
      page_url: pageUrl
    });
  }

  /**
   * Stop livestream
   */
  async stopLivestream(meetingId) {
    if (!this.isConfigured) {
      throw new Error('Zoom not configured');
    }
    return await this.makeRequest('PATCH', `/meetings/${meetingId}/livestream/status`, {
      action: 'stop'
    });
  }

  /**
   * Get meeting participants
   */
  async getParticipants(meetingId) {
    if (!this.isConfigured) {
      return [];
    }
    try {
      const response = await this.makeRequest('GET', 
        `/past_meetings/${meetingId}/participants`);
      return response.participants || [];
    } catch (error) {
      console.error('Get participants error:', error.message);
      return [];
    }
  }

  /**
   * Get past meeting details
   */
  async getPastMeeting(meetingId) {
    if (!this.isConfigured) {
      return null;
    }
    try {
      return await this.makeRequest('GET', `/past_meetings/${meetingId}`);
    } catch (error) {
      console.error('Get past meeting error:', error.message);
      return null;
    }
  }

  /**
   * Generate secure meeting password
   */
  generatePassword(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Verify Zoom webhook signature
   */
  verifyWebhookSignature(payload, signature, timestamp) {
    const message = `v0:${timestamp}:${JSON.stringify(payload)}`;
    const hashForVerify = crypto
      .createHmac('sha256', process.env.ZOOM_WEBHOOK_SECRET || '')
      .update(message)
      .digest('hex');

    const expectedSignature = `v0=${hashForVerify}`;
    
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );
    } catch {
      return false;
    }
  }

  /**
   * Get user information
   */
  async getUser(userId = 'me') {
    if (!this.isConfigured) {
      throw new Error('Zoom not configured');
    }
    return await this.makeRequest('GET', `/users/${userId}`);
  }

  /**
   * List all users (for account)
   */
  async listUsers() {
    if (!this.isConfigured) {
      return [];
    }
    const response = await this.makeRequest('GET', '/users');
    return response.users || [];
  }

  /**
   * Check if meeting is live
   */
  async isMeetingLive(meetingId) {
    if (!this.isConfigured) {
      return false;
    }
    try {
      const meeting = await this.getMeeting(meetingId);
      return meeting.status === 'started';
    } catch (error) {
      return false;
    }
  }
}

export default new ZoomService();

