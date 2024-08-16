import { Router } from "express";
import { loginUser, 
    logoutUser, 
    registerUser,
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateDetails, 
    updateAvatar, 
    updateCoverImage, 
    getUserChannelProfile, 
    getWathHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.post('/register',
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

router.post('/login',loginUser)    

//secure route
router.post('/logout',verifyJWT,logoutUser);
router.post('/refresh-token',refreshAccessToken);
router.post('/changePassword',verifyJWT,changeCurrentPassword);
router.get('/get-user',verifyJWT,getCurrentUser);
router.patch('/update-Details',verifyJWT,updateDetails);
router.patch('/update/avatar',verifyJWT,upload.single("avatar"),updateAvatar);
router.patch('/update/cover_image',verifyJWT,upload.single("coverImage"),updateCoverImage);
router.get('/channel/:username',verifyJWT,getUserChannelProfile);
router.get('/watchHistory',verifyJWT,getWathHistory);


export default router;