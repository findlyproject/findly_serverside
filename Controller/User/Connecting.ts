import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../Model/UserSchema";
import { IUser } from "../../types/allTypes";

const userconnections = async (req: Request, res: Response): Promise<void> => {
  const _id = req.user?.id;
  const connectionId = req.params.id;

  if (!_id) {
    res.status(400).json({ status: false, message: "User ID is missing" });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(connectionId)) {
    res
      .status(400)
      .json({ status: false, message: "Invalid connection ID format" });
    return;
  }

  const currentUser = await User.findById(_id);
  if (!currentUser) {
    res.status(404).json({ status: false, message: "Current user not found" });
    return;
  }

  const targetUser = await User.findById(connectionId);
  if (!targetUser) {
    res.status(404).json({ status: false, message: "Target user not found" });
    return;
  }

  const isDuplicate = targetUser.connecting.some(
    (conn) => conn.connectionID?.toString() === _id
  );

  if (isDuplicate) {
    res
      .status(400)
      .json({ status: false, message: "Connection request already sent" });
    return;
  }

  targetUser.connecting.push({
    connectionID: new mongoose.Types.ObjectId(_id),
    status: false,
    createdAt: new Date(),
  });

  await targetUser.save();

  res.status(200).json({
    status: true,
    message: "Connection request sent successfully",
    targetUser,
  });
};

const acceptconnectionrequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const _id = req.user?.id;
  const connectionId = req.params.id;

  if (!_id) {
    res.status(400).json({ status: false, message: "User ID is missing" });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(connectionId)) {
    res
      .status(400)
      .json({ status: false, message: "Invalid connection ID format" });
    return;
  }

  const targetUser = await User.findById(_id);
  if (!targetUser) {
    res.status(404).json({ status: false, message: "Target user not found" });
    return;
  }

  const requestingUser = await User.findById(connectionId);
  if (!requestingUser) {
    res
      .status(404)
      .json({ status: false, message: "Requesting user not found" });
    return;
  }

  const connectionIndex = targetUser.connecting.findIndex(
    (conn) => conn.connectionID?.toString() === connectionId
  );

  if (connectionIndex === -1) {
    res
      .status(400)
      .json({ status: false, message: "No pending connection request found" });
    return;
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

//////////////////////////////// GET CONNECTION /////////////////////

const getconnection = async (req: Request, res: Response): Promise<void> => {
  const _id = req.user?.id;

  if (!_id) {
    res.status(400).json({ status: false, message: "User ID is missing" });
    return;
  }

  const foundUser: IUser | null = await User.findOne({ _id }).populate({
    path: "connecting.connectionID",
    select: "firstName lastName email profileImage jobTitle connecting",
  });

  if (!foundUser) {
    res.status(404).json({ status: false, message: "User not found" });
    return;
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

const removeConnection = async (req: Request, res: Response): Promise<void> => {
  const _id = req.user?.id;
  const connectionId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(connectionId)) {
    res.status(400).json({ status: false, message: "Invalid connection ID" });
    return;
  }

  const user = await User.findById(_id);
  if (!user) {
    res.status(404).json({ status: false, message: "User not found" });
    return;
  }

  const findConnectedUser = await User.findOne({ _id: connectionId });
  if (!findConnectedUser) {
    res
      .status(404)
      .json({ status: false, message: "Connected user not found" });
    return;
  }

  const userobjectid = new mongoose.Types.ObjectId(_id);
  const connectedIDobject = new mongoose.Types.ObjectId(connectionId);

  const finduserconnection = user.connecting.find((item) =>
    item.connectionID.equals(connectedIDobject)
  );
  console.log("finduserconnection", finduserconnection);

  if (!finduserconnection) {
    res
      .status(400)
      .json({ status: false, message: "User connection not found" });
    return;
  }

  const filteredconnections = findConnectedUser.connecting.filter((item) =>
    item.connectionID.equals(userobjectid)
  );
  console.log("filteredconnections", filteredconnections);

  if (!filteredconnections) {
    res
      .status(400)
      .json({ status: false, message: "Connected user connection not found" });
    return;
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

const GetConnectionRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;

  const user = await User.findById(userId)
    .select("connecting")
    .populate("connecting.connectionID");

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
    return;
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

const ignoreConnectionRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const _id = req.user?.id;
  const connectionId = req.params.id;

  if (!_id) {
    res.status(400).json({ status: false, message: "User ID is missing" });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(connectionId)) {
    res
      .status(400)
      .json({ status: false, message: "Invalid connection ID format" });
    return;
  }

  const currentUser = await User.findById(_id);
  if (!currentUser) {
    res.status(404).json({ status: false, message: "Current user not found" });
    return;
  }

  const updatedConnections = currentUser.connecting.filter(
    (conn) => conn.connectionID?.toString() !== connectionId
  );
  console.log();

  if (updatedConnections.length === currentUser.connecting.length) {
    res
      .status(400)
      .json({ status: false, message: "Connection request not found" });
    return;
  }

  currentUser.connecting = updatedConnections;
  await currentUser.save();

  res
    .status(200)
    .json({ status: true, message: "Connection request ignored successfully" });
};

export {
  userconnections,
  acceptconnectionrequest,
  getconnection,
  removeConnection,
  GetConnectionRequest,
  ignoreConnectionRequest,
};
