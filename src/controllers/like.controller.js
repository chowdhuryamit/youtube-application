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


const toggleCommentLike=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    if (!commentId) {
        throw new ApiError(200,"comment id is required");
    }

    const commentLiked=await Like.aggregate([
        {
            $match:{
                comment:new mongoose.Types.ObjectId(commentId)
            }
        },
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    if (commentLiked.length<=0) {
        const like=await Like.create({
            comment:commentId,
            likedBy:req.user._id
        });

        if (!like) {
            throw new ApiError(400,"error occured while creating like in database");
        }
        return res.status(200)
        .json(new ApiResponse(200,like,"you liked this comment"));
    }

    try {
        const like=await Like.findOneAndDelete({comment:commentId,likedBy:req.user._id});
        if (!like) {
            throw new ApiError(400,"error occured while deleting like from database");
        }
        return res.status(200)
        .json(new ApiResponse(200,like,"you dislike this comment"));
    } catch (error) {
        throw new ApiError(400,"error occured while updating like toggle on comment");
    }
})


const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    if (!tweetId) {
        throw new ApiError(200,"tweet id is required");
    }

    const tweetLiked=await Like.aggregate([
        {
            $match:{
                tweet:new mongoose.Types.ObjectId(tweetId)
            }
        },
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    if (tweetLiked.length<=0) {
        const like=await Like.create({
            tweet:tweetId,
            likedBy:req.user._id
        });

        if (!like) {
            throw new ApiError(400,"error occured while creating like in database");
        }
        return res.status(200)
        .json(new ApiResponse(200,like,"you liked this tweet"));
    }

    try {
        const like=await Like.findOneAndDelete({tweet:tweetId,likedBy:req.user._id});
        if (!like) {
            throw new ApiError(400,"error occured while deleting like from database");
        }
        return res.status(200)
        .json(new ApiResponse(200,like,"you dislike this tweet"));
    } catch (error) {
        throw new ApiError(400,"error occured while updating like toggle on comment");
    }
})


const getAllLikedVideo=asyncHandler(async(req,res)=>{
    const { page = 1, limit = 10 } = req.query
    const parsedLimit = parseInt(limit);
    const pageSkip = (page - 1) * parsedLimit;
    
    const allVideo=await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $match:{
                video:{$exists:true}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
                    {
                        $project:{
                            thumbnails:1,
                            title:1,
                            description:1,
                            duration:1,
                            views:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                video:{$arrayElemAt:["$video",0]}
            }
        },
        {
            $project:{
                video:1
            }
        },
        {
            $skip: pageSkip,
        },
        {
            $limit: parsedLimit,
        }
    ])

    return res.status(200)
    .json(new ApiResponse(200,allVideo,`you liked ${allVideo.length} videos`));
})

export{
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getAllLikedVideo
}


