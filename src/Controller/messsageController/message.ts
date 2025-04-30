import { Request, Response } from "express";
import User from "../../model/UserSchema";
import { Community, CommunityMessage, Conversation, Message,} from "../../model/MessageSchema";
import { CustomError } from "../../Utils/errorHandler";
import mongoose from "mongoose";
import { IMessage } from "../../types/allTypes";
import { Company } from "../../model/CompanySchema";

//community
export const createCommunity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;


  const { name, description, profile } = req.body;

  if (!userId) {
    throw new CustomError("current company not found", 404);
  }
  if (!name || !description) {
    throw new CustomError("name and description is required", 400);
  }
  const existingCommunity = await Community.findOne({ name });
  if (existingCommunity) {
    throw new CustomError("community already exists", 400);
  }

  const community = new Community({
    name,
    description,
    createdBy: userId,

    profile,

    members: [
      {
        memberId: userId,
        memberModel: "Company",
      },
    ],
  });
  await community.save();

  res
    .status(201)
    .json({ status: true, message: "community created", community });
};

export const AllCommunities = async (
  req: Request,
  res: Response
): Promise<void> => {
  const communities = await Community.find({ isDeleted: false }).populate({
    path: "members.memberId",
    select: "_id firstName lastName profileImage logo name",
  });

  if (!communities) {
    throw new CustomError("all communities not found", 404);
  }
  res.status(200).json({ status: true, message: "communities", communities });
};

export const joinCommunity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const io = res.app.get("io");
  const communityId = req.params.id;
  const userId = req.user?.id;
  const community = await Community.findById(communityId).populate("members");
  if (!community) {
    res.status(404).json({ status: false, message: "Community not found" });
    return;
  }

  const isMember = community.members.some(
    (member) => member.memberId.toString() === userId
  );
  if (isMember) {
    res
      .status(400)
      .json({ status: false, message: "User is already a member" });
    return;
  }

  community.members.push({
    memberId: new mongoose.Types.ObjectId(userId),
    memberModel: "User",
  });

  await community.save();
  const savedCommunity = await Community.findById(communityId).populate(
    "members"
  );
  console.log("response join", savedCommunity);

  io.emit("communtjoin", savedCommunity);

  res
    .status(200)
    .json({
      status: true,
      message: "User joined the community successfully",
      savedCommunity,
    });
};

export const CommunitySendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const io = res.app.get("io");
  const userId = req.user?.id;
  const communityId = req.params.id;
  const { message, type } = req.body;
  const [user, company] = await Promise.all([
    User.findOne({ _id: userId }),
    Company.findOne({ _id: userId }),
  ]);

  const currentUser = user || company;
  const senderModel = user ? "User" : "Company";

  if (!currentUser) {
    throw new CustomError("user not found", 404);
  }
  const findCommunity = await Community.findOne({ _id: communityId });

  if (!findCommunity) {
    res
      .status(404)
      .json({ status: false, message: "community Id is not found" });
    return;
  }
  if (!message) {
    res.status(404).json({ status: false, message: "message not found" });
    return;
  }
  const newMessage = await new CommunityMessage({
    communityId,
    sender: currentUser?._id,
    senderModel,
    message,
    type,
  });
  const savecommunitymessage = await newMessage.save();
  io.emit("sendedMessage", savecommunitymessage);
  res
    .status(200)
    .json({
      status: true,
      message: "messsag send successfully",
      data: savecommunitymessage,
    });
};

export const communitymesgById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const communityId = req.params.id;
  const findCommunity = await Community.findOne({ _id: communityId });
  if (!findCommunity) {
    res.status(404).json({ status: false, message: "community is not found" });
    return;
  }
  const findCommunityMessaeg = await CommunityMessage.find({
    communityId,
    isDelete: false,
  }).populate({
    path: "sender",
    select: "_id firstName profileImage logo name",
  });

  res
    .status(200)
    .json({
      status: true,
      message: "get community by id",
      Message: findCommunityMessaeg,
    });
};

export const deletecommunitymessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const io = res.app.get("io");
  const messageId = req.params.id;
  if (!messageId) {
    res.status(404).json({ status: false, message: "message id is not found" });
    return;
  }
  const findMessage = await CommunityMessage.findOne({ _id: messageId });
  if (!findMessage) {
    res.status(404).json({ status: false, message: "message id wrong" });
    return;
  }
  findMessage.isDelete = true;
  findMessage.save();
  const findecommunitymessage = await CommunityMessage.find({
    communityId: findMessage.communityId,
    isDelete: false,
  });
  io.emit("undeletedMessages", findMessage);
  res.status(200).json({ status: true, message: "delete successfully" });
};

//leave community
export const LeaveCommunity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const communityid = req.params.id;
  const userid = req.user?.id;

  const community = await Community.findById(communityid);
  if (!community) {
    throw new CustomError(`community not found`, 404);
  }
  const isMember = community.members.some(
    (member) => member.toString() === userid
  );
  if (!isMember) {
    throw new CustomError("user is not a member", 400);
  }
  community.members = community.members.filter(
    (item) => item.toString() !== userid
  );
  await community.save();

  res.status(200).json({ status: true, message: "leave community", community });
};

//Community Details
export const CommunityDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const communityID = req.params.id;

 
  let community = await Community.findById(communityID)
    .populate({
      path: "createdBy",
      select: "_id name logo",
    })
    .lean(); 

  if (!community) {
    throw new CustomError(`Community not found`, 404);
  }

  
  if (community.members && community.members.length > 0) {
    community.members = await Promise.all(
      community.members.map(async (member: any) => {
        if (member.memberModel === "User") {
          member.memberId = await User.findById(member.memberId).select(
            "profileImage firstName lastName _id name logo"
          );
        } else if (member.memberModel === "Company") {
          member.memberId = await Company.findById(member.memberId).select(
            "_id name logo"
          );
        }
        return member;
      })
    );
  }

 
  res
    .status(200)
    .json({ status: true, message: "Community details", community });
};

//UpdateCommunity

export const UpdateDescriptionCommunity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const communityid = req.params.id;
  const { description } = req.body;

  const creatorID = req.user?.id;
  if (!description) {
    throw new CustomError(" description is required", 400);
  }
  const community = await Community.findById(communityid);
  if (!community) {
    throw new CustomError("community not found", 404);
  }

  if (community.createdBy.toString() !== creatorID) {
    throw new CustomError(
      "Unauthorized! Only the  admin can update this community.",
      400
    );
  }

  community.description = description;

  await community.save();
  res
    .status(200)
    .json({ status: true, message: "updated successfully", community });
};

export const UpdateNameCommunity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const communityid = req.params.id;
  const { name } = req.body;

  const creatorID = req.user?.id;
  if (!name) {
    throw new CustomError(" name is required", 400);
  }
  const community = await Community.findById(communityid);
  if (!community) {
    throw new CustomError("community not found", 404);
  }

  if (community.createdBy.toString() !== creatorID) {
    throw new CustomError(
      "Unauthorized! Only the  admin can update this community.",
      400
    );
  }

  community.name = name;

  await community.save();
  res
    .status(200)
    .json({ status: true, message: "updated successfully", community });
};
export const ProfileOfCommunity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const communityid = req.params.id;

  const creatorID = req.user?.id;

  const community = await Community.findById(communityid);
  if (!community) {
    throw new CustomError("community not found", 404);
  }

  if (community.createdBy.toString() !== creatorID) {
    throw new CustomError(
      "Unauthorized! Only the  admin can update this community.",
      400
    );
  }

  if (req.file) {
    community.profile = req.file?.path;
  }
 

  await community.save();
  res
    .status(200)
    .json({ status: true, message: "updated successfully", community });
};

//admin can Delete Community

export const DeleteCommunity = async (
  req: Request,
  res: Response
): Promise<void> => {
  const communityid = req.params.id;
  const community = await Community.findById(communityid);
  const creatorID = req.user?.id;

  if (!community) {
    throw new CustomError(`community not found`, 404);
  }

  if (community.createdBy.toString() !== creatorID) {
    throw new CustomError(
      "Unauthorized! Only the  admin can delete this community.",
      400
    );
  }

  community.isDeleted = true;
  await community.save();

  res
    .status(200)
    .json({ status: true, message: "community deleted", community });
};

//search community

export const SearchCommunity = async (
  req: Request,
  res: Response
): Promise<void> => {

  const { query } = req.query;
 

  if (!query) {
    throw new CustomError(`query is required`, 400);
  }

  const community = await Community.find({
    name: { $regex: query, $options: "i" },
  }).populate("members");

  if (!community) {
    throw new CustomError(`community not found`, 404);
  }

  res.status(200).json({ status: true, message: "success", community });
};

//message
export const SendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const io = req.app.get("io");

  const { senderId, receiverId } = req.params;
  const { message } = req.body;
  console.log(message);

  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);

  if (!sender || !receiver) {
    res.status(404).json({ message: "Sender or receiver not found" });
    return;
  }
  io.on("newMessage", (data: string) => {
    console.log("message", data);
  });

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });
  console.log("conversation", conversation);
  if (conversation && conversation.isBlockedUsers.length > 0) {
    res
      .status(403)
      .json({
        message: "You cannot send messages in this conversation. Blocked.",
      });
    return;
  }
  const newMessage = new Message({
    sender: senderId,
    receiver: receiverId,
    seen: false,
    message,
  });

  await newMessage.save();
  if (!conversation) {
    conversation = new Conversation({
      participants: [senderId, receiverId],
      messages: [newMessage._id],
      lastUpdated: new Date(),
    });
  } else {
    conversation.messages.push(newMessage._id as IMessage);
    conversation.lastUpdated = new Date();
  }

  await conversation.save();

  io.emit("receiveMessage", {
    message: newMessage,
    from: senderId,
  });

  res.status(201).json({ message: "Message sent successfully", newMessage });
};

export const GetConversation = async (req: Request, res: Response) => {
  const activeUserId = req.user?.id;
  const { senderId, receiverId } = req.params;
  if (activeUserId !== senderId && activeUserId !== receiverId) {
    res.status(403).json({ message: "Unauthorized to view this conversation" });
    return;
  }
  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate({
    path: "messages",
    model: "Message",
    match: { isDeleted: false },
    options: { sort: { createdAt: 1 } },
  });

  if (!conversation) {
    res.status(404).json({ message: "No conversation found" });
    return;
  }

  const otherUserId = activeUserId === senderId ? receiverId : senderId;

  await Message.updateMany(
    {
      sender: otherUserId,
      receiver: activeUserId,
      seen: false,
    },
    { $set: { seen: true } }
  );

  res.status(200).json({ messages: conversation.messages });
};

export const Conversations = async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.params;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });
  if (!conversation) {
    throw new CustomError("conversation not found", 404);
  }
  res
    .status(200)
    .json({
      status: true,
      message: "conversation of active user",
      conversation,
    });
};

export const BlockOrUnblockUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { senderId, receiverId } = req.params;
  const { action } = req.body;
  if (!senderId || !receiverId) {
    res.status(400).json({ message: "Sender and Receiver IDs are required" });
    return;
  }

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    res
      .status(404)
      .json({ message: "No conversation found between these users." });
    return;
  }

  if (action === "block") {
    if (
      conversation.isBlockedUsers.includes(
        new mongoose.Types.ObjectId(senderId)
      )
    ) {
      res.status(400).json({ message: "User already blocked." });
      return;
    }

    conversation.isBlockedUsers.push(new mongoose.Types.ObjectId(senderId));
    await conversation.save();

    res.status(200).json({ message: `You have blocked user ${receiverId}.` });
  } else if (action === "unblock") {
    if (
      !conversation.isBlockedUsers.includes(
        new mongoose.Types.ObjectId(senderId)
      )
    ) {
      res.status(400).json({ message: "User is not blocked." });
      return;
    }

    conversation.isBlockedUsers = conversation.isBlockedUsers.filter(
      (userId) => userId.toString() !== senderId
    );
    await conversation.save();

    res.status(200).json({ message: `You have unblocked user ${receiverId}.` });
  } else {
    res
      .status(400)
      .json({ message: "Invalid action. Use 'block' or 'unblock'." });
  }
};

export const GetChatList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const activeUserId = req.user?.id;

    if (!activeUserId) {
      res.status(400).json({ message: "Active user ID is required." });
      return;
    }

    const conversations = await Conversation.find({
      participants: activeUserId,
    });

    if (!conversations.length) {
      res.status(200).json({ message: "No chats found.", chats: [] });
      return;
    }

    const userIdsSet = new Set<string>();

    conversations.forEach((conv) => {
      conv.participants.forEach((participant: any) => {
        if (participant.toString() !== activeUserId) {
          userIdsSet.add(participant.toString());
        }
      });
    });

    const userIds = Array.from(userIdsSet);

    const users = await User.find({ _id: { $in: userIds } }).select(
      "_id profileImage firstName lastName"
    );

    const chatListWithDetails = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: activeUserId, receiver: user._id },
            { sender: user._id, receiver: activeUserId },
          ],
          isDeleted: false,
        })
          .sort({ timestamp: -1 })
          .limit(1)
          .lean();

        const unreadCount = await Message.countDocuments({
          sender: user._id,
          receiver: activeUserId,
          seen: false,
          isDeleted: false,
        });

        return {
          user: {
            _id: user._id,
            profileImage: user.profileImage,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          lastMessage: {
            message: lastMessage ? lastMessage.message : null,
            timestamp: lastMessage ? lastMessage.timestamp : null,
            sender: lastMessage ? lastMessage.sender : null,
            receiver: lastMessage ? lastMessage.receiver : null,
            seen: lastMessage ? lastMessage.seen : null,
          },
          unreadCount,
        };
      })
    );

    res.status(200).json({
      message: "Chat list fetched successfully.",
      chats: chatListWithDetails,
    });
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const StarOrRemoveStar = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { senderId, receiverId } = req.params;
  const { action } = req.body;
  if (!senderId || !receiverId) {
    res.status(400).json({ message: "Sender and Receiver IDs are required" });
    return;
  }

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    res
      .status(404)
      .json({ message: "No conversation found between these users." });
    return;
  }

  if (action === "star") {
    if (
      conversation.isStarredUsers.includes(
        new mongoose.Types.ObjectId(receiverId)
      )
    ) {
      res.status(400).json({ message: "User already starred." });
      return;
    }

    conversation.isStarredUsers.push(new mongoose.Types.ObjectId(receiverId));
    await conversation.save();

    res.status(200).json({ message: `You have starred user ${receiverId}.` });
  } else if (action === "removestar") {
    if (
      !conversation.isStarredUsers.includes(
        new mongoose.Types.ObjectId(receiverId)
      )
    ) {
      res.status(400).json({ message: "User is not stared." });
      return;
    }

    conversation.isStarredUsers = conversation.isStarredUsers.filter(
      (userId) => userId.toString() !== receiverId
    );
    await conversation.save();

    res
      .status(200)
      .json({ message: `You have remove star user ${receiverId}.` });
  } else {
    res
      .status(400)
      .json({ message: "Invalid action. Use 'star' or 'remove star'." });
  }
};

export const getStarredUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const senderId = req.user?.id;

    if (!senderId) {
      res.status(400).json({ message: "Sender ID is required." });
      return;
    }

    const conversations = await Conversation.find({
      participants: { $in: [senderId] },
    }).populate("isStarredUsers", "firstName  profileImage jobTitle");
    console.log("conversationsconversations", conversations);

    if (!conversations || conversations.length === 0) {
      res
        .status(404)
        .json({ message: "No conversations found for this user." });
      return;
    }

    const starredUsers = conversations
      .map((conversation) => conversation.isStarredUsers)
      .flat();

    res.status(200).json({
      message: "Starred users fetched successfully.",
      starredUsers,
    });
  } catch (error) {
    console.error("Error fetching starred users:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const ClearChat = async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.params;
  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });
  if (!conversation) {
    throw new CustomError("conversation not found ", 404);
  }
  if (conversation.messages.length > 0) {
    await Message.updateMany(
      { _id: { $in: conversation.messages } },
      { $set: { isDeleted: true } }
    );
  }
  conversation.messages = [];
  await conversation.save();

  res
    .status(200)
    .json({
      status: true,
      message: "message cleared successfully",
      conversation,
    });
};

export const DeleteConversation = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId } = req.params;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      throw new CustomError("Conversation not found", 404);
    }

    await Message.deleteMany({ _id: { $in: conversation.messages } });

    await Conversation.deleteOne({ _id: conversation._id });

    res.status(200).json({ status: true, message: "Conversation deleted" });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};
