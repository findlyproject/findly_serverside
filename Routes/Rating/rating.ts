import express from "express";
import  {createRating, deleteRating, getUserRatings}  from "../../Controller/commonFolders/Rating";
import { errorCatch } from "../../Middleware/tryCatch";
const rating = express.Router()

rating

.post("/user",errorCatch(createRating))
.get("/user/:userId",errorCatch(getUserRatings))
.delete("/user/:ratingId",errorCatch(deleteRating))


       
export {rating}