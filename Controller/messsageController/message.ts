import { Request, Response } from "express";
import User from "../../model/UserSchema";
import { Community, CommunityMessage, Conversation, Message } from "../../model/messageSchema";
import { CustomError } from "../../Utils/errorHandler";
import mongoose from "mongoose";
import { IMessage } from "../../types/allTypes";
import { promise } from "zod";
import { Company } from "../../model/CompanySchema";



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
        throw new CustomError('current company not found',404)
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
   
    members:[{
      memberId:userId,
      memberModel:'Company'
    }]
   })
await community.save()

   res.status(201).json({status:true,message:"community created",community})
}


export const AllCommunities=async(req:Request,res:Response):Promise<void>=>{
    const communities=await Community.find({isDeleted:false}).populate({path:'members.memberId',select:'_id firstName lastName profileImage logo name'})

    if(!communities){
        throw new  CustomError("all communities not found",404)
    }
res.status(200).json({status:true,message:'communities',communities})
}



export const joinCommunity =async(req:Request,res:Response):Promise<void>=>{
   const io = res.app.get("io")
   const communityId=req.params.id
  const userId=req.user?.id
    const community = await Community.findById(communityId).populate('members');
    if (!community) {
      res.status(404).json({status:false, message: 'Community not found' });
      return;
    }

    const isMember = community.members.some(
      (member) => member.memberId.toString() === userId
    );
    if (isMember) {
      res.status(400).json({status:false, message: 'User is already a member' });
      return;
    }

    community.members.push({ memberId: new mongoose.Types.ObjectId(userId), memberModel: "User" });

    await community.save();
    const savedCommunity = await Community.findById(communityId).populate('members');
    console.log("response join",savedCommunity);

    io.emit("communtjoin",savedCommunity)
    
    res.status(200).json({status:true, message: 'User joined the community successfully',savedCommunity});
}

export const CommunitySendMessage = async (req:Request,res:Response):Promise<void>=>{
  const io = res.app.get("io")
  const userId = req.user?.id;
  const communityId = req.params.id;
  const {message,type} = req.body;
console.log("object",message,type)
const [user, company] = await Promise.all([
  User.findOne({ _id: userId }),
  Company.findOne({ _id: userId })
]);

const currentUser = user || company;
const senderModel = user ? "User" : "Company";
  console.log("currentUser....",currentUser);
  
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
    sender:currentUser?._id,
    senderModel,
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
const findCommunityMessaeg = await CommunityMessage.find({communityId,isDelete:false})
.populate({path:"sender",select:"_id firstName profileImage logo name"})
// .populate({ path: "sender", select: "_id logo name" })
console.log("findCommunityMessaeg",findCommunityMessaeg);

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

//leave community
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
  export const CommunityDetails = async (req: Request, res: Response): Promise<void> => {
    const communityID = req.params.id;
  
    // Find the community
    let community = await Community.findById(communityID)
      .populate({
        path: "createdBy",
        select: "_id name logo",
      })
      .lean(); // Convert Mongoose document to plain object
  
    if (!community) {
      throw new CustomError(`Community not found`, 404);
    }
  
    // Manually populate members based on model type
    if (community.members && community.members.length > 0) {
      community.members = await Promise.all(
        community.members.map(async (member: any) => {
          if (member.memberModel === "User") {
            member.memberId = await User.findById(member.memberId).select("profileImage firstName lastName _id name logo");
          } else if (member.memberModel === "Company") {
            member.memberId = await Company.findById(member.memberId).select("_id name logo");
          }
          return member;
        })
      );
    }
  
    console.log("community..............", community);
    res.status(200).json({ status: true, message: "Community details", community });
  };
  
  //UpdateCommunity
  
  export const  UpdateDescriptionCommunity=async(req:Request,res:Response):Promise<void>=>{
    const communityid=req.params.id
    const{description}=req.body
   
    
    const creatorID=req.user?.id
    if(!description){
      throw new CustomError(' description is required',400)
  }
    const community=await Community.findById(communityid)
    if(!community){
      throw new CustomError('community not found',404)
    }

  
  if(community.createdBy.toString()!==creatorID){
    throw new CustomError("Unauthorized! Only the  admin can update this community.", 400)
  }
 

   community.description=description
 
   await community.save()
   res.status(200).json({status:true,message:'updated successfully',community})

  
  
  }



  export const  UpdateNameCommunity=async(req:Request,res:Response):Promise<void>=>{
    const communityid=req.params.id
    const{name}=req.body
   
    
    const creatorID=req.user?.id
    if(!name){
      throw new CustomError(' name is required',400)
  }
    const community=await Community.findById(communityid)
    if(!community){
      throw new CustomError('community not found',404)
    }

  
  if(community.createdBy.toString()!==creatorID){
    throw new CustomError("Unauthorized! Only the  admin can update this community.", 400)
  }
 
   community.name=name
   
  
   await community.save()
   res.status(200).json({status:true,message:'updated successfully',community})

  
  
  }
  export const ProfileOfCommunity=async(req:Request,res:Response):Promise<void>=>{

    const communityid=req.params.id
    
   
    
    const creatorID=req.user?.id
  
    const community=await Community.findById(communityid)
    if(!community){
      throw new CustomError('community not found',404)
    }

  
  if(community.createdBy.toString()!==creatorID){
    throw new CustomError("Unauthorized! Only the  admin can update this community.", 400)
  }
 
   if(req.file){
    community.profile=req.file?.path
   }
   console.log("req.file",req.file);
   
  
   await community.save()
   res.status(200).json({status:true,message:'updated successfully',community})
  
  }
  
  
  
  //admin can Delete Community
  
  export const  DeleteCommunity=async(req:Request,res:Response):Promise<void>=>{
  
  const communityid=req.params.id
  const community=await Community.findById(communityid)
  const creatorID=req.user?.id
  
  if(!community){
    throw new CustomError(`community not found`,404)
  }

  if(community.createdBy.toString() !==creatorID){
    throw new CustomError("Unauthorized! Only the  admin can delete this community.", 400)
  }

  community.isDeleted=true
  await community.save()

  res.status(200).json({status:true,message:'community deleted',community})
  }
    
  
  //search community
  
  export const  SearchCommunity=async(req:Request,res:Response):Promise<void>=>{
    console.log("dfghjsdfgh");
    
  const {query}=req.query
  console.log("query",query);
  
  if(!query){
    throw new CustomError(`query is required`,400)
  }


  const community=await Community.find({name:{ $regex: query, $options: "i" }}).populate('members');

  if(!community){
    throw new CustomError(`community not found`,404)  
  }
  
  res.status(200).json({status:true,message:'success',community})
  }