import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment } from "../controllers/comment.controller.js";

const router=Router();

router.use(verifyJWT);


router.post('/addComment/:videoId',addComment);


export default router;