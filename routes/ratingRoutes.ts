import express from "express";
import {
  createRating,
  getAllRatings,
  getUserRatings,
} from "../Controller/ratingController/user";
import { errorCatch } from "../middleware/tryCatch";
import { userAuthMiddleware } from "../middleware/userauthantication";
import { validateData } from "../middleware/zodValidation";
import { IdSchema, RatingSchema } from "../Utils/zodSchema";
const ratingRouter = express.Router();

ratingRouter

  .post(
    "/createreview",
    userAuthMiddleware,
    validateData(RatingSchema),
    errorCatch(createRating)
  )

  .get("/findallreviews", errorCatch(getAllRatings))
  .get(
    "/:userId",
    userAuthMiddleware,
    validateData(undefined, IdSchema),
    errorCatch(getUserRatings)
  )

export { ratingRouter };
