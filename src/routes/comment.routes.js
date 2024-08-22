import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";

const router=Router();

router.use(verifyJWT);


router.post('/addComment/:videoId',addComment);
router.patch('/updateComment/:commentId',updateComment);
router.delete('/deleteComment/:commentId',deleteComment);
router.get('/getAllComments/:videoId',getAllComments);


export default router;