
import Rating from "../../model/RatingSchema"
import { Request,Response } from "express"
export const findreviewsBycompany=async(req:Request,res:Response)=>{
    const companyId=req.user?.id

    const reviews=await Rating.find({targetCompanyId:companyId,isDeleted:false}).populate("companyId userId")
    res.status(200).json({success:true,message:"reviews found it ",reviews})
  }

export const findreviewsByTargetedId=async(req:Request,res:Response)=>{
    const {targetedId}=req.params
    const reviews=await Rating.find({targetCompanyId:targetedId,isDeleted:false}).populate("companyId userId")
    res.status(200).json({success:true,message:"found it ",reviews})
}


export const deleteReview = async (req: Request, res: Response) => {

        const reviewId = req.params.id;
        const review = await Rating.findById(reviewId);
        if (!review) {
             res.status(404).json({ success: false, message: "Review not found" });
             return
        }
        review.isDeleted = true;
        await review.save();

         res.status(200).json({ success: true, message: "Review soft deleted successfully" });

};


export const deleteReviews=async(req:Request,res:Response):Promise<void>=>{
  const {id}=req.params

  
  let companyId = req.user?.id

  const review=await Rating.findOne({_id:id,companyId})
  if (!review) {
     res.status(404).json({ success: false, message: "Review not found" });
     return
  }


  review.isDeleted = true;
  await review.save();

  res.json({ success: true, message: "Review deleted", review });
}

