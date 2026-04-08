import Library from '../models/Library.js';

// @desc    Get all library items
// @route   GET /api/library
// @access  Private
export const getLibraryItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      difficulty,
      search,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (featured === 'true') query.isFeatured = true;
    
    if (search) {
      query.$text = { $search: search };
    }

    // Students can only see published items
    if (req.user.role === 'student') {
      query.isFeatured = true; // Or show approved items
    }

    const sort = {};
    if (sortBy === 'rating') {
      sort['rating.average'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    const items = await Library.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Library.countDocuments(query);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get library items error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching library items',
      error: error.message
    });
  }
};

// @desc    Get library item by ID
// @route   GET /api/library/:id
// @access  Private
export const getLibraryItemById = async (req, res) => {
  try {
    const item = await Library.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('createdBy', 'firstName lastName');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get library item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching library item',
      error: error.message
    });
  }
};

// @desc    Create library item
// @route   POST /api/library
// @access  Private (Admin, Teacher)
export const createLibraryItem = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      subcategory,
      content,
      fileUrl,
      thumbnail,
      author,
      duration,
      pages,
      tags,
      difficulty,
      language,
      isPremium
    } = req.body;

    const item = await Library.create({
      title,
      description,
      type,
      category,
      subcategory,
      content,
      fileUrl,
      thumbnail,
      author,
      duration,
      pages,
      tags: tags || [],
      difficulty: difficulty || 'all',
      language: language || 'English',
      isPremium: isPremium || false,
      createdBy: req.user._id,
      publishedAt: req.user.role === 'student' ? null : new Date()
    });

    const populatedItem = await Library.findById(item._id)
      .populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Library item created successfully',
      data: populatedItem
    });
  } catch (error) {
    console.error('Create library item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating library item',
      error: error.message
    });
  }
};

// @desc    Update library item
// @route   PUT /api/library/:id
// @access  Private (Admin, Teacher)
export const updateLibraryItem = async (req, res) => {
  try {
    const item = await Library.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isCreator = item.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const allowedFields = [
      'title', 'description', 'type', 'category', 'subcategory',
      'content', 'fileUrl', 'thumbnail', 'author', 'duration',
      'pages', 'tags', 'difficulty', 'language', 'isFeatured', 'isPremium'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    await item.save();

    const updatedItem = await Library.findById(item._id)
      .populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Library item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update library item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating library item',
      error: error.message
    });
  }
};

// @desc    Delete library item
// @route   DELETE /api/library/:id
// @access  Private (Admin, Teacher)
export const deleteLibraryItem = async (req, res) => {
  try {
    const item = await Library.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check permissions
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);
    const isCreator = item.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Library.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Library item deleted successfully'
    });
  } catch (error) {
    console.error('Delete library item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting library item',
      error: error.message
    });
  }
};

// @desc    Rate library item
// @route   POST /api/library/:id/rate
// @access  Private
export const rateLibraryItem = async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const item = await Library.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Update rating (simple average)
    const totalScore = (item.rating.average * item.rating.count) + rating;
    item.rating.count += 1;
    item.rating.average = totalScore / item.rating.count;

    await item.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        average: item.rating.average,
        count: item.rating.count
      }
    });
  } catch (error) {
    console.error('Rate library item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message
    });
  }
};

// @desc    Track library item download
// @route   POST /api/library/:id/download
// @access  Private
export const trackDownload = async (req, res) => {
  try {
    const item = await Library.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Download tracked',
      data: { downloadCount: item.downloadCount }
    });
  } catch (error) {
    console.error('Track download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking download',
      error: error.message
    });
  }
};

// @desc    Get library categories
// @route   GET /api/library/categories
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = await Library.distinct('category');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

