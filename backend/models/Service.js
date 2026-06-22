const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    _id: true
  }
);

const pricingRuleSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      default: ''
    },
    daysOfWeek: {
      type: [Number],
      default: [],
      validate: {
        validator: (days) => days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6),
        message: 'daysOfWeek phai nam trong khoang 0-6'
      }
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    _id: true
  }
);

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    categorySlug: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      trim: true,
      default: ''
    },
    imageUrl: {
      type: String,
      trim: true,
      default: ''
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
      default: ''
    },
    duration: {
      type: Number,
      required: true,
      min: 15
    },
    durationMinutes: {
      type: Number,
      default: 60,
      min: 15
    },
    suitableFor: {
      type: [String],
      default: []
    },
    benefits: {
      type: [String],
      default: []
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    addons: {
      type: [addonSchema],
      default: []
    },
    pricingRules: {
      type: [pricingRuleSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

serviceSchema.index({ categorySlug: 1, category: 1, createdAt: -1 });

const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const getCategorySlug = (category) => {
  const cat = (category || '').toLowerCase().trim();
  if (cat.includes('cat') || cat.includes('tao kieu') || cat.includes('cắt') || cat.includes('tạo kiểu') || cat.includes('haircut')) return 'haircut';
  if (cat.includes('uon') || cat.includes('uốn') || cat.includes('perm')) return 'perm';
  if (cat.includes('duoi') || cat.includes('duỗi') || cat.includes('straight')) return 'straightening';
  if (cat.includes('nhuom') || cat.includes('nhuộm') || cat.includes('color')) return 'color';
  if (cat.includes('phuc hoi') || cat.includes('phục hồi') || cat.includes('treatment')) return 'treatment';
  if (cat.includes('goi') || cat.includes('gội') || cat.includes('shampoo') || cat.includes('duong sinh')) return 'shampoo';
  if (cat.includes('combo')) return 'combo';
  return slugify(category) || 'other';
};

serviceSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name);
  }
  if (this.category && !this.categorySlug) {
    this.categorySlug = getCategorySlug(this.category);
  }
  if (this.duration && !this.durationMinutes) {
    this.durationMinutes = this.duration;
  }
  if (this.durationMinutes && !this.duration) {
    this.duration = this.durationMinutes;
  }
  if (this.imageUrl && !this.image) {
    this.image = this.imageUrl;
  }
  if (this.image && !this.imageUrl) {
    this.imageUrl = this.image;
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
