import { Request,Response } from "express";
import { JobPost } from "../../model/JobSchema";
import { CustomError } from "../../Utils/errorHandler";

export const createJobPost = async (req: Request, res: Response):Promise<void> => {
              

   const userId=req.user?.id
   if(!userId){
    throw new CustomError("UnAutherized",401)
   }
      const { title, company, location, jobType, description, requirements, salary, images } = req.body;
  
      if (images.length > 5) {
         res.status(400).json({ message: "Cannot upload more than 5 images" });
         return
      }
  
      const job = new JobPost({
        title,
        company,
        location,
        jobType,
        description,
        requirements,
        salary,
        images,
        postedBy:userId 
      });
  
      await job.save();
      res.status(201).json({ message: "Job post created successfully", job });

  };
  
