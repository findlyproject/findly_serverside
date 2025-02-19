import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Company } from "../../model/CompanySchema";
import { CustomError } from "../../Utils/errorHandler";
import { sendOTP } from "../../Utils/otpService";  
import { generateOTP } from "../../Utils/otpGenerator"; 

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
        address
    });
  
    await company.save();
  
    // Generate JWT tokens
    const ctoken = jwt.sign(
        { id: company._id, email: company.email },
        process.env.COMPANY_SECRETKEY!,   
        { expiresIn: "1d" }
    );
    const crefreshToken = jwt.sign(
        { id: company._id, email: company.email },
        process.env.COMPANY_SECRETKEY!,
        { expiresIn: "7d" }
    );
  
    res.cookie("ctoken", ctoken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
    });
  
    res.cookie("crefreshToken", crefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
    const ctoken = jwt.sign(
      {
        id: company._id,
        email: company.email,
 
      },
      process.env.USER_SECRETKEY!,
      { expiresIn: "1d" }
    );
    res.cookie("ctoken", ctoken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
    const crefreshToken = jwt.sign(
      { id: company._id, email: company.email },
      process.env.USER_SECRETKEY!,
      { expiresIn: "7d" }
    );
    res.cookie("crefreshToken", crefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

    res.clearCookie("ctoken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    res.clearCookie("crefreshToken", {
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
  
}