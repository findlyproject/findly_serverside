import Rating from "../../Model/RatingSchema";
import {  Request, Response } from "express";


 const createRating = async (req:Request,res:Response): Promise<void>=>{

  const userId=req.user?.id
  console.log("userId",userId);
  
  const { review, starsRating } = req.body;
console.log("review, starsRating",review, starsRating);

  if (!review || !starsRating || !userId) {
     res.status(400).json({success:false, message: "All fields are required." });
     return 
  }

  const newRating = new Rating({
    review,
    starsRating,
    userId,
  });

  await newRating.save();
  res.status(201).json({ success:true ,message: "Rating created successfully", newRating });

};


const getUserRatings = async (req: Request, res: Response) => {

    

      const userId=req.user?.id
    if(!userId){
      res.status(404).json({success:false,message:"Unauthorized"})
    }
  console.log("Fasfd")
      const userRatings = await Rating.find({ userId });

      if (userRatings.length === 0) {
          res.status(404).json({success:false, message: "No ratings found for this user." });
          return;
      }

      res.status(200).json({ success:true ,userRatings });

};


     const getAllRatings=async(req:Request,res:Response)=>{

      const allratings=await Rating.find()
      console.log("allratings",allratings)
      if(!allratings){
        res.status(404).json({success:false,message:" No review about findly"})
        return
      }
      res.status(200).json({success:true,message:"found it ",allratings})
     }

const deleteRating = async (req: Request, res: Response) => {

  const userId=req.user?.id
if(!userId){
  res.status(404).json({success:false,message:"Unauthorized"})
  return
}
 
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


    export { createRating, getUserRatings, deleteRating,getAllRatings };