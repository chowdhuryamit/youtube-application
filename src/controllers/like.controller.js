import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";


const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if (!videoId) {
        throw new ApiError(200,"video id is required");
    }

    const videoLiked=await Like.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    if (videoLiked.length<=0) {
        const like=await Like.create({
            video:videoId,
            likedBy:req.user._id
        });

        if (!like) {
            throw new ApiError(400,"error occured while creating like in database");
        }
        return res.status(200)
        .json(new ApiResponse(200,like,"you liked this video"));
    }

    try {
        const like=await Like.findOneAndDelete({video:videoId,likedBy:req.user._id});
        if (!like) {
            throw new ApiError(400,"error occured while deleting like from database");
        }
        return res.status(200)
        .json(new ApiResponse(200,like,"you dislike this video"));
    } catch (error) {
        throw new ApiError(400,"error occured while updating like toggle on video");
    }
})

export{
    toggleVideoLike
}


