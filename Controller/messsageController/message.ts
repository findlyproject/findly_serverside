import { Request, Response } from "express";
import User from "../../model/UserSchema";
import { Community, Conversation, Message } from "../../model/messageSchema";
import { CustomError } from "../../Utils/errorHandler";
import mongoose from "mongoose";
import { IMessage } from "../../types/allTypes";



export const SendMessage = async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io"); // Get Socket.IO instance
  
  const { senderId, receiverId } = req.params;
  const { message } = req.body;
console.log(message);

  // Check if sender and receiver exist
  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);

  if (!sender || !receiver) {
    res.status(404).json({ message: 'Sender or receiver not found' });
    return;
  }
io.on("newMessage",(data:string)=>{
  console.log("message",data);
  
})
  // Create a new message document 
  const newMessage = new Message({
    sender: senderId,
    receiver: receiverId,
    message
  });

  await newMessage.save();

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] }
  });

  if (!conversation) {
    conversation = new Conversation({
      participants: [senderId, receiverId],
      messages: [newMessage._id],
      lastUpdated: new Date()
    });
  } else {
    conversation.messages.push(newMessage._id as IMessage);
    conversation.lastUpdated = new Date();
  }

  await conversation.save();

  // Emit the message to the receiver's room
  io.emit("receiveMessage", {
    message: newMessage,
    from: senderId
  });

  res.status(201).json({ message: 'Message sent successfully', newMessage });
};

  


  export const GetConversation=async(req:Request,res:Response)=>{

    const { senderId, receiverId } = req.params;

   
      // Check if conversation exists between sender and receiver
      const conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] }
      }).populate({
        path: 'messages',
        model: 'Message',
        options: { sort: { createdAt: 1 } } // Sort messages by creation time in ascending order
      });
  
      if (!conversation) {
        res.status(404).json({ message: 'No conversation found' });
        return;
      }
  
      res.status(200).json({ messages: conversation.messages});
    }

    export const createCommunity=async(req:Request,res:Response):Promise<void>=>{

    const userId=req.user?.id
    console.log("userId",userId);
    
    const {name,description,profile}=req.body
    console.log("{name,description,profile}",{name,description,profile})
    if(!userId){
        throw new CustomError('current user not found',404)
    }
    if(!name||!description){
        throw new CustomError('name and description is required',400)
    }
    const existingCommunity=await Community.findOne({name})
    if(existingCommunity){
        throw new CustomError('community already exists',400)
    }

    
   const community=new Community({
    name,
    description,
    createdBy:userId,
    profile,
    members:[userId]
   })
await community.save()

   res.status(201).json({status:true,message:"community created",community})
}


export const AllCommunities=async(req:Request,res:Response):Promise<void>=>{
    const communities=await Community.find()

    if(!communities){
        throw new  CustomError("all communities not found",404)
    }
res.status(200).json({status:true,message:'communities',communities})
}



export const joinCommunity =async(req:Request,res:Response):Promise<void>=>{
   
   const communityId=req.params.id
  const userId=req.user?.id
    // Check if the community exists
    const community = await Community.findById(communityId);
    if (!community) {
      res.status(404).json({ message: 'Community not found' });
      return;
    }

    // Check if the user is already a member
    const isMember = community.members.some(
      (member) => member.toString() === userId
    );
    if (isMember) {
      res.status(400).json({ message: 'User is already a member' });
      return;
    }

    // Add user to the community
    community.members.push(new mongoose.Types.ObjectId(userId));

    // Save the updated community
    await community.save();

    res.status(200).json({ message: 'User joined the community successfully',community});
}