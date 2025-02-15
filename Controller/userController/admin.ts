import { Request, Response } from "express";
import User from "../../model/UserSchema";
import { CustomError } from "../../Utils/errorHandler";

//user block and unblock
export const blockAndUnblock = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.id;
  if (!userId) {
    throw new CustomError("User ID for blocking is missing", 404);
  }

  const findUser = await User.findOne({ _id: userId });

  if (!findUser) {
    throw new CustomError("User to be blocked not found", 404);
  }

  findUser.isBlocked = !findUser.isBlocked;
  await findUser.save();

  res
    .status(200)
    .json({
      status: true,
      message: `User ${
        findUser.isBlocked ? "blocked" : "unblocked"
      } successfully`,
      data: findUser,
    });
};

// get all Users
export const allUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await User.find();
  const totalUsers = await User.countDocuments();
  if (!users) {
    throw new CustomError("users not found", 404);
  }
  res
    .status(200)
    .json({
      status: "success",
      massage: "Got all the users and the count",
      users,
      totalUsers,
    });
};
