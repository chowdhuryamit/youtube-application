import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet,
    deleteTweet,
    getAllTweets,
    getUserTweets,
    updateTweet
} from "../controllers/tweet.controller.js";

const router=Router();

router.use(verifyJWT);


router.post('/createTweet',createTweet);
router.get('/getUserTweet',getUserTweets);
router.get('/getAllTweets',getAllTweets);
router.patch('/updateTweet/:tweetId',updateTweet);
router.delete('/deleteTweet/:tweetId',deleteTweet);

export default router;