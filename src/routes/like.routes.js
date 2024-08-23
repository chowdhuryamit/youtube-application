import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleCommentLike, toggleVideoLike } from "../controllers/like.controller.js";

const router=Router();

router.use(verifyJWT);


router.post('/toggleVideoLike/:videoId',toggleVideoLike);
router.post('/toggleCommentLike/:commentId',toggleCommentLike);



export default router;