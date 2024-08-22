import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";


const addComment=asyncHandler(async(req,res)=>{
    const {videoId}=req.params;
    if (!videoId) {
        throw new ApiError(400,"video id is required");
    }

    const {content}=req.body;
    if (!content?.trim()) {
        throw new ApiError(400,"content is required");
    }

    const comment=await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
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

export{
    addComment,
    updateComment,
    deleteComment
}