import mongoose from "mongoose";

import { IRating } from "../types/allTypes";

const ratingSchema = new mongoose.Schema<IRating>(
  {
    review: {
      type: String,
      required: true,
      trim: true,
    },
    starsRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted:{type:Boolean,default:false},
  },
  { timestamps: true }
);

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
