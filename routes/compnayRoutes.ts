import express from "express";
import { errorCatch } from "../middleware/tryCatch";
import { initialRegister,verifyOTP,finalRegister,login, logOut, resetPasword, requestDeleteAccount, verifyOtp, } from "../Controller/authController/company";
import { upload } from "../middleware/upload";
import { validateData } from "../middleware/zodValidation";
import { CommentSchema, CompanySchema, IdSchema, jobPostSchema, LoginSchema, ReplySchema, SubscriptionSchema, VerificationSchema } from "../Utils/zodSchema";
import { approveJobApplication, createJobPost, deleteJobPost, findAppliedUsers, findUserApplication, generateOfferLetter, getAllJobPost, getJobsByCompanies, getJobsById, rejectJobApplication, updateJobDeadline, updateJobPost } from "../Controller/jobController/company";
import { companyAuth, userAuthMiddleware } from "../middleware/userauthantication";
import { sendOtp } from "../Controller/authController/company";
import { createSubscription, findSubscriptionById, verifySubscription } from "../Controller/subscriptionController/user";
import { allCompanies } from "../Controller/userController/admin";

import { FollowAndUnfollowCompany } from "../Controller/ConnectingController/user";

import { allUsersforCompany, BannerOfCompany, EditCompany, EditContacts, editemployee, EditProfetional,  EditServiecs, editsocialmedia, LogoOfCompany, removeEmployee, spacificCompanyDetails } from "../Controller/userController/company";
import { createCompanyRating } from "../Controller/ratingController/user";




import { deleteReview, deleteReviews, findreviewsBycompany, findreviewsByTargetedId } from "../Controller/ratingController/company";
import { getPostsByOwner } from "../Controller/postController/company";
import { addCommentToPost, deleteComment, editComment, getCommentById } from "../Controller/commentController/user";
import { deleteReply, editReply, getCommentsWithReplies, getRepliesForComment, replyToComment } from "../Controller/replyController/user";
import { addPost, deleteApplicatio, DeletePost, getLikedPosts, getSavedApplicationById, LikeOrDislike, saveOrUnsaveApplication, updatePost } from "../Controller/postController/user";

import {  AllSaved, SaveandUnsavePost } from "../Controller/saveController/user";
import { getpostbyid, getPostsByOwners } from "../Controller/postController/user";
import { communitymesgById, CommunitySendMessage, createCommunity, deletecommunitymessage, SendMessage } from "../Controller/messsageController/message";

const companyRouter = express.Router();

companyRouter

  //auth
    
  .post(
    "/send-otp",
    errorCatch(initialRegister)
  )
  .post(
    "/verify-otp",
    errorCatch(verifyOTP)
  )
  .post(
    "/final-register",
    upload.single("logo"),
    validateData(CompanySchema),
    errorCatch(finalRegister)
  )
  .post("/login",validateData(LoginSchema),errorCatch(login))
  .post("/logout",companyAuth, errorCatch(logOut))
  .post("/jobposting",companyAuth,errorCatch(createJobPost))
  .post("/editdeadline/:jobId",companyAuth,errorCatch(updateJobDeadline))
  .patch("/updatejobs/:jobId",companyAuth,errorCatch(updateJobPost))
  .delete("/deletejobpost/:jobId",companyAuth,errorCatch(deleteJobPost))
  .get("/getalljobs",userAuthMiddleware,errorCatch(getAllJobPost))
  .get("/getJobsById/:id",userAuthMiddleware,errorCatch(getJobsById))
  .get("/findapplications",companyAuth,errorCatch(findAppliedUsers))
  .get("/findapplications/:userId/:jobId",companyAuth,errorCatch(findUserApplication))
  .put("/reject-application/:userId/:jobId", companyAuth, errorCatch(rejectJobApplication))
  .put("/approve/:userId/:jobId", companyAuth,errorCatch(approveJobApplication))
  .post('/generate-offer-letter',companyAuth,errorCatch(generateOfferLetter) )
  .post("/sendotp/:email",errorCatch(sendOtp))
  .post("/resetpassword/:email/:password",errorCatch(resetPasword))
  .get("/allcompanies",errorCatch(allCompanies))
  .get("/findcompany/:companyId",errorCatch(spacificCompanyDetails))
  .post(
      "/payment/createSubscription",
      companyAuth,
      validateData(SubscriptionSchema),
      errorCatch(createSubscription)
    )
    .post(
        "/payment/verifySubscription/:sessionId",
        companyAuth,
        validateData(undefined, VerificationSchema), 
        errorCatch(verifySubscription)
      )  
      .post("/saveapplication",companyAuth,errorCatch(saveOrUnsaveApplication))
      .post("/findsavedapplication",companyAuth,errorCatch(getSavedApplicationById))
      .delete("/deleteapplication",companyAuth,errorCatch(deleteApplicatio))
      .get(
        "/payment/findsubscriptionbyId/:sessionId",
        companyAuth,
        validateData(undefined, VerificationSchema),
        errorCatch(findSubscriptionById)
      )
      .get("/getjobs",companyAuth,errorCatch(getJobsByCompanies))
      .post("/companyrating/:targetedId",companyAuth,errorCatch(createCompanyRating))
      .delete("/deletereview/:id",companyAuth,errorCatch(deleteReview))
      .delete("/deleteReview/:id",companyAuth,errorCatch(deleteReviews))
      .get("/findrating/:targetedId",companyAuth,errorCatch(findreviewsByTargetedId))



      .post(`/follow/:id`,userAuthMiddleware,errorCatch(FollowAndUnfollowCompany))

      //GET POSTS
      .get("/findposts",companyAuth,errorCatch(getPostsByOwner))
      .get(
          "/posts",
          companyAuth,
          errorCatch(getPostsByOwners)
        )


.get(
    "/viewcomment/:id",
    companyAuth,
    errorCatch(getCommentById)
  )
  .post(
    "/comment",
    companyAuth,
    validateData(CommentSchema),
    errorCatch(addCommentToPost)
  )
  .put(
    "/edit-comment/:commentId",
    companyAuth,
    errorCatch(editComment)
  )
  .post(
    "/delete-comment/:commentId",
    companyAuth,
    errorCatch(deleteComment)
  )

  //like & unlike
  .post(
    "/likepost/:id",
    companyAuth,
    errorCatch(LikeOrDislike)
  )
  .get(
    "/likes",
    companyAuth,
    errorCatch(getLikedPosts)
  )

 

  //reply
  .post(
    "/postreplay",
    companyAuth,
    validateData(ReplySchema),
    errorCatch(replyToComment)
  )
  .get(
    "/findreply/:commentId",
    companyAuth,
    errorCatch(getRepliesForComment)
  )
  .put("/editreplay", companyAuth, errorCatch(editReply))
  .delete("/deletereplay", companyAuth, errorCatch(deleteReply))
  .get(
    "/getcommentswithreplies",
    companyAuth,
    errorCatch(getCommentsWithReplies)
  )

      //delete account
      .post("/accountdeletionreqst",companyAuth,errorCatch(requestDeleteAccount))
      .post("/verifyOtp",companyAuth,errorCatch(verifyOtp))
       .get(
          "/owner",
          companyAuth,
        
          errorCatch(getPostsByOwners)
        )


        

      //edit profile
      .patch("/edit/:id",errorCatch(EditCompany))
      .patch("/editcontact/:id",errorCatch(EditContacts))
      .patch("/editservice/:id",errorCatch(EditContacts))
      .patch("/editprofetional/:id",errorCatch(EditProfetional))
      .patch("/editsocialmedia/:id",errorCatch(editsocialmedia))
      .patch("/editservices/:id",errorCatch(EditServiecs))
      .patch("/editemployee/:id",errorCatch(editemployee))
      .patch("/removeemployee/:id",errorCatch(removeEmployee))
      .patch("/edit/logo/:id",upload.single('logo'),errorCatch(LogoOfCompany))
      .patch("/edit/banner/:id",upload.single('banner'),errorCatch(BannerOfCompany))
      .get(`/users`,errorCatch(allUsersforCompany))



      
      
        //save routes
        .post("/save/:id",companyAuth,errorCatch(SaveandUnsavePost))
        .get("/saveds",companyAuth,errorCatch(AllSaved))
        // .get("/all",companyAuth,errorCatch(All))

        //post by owner
        .get(
            "/posts",
            companyAuth,
            errorCatch(getPostsByOwner)
          )


          .get("/post/:id",errorCatch(getpostbyid))

//community

.post("/create", companyAuth,errorCatch(createCommunity))


.post('/communtyMessage/:id',companyAuth,errorCatch(CommunitySendMessage))
.get('/getCommuntyMessage/:id',companyAuth,errorCatch(communitymesgById))
.post('/deletCommuntyMessage/:id',companyAuth,errorCatch(deletecommunitymessage))
.post(
            "/upload",
            companyAuth,
            upload.fields([{ name: "media", maxCount: 5 }]),
            addPost
          )
          .patch(
            "/update/:postId",
            companyAuth,
            upload.fields([{ name: "media", maxCount: 5 }]),
            errorCatch(updatePost)
          )
          .put("/delete/:postId",companyAuth, errorCatch(DeletePost))
export { companyRouter };
