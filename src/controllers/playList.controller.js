import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;
    if (!name) {
        throw new ApiError(400,"name is required");
    }
    if (!description) {
        throw new ApiError(400,"description is required");
    }

    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user._id
    })

    if (!playlist) {
        throw new ApiError(400,"playlist is not created");
    }

    return res.status(200)
    .json(new ApiResponse(200,playlist,"playlist is created successfully"));
})



export{
    createPlaylist,
}