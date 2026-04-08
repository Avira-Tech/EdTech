import Asset from '../models/Asset.js';

// Helper function to get signed URL (placeholder for cloud storage)
// In production, integrate with AWS S3, Cloudinary, etc.
const getSignedUrl = async (url) => {
  // For local storage, return the URL as-is
  // For cloud storage, generate a signed URL with expiration
  return url;
};

// Helper function to delete from cloud storage (placeholder)
// In production, integrate with AWS S3, Cloudinary, etc.
const deleteFromCloud = async (path) => {
  // For local storage, the file is already deleted from disk
  // For cloud storage, delete from the cloud provider
  return true;
};

// @desc    Get all assets
// @route   GET /api/assets
// @access  Private (Admin, Teacher)
export const getAssets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      folder,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (folder) query.folder = folder;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Non-admin users can only see their own assets
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      query.uploadedBy = req.user._id;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const assets = await Asset.find(query)
      .populate('uploadedBy', 'firstName lastName email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Asset.countDocuments(query);

    // Generate signed URLs for viewing
    const assetsWithUrls = await Promise.all(assets.map(async (asset) => {
      const signedUrl = await getSignedUrl(asset.url);
      return {
        ...asset.toObject(),
        signedUrl
      };
    }));

    res.json({
      success: true,
      data: assetsWithUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get assets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message
    });
  }
};

// @desc    Get asset by ID
// @route   GET /api/assets/:id
// @access  Private
export const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('usedIn.referenceId');

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const signedUrl = await getSignedUrl(asset.url);

    res.json({
      success: true,
      data: {
        ...asset.toObject(),
        signedUrl
      }
    });
  } catch (error) {
    console.error('Get asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching asset',
      error: error.message
    });
  }
};

// @desc    Upload new asset
// @route   POST /api/assets
// @access  Private (Admin, Teacher)
export const uploadAsset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { originalname, mimetype, size, path, filename } = req.file;

    // Determine asset type from mime type
    let type = 'other';
    if (mimetype.startsWith('image/')) type = 'image';
    else if (mimetype.startsWith('video/')) type = 'video';
    else if (mimetype.startsWith('audio/')) type = 'audio';
    else if (mimetype.includes('pdf') || mimetype.includes('document')) type = 'document';
    else if (mimetype.includes('zip') || mimetype.includes('compressed')) type = 'archive';

    const asset = await Asset.create({
      name: req.body.name || originalname,
      description: req.body.description,
      type,
      mimeType: mimetype,
      size,
      url: path,
      path: filename,
      thumbnail: req.body.thumbnail,
      folder: req.body.folder || 'general',
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      uploadedBy: req.user._id
    });

    const populatedAsset = await Asset.findById(asset._id)
      .populate('uploadedBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Asset uploaded successfully',
      data: populatedAsset
    });
  } catch (error) {
    console.error('Upload asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading asset',
      error: error.message
    });
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:id
// @access  Private (Admin, Teacher - owner only)
export const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check permissions
    const isOwner = asset.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { name, description, folder, tags, isPublic } = req.body;

    if (name) asset.name = name;
    if (description !== undefined) asset.description = description;
    if (folder) asset.folder = folder;
    if (tags) asset.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (isPublic !== undefined) asset.isPublic = isPublic;

    await asset.save();

    const updatedAsset = await Asset.findById(asset._id)
      .populate('uploadedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: updatedAsset
    });
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating asset',
      error: error.message
    });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin, Teacher - owner only)
export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check permissions
    const isOwner = asset.uploadedBy.toString() === req.user._id.toString();
    const isAdmin = ['superadmin', 'admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete from cloud storage
    try {
      await deleteFromCloud(asset.path);
    } catch (e) {
      console.error('Failed to delete from cloud:', e);
    }

    await Asset.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting asset',
      error: error.message
    });
  }
};

// @desc    Get asset folders
// @route   GET /api/assets/folders
// @access  Private
export const getFolders = async (req, res) => {
  try {
    const folders = await Asset.distinct('folder');

    res.json({
      success: true,
      data: folders
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching folders',
      error: error.message
    });
  }
};

// @desc    Track asset download
// @route   POST /api/assets/:id/download
// @access  Private
export const trackDownload = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    res.json({
      success: true,
      message: 'Download tracked'
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

