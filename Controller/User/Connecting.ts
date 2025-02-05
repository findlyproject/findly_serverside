import { Request, Response } from "express"
import mongoose from "mongoose";
import User from "../../Model/UserSchema";


const userconnections = async (req:Request,res:Response):Promise<void>=>{
    const _id = req.user?.id;
    if (!_id) {
         res.status(400).json({ status: false, message: "User ID is missing" });
         return
    }

    const finduser = await User.findOne({ _id });
    console.log(finduser);
    
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

    if (!finduser.connecting.some((id) => id.toString() === connectionid)) {
        finduser.connecting.push(userid);   
        await finduser.save(); 

        res.status(200).json({status:true,message:"connecting successful",finduser})
        return
    
}
res.status(200).json({status:true,message:"connecting successful",finduser})
}



export{userconnections}  