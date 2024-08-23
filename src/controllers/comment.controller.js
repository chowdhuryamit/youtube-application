import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";


const addComment=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if (!videoId) {
        throw new ApiError(400,"video id is required");
    }

    const {content}=req.body;
    if (!content?.trim()) {
        throw new ApiError(400,"content is required");
    }

    const userId=req.user._id;
    if (!userId) {
        throw new ApiError(400,"you have to login in your account");
    }
    const comment=await Comment.create({
        content,
        video:videoId,
        owner:userId
    })

    if (!comment) {
        throw new ApiError(400,"error occured while creating comment");
    }
    return res.status(200)
    .json(new ApiResponse(200,comment,"comment added"))
})


const updateComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    if (!commentId) {
        throw new ApiError(400,"comment id is required to edit comment");
    }

    const {content}=req.body;
    if(!content?.trim()){
        throw new ApiError(400,"content is required to edit comment");
    }

    const comment=await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(400,"comment does not exist");
    }

    if (!comment.owner.equals(req.user._id)) {
        throw new ApiError(400,"you are not authorized");
    }

    comment.content=content;

    try {
        await comment.save({validateBeforeSave:false});
    } catch (error) {
        throw new ApiError(400,"error occured while updating comment")
    }

    return res.status(200)
    .json(new ApiResponse(200,comment,"comment updated successfully"));
})


const deleteComment=asyncHandler(async(req,res)=>{
    const {commentId}=req.params;
    if (!commentId) {
        throw new ApiError(400,"comment id is required");
    }

    const comment=await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(400,"comment does not exist");
    }
    if (!comment.owner.equals(req.user._id)) {
        throw new ApiError(400,"you are not authorized to delete comment");
    }

    try {
        await Comment.findByIdAndDelete(commentId);
    } catch (error) {
        throw new ApiError(400,"error occured while deleting comment");
    }

    return res.status(200)
    .json(new ApiResponse(200,comment,"comment deleted successfully"));

})


const getAllComments=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    

    if (!videoId) {
        throw new ApiError(400,"video is is required");
    }
    const { page = 1, limit = 10 } = req.query
    const parsedLimit = parseInt(limit);
    const pageSkip = (page - 1) * parsedLimit;

    const comments=await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{$arrayElemAt:["$owner",0]}
            }
        },
        {
            $skip: pageSkip,
        },
        {
            $limit: parsedLimit,
        },
        {
            $project:{
                content:1,
                owner:1,
                updatedAt:1
            }
        }
    ])
    

    if (!comments) {
        throw new ApiError(400,"could not fetch comments on this video")
    }

    return res.status(200)
    .json(new ApiResponse(200,comments,`${videoId} has ${comments.length} comments`));
})

export{
    addComment,
    updateComment,
    deleteComment,
    getAllComments
}