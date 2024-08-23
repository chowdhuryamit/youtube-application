import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createPlaylist } from "../controllers/playList.controller.js";

const router=Router();

router.use(verifyJWT);


router.post('/createplayList',createPlaylist);

export default router;