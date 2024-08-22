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




export{
    addComment
}