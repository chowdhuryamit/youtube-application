import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, updateComment } from "../controllers/comment.controller.js";

const router=Router();

router.use(verifyJWT);


router.post('/addComment/:videoId',addComment);
router.patch('/updateComment/:commentId',updateComment);


export default router;