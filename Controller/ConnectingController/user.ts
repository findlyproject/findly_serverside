import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../model/UserSchema";
import { IUser } from "../../types/allTypes";
import { CustomError } from "../../Utils/errorHandler";
import { Company } from "../../model/CompanySchema";

//CONNECTION REQUEST
export const userconnections = async (
  req: Request,
  res: Response
): Promise<void> => {
  const _id = req.user?.id;

  const connectionId = req.params.id;

  if (!_id) {
    throw new CustomError("User ID is missing", 404);
  }
  if (!connectionId) {
    throw new CustomError("Invalid connection ID format", 404);
  }

  const currentUser = await User.findById(_id);
  if (!currentUser) {
    throw new CustomError("Current user not found", 404);
  }

  const targetUser = await User.findById(connectionId);
  if (!targetUser) {
    throw new CustomError("Target user not found", 404);
  }

  const isDuplicate = targetUser.connecting.some(
    (conn) => conn.connectionID?.toString() === _id
  );

  if (isDuplicate) {
    throw new CustomError("Connection request already sent", 404);
  }

  targetUser.connecting.push({
    connectionID: new mongoose.Types.ObjectId(_id),
    status: false,
    createdAt: new Date(),
  });

  await targetUser.save();

  const populatedTargetUser = await User.findById(connectionId).populate(
    "connecting.connectionID",
    "name email profilePic"
  );

  res.status(200).json({
    status: true,
    message: "Connection request sent successfully",
    targetUser: populatedTargetUser,
  });
};

//REQUEST ACCEPT
export const acceptconnectionrequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const _id = req.user?.id;
  const connectionId = req.params.id;

  if (!_id) {
    throw new CustomError("User ID is missing", 404);
  }

  if (!connectionId) {
    throw new CustomError("Invalid connection ID format", 404);
  }

  const targetUser = await User.findById(_id);
  if (!targetUser) {
    throw new CustomError("Target user not found", 404);
  }

  const requestingUser = await User.findById(connectionId);
  if (!requestingUser) {
    throw new CustomError("Requesting user not found", 404);
  }

  const connectionIndex = targetUser.connecting.findIndex(
    (conn) => conn.connectionID?.toString() === connectionId
  );

  if (connectionIndex === -1) {
    throw new CustomError("No pending connection request found", 404);
  }

  targetUser.connecting[connectionIndex].status = true;

  requestingUser.connecting.push({
    connectionID: new mongoose.Types.ObjectId(_id),
    status: true,
    createdAt: new Date(),
  });

  await targetUser.save();
  await requestingUser.save();

  res.status(200).json({
    status: true,
    message: "Connection request accepted successfully",
    targetUser,
    requestingUser,
  });
};

//////////////////////////////// GET CONNECTION OF CURRENT USER /////////////////////

export const getconnection = async (
  req: Request,
  res: Response
): Promise<void> => {
  const _id = req.user?.id;

  if (!_id) {
    throw new CustomError("User ID is missing", 404);
  }

  const foundUser: IUser | null = await User.findOne({ _id }).populate({
    path: "connecting.connectionID",
    select: "firstName lastName email profileImage jobTitle connecting",
  });

  if (!foundUser) {
    throw new CustomError("User not found", 404);
  }

  const userConnections = foundUser.connecting.filter(
    (conn) => conn.status === true
  );

  res.status(200).json({
    status: true,
    message: "User connections retrieved successfully",
    connections: userConnections,
  });
};

////////////// CONNECTION REMOVING /////////////

export const removeConnection = async (
  req: Request,
  res: Response
): Promise<void> => {
  const _id = req.user?.id;
  const connectionId = req.params.id;

  if (!connectionId) {
    throw new CustomError("Invalid connection ID format", 404);
  }

  const user = await User.findById(_id);
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const findConnectedUser = await User.findOne({ _id: connectionId });
  if (!findConnectedUser) {
    throw new CustomError("Connected user not found", 404);
  }

  const userobjectid = new mongoose.Types.ObjectId(_id);
  const connectedIDobject = new mongoose.Types.ObjectId(connectionId);

  const finduserconnection = user.connecting.find((item) =>
    item.connectionID.equals(connectedIDobject)
  );

  if (!finduserconnection) {
    throw new CustomError("User connection not found", 404);
  }

  const filteredconnections = findConnectedUser.connecting.filter((item) =>
    item.connectionID.equals(userobjectid)
  );

  if (!filteredconnections) {
    throw new CustomError("Connected user connection not found", 404);
  }

  user.connecting = user.connecting.filter(
    (item) => !item.connectionID.equals(connectedIDobject)
  ) as [
    { connectionID: mongoose.Types.ObjectId; status: boolean; createdAt: Date }
  ];
  findConnectedUser.connecting = findConnectedUser.connecting.filter(
    (item) => !item.connectionID.equals(userobjectid)
  ) as [
    { connectionID: mongoose.Types.ObjectId; status: boolean; createdAt: Date }
  ];

  await user.save();
  await findConnectedUser.save();

  res
    .status(200)
    .json({ status: true, message: "Connection removed successfully", user });
  return;
};

//ALL CONNECTION REQUEST OF A USER
export const GetConnectionRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;

  const user = await User.findById(userId)
    .select("connecting")
    .populate("connecting.connectionID");

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const pendingRequests = user.connecting.filter(
    (conn) => conn.status === false
  );

  res.status(200).json({
    success: true,
    message: "Pending connection requests fetched successfully",
    requests: pendingRequests,
  });
};

//IGNORE CONNECTION REQUEST

export const ignoreConnectionRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const _id = req.user?.id;
  const connectionId = req.params.id;

  if (!_id) {
    throw new CustomError("User ID is missing", 404);
  }

  if (!connectionId) {
    throw new CustomError("Invalid connection ID format", 404);
  }

  const currentUser = await User.findById(_id);
  if (!currentUser) {
    throw new CustomError("Current user not found", 404);
  }

  const updatedConnections = currentUser.connecting.filter(
    (conn) => conn.connectionID?.toString() !== connectionId
  );

  if (updatedConnections.length === currentUser.connecting.length) {
    throw new CustomError("Connection request not found", 404);
  }

  currentUser.connecting = updatedConnections;
  await currentUser.save();

  res
    .status(200)
    .json({ status: true, message: "Connection request ignored successfully" });
};




export const FollowAndUnfollowCompany=async(req:Request,res:Response):Promise<void>=>{

  const userId = req.user?.id; // Assumes authentication middleware is setting user ID
  const companyId = req.params.id;


  const company = await Company.findById(companyId);
  if (!company) {
    res.status(404).json({ message: "Company not found" });
    return;
  }

  
  const user = await User.findById(userId);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  
  const isFollowing = user.following.some((id) => id.toString() === companyId);

  if (isFollowing) {
   
    user.following = user.following.filter((id) => id.toString() !== companyId);
    company.followers = company.followers.filter((id) => id.toString() !== userId);
    await user.save();
    await company.save()
    res.status(200).json({ message: "Company unfollowed successfully", following: user.following });
  } else {
   
    user.following.push(new mongoose.Types.ObjectId(companyId));
    company.followers.push(new mongoose.Types.ObjectId(userId));
    await user.save();
    await company.save()
    res.status(200).json({ message: "Company followed successfully", following: user.following ,company});
  }
}