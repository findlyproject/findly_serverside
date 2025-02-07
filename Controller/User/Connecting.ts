import { Request, Response } from "express"
import mongoose from "mongoose";
import User from "../../Model/UserSchema";
import { IUser } from "../../types/allTypes";


const userconnections = async (req: Request, res: Response): Promise<void> => {
     const _id = req.user?.id;
     if (!_id) {
          res.status(400).json({ status: false, message: "User ID is missing" });
          return
     }

     const finduser = await User.findOne({ _id });

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
     const connectionobjectid = new mongoose.Types.ObjectId(connectionid);
     const userid = new mongoose.Types.ObjectId(_id);

     if (finduser && findconnectionuser) {
          const isDuplicateForUser = finduser.connecting.some(
               (conn) => conn.connectionID?.equals(connectionobjectid)
          );

          const isDuplicateForConnectionUser = findconnectionuser.connecting.some(
               (conn) => conn.connectionID?.equals(userid)
          );

          if (isDuplicateForUser && isDuplicateForConnectionUser) {
               res.status(404).json({ status: false, message: "this connection already in " })
               return
          }

          if (!isDuplicateForUser && !isDuplicateForConnectionUser) {

               await finduser.connecting.push({
                    connectionID: connectionobjectid,
                    status: false
               });
               finduser.save()
               await findconnectionuser.connecting.push({
                    connectionID: userid,
                    status: false
               });
               findconnectionuser.save()
          }    


          res.status(200).json({ status: true, message: "connecting successful", finduser, findconnectionuser })
          return
     }

     res.status(200).json({ status: true, message: "connecting successful", finduser, findconnectionuser })
}

//////////////////////// ACCEPT CONNECTION REQUEST ////////////////////////////

const acceptconnectionrequest = async (req: Request, res: Response): Promise<void> => {
     const _id = req.user?.id;
     if (!_id) {
          res.status(404).json({ status: false, message: "User ID is missing" });
          return
     }
     
     const connectedID = req.params.id;
     if (!connectedID) {
          res.status(404).json({ status: false, message: "ConnectedID is missing" });
          return
     }
     
     const finduser = await User.findOne({ _id });
     if (!finduser) {
          res.status(404).json({ status: false, message: "User not found" });
          return
     }
     
     const findConnectedUser = await User.findOne({ _id: connectedID });
     if (!findConnectedUser) {
          res.status(404).json({ status: false, message: "Connected user not found" });
          return
     }
     
     const userobjectid = new mongoose.Types.ObjectId(_id);
     const connectedIDobject = new mongoose.Types.ObjectId(connectedID);
     
     const finduserconnection = finduser.connecting.filter(item => item.connectionID.equals(connectedIDobject) && !item.status);
     const filteredconnections = findConnectedUser.connecting.filter(item => item.connectionID.equals(userobjectid) && !item.status);
     
     finduserconnection.forEach(item => item.status = true);
     filteredconnections.forEach(item => item.status = true);
     
     await finduser.save();
     await findConnectedUser.save();
     
     res.status(200).json({ status: true, message: "Connection updated successfully",finduserconnection });
     
     
}

//////////////////////////////// GET CONNECTION /////////////////////

const getconnection = async (req: Request, res: Response): Promise<void> => {
     const _id = req.user?.id;

     if (!_id) {
          res.status(400).json({ status: false, message: "User ID is missing" });
          return
     }

     const foundUser: IUser | null = await User.findOne({ _id })
     .populate({
          path: 'connecting.connectionID', 
          select: 'firstName lastName email profileImage jobTitle'  
        });

     if (!foundUser) {
          res.status(404).json({ status: false, message: "User not found" });
          return
     }

     const userConnections = foundUser.connecting;

     res.status(200).json({
          status: true,
          message: "User connections retrieved successfully",
          connections: userConnections,
     });

}

////////////// CONNECTION REMOVING /////////////

const removeConnection = async (req: Request, res: Response): Promise<void> => {
     const _id = req.user?.id;
const connectionId = req.params.id;

if (!mongoose.Types.ObjectId.isValid(connectionId)) {
     res.status(400).json({ status: false, message: "Invalid connection ID" });
     return
}

const user = await User.findById(_id);
if (!user) {
     res.status(404).json({ status: false, message: "User not found" });
     return
}

const findConnectedUser = await User.findOne({ _id: connectionId });
if (!findConnectedUser) {
     res.status(404).json({ status: false, message: "Connected user not found" });
     return
}

const userobjectid = new mongoose.Types.ObjectId(_id);
const connectedIDobject = new mongoose.Types.ObjectId(connectionId);

const finduserconnection = user.connecting.find(item => item.connectionID.equals(connectedIDobject));
console.log("finduserconnection",finduserconnection);


if (!finduserconnection) {
     res.status(400).json({ status: false, message: "User connection not found" });
     return
}

const filteredconnections = findConnectedUser.connecting.filter(item => item.connectionID.equals(userobjectid));
console.log("filteredconnections",filteredconnections);

if (!filteredconnections) {
     res.status(400).json({ status: false, message: "Connected user connection not found" });
     return
}

user.connecting = user.connecting.filter(item => !item.connectionID.equals(connectedIDobject)) as [{ connectionID: mongoose.Types.ObjectId; status: boolean }];
findConnectedUser.connecting = findConnectedUser.connecting.filter(item => !item.connectionID.equals(userobjectid)) as [{ connectionID: mongoose.Types.ObjectId; status: boolean }];

await user.save();
await findConnectedUser.save();

 res.status(200).json({ status: true, message: "Connection removed successfully", user });
 return

};



export {
     userconnections,
     acceptconnectionrequest,
     getconnection,
     removeConnection
}  