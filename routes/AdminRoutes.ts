import express from "express";
import { login, logout,ProfileEdit } from "../Controller/authController/admin";
import { adminAuthentication } from "../middleware/adminAuthentication";
import { validateData } from "../middleware/zodValidation";
import { IdSchema, LoginSchema } from "../Utils/zodSchema";
import { allUsers, blockAndUnblock ,getDailyRevenue,getDailyUsers,createSkills, createTitles, AllSkills, RemoveSkills, AllTitles, RemoveTitle, EditSkill, ApproveSkill, EditTitle, ApproveTitle,createTitlesbyUser} from "../Controller/userController/admin";
import { deletePost, dismissReports, getReports } from "../Controller/postController/admin";
import { errorCatch } from "../middleware/tryCatch";
import { upload } from "../middleware/upload";
const adminRouter = express.Router();

adminRouter
//auth
  .post("/login", validateData(LoginSchema), errorCatch(login))
  .post("/logout", adminAuthentication, errorCatch(logout))

  //user
  .patch(
    "/blockandunblock/:id",
    adminAuthentication,
    validateData(undefined,IdSchema),
    errorCatch(blockAndUnblock)
  )
  .get("/users", adminAuthentication, errorCatch(allUsers))

  //report
  .get("/viewreports", adminAuthentication, errorCatch(getReports))
  .post(
    "/dismissreports/:id",
    adminAuthentication,
    validateData(undefined,IdSchema),
    errorCatch(dismissReports)
  )

  //post
  .delete(
    "/deletepost/:id",
    adminAuthentication,
    validateData(undefined,IdSchema),
    errorCatch(deletePost)
  )

  //editprofile
  .patch("/editprofile",adminAuthentication,upload.single("profileImage"),errorCatch(ProfileEdit))

  //daily users
  .get("/dailyusers",getDailyUsers)

  //daily revenue

  .get("/dailyrevenue",getDailyRevenue)

  //create skills

  .post("/addskill",adminAuthentication,errorCatch(createSkills))
  .get("/allskills",errorCatch(AllSkills))
  .patch("/removeskill/:id",errorCatch(RemoveSkills))
  .patch("/editskill/:id",errorCatch(EditSkill))
  .patch("/approveskill/:id",errorCatch(ApproveSkill))
  //create titles
  .post("/addtitle",adminAuthentication,errorCatch(createTitles))
  .post("/titlebyuser",errorCatch(createTitlesbyUser))
   .get("/alltitle",errorCatch(AllTitles))
  .patch("/removetitle/:titleid",errorCatch(RemoveTitle))
  .patch("/edittitle/:id",errorCatch(EditTitle))
  .patch("/approvetitle/:id",errorCatch(ApproveTitle))

export { adminRouter };

