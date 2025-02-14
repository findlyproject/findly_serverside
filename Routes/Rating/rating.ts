import express from "express";
import  {createRating, deleteRating, getAllRatings, getUserRatings}  from "../../Controller/commonFolders/Rating";
import { errorCatch } from "../../middleware/tryCatch";
import { userAuthMiddleware } from "../../middleware/userauthantication";
import { validateData } from "../../middleware/zodValidation";
import { IdSchema, ratingSchema } from "../../Utils/zodSchema";
const rating = express.Router()

rating

.post("/createreview",userAuthMiddleware,validateData(ratingSchema),errorCatch(createRating))
.delete("/:ratingId",userAuthMiddleware,validateData(undefined,IdSchema),errorCatch(deleteRating))
.get("/findallreviews",errorCatch(getAllRatings))
.get("/:userId",userAuthMiddleware,validateData(undefined,IdSchema),errorCatch(getUserRatings))

export {rating}