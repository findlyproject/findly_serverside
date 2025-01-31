import Rating from "../../Model/RatingSchema";
import { Request, Response } from "express";


 const createRating = async (req:Request, res:Response ):Promise<void> =>  {

  const { review, starsRating, userId } = req.body;

  if (!review || !starsRating || !userId) {
     res.status(400).json({ message: "All fields are required." });
  }

  const newRating = new Rating({
    review,
    starsRating,
    userId,
  });

  await newRating.save();
  res.status(201).json({ message: "Rating created successfully", newRating });

};


const getUserRatings = async (req: Request, res: Response) => {

      const { userId } = req.params; 

      if (!userId) {
          res.status(400).json({ message: "User ID is required." });
          return;
      }

      const userRatings = await Rating.find({ userId });

      if (userRatings.length === 0) {
          res.status(404).json({ message: "No ratings found for this user." });
          return;
      }

      res.status(200).json({ userRatings });

};

const deleteRating = async (req: Request, res: Response) => {
 
      const { ratingId } = req.params; 

      if (!ratingId) {
          res.status(400).json({ message: "Rating ID is required." });
          return;
      }

      const deletedRating = await Rating.findByIdAndDelete(ratingId);

      if (!deletedRating) {
          res.status(404).json({ message: "Rating not found." });
          return;
      }

      res.status(200).json({ message: "Rating deleted successfully." });


    }


    export { createRating, getUserRatings, deleteRating };