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

const addVideoToPlayList=asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params;
    if (!playlistId) {
        throw new ApiError(404,"playList id is required");
    }
    if (!videoId) {
        throw new ApiError(400,"video id is required");
    }

    const playList=await Playlist.findById(playlistId);
    if (!playList) {
        throw new ApiError(400,"invalid playlist id");
    }
    if (playList.owner.toString()!==req.user._id.toString()){
        throw new ApiError(401,"you are not the owner of this playlist");
    }

    playList.video.push(videoId);

    try {
        await playList.save({validateBeforeSave:false})
    } catch (error) {
        throw new ApiError(400,"error occured while saving video on playlist");
    }

    return res.status(200)
    .json(new ApiResponse(200,playList,"video added to playlist"))
})

export{
    createPlaylist,
    addVideoToPlayList
}