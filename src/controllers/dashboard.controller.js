import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";


const getChannelVideos=asyncHandler(async(req,res)=>{
    const videos=await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $project:{
                thumbnails:1,
                title:1,
                views:1,
                duration:1,
                isPublished:1
            }
        }
    ])

    if (!videos) {
        throw new ApiError(400,"you dont have any published videos");
    }

    return res.status(200)
    .json(new ApiResponse(200,videos,`you have published ${videos.length} videos`));
})

export{
    getChannelVideos
}