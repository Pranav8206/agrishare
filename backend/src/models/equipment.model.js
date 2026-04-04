import mongoose from "mongoose";

const { Schema, model } = mongoose;

const equipmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      trim: true,
    },

    pricePerDay: {
      type: Number,
      required: true,
    },

    // Legacy location field kept for backward compatibility
    location: {
      type: String,
      trim: true,
    },

    // Geospatial location data for nearest equipment search
    // Used for MongoDB geospatial queries with 2dsphere index
    geoLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
      },
      address: {
        type: String, // e.g., "Rajapeth, Jalgaon, Maharashtra"
        trim: true,
      },
    },

    manufacturingYear: {
      type: Number,
    },

    images: [
      {
        type: String,
      },
    ],

    coverImage: {
      type: String,
      trim: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    condition: {
      type: String,
      enum: ["new", "like_new", "good", "fair", "old"],
      default: "good",
    },

    specifications: {
      type: Map,
      of: String,
      default: {},
    },

    address: {
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      pincode: {
        type: String,
        trim: true,
      },
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    avgRating: {
      type: Number,
      default: 0,
    },

    numReviews: {
      type: Number,
      default: 0,
    },

    aiAnalysis: {
      priceLabel: {
        type: String,
        enum: ["good_deal", "fair", "overpriced", "unknown"],
        default: "unknown",
      },
      priceReason: {
        type: Schema.Types.Mixed,
        default: {},
      },
      conditionLabel: {
        type: String,
        enum: ["excellent", "good", "average", "poor", "unknown"],
        default: "unknown",
      },
      conditionReason: {
        type: Schema.Types.Mixed,
        default: {},
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      model: {
        type: String,
        default: "",
      },
      analyzedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create 2dsphere index for geospatial queries
// This enables efficient nearest neighbor searches using MongoDB's geospatial operators
equipmentSchema.index({ "geoLocation.coordinates": "2dsphere" });

export const Equipment = model("Equipment", equipmentSchema);
