import { Router } from "express";
import {toggleSubscription} from "../controllers/subscription.controller.js"
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.use(verifyJWT);

router.post('/toggleSubscription/:channelId',toggleSubscription);



export default router;