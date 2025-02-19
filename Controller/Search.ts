import { Request, Response } from "express";
import User from "../model/UserSchema";
import { CustomError } from "../Utils/errorHandler";

export const UserSearch = async (req: Request, res: Response): Promise<void> => {
  const { firstName } = req.query;

  if (!firstName) {
    throw new CustomError("Search term is required", 400);
  }

  const users = await User.find({
    firstName: { $regex: `^${firstName}`, $options: "i" },
  });

  res.status(200).json({ status: true, message: "search results", users });
};


