import mongoose from "mongoose";

// Sub-schema for Product Variants (Size, Color, Material, etc.) to support future-proofing
const productVariantSchema = new mongoose.Schema({
  variantId: {
    type: String,
    required: true,
    trim: true,
    unique: false // Unique within the scope of this product
  },
  name: {
    type: String,
    required: [true, "Variant name is required (e.g., Size, Color)"],
    trim: true
  },
  value: {
    type: String,
    required: [true, "Variant value is required (e.g., Medium, Red)"],
    trim: true
  },
  additionalPrice: {
    type: Number,
    default: 0,
    min: [0, "Additional price cannot be negative"]
  },
  stock: {
    type: Number,
    required: [true, "Stock for variant is required"],
    min: [0, "Stock cannot be negative"],
    default: 0
  },
  sku: {
    type: String,
    trim: true,
    sparse: true
  }
}, { _id: true });

// Sub-schema for SEO optimization
const seoSchema = new mongoose.Schema({
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [70, "Meta title should not exceed 70 characters"]
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, "Meta description should not exceed 160 characters"]
  },
  keywords: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// Sub-schema for analytics
const productAnalyticsSchema = new mongoose.Schema({
  viewsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  salesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  wishlistCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [150, "Title must not exceed 150 characters"]
    },
    slug: {
      type: String,
      required: [true, "Slug is required for SEO-friendly URLs"],
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters long"],
      maxlength: [5000, "Description must not exceed 5000 characters"]
    },
    // Reference to Category (Normalized)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"]
    },
    // Subcategory (Normalized reference to support deep hierarchies)
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },
    // Images array containing secure URLs
    images: [{
      type: String,
      required: [true, "At least one product image is required"],
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid secure image URL (HTTP/HTTPS)"
      }
    }],
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"]
    },
    discountPrice: {
      type: Number,
      default: null,
      validate: {
        validator: function(value) {
          // If discountPrice is provided, it must be less than or equal to the main price
          if (value === null || value === undefined) return true;
          return value <= this.price;
        },
        message: "Discount price ({VALUE}) must be less than or equal to the original price"
      }
    },
    // Overall stock count (accumulated from variants or single product stock)
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    // Product availability status derived from stock or manual override
    status: {
      type: String,
      enum: ["draft", "pending_approval", "active", "out_of_stock", "inactive"],
      default: "draft"
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    // SEO fields nested structure
    seo: {
      type: seoSchema,
      default: () => ({})
    },
    // Admin Approval fields
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    // Soft Delete pattern
    isDeleted: {
      type: Boolean,
      default: false,
      select: false // Exclude from normal queries by default
    },
    deletedAt: {
      type: Date,
      default: null
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    // Premium / Promo sorting controls
    isFeatured: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    },
    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator (User) reference is required"]
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    // Future-proof subscription support
    isSubscription: {
      type: Boolean,
      default: false
    },
    subscriptionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      default: null
    },
    // Variants array
    variants: [productVariantSchema],
    // Analytics structure
    analytics: {
      type: productAnalyticsSchema,
      default: () => ({ viewsCount: 0, salesCount: 0, wishlistCount: 0 })
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ==========================================
// 🔍 INDEXES FOR HIGH-PERFORMANCE QUERIES
// ==========================================

// 1. Text Index for search (title, description, tags)
productSchema.index(
  { title: "text", description: "text", tags: "text" },
  { weights: { title: 10, tags: 5, description: 1 }, name: "ProductTextSearchIndex" }
);

// 2. Slug index for fast SEO-friendly lookups
productSchema.index({ slug: 1 }, { unique: true });

// 3. Category & Subcategory compound index (extremely common in filters/e-commerce)
productSchema.index({ category: 1, subcategory: 1, status: 1 });

// 4. Listing, Filtering & Sorting compound index for customers
// Covers active check, category filter, feature promotion, and price sorting
productSchema.index({ isDeleted: 1, status: 1, category: 1, isFeatured: -1, price: 1 });

// 5. Admin Listing & Audit sorting
productSchema.index({ approvalStatus: 1, createdAt: -1 });

// 6. User inventory or user's created products
productSchema.index({ createdBy: 1, isDeleted: 1 });

// ==========================================
// ⚙️ PRE-SAVE HOOKS & MIDDLEWARE
// ==========================================

// Pre-save hook to auto-generate slug if title changed (and fallback handling)
productSchema.pre("save", function(next) {
  if (this.isModified("title") && (!this.slug || this.isModified("slug"))) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // remove non-alphanumeric chars except space/dash
      .replace(/\s+/g, "-")      // replace spaces with single dash
      .replace(/-+/g, "-")       // replace multiple dashes with single dash
      .trim();
  }
  
  // Auto-set status to 'out_of_stock' if stock drops to 0 and was previously active
  if (this.isModified("stock")) {
    if (this.stock === 0 && this.status === "active") {
      this.status = "out_of_stock";
    } else if (this.stock > 0 && this.status === "out_of_stock") {
      this.status = "active";
    }
  }

  next();
});

// ==========================================
// 📈 VIRTUALS & INSTANCE METHODS
// ==========================================

// Virtual to check if product is on sale (has a valid discount price)
productSchema.virtual("isOnSale").get(function() {
  return !!(this.discountPrice && this.discountPrice < this.price);
});

// Virtual to calculate percentage discount
productSchema.virtual("discountPercentage").get(function() {
  if (!this.discountPrice || this.discountPrice >= this.price) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// Query helper to exclude soft-deleted items
productSchema.pre(/^find/, function(next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export default mongoose.model("Product", productSchema);
