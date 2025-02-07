import { Request, Response } from "express"
import { Admin } from "../../Model/AdminSchema";


const login = async(req:Request,res:Response):Promise<void>=>{
    const {email,password} = req.body;

    if(!email || !password ){
        res.status(404).json({status:false,message:"email and password is missing"})
        return
    }
    const findadmin = await Admin.findOne({email,password})
    console.log(findadmin);
    res.send("djsfhdkjfhsdkj")
    
}

export {
    login
}