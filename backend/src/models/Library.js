import mongoose from 'mongoose';

const librarySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['book', 'article', 'video', 'podcast', 'tutorial', 'template', 'cheatsheet', 'other'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String
  },
  content: {
    type: String, // URL or text content
    default: ''
  },
  fileUrl: {
    type: String,
    default: null
  },
  thumbnail: {
    type: String,
    default: null
  },
  author: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in minutes for video/audio
    default: 0
  },
  pages: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  language: {
    type: String,
    default: 'English'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
librarySchema.index({ type: 1 });
librarySchema.index({ category: 1 });
librarySchema.index({ tags: 1 });
librarySchema.index({ difficulty: 1 });
librarySchema.index({ createdBy: 1 });
librarySchema.index({ createdAt: -1 });
librarySchema.index({ title: 'text', description: 'text' });

// Virtual for formatted duration
librarySchema.virtual('formattedDuration').get(function() {
  if (this.duration === 0) return null;
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
});

const Library = mongoose.model('Library', librarySchema);

export default Library;

