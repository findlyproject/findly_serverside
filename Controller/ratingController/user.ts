import Rating from "../../model/RatingSchema";
import { Request, Response } from "express";
import { CustomError } from "../../Utils/errorHandler";

//adding rating
export const createRating = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { review, starsRating } = req.body;

  if (!review || !starsRating || !userId) {
    throw new CustomError("All fields are required.", 400);
  }

  const newRating = new Rating({
    review,
    starsRating,
    userId,
  });

  await newRating.save();
  res
    .status(201)
    .json({ success: true, message: "Rating created successfully", newRating });
};

//get user rating
export const getUserRatings = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new CustomError("Unauthorized", 404);
  }
  const userRatings = await Rating.find({ userId });

  res
    .status(200)
    .json({ success: true, message: "recived rating", userRatings });
};

//get all the rating
export const getAllRatings = async (req: Request, res: Response) => {
  const allratings = await Rating.find().populate("userId");
  if (!allratings) {
    throw new CustomError(" No review about findly", 404);
  }
  res.status(200).json({ success: true, message: "found it ", allratings });
};

//delete rating
export const deleteRating = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new CustomError("Unauthorized", 404);
  }

  const { ratingId } = req.params;

  if (!ratingId) {
    throw new CustomError("Rating ID is required.", 400);
  }

 const deletedRating = await Rating.findByIdAndDelete(ratingId);

  if (!deletedRating) {
    throw new CustomError("Rating not found.", 404);
  }

  res.status(200).json({ message: "Rating deleted successfully." });
};
