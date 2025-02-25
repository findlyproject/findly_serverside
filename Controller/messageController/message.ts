import { Request, Response } from "express";
import User from "../../model/UserSchema";
import { Message } from "../../model/MessageSchema";
import { Conversation } from "../../model/ConversationSchema";
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
  
      res.status(200).json({ messages: conversation.messages });
    
  }