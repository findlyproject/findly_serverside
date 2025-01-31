import Rating from "../../Model/RatingSchema";
import { Request, Response } from "express";


 const createRating = async (req:Request, res:Response) =>  {

    const { review, starsRating, userId } = req.body;

    if (!review || !starsRating || !userId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newRating = new Rating({
      review,
      starsRating,
      userId,
    });

    await newRating.save();
    res.status(201).json({ message: "Rating created successfully", newRating });

};




export{createRating}