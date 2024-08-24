import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {getChannelVideos} from "../controllers/dashboard.controller.js"

const router=Router();

router.use(verifyJWT);


router.get('/getChannelVideos',getChannelVideos);


export default router;