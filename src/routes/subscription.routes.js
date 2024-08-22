import { Router } from "express";
import {getSubscribedChannels, toggleSubscription} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.use(verifyJWT);

router.post('/toggleSubscription/:channelId',toggleSubscription);
router.get('/getSubscibedChannels',getSubscribedChannels);



export default router;