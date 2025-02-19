import User from "../../model/UserSchema";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { CustomError } from "../../Utils/errorHandler";

//Registration
export const RegistrationUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    email,
    password,
    firstName,
    lastName,
    education,
    location,
    jobTitles,
    jobLocations,
    gender
  } = req.body;

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    throw new CustomError("Invalid email format", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new CustomError("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    education: education || [],
    location,
    gender,
    jobTitle: jobTitles,
    jobLocation: jobLocations,
  });
  await user.save();

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.USER_SECRETKEY!,
    { expiresIn: "1d" }
  );
  const refreshToken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.USER_SECRETKEY!,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res
    .status(200)
    .json({ status: true, message: "Registration successful", user });
};

//login
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const logeduser = await User.findOne({ email });
  if (!logeduser) {
    throw new CustomError("email id is wrong", 404);
  }
  const verfyuser = await bcrypt.compare(password, logeduser.password);
  if (!verfyuser) {
    throw new CustomError("password is wrong", 404);
  }
  const currentDate = new Date();
  if (logeduser.role === "premium" && logeduser.subscriptionEndDate) {
    if (logeduser.subscriptionEndDate < currentDate) {
      logeduser.role = "user";
      logeduser.subscriptionStartDate = null;
      logeduser.subscriptionEndDate = null;
      await logeduser.save();
    }
  }
  if (verfyuser) {
    const token = jwt.sign(
      {
        id: logeduser._id,
        email: logeduser.email,
        isBlocked: logeduser.isBlocked,
      },
      process.env.USER_SECRETKEY!,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    const refreshToken = jwt.sign(
      { id: logeduser._id, email: logeduser.email },
      process.env.USER_SECRETKEY!,
      { expiresIn: "7d" }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  if (logeduser.role === "premium" && logeduser.subscriptionEndDate) {
    const subscriptionEndDate = logeduser.subscriptionEndDate
      ? new Date(logeduser.subscriptionEndDate)
      : null;

    if (subscriptionEndDate && !isNaN(subscriptionEndDate.getTime())) {
      const currentDate = new Date();

      const startOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0));

      const normalizedEndDate = startOfDay(subscriptionEndDate);
      const normalizedCurrentDate = startOfDay(currentDate);

      const differenceInTime =
        normalizedEndDate.getTime() - normalizedCurrentDate.getTime();

      const remainingValidityDays = Math.floor(
        differenceInTime / (1000 * 60 * 60 * 24)
      );

      if (remainingValidityDays > 0) {
        const payload = {
          userId: logeduser._id,
          email: logeduser.email,
          role: logeduser.role,
          remainingValidityDays,
        };

        const secretKey = process.env.USER_SECRETKEY!;

        const subscriptionToken = jwt.sign(payload, secretKey, {
          expiresIn: `${remainingValidityDays}d`,
        });

        res.cookie("subscriptionToken", subscriptionToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: remainingValidityDays * 24 * 60 * 60 * 1000,
        });
      } else {
        throw new CustomError(
          "Your premium membership has expired. Please renew to continue enjoying premium benefits.",
          403
        );
      }
    } else {
      console.error("Invalid subscription end date");
    }
  }

  res
    .status(200)
    .json({ status: true, message: "Login successful", logeduser });
};

//logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (userId) {
    const user = await User.findById(userId);

    if (user && user.role === "premium" && user.subscriptionEndDate) {
      const currentDate = new Date();

      if (user.subscriptionEndDate < currentDate) {
        user.role = "user";
        user.subscriptionStartDate = null;
        user.subscriptionEndDate = null;
        await user.save();
      }
    }
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.clearCookie("subscriptionToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.status(200).json({ status: true, message: "Logout successfully" });
};

//google auth login
export const googleauthlogin = async (req: Request, res: Response) => {
  const { email, name, image } = req.body;

  if (!name && !email) {
    throw new CustomError("name or email is missing", 404);
  }
  const finduser = await User.findOne({ email });

  if (finduser) {
    const token = jwt.sign(
      {
        id: finduser._id,
        email: finduser.email,
        isBlocked: finduser.isBlocked,
      },
      process.env.USER_SECRETKEY!,
      { expiresIn: "1d" }
    );

    const currentDate = new Date();
    if (finduser.role === "premium" && finduser.subscriptionEndDate) {
      if (finduser.subscriptionEndDate < currentDate) {
        finduser.role = "user";
        finduser.subscriptionStartDate = null;
        finduser.subscriptionEndDate = null;
        await finduser.save();
      }
    }

    if (finduser.role === "premium" && finduser.subscriptionEndDate) {
      const subscriptionEndDate = finduser.subscriptionEndDate
        ? new Date(finduser.subscriptionEndDate)
        : null;

      if (subscriptionEndDate && !isNaN(subscriptionEndDate.getTime())) {
        const currentDate = new Date();

        const startOfDay = (date: Date) => new Date(date.setHours(0, 0, 0, 0));

        const normalizedEndDate = startOfDay(subscriptionEndDate);
        const normalizedCurrentDate = startOfDay(currentDate);

        const differenceInTime =
          normalizedEndDate.getTime() - normalizedCurrentDate.getTime();

        const remainingValidityDays = Math.floor(
          differenceInTime / (1000 * 60 * 60 * 24)
        );

        if (remainingValidityDays > 0) {
          const payload = {
            userId: finduser._id,
            email: finduser.email,

            role: finduser.role,
            remainingValidityDays,
          };

          const secretKey = process.env.USER_SECRETKEY!;

          const subscriptionToken = jwt.sign(payload, secretKey, {
            expiresIn: `${remainingValidityDays}d`,
          });

          res.cookie("subscriptionToken", subscriptionToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: remainingValidityDays * 24 * 60 * 60 * 1000,
          });
        } else {
          throw new CustomError(
            "Your premium membership has expired. Please renew to continue enjoying premium benefits.",
            404
          );
        }
      } else {
      }
    }
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    const refreshToken = jwt.sign(
      {
        id: finduser._id,
        email: finduser.email,
        isBlocked: finduser.isBlocked,
      },
      process.env.USER_SECRETKEY!,
      { expiresIn: "1d" }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: true,
      message: "google auth Login successful",
      finduser,
    });
    return;
  } else {
    const user = await new User({
      email,
      firstName: name,
      profileImage: image,
    });
    const savegoogleauth = await user.save();
    res.status(200).json({
      status: true,
      message: "google auth registration and Login successful",
      savegoogleauth,
    });
  }
};

//Email check

export const AllUsersEmailCheck = async (req: Request, res: Response) => {
  const { email } = req.query;

  const user = await User.findOne({ email });

  if (user) {
    res.json({ exists: true });
    return;
  } else {
    res.json({ exists: false });
    return;
  }
};

// refresh token
declare module "express-serve-static-core" {
    interface Request {
        user?: JwtDecoded;
        token?: string;
    }
}

export interface JwtDecoded extends JwtPayload {
    id: string;
    name: string;
    email: string;
    isBlocked: boolean;
}

export const refreshAccessToken = async (req:Request, res:Response):Promise<void> => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new CustomError("Refresh token not found please login",404);
        
    }
    const secretKey = process.env.USER_SECRETKEY || "default_secret";
if(!secretKey){
    throw new CustomError("missing secret key",404);
}
jwt.verify(refreshToken, secretKey, (error: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (error) {
            throw new CustomError("Refresh token invalid",404);
            
        }
        if (typeof decoded !== "object" || !decoded) {
            throw new CustomError("Invalid token structure",404);
            
        }

        const accessToken = jwt.sign(
        { id: decoded.id, username: decoded.username, email: decoded.email },
        secretKey,
        { expiresIn: "1d" }
        );

        res.cookie("token", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "lax",
        });

         res.status(200).json({status:true,message:"accessToken created", accessToken });
         return
    });
};
