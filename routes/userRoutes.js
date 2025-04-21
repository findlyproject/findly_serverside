"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const ContactUs_1 = require("../Controller/ContactUs");
const tryCatch_1 = require("../middleware/tryCatch");
const userauthantication_1 = require("../middleware/userauthantication");
const user_1 = require("../Controller/reportController/user");
const user_2 = require("../Controller/authController/user");
const fileUpload_1 = require("../Utils/fileUpload");
const ressumeUploading_1 = __importDefault(require("../middleware/ressumeUploading"));
const zodValidation_1 = require("../middleware/zodValidation");
const zodSchema_1 = require("../Utils/zodSchema");
const user_3 = require("../Controller/authController/user");
const user_4 = require("../Controller/userController/user");
const user_5 = require("../Controller/jobController/user");
const user_6 = require("../Controller/subscriptionController/user");
const user_7 = require("../Controller/ratingController/user");
const company_1 = require("../Controller/ratingController/company");
const user_8 = require("../Controller/commentController/user");
const user_9 = require("../Controller/replyController/user");
const user_10 = require("../Controller/postController/user");
const user_11 = require("../Controller/saveController/user");
const upload_1 = require("../middleware/upload");
const userRouter = express_1.default.Router();
exports.userRouter = userRouter;
userRouter
    //auth
    .post("/registration", (0, zodValidation_1.validateData)(zodSchema_1.UserSchema), (0, tryCatch_1.errorCatch)(user_3.RegistrationUser))
    .post("/login", (0, zodValidation_1.validateData)(zodSchema_1.LoginSchema), (0, tryCatch_1.errorCatch)(user_3.login))
    .post("/googleauthlogin", (0, tryCatch_1.errorCatch)(user_3.googleauthlogin))
    .post("/logout", (0, tryCatch_1.errorCatch)(user_3.logout))
    .post("/refreshtoken", (0, tryCatch_1.errorCatch)(user_2.refreshAccessToken))
    .post("/emailus", (0, tryCatch_1.errorCatch)(ContactUs_1.EmailUs))
    //user
    .get("/currentuserdetails", userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(user_4.findCurrentUserDetails))
    .get("/people-you-might-know", userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(user_4.getPeopleYouMightKnow))
    // .put("/profile",userAuthMiddleware,validateData(UserSchema),errorCatch(updateUserProfile))
    .put('/update-banner', userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_4.updateBanner))
    .put('/update-profile-image', userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_4.updateProfileImage))
    .put('/update-basic-info', userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_4.updateBasicInfo))
    .put('/update-other-details', userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_4.updateOtherDetails))
    .post("/send-otp", userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(user_4.sendingOTP))
    .post("/verify-otp", userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(user_4.verifyingOTP))
    .post("/uploadressume", userauthantication_1.userAuthMiddleware, ressumeUploading_1.default, (0, tryCatch_1.errorCatch)(user_4.uploadResume))
    .get("/getuploadedfiles", userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(user_4.getUploadedFiles))
    .delete("/removeresume", userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(user_4.removeResumeFile))
    .post("/save/:id", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_11.SaveandUnsavePost))
    .get("/saveds", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_11.AllSaved))
    // .get("/all",userAuth,errorCatch(All))
    .get('/all', user_3.AllUsersEmailCheck)
    .post("/reportuser", userauthantication_1.userAuthMiddleware, (0, zodValidation_1.validateData)(zodSchema_1.ReportSchema), (0, tryCatch_1.errorCatch)(user_1.reportuser))
    .get("/generate-signed-url", (0, tryCatch_1.errorCatch)(fileUpload_1.generateSignedUrl))
    .get("/spacificuserdetails/:id", userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(user_4.spacificuserdetails))
    .post("/resetpasword/:email/:password", (0, tryCatch_1.errorCatch)(user_2.resetPasword))
    .post("/sendotp/:email", (0, tryCatch_1.errorCatch)(user_2.sendOtp))
    .get("/findrating/:targetedId", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(company_1.findreviewsByTargetedId))
    //apply job
    .post("/applytojob/:jobId", userauthantication_1.userAuth, ressumeUploading_1.default, (0, tryCatch_1.errorCatch)(user_5.applyToJob))
    .get("/applyedjobs", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_5.applydeJobs))
    .get("/allusers", (0, tryCatch_1.errorCatch)(user_2.findUsers))
    .get("/getTotalRevenue", (0, tryCatch_1.errorCatch)(user_4.getTotalRevenue))
    .get("/findprimeclients", (0, tryCatch_1.errorCatch)(user_4.getPrimeClients))
    .post("/saveJobs/:id", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_5.saveJobs))
    .get("/getsavedjobs", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_5.getsavedjobs))
    .get("/recommended", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_5.getRecommendedJobs))
    .post("/payment/createSubscription", userauthantication_1.userAuth, (0, zodValidation_1.validateData)(zodSchema_1.SubscriptionSchema), (0, tryCatch_1.errorCatch)(user_6.createSubscription))
    .post("/payment/verifySubscription/:sessionId", userauthantication_1.userAuth, (0, zodValidation_1.validateData)(undefined, zodSchema_1.VerificationSchema), (0, tryCatch_1.errorCatch)(user_6.verifySubscription))
    .get("/payment/findsubscriptionbyId/:sessionId", userauthantication_1.userAuth, 
// validateData(undefined, VerificationSchema),
(0, tryCatch_1.errorCatch)(user_6.findSubscriptionById))
    .get("/payment/subscriptiondetails", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_6.PremiumDetailsOfActiveUser))
    .post("/companyrating/:targetedId", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_7.createCompanyRating))
    .get("/findrating/:targetedId", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(company_1.findreviewsByTargetedId))
    .post("/accountdeletionreqst", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_2.requestDeleteAccount))
    .post("/verifyOtp", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_2.verifyOtp))
    .get("/posts", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_10.getPostsByOwners))
    .get("/similarjobs/:jobType/:companyName", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_5.similarjobs))
    //comment
    .get("/allcomments", (0, tryCatch_1.errorCatch)(user_8.getAllComments))
    .get("/viewcomment/:id", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_8.getCommentById))
    .post("/comment", userauthantication_1.userAuth, (0, zodValidation_1.validateData)(zodSchema_1.CommentSchema), (0, tryCatch_1.errorCatch)(user_8.addCommentToPost))
    .put("/edit-comment/:commentId", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_8.editComment))
    .post("/delete-comment/:commentId", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_8.deleteComment))
    //like & unlike
    .post("/likepost/:id", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_10.LikeOrDislike))
    .get("/likes", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_10.getLikedPosts))
    //reply
    .post("/postreplay", userauthantication_1.userAuth, (0, zodValidation_1.validateData)(zodSchema_1.ReplySchema), (0, tryCatch_1.errorCatch)(user_9.replyToComment))
    .get("/findreply/:commentId", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_9.getRepliesForComment))
    .put("/editreplay", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_9.editReply))
    .delete("/deletereplay", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_9.deleteReply))
    .get("/getcommentswithreplies", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_9.getCommentsWithReplies))
    .post("/upload", userauthantication_1.userAuth, upload_1.upload.fields([{ name: "media", maxCount: 5 }]), user_10.addPost)
    .patch("/update/:postId", userauthantication_1.userAuth, upload_1.upload.fields([{ name: "media", maxCount: 5 }]), (0, tryCatch_1.errorCatch)(user_10.updatePost))
    .put("/delete/:postId", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_10.DeletePost))
    .post("/plancancellation/:sessionId", userauthantication_1.userAuth, (0, tryCatch_1.errorCatch)(user_6.planCancellation));
