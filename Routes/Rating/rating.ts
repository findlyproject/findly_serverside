import express from "express";
import  {createRating, deleteRating, getAllRatings, getUserRatings}  from "../../Controller/commonFolders/Rating";
import { errorCatch } from "../../middleware/tryCatch";
import { userAuthMiddleware } from "../../middleware/userauthantication";
const rating = express.Router()

rating

.post("/createreview",userAuthMiddleware,errorCatch(createRating))
.delete("/:ratingId",userAuthMiddleware,errorCatch(deleteRating))
.get("/findallreviews",errorCatch(getAllRatings))
.get("/:userId",userAuthMiddleware,errorCatch(getUserRatings))



       
export {rating}