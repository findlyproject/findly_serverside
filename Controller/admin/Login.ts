import { Request, Response } from "express"
import { Admin } from "../../Model/AdminSchema";
import bcrypt from 'bcrypt'


const login = async(req:Request,res:Response):Promise<void>=>{
    const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ status: false, message: "Email and password are required" });
            return;
        }

       
        const findadmin = await Admin.findOne({ email });

        if (!findadmin) {
            res.status(404).json({ status: false, message: "Admin not found" });
            return;
        }

        
        const isMatch = await bcrypt.compare(password, findadmin.password);

        if (!isMatch) {
            res.status(401).json({ status: false, message: "Invalid credentials" });
            return;
        }

        res.status(200).json({ status: "success", message: "Login successful" ,findadmin});
}

export {login}