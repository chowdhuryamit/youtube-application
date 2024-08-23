import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlayList, createPlaylist } from "../controllers/playList.controller.js";

const router=Router();

router.use(verifyJWT);


router.post('/createplayList',createPlaylist);
router.patch('/addvideoToPlayList/:playlistId/:videoId',addVideoToPlayList);

export default router;