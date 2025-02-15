import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Company } from "../../model/CompanySchema";
import { CustomError } from "../../Utils/errorHandler";

// Register Company
export const register = async (req: Request, res: Response): Promise<void> => {
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
