
import { CustomError } from "../../Utils/errorHandler";
import { Response,Request } from "express";
import Rating from "../../model/RatingSchema";
//delete rating
export const deleteRating = async (req: Request, res: Response) :Promise<void>=> {
 

    const ratingId  = req.params.id
  
    if (!ratingId) {
      throw new CustomError("Rating ID is required.", 400);
    }
  
   const deletedRating = await Rating.findById({_id:ratingId});
  
    if (!deletedRating) {
      throw new CustomError("Rating not found.", 404);
    }
    deletedRating.isDeleted=true
  
    await deletedRating.save()
  
    res.status(200).json({status:true, message: "Rating deleted successfully." ,deletedRating});
  };
  

  //accept rating

  export const approveRating=async(req:Request,res:Response):Promise<void>=>{
    const ratingid=req.params.id
    if (!ratingid) {
        throw new CustomError("Rating ID is required.", 400);
      }
    
     const rating = await Rating.findById({_id:ratingid});
    
      if (!rating) {
        throw new CustomError("Rating not found.", 404);
      }
      rating.status=true
    
      await rating.save()
    
      res.status(200).json({status:true, message: "Rating approved successfully." ,rating});

  }

  //get allratings in adminside

  export const getRatings=async(req:Request,res:Response):Promise<void>=>{

    const ratings=await Rating.find({isDeleted:false}).populate("userId")

    if(!ratings){
      throw new CustomError("ratings not found",404)
    }

    res.status(200).json({status:true,message:'ratings',ratings})
    


  }