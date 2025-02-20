import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Company } from "../../model/CompanySchema";
import { CustomError } from "../../Utils/errorHandler";
import { sendOTP } from "../../Utils/otpService";  
import { generateOTP } from "../../Utils/otpGenerator"; 
import nodemailer from "nodemailer";
import { ICompany } from "../../types/allTypes";
// Step 1: Initial Register (Send OTP)
interface OTPStore {
    [key: string]: { otp: string; createdAt: number };
  }
  
  const otpStore: OTPStore = {};
  
  export const initialRegister = async (req: Request, res: Response): Promise<void> => {
    const { name, email } = req.body;
  console.log(req.body)
    if (!name || !email) {
      throw new CustomError("Name and email are required.", 400);
    }
  
    // Check if company already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      throw new CustomError("Company already exists.", 400);
    }
  
    // Generate OTP
    const otp = generateOTP();  // Your OTP generation function
  
    // Store OTP in memory with timestamp for expiry validation
    otpStore[email] = { otp, createdAt: Date.now() };
  console.log(otpStore)
    // Send OTP to email/contact
    try {
      await sendOTP(email, otp);
      res.status(200).json({
        message: "OTP sent to your email. Please verify to proceed."
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new CustomError("Error sending OTP. Please try again later.", 500);
    }
  };

// Step 2: OTP Verification
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  const { otp, email } = req.body;

  if (!otp || !email) {
    throw new CustomError("OTP and email are required.", 400);
  }
  console.log(otp)
console.log(otpStore)

  // Compare the OTP with the one stored in the in-memory store
  if (otpStore[email]?.otp !== otp.toString()) {
    throw new CustomError("Invalid OTP. Please try again.", 400);
  }

  // OTP is valid, proceed to the next step (final registration form)
  res.status(200).json({
    message: "OTP verified successfully. Please proceed to fill the registration form."
  });

  // Clear OTP after verification
  delete otpStore[email];  // Clean up the OTP once it is used
};

// Step 3: Final Registration Form Submission
export const finalRegister = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, cpassword, contact, age, IndustryType, address, role } = req.body;
  
    if (!name || !email || !password || !cpassword || !contact) {
        throw new CustomError("All required fields must be filled.", 400);
    }
  
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
        throw new CustomError("Invalid email format.", 400);
    }
  
    if (password !== cpassword) {
        throw new CustomError("Passwords do not match.", 400);
    }
  
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
        throw new CustomError("Company already exists.", 400);
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const logo = req.file ? req.file.path : ""; // Ensure this field exists
  
    const company = new Company({  
        name,
        logo, 
        email,
        password: hashedPassword,
        contact,
        role: role || "company",
        age,
        IndustryType,
        address,
        type:"Company"
    });
  
    await company.save();
  
    // Generate JWT tokens
    const token = jwt.sign(
        { id: company._id, email: company.email },
        process.env.USER_SECRETKEY!,   
        { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
        { id: company._id, email: company.email },
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
    res.cookie(`type`, "Company", {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      sameSite: 'none',
    });
  
    res.status(201).json({ status: true, message: "Company registered successfully", company });
  };    


export const login=async(req:Request,res:Response)=>{
    const {email,password}=req.body;
    const company=await Company.findOne({email})
    if (!company) {
        throw new CustomError(`No account found for ${email}`,401);
    }
        const verfyPassword = await bcrypt.compare(password, company.password);
         if (!verfyPassword) {
           throw new CustomError("password is wrong", 404);
         }
         const currentDate = new Date();
         if (company.role === "premium" && company.subscriptionEndDate) {
           if (company.subscriptionEndDate < currentDate) {
            company.role = "company";
            company.subscriptionStartDate = null;
            company.subscriptionEndDate = null;
             await company.save();
           }
         }

if (verfyPassword) {
    const token = jwt.sign(
      {
        id: company._id,
        email: company.email,
        type:"Company"
 
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
      { id: company._id, email: company.email },
      process.env.USER_SECRETKEY!,
      { expiresIn: "7d" }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie(`type`, "Company", {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      sameSite: 'none',
    });
  }

  if (company.role === "premium" && company.subscriptionEndDate) {
      const subscriptionEndDate = company.subscriptionEndDate
        ? new Date(company.subscriptionEndDate)
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
            userId: company._id,
            email: company.email,
            role: company.role,
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

    res.status(200).json({ status: true, message: "Login successful", company });
      
}   


export const logOut=async(req:Request,res:Response)=>{
     const companyId=req.company?.id;
     if (companyId) {
      const company = await Company.findById(companyId);
  
      if (company && company.role === "premium" && company.subscriptionEndDate) {
        const currentDate = new Date();
  
        if (company.subscriptionEndDate < currentDate) {
          company.role = "company";
          company.subscriptionStartDate = null;
          company.subscriptionEndDate = null;
          await company.save();
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

    res.clearCookie("type", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.status(200).json({ status: true, message: "Logout successfully" });
  
}




export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.params;
  if (!email) {
    throw new CustomError("email is not found", 404);
  }
  const company = await Company.findOne({ email });
  if (!company) {
    throw new CustomError("company not found", 404);
  }
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    throw new CustomError("Invalid email format", 400);
  }
  const otp = Math.floor(1000 + Math.random() * 9000);


  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL as string,
      pass: process.env.APP_PASSWORD as string,
    },
  });

  const mailOptions = {
    from: process.env.APP_EMAIL as string,
    replyTo: email,
    to: email,
    subject: '🔐 Password Reset OTP - Findly',
    text: `Dear User,

Your OTP for password reset is: ${otp}

This OTP is valid for 10 minutes.

If you didn’t request this, please ignore this email.

Findly Support Team`,

    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333; text-align: center;">🔐 Password Reset Request</h2>
        <p style="color: #555; font-size: 16px;">Dear User,</p>
        <p style="color: #555; font-size: 16px;">We received a request to reset your password for your <b>Findly</b> account.</p>
        <p style="color: #555; font-size: 16px;">Your One-Time Password (OTP) is:</p>
        <div style="text-align: center; padding: 15px; background-color: #ffcc00; border-radius: 8px; font-size: 22px; font-weight: bold; letter-spacing: 2px;">
            ${otp}
        </div>
        <p style="color: #555; font-size: 16px;">This OTP is valid for <b>10 minutes</b>. Do not share it with anyone for security reasons.</p>
        <p style="color: #555; font-size: 16px;">If you did not request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <a href="${process.env.CLIENT_URL}/contactus/contact" style="color: #999; font-size: 14px; text-align: center;">Findly Support Team</a>

    </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  res
    .status(200)
    .json({ status: true, message: "Otp sent successfully", otp });
}


export const resetPasword = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.params;
  if (!email) {
    res.status(404).json({ status: false, message: "email is not found" })
  }
  console.log("email",email);
  
  const findCompany: ICompany | null = await Company.findOne({ email: email });
  if (!findCompany) {
    res.status(404).json({ status: false, message: "you have no account" });
    return;
  }
  if (!password) {
    res.status(404).json({ status: false, message: "password is not found" })
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  findCompany.password = hashedPassword

  const updatedUser = await findCompany.save();
  res.status(200).json({ status: true, message: "password updated successfully", updatedUser })
}