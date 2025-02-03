import {Request,Response} from "express";
import User from "../../../Model/UserSchema"; 


const UserSearch=async(req:Request, res:Response):Promise<void> => {

console.log("hhhhhhhhhh");

    const { firstName } = req.query; 

    if (!firstName) {
       res.status(400).json({ message: "Search term is required" });
    }

    const users = await User.find({
      firstName: { $regex: `^${firstName}`, $options: "i" }, 
    });

    res.status(200).json(users);
 
}

export{UserSearch}
