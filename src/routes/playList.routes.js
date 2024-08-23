import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlayList, createPlaylist, deletePlaylist, removeVideoFromPlaylist } from "../controllers/playList.controller.js";

const router=Router();

router.use(verifyJWT);


router.post('/createplayList',createPlaylist);
router.patch('/addvideoToPlayList/:playlistId/:videoId',addVideoToPlayList);
router.patch('/removeVideoFromPlaylist/:playlistId/:videoId',removeVideoFromPlaylist);
router.delete('/deletePlayist/:playlistId',deletePlaylist);


export default router;