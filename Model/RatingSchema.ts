import mongoose from "mongoose"




const ratingSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);


const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
