import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlayList, createPlaylist, deletePlaylist, getPlaylistById, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playList.controller.js";

const router=Router();

router.use(verifyJWT);


router.post('/createplayList',createPlaylist);
router.patch('/addvideoToPlayList/:playlistId/:videoId',addVideoToPlayList);
router.patch('/removeVideoFromPlaylist/:playlistId/:videoId',removeVideoFromPlaylist);
router.delete('/deletePlayist/:playlistId',deletePlaylist);
router.patch('/updatePlaylist/:playlistId',updatePlaylist);
router.get('/getPlaylistById/:playlistId',getPlaylistById);

export default router;