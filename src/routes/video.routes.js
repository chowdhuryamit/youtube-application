import { Router } from "express";
import {publishAVideo,getVideoById} from "../controllers/video.controller.js"
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.use(verifyJWT);

router.post('/publish',
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnails",
            maxCount:1
        }
    ]),
    publishAVideo);

router.get('/getvideo/:videoId',getVideoById);




export default router;