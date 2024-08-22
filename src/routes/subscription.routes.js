import { Router } from "express";
import {getSubscribedChannels, getSubscriber, toggleSubscription} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.use(verifyJWT);

router.post('/toggleSubscription/:channelId',toggleSubscription);
router.get('/getSubscibedChannels',getSubscribedChannels);
router.get('/getSubscriber',getSubscriber);



export default router;