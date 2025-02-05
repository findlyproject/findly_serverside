import { Request, Response } from "express";

const getauteruserdetails = async (req:Request,res:Response)=>{
    const userid = req.params.id;
    console.log(userid);
    
}

export {
    getauteruserdetails,
}