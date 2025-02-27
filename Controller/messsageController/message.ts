import { Request, Response } from "express";
import User from "../../model/UserSchema";
import { Community, CommunityMessage, Conversation, Message } from "../../model/messageSchema";
import { CustomError } from "../../Utils/errorHandler";
import mongoose from "mongoose";
import { IMessage } from "../../types/allTypes";
import { promise } from "zod";



export const SendMessage = async (req: Request, res: Response): Promise<void> => {
  const io = req.app.get("io");
  
  const { senderId, receiverId } = req.params;
  const { message } = req.body;
console.log(message);

  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);

  if (!sender || !receiver) {
    res.status(404).json({ message: 'Sender or receiver not found' });
    return;
  }
io.on("newMessage",(data:string)=>{
  console.log("message",data);
  
})
  const newMessage = new Message({
    sender: senderId,
    receiver: receiverId,
    message
  });

  await newMessage.save();

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
        options: { sort: { createdAt: 1 } } 
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

export const CommunitySendMessage = async (req:Request,res:Response):Promise<void>=>{
  const io = res.app.get("io")
  const userId = req.user?.id;
  const communityId = req.params.id;
  const {message,type} = req.body;
console.log("object",message,type)
  const currentUser = await User.findOne({_id:userId});
  
  if(!currentUser){
    throw new CustomError("user not found",404)
  }
  const findCommunity = await Community.findOne({_id:communityId})


  if(!findCommunity){
    res.status(404).json({status:false,message:"community Id is not found"})
    return
  }
  if(!message){
    res.status(404).json({status:false,message:"message not found"})
    return
  }
  const newMessage = await new CommunityMessage({
    communityId,
    sender:userId,
    message,
    type,
  })
  const savecommunitymessage =await newMessage.save();
io.emit("sendedMessage",savecommunitymessage)
  res.status(200).json({status:true,message:"messsag send successfully",data:savecommunitymessage})

}

export const communitymesgById = async (req:Request,res:Response):Promise<void>=>{
const communityId = req.params.id;
const findCommunity = await Community.findOne({_id:communityId})
if(!findCommunity){
  res.status(404).json({status:false,message:"community is not found"})
  return 
}
const findCommunityMessaeg = await CommunityMessage.find({communityId,isDelete:false}).populate("sender","_id firstName lastName profileImage")
res.status(200).json({status:true,message:"get community by id",Message:findCommunityMessaeg})
}


export const deletecommunitymessage = async(req:Request,res:Response):Promise<void>=>{
  const io = res.app.get("io")
const messageId = req.params.id;
if(!messageId){
  res.status(404).json({status:false,message:"message id is not found"})
  return
}
const findMessage =await CommunityMessage.findOne({_id:messageId})
if(!findMessage){
  res.status(404).json({status:false,message:"message id wrong"})
  return
}
findMessage.isDelete = true;
findMessage.save()
const findecommunitymessage = await CommunityMessage.find({communityId:findMessage.communityId,isDelete:false})
console.log("findMessage",findecommunitymessage);
io.emit("undeletedMessages",findMessage)
res.status(200).json({ status:true, message:"delete successfully"})
}


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