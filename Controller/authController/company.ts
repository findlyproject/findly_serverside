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
    const token = jwt.sign(
        { id: company._id, email: company.email },
        process.env.COMPANY_SECRETKEY!,   
        { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
        { id: company._id, email: company.email },
        process.env.COMPANY_SECRETKEY!,
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
  
    res.status(201).json({ status: true, message: "Company registered successfully", company });
  };    