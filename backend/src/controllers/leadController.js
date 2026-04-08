import Lead from '../models/Lead.js';
import User from '../models/User.js';

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private (Superadmin, Admin)
export const getLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      source,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const leads = await Lead.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .populate('interestedCourses', 'title')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      data: leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
      error: error.message
    });
  }
};

// @desc    Get lead by ID
// @route   GET /api/leads/:id
// @access  Private (Superadmin, Admin)
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('interestedCourses', 'title thumbnail')
      .populate('notes.createdBy', 'firstName lastName')
      .populate('activities.createdBy', 'firstName lastName');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead',
      error: error.message
    });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private (Superadmin, Admin)
export const createLead = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      source,
      interestedCourses,
      tags,
      budget,
      timeline
    } = req.body;

    // Check if lead with email already exists
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(400).json({
        success: false,
        message: 'Lead with this email already exists'
      });
    }

    const lead = await Lead.create({
      firstName,
      lastName,
      email,
      phone,
      source: source || 'website',
      interestedCourses: interestedCourses || [],
      tags: tags || [],
      budget,
      timeline: timeline || '1-3-months',
      activities: [{
        type: 'note',
        description: 'Lead created',
        createdBy: req.user._id
      }]
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'firstName lastName')
      .populate('interestedCourses', 'title');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: populatedLead
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating lead',
      error: error.message
    });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private (Superadmin, Admin)
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      source,
      interestedCourses,
      tags,
      budget,
      timeline,
      assignedTo
    } = req.body;

    if (firstName) lead.firstName = firstName;
    if (lastName) lead.lastName = lastName;
    if (email) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (source) lead.source = source;
    if (interestedCourses) lead.interestedCourses = interestedCourses;
    if (tags) lead.tags = tags;
    if (budget) lead.budget = budget;
    if (timeline) lead.timeline = timeline;
    if (assignedTo) lead.assignedTo = assignedTo;

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'firstName lastName')
      .populate('interestedCourses', 'title');

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead
    });
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating lead',
      error: error.message
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private (Superadmin only)
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting lead',
      error: error.message
    });
  }
};

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
// @access  Private (Superadmin, Admin)
export const addNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required'
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    lead.notes.push({
      text,
      createdBy: req.user._id
    });

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('notes.createdBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Note added successfully',
      data: updatedLead.notes
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding note',
      error: error.message
    });
  }
};

// @desc    Add activity to lead
// @route   POST /api/leads/:id/activities
// @access  Private (Superadmin, Admin)
export const addActivity = async (req, res) => {
  try {
    const { type, description } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Type and description are required'
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    lead.activities.push({
      type,
      description,
      createdBy: req.user._id,
      date: new Date()
    });

    // Update status if activity is a call or meeting
    if (['call', 'meeting'].includes(type)) {
      lead.status = 'contacted';
      lead.lastContactedAt = new Date();
    }

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('activities.createdBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Activity added successfully',
      data: updatedLead.activities
    });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding activity',
      error: error.message
    });
  }
};

// @desc    Update lead status
// @route   PUT /api/leads/:id/status
// @access  Private (Superadmin, Admin)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost', 'unsubscribed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    lead.status = status;

    if (status === 'converted') {
      lead.convertedAt = new Date();
      
      // Add activity
      lead.activities.push({
        type: 'status-change',
        description: `Lead converted to user`,
        createdBy: req.user._id
      });
    } else if (status === 'unsubscribed') {
      lead.unsubscribedAt = new Date();
    }

    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'firstName lastName');

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: updatedLead
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
};

// @desc    Convert lead to user
// @route   POST /api/leads/:id/convert
// @access  Private (Superadmin, Admin)
export const convertToUser = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (lead.status === 'converted') {
      return res.status(400).json({
        success: false,
        message: 'Lead is already converted'
      });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: lead.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user from lead
    const user = await User.create({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      role: 'student',
      isVerified: true,
      password: req.body.password || 'TempPass123!' // Should be handled better
    });

    // Update lead
    lead.status = 'converted';
    lead.convertedAt = new Date();
    lead.convertedToUser = user._id;
    lead.activities.push({
      type: 'status-change',
      description: 'Lead converted to registered user',
      createdBy: req.user._id
    });

    await lead.save();

    // Add enrolled courses if any
    if (lead.interestedCourses && lead.interestedCourses.length > 0) {
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { enrolledCourses: { $each: lead.interestedCourses } }
      });
    }

    res.json({
      success: true,
      message: 'Lead converted to user successfully',
      data: {
        lead,
        user
      }
    });
  } catch (error) {
    console.error('Convert lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Error converting lead',
      error: error.message
    });
  }
};

// @desc    Get lead statistics
// @route   GET /api/leads/stats
// @access  Private (Superadmin, Admin)
export const getLeadStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    
    const byStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const bySource = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);

    const convertedThisMonth = await Lead.countDocuments({
      status: 'converted',
      convertedAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const newThisMonth = await Lead.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    res.json({
      success: true,
      data: {
        totalLeads,
        byStatus,
        bySource,
        convertedThisMonth,
        newThisMonth
      }
    });
  } catch (error) {
    console.error('Get lead stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lead statistics',
      error: error.message
    });
  }
};

