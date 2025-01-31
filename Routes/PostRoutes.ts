import express from "express";

const router = express.Router();

router.post("/workspaces/:workspaceId/messages", validateData(chatSchema), errorCatch(createMessages));


export default router;