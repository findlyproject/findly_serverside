import { Request, Response } from "express"
import mongoose from "mongoose";
import User from "../../Model/UserSchema";
import { IUser } from "../../types/allTypes";
import { any } from "zod";


const userconnections = async (req:Request,res:Response):Promise<void>=>{
    const _id = req.user?.id;
    if (!_id) {
         res.status(400).json({ status: false, message: "User ID is missing" });  
         return
    }

    const finduser = await User.findOne({ _id });
    
    if (!finduser) {
         res.status(404).json({ status: false, message: "User not found" });       
         return
         
    }

    const connectionid = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(connectionid)) {
         res.status(400).json({ status: false, message: "Invalid connection ID format" });
         return                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
         
    }

    const findconnectionuser = await User.findOne({ _id: connectionid });
    if (!findconnectionuser) {
         res.status(404).json({ status: false, message: "Connection user not found" });
         return
    }

    const userid = new mongoose.Types.ObjectId(connectionid);

    
res.status(200).json({status:true,message:"connecting successful",finduser})
}

//////////////////////////////// GET CONNECTION /////////////////////

     const getconnection = async(req:Request,res:Response):Promise<void>=>{
          const _id = req.user?.id;

          if (!_id) {
             res.status(400).json({ status: false, message: "User ID is missing" });
            return
          }
      
          const foundUser: IUser | null = await User.findOne({ _id })
          .populate("connecting","email firstName lastName profileImage banner");
      
          if (!foundUser) {
             res.status(404).json({ status: false, message: "User not found" });
             return
          }
      
          const userConnections = foundUser.connecting; 
      
          res.status(200).json({
            status: true,
            message: "User connections retrieved successfully",
            connections: userConnections,
          });
          
     }

     ////////////// CONNECTION REMOVING /////////////

 const removeConnection = async (req: Request, res: Response): Promise<void> => {
        const _id = req.user?.id; 
        const connectionId = req.params.id; 

        if (!mongoose.Types.ObjectId.isValid(connectionId)) {
            res.status(400).json({ status: false, message: "Invalid connection ID" });
            return
        }

        const user = await User.findById(_id);
        if (!user) {
             res.status(404).json({ status: false, message: "User not found" });
             return
        }

        const index = user.connecting.findIndex((id) => id.toString() === connectionId);
        if (index === -1) {
            res.status(400).json({ status: false, message: "Connection not found" });
            return
        }

        user.connecting.splice(index, 1);
        await user.save();

        res.status(200).json({ status: true, message: "Connection removed successfully", user });
    
};



export{userconnections,
     getconnection,
     removeConnection
}  