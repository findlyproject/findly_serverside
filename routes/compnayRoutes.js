"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyRouter = void 0;
const express_1 = __importDefault(require("express"));
const tryCatch_1 = require("../middleware/tryCatch");
const company_1 = require("../Controller/authController/company");
const upload_1 = require("../middleware/upload");
const zodValidation_1 = require("../middleware/zodValidation");
const zodSchema_1 = require("../Utils/zodSchema");
const company_2 = require("../Controller/jobController/company");
const userauthantication_1 = require("../middleware/userauthantication");
const company_3 = require("../Controller/authController/company");
const user_1 = require("../Controller/subscriptionController/user");
const admin_1 = require("../Controller/userController/admin");
const user_2 = require("../Controller/ConnectingController/user");
const company_4 = require("../Controller/userController/company");
const user_3 = require("../Controller/ratingController/user");
const company_5 = require("../Controller/ratingController/company");
const company_6 = require("../Controller/postController/company");
const user_4 = require("../Controller/commentController/user");
const user_5 = require("../Controller/replyController/user");
const user_6 = require("../Controller/postController/user");
const user_7 = require("../Controller/saveController/user");
const user_8 = require("../Controller/postController/user");
const message_1 = require("../Controller/messsageController/message");
const company_7 = require("../Controller/subscriptionController/company");
const companyRouter = express_1.default.Router();
exports.companyRouter = companyRouter;
companyRouter
    //auth
    .post("/send-otp", (0, tryCatch_1.errorCatch)(company_1.initialRegister))
    .post("/verify-otp", (0, tryCatch_1.errorCatch)(company_1.verifyOTP))
    .post("/final-register", upload_1.upload.single("logo"), (0, zodValidation_1.validateData)(zodSchema_1.CompanySchema), (0, tryCatch_1.errorCatch)(company_1.finalRegister))
    .post("/login", (0, zodValidation_1.validateData)(zodSchema_1.LoginSchema), (0, tryCatch_1.errorCatch)(company_1.login))
    .post("/logout", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_1.logOut))
    .post("/jobposting", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_2.createJobPost))
    .post("/editdeadline/:jobId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_2.updateJobDeadline))
    .patch("/updatejobs/:jobId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_2.updateJobPost))
    .delete("/deletejobpost/:jobId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_2.deleteJobPost))
    .get("/getalljobs", userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(company_2.getAllJobPost))
    .get("/getJobsById/:id", userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(company_2.getJobsById))
    .get("/findapplications", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_2.findAppliedUsers))
    .get("/findapplications/:userId/:jobId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_2.findUserApplication))
    .put("/reject-application/:userId/:jobId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_2.rejectJobApplication))
    .put("/approve/:userId/:jobId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_2.approveJobApplication))
    .post('/generate-offer-letter', userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_2.generateOfferLetter))
    .post("/sendotp/:email", (0, tryCatch_1.errorCatch)(company_3.sendOtp))
    .post("/resetpassword/:email/:password", (0, tryCatch_1.errorCatch)(company_1.resetPasword))
    .get("/allcompanies", (0, tryCatch_1.errorCatch)(admin_1.allCompanies))
    .get("/findcompany/:companyId", (0, tryCatch_1.errorCatch)(company_4.spacificCompanyDetails))
    .post("/payment/createSubscription", userauthantication_1.companyAuth, (0, zodValidation_1.validateData)(zodSchema_1.SubscriptionSchema), (0, tryCatch_1.errorCatch)(user_1.createSubscription))
    .post("/payment/verifySubscription/:sessionId", userauthantication_1.companyAuth, (0, zodValidation_1.validateData)(undefined, zodSchema_1.VerificationSchema), (0, tryCatch_1.errorCatch)(user_1.verifySubscription))
    .get("/payment/subscriptiondetails", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_7.PremiumDetailsOfActiveCompany))
    .post("/saveapplication", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_6.saveOrUnsaveApplication))
    .post("/findsavedapplication", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_6.getSavedApplicationById))
    .delete("/deleteapplication", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_6.deleteApplicatio))
    .get("/payment/findsubscriptionbyId/:sessionId", userauthantication_1.companyAuth, (0, zodValidation_1.validateData)(undefined, zodSchema_1.VerificationSchema), (0, tryCatch_1.errorCatch)(user_1.findSubscriptionById))
    .post("/plancancellation/:sessionId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_1.planCancellation))
    .get("/getjobs", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_2.getJobsByCompanies))
    .post("/companyrating/:targetedId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_3.createCompanyRating))
    .delete("/deletereview/:id", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_5.deleteReview))
    .delete("/deleteReview/:id", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_5.deleteReviews))
    .get("/findrating/:targetedId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_5.findreviewsByTargetedId))
    .post(`/follow/:id`, userauthantication_1.userAuthMiddleware, (0, tryCatch_1.errorCatch)(user_2.FollowAndUnfollowCompany))
    //GET POSTS
    .get("/findposts", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_6.getPostsByOwner))
    .get("/posts", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_8.getPostsByOwners))
    .get("/viewcomment/:id", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_4.getCommentById))
    .post("/comment", userauthantication_1.companyAuth, (0, zodValidation_1.validateData)(zodSchema_1.CommentSchema), (0, tryCatch_1.errorCatch)(user_4.addCommentToPost))
    .put("/edit-comment/:commentId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_4.editComment))
    .post("/delete-comment/:commentId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_4.deleteComment))
    //like & unlike
    .post("/likepost/:id", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_6.LikeOrDislike))
    .get("/likes", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_6.getLikedPosts))
    //reply
    .post("/postreplay", userauthantication_1.companyAuth, (0, zodValidation_1.validateData)(zodSchema_1.ReplySchema), (0, tryCatch_1.errorCatch)(user_5.replyToComment))
    .get("/findreply/:commentId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_5.getRepliesForComment))
    .put("/editreplay", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_5.editReply))
    .delete("/deletereplay", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_5.deleteReply))
    .get("/getcommentswithreplies", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_5.getCommentsWithReplies))
    //delete account
    .post("/accountdeletionreqst", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_1.requestDeleteAccount))
    .post("/verifyOtp", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_1.verifyOtp))
    .get("/owner", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_8.getPostsByOwners))
    //edit profile
    .patch("/edit/:id", (0, tryCatch_1.errorCatch)(company_4.EditCompany))
    .patch("/editcontact/:id", (0, tryCatch_1.errorCatch)(company_4.EditContacts))
    .patch("/editservice/:id", (0, tryCatch_1.errorCatch)(company_4.EditContacts))
    .patch("/editprofetional/:id", (0, tryCatch_1.errorCatch)(company_4.EditProfetional))
    .patch("/editsocialmedia/:id", (0, tryCatch_1.errorCatch)(company_4.editsocialmedia))
    .patch("/editservices/:id", (0, tryCatch_1.errorCatch)(company_4.EditServiecs))
    .patch("/editemployee/:id", (0, tryCatch_1.errorCatch)(company_4.editemployee))
    .patch("/removeemployee/:id", (0, tryCatch_1.errorCatch)(company_4.removeEmployee))
    .patch("/edit/logo/:id", upload_1.upload.single('logo'), (0, tryCatch_1.errorCatch)(company_4.LogoOfCompany))
    .patch("/edit/banner/:id", upload_1.upload.single('banner'), (0, tryCatch_1.errorCatch)(company_4.BannerOfCompany))
    .get(`/users`, (0, tryCatch_1.errorCatch)(company_4.allUsersforCompany))
    //save routes
    .post("/save/:id", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_7.SaveandUnsavePost))
    .get("/saveds", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_7.AllSaved))
    // .get("/all",companyAuth,errorCatch(All))
    //post by owner
    .get("/posts", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(company_6.getPostsByOwner))
    .get("/post/:id", (0, tryCatch_1.errorCatch)(user_8.getpostbyid))
    //community
    .post("/create", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(message_1.createCommunity))
    .post('/communtyMessage/:id', userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(message_1.CommunitySendMessage))
    .get('/getCommuntyMessage/:id', userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(message_1.communitymesgById))
    .post('/deletCommuntyMessage/:id', userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(message_1.deletecommunitymessage))
    .post("/upload", userauthantication_1.companyAuth, upload_1.upload.fields([{ name: "media", maxCount: 5 }]), user_6.addPost)
    .patch("/update/:postId", userauthantication_1.companyAuth, upload_1.upload.fields([{ name: "media", maxCount: 5 }]), (0, tryCatch_1.errorCatch)(user_6.updatePost))
    .put("/delete/:postId", userauthantication_1.companyAuth, (0, tryCatch_1.errorCatch)(user_6.DeletePost));
