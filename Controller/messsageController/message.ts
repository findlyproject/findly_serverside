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
    const communities=await Community.find().populate('members')

    if(!communities){
        throw new  CustomError("all communities not found",404)
    }
res.status(200).json({status:true,message:'communities',communities})
}



export const joinCommunity =async(req:Request,res:Response):Promise<void>=>{
  const io = res.app.get("io")
  const communityId=req.params.id
 const userId=req.user?.id
   const community = await Community.findById(communityId);
   if (!community) {
     res.status(404).json({status:false, message: 'Community not found' });
     return;
   }

   const isMember = community.members.some(
     (member) => member.toString() === userId
   );
   if (isMember) {
     res.status(400).json({status:false, message: 'User is already a member' });
     return;
   }

   community.members.push(new mongoose.Types.ObjectId(userId));

   await community.save();
   console.log("response join",community);
   io.emit("communtjoin",community)
   
   res.status(200).json({status:true, message: 'User joined the community successfully',community});
}

//leave  community

export const LeaveCommunity=async(req:Request,res:Response):Promise<void>=>{
const communityid=req.params.id
const userid=req.user?.id
console.log("userid for community",userid);

const community=await Community.findById(communityid)
if(!community){
  throw new CustomError(`community not found`,404)

}
const isMember=community.members.some((member)=>member.toString()===userid)
if(!isMember){
 throw new CustomError('user is not a member',400)
}
community.members= community.members.filter((item)=>item.toString()!==userid)
await community.save()


res.status(200).json({status:true,message:'leave community',community})
}


//Community Details
export const CommunityDetails=async(req:Request,res:Response):Promise<void>=>{
const communityID=req.params.id
const community=await Community.findById(communityID)
if(!community){
  throw new CustomError(`community not found`,404)
}
res.status(200).json({ status:true,message:'community details',community})
}


//UpdateCommunity

export const  UpdateCommunity=async(req:Request,res:Response):Promise<void>=>{


}


//admin can Delete Community

export const  DeleteCommunity=async(req:Request,res:Response):Promise<void>=>{

const communityid=req.params.id
const community=await Community.findById(communityid)

if(!community){
  throw new CustomError(`community not found`,404)
}


}


//search community

export const  SearchCommunity=async(req:Request,res:Response):Promise<void>=>{
  console.log("dfghjsdfgh");
  
const {query}=req.query
console.log("query",query);

if(!query){
  throw new CustomError(`query is required`,400)
}
const community=await Community.find({name:{ $regex: query, $options: "i" }})
if(!community){
  throw new CustomError(`community not found`,404)
}

res.status(200).json({status:true,message:'success',community})
}



//Delete message


export const DeleteMessage=async(req:Request,res:Response):Promise<void>=>{


}