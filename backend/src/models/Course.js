import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['free', 'one-time', 'subscription'],
    default: 'free'
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  discountType: {
    type: String,
    enum: ['none', 'percentage', 'flat'],
    default: 'none'
  },
  discountValue: {
    type: Number,
    default: 0,
    min: 0
  },
  discountedPrice: {
    type: Number,
    default: 0
  },
  subscriptionDuration: {
    type: Number, // in days
    default: null
  }
}, { _id: false });

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  thumbnail: {
    type: String,
    default: null
  },
  previewVideo: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  subcategory: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pricing: {
    type: pricingSchema,
    default: () => ({ type: 'free', price: 0 })
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  language: {
    type: String,
    default: 'English'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  modules: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    order: Number,
    lessons: [{
      title: {
        type: String,
        required: true
      },
      description: String,
      type: {
        type: String,
        enum: ['video', 'pdf', 'text', 'quiz', 'assignment'],
        default: 'video'
      },
      content: {
        type: String, // URL for video/pdf or text content
        default: ''
      },
      duration: {
        type: Number, // in minutes
        default: 0
      },
      order: Number,
      isFree: {
        type: Boolean,
        default: false
      }
    }]
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  objectives: [{
    type: String,
    trim: true
  }],
  whatYouWillLearn: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
courseSchema.index({ status: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ 'pricing.type': 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ title: 'text', description: 'text' });

// Generate slug before saving
courseSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Calculate discounted price
courseSchema.pre('save', function(next) {
  if (this.pricing) {
    if (this.pricing.discountType === 'percentage') {
      this.pricing.discountedPrice = this.pricing.price - 
        (this.pricing.price * this.pricing.discountValue / 100);
    } else if (this.pricing.discountType === 'flat') {
      this.pricing.discountedPrice = Math.max(0, 
        this.pricing.price - this.pricing.discountValue);
    } else {
      this.pricing.discountedPrice = this.pricing.price;
    }
  }
  next();
});

// Virtual for total lessons count
courseSchema.virtual('totalLessons').get(function() {
  if (!this.modules || this.modules.length === 0) return 0;
  return this.modules.reduce((total, module) => 
    total + (module.lessons ? module.lessons.length : 0), 0);
});

// Virtual for formatted duration
courseSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

const Course = mongoose.model('Course', courseSchema);

export default Course;

