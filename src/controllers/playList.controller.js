import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";


const createPlaylist=asyncHandler(async(req,res)=>{
    const {name,description}=req.body;
    if (!name) {
        throw new ApiError(400,"name is required");
    }
    if (!description) {
        throw new ApiError(400,"description is required");
    }

    const playlist=await Playlist.create({
        name:name.trim(),
        description:description.trim(),
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

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
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

    if (playList.owner.toString()!==req.user._id.toString()) {
        throw new ApiError(400,"you are not the owner of this playlist");
    }

    playList.video=playList.video.filter(vid=>vid.toString()!==videoId.toString());

    try {
        await playList.save({validateBeforeSave:false});
    } catch (error) {
        throw new ApiError(400,"error occured while delete video from playlist");
    }

    return res.status(200)
    .json(new ApiResponse(200,playList,"video removed from playlist"));

})

const deletePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    if (!playlistId) {
        throw new ApiError(404,"playlist id is required");
    }

    const playList=await Playlist.findById(playlistId);
    if (!playList) {
        throw new ApiError(400,"invalid playlist id");
    }

    if (playList.owner.toString()!==req.user._id.toString()) {
        throw new ApiError(400,"you are not the owner of this playlist");
    }

    try {
        await Playlist.findByIdAndDelete(playlistId);
    } catch (error) {
        throw new ApiError(400,"error occured while deleting playlist");
    }

    return res.status(200)
    .json(new ApiResponse(200,"playlist deleted successfully"));
})

const updatePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    if (!playlistId) {
        throw new ApiError(404,"playlist id is required");
    }

    const {name,description}=req.body;

    const playList=await Playlist.findById(playlistId);
    if (!playList) {
        throw new ApiError(400,"invalid playlist id");
    }

    if (!playList.owner.equals(req.user._id)) {
        throw new ApiError(400,"you are not the owner of the playlist");
    }

    // if (name) {
    //     playList.name=name;
    // }
    // if (description) {
    //     playList.description=description;
    // }

    try {
        await Playlist.findByIdAndUpdate(playlistId,{
            $set:{
                name:name?.trim()||playList.name,
                description:description?.trim()||playList.description
            }
        })
    } catch (error) {
        throw new ApiError(400,"error occured while updating playlist")
    }

    return res.status(200)
    .json(new ApiResponse(200,"playlist updated successfully"));

})

const getPlaylistById=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params;
    if (!playlistId) {
        throw new ApiError(404,"playlist id is required");
    }

    const playList=await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistId)
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
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
                pipeline:[
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
                ]
            }
        },
        {
            $addFields:{
                totalVideos:{
                    $size:"$video"
                }
            }
        }
    ])

    if (playList.length<=0) {
        throw new ApiError(400,"playlist does not exist");
    }

    return res.status(200)
    .json(new ApiResponse(200,playList[0],"playlist fetched successfully"));
})

const getUserPlaylist=asyncHandler(async(req,res)=>{
    const playList=await Playlist.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
           $addFields:{
            totalVideos:{
                $size:"$video"
            }
           }
        }
    ])

    if (playList.length<=0) {
        throw new ApiError("playlist does not exist");
    }

    return res.status(200)
    .json(new ApiResponse(200,playList,"all playlist fetched successfully"));
})

export{
    createPlaylist,
    addVideoToPlayList,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    getPlaylistById,
    getUserPlaylist
}