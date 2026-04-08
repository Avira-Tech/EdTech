import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'archive', 'other'],
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  },
  folder: {
    type: String,
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  usedIn: [{
    type: {
      type: String,
      enum: ['course', 'lesson', 'assignment', 'profile']
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId
    }
  }],
  downloads: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
assetSchema.index({ type: 1 });
assetSchema.index({ folder: 1 });
assetSchema.index({ tags: 1 });
assetSchema.index({ uploadedBy: 1 });
assetSchema.index({ createdAt: -1 });

// Virtual for formatted file size
assetSchema.virtual('formattedSize').get(function() {
  if (this.size < 1024) return `${this.size} B`;
  if (this.size < 1024 * 1024) return `${(this.size / 1024).toFixed(1)} KB`;
  if (this.size < 1024 * 1024 * 1024) return `${(this.size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(this.size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
});

// Get file extension
assetSchema.virtual('extension').get(function() {
  const match = this.name.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : '';
});

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;

