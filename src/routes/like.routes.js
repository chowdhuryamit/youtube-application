import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllLikedVideo,
toggleCommentLike,
toggleTweetLike,
toggleVideoLike
} from "../controllers/like.controller.js";

const router=Router();

router.use(verifyJWT);


router.post('/toggleVideoLike/:videoId',toggleVideoLike);
router.post('/toggleCommentLike/:commentId',toggleCommentLike);
router.post('/toggleTweetLike/:tweetId',toggleTweetLike);
router.get('/getAllLikedVideo',getAllLikedVideo);


export default router;