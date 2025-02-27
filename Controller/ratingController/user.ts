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

  export const createCompanyRating=async(req:Request,res:Response)=>{
         
           const {targetedId}=req.params
           console.log("targetedId",targetedId);
           
           const { review, starsRating,name,email } = req.body;
           const type=req.user &&req.user.type
           console.log("type",type);
           
           let userId = type==="User"?req.user?.id:null
           let companyId =type==="Company"?req.user?.id:null
           if (!review || !starsRating ) {
            throw new CustomError("All fields are required.", 400);
          }
          
          if(!targetedId){
            res.status(404).json({success:false,message:"targetId is  not fount"})
            return
          }
          const newRating = new Rating({
            review,
            starsRating,
            userId:userId||null,
            companyId:companyId||null,
            targetCompanyId:targetedId,
            name,
            email
          });
        
          await newRating.save();

          res.status(201).json({success:true,message:"rating posted"})
  }  


 
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
  const allratings = await Rating.find({isDeleted:false,status:true}).populate("userId");
  if (!allratings) {
    throw new CustomError(" No review about findly", 404);
  }
  res.status(200).json({ success: true, message: "found it ", allratings });
};

