import express from "express";
import  {createRating}  from "../../Controller/commonFolders/Rating";
const rating = express.Router()

rating
.post("/user",createRating)

       
export {rating}