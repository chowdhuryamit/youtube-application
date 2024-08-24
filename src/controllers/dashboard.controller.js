import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import {User} from "../models/user.model.js"
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


const getChannelStats=asyncHandler(async(req,res)=>{
    const channelStats=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
           $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscriber",
            pipeline:[
               {
                $lookup:{
                    from:"users",
                    localField:"subscriber",
                    foreignField:"_id",
                    as:"user",
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
                    user:{
                        $arrayElemAt:["$user",0]
                    }
                 }
               },
               {
                $project:{
                    user:1
                }
               }
            ]
           }
        },
        {
           $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribed",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"channel",
                        foreignField:"_id",
                        as:"channel",
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
                        channel:{
                            $arrayElemAt:["$channel",0]
                        }
                    }
                },
                {
                    $project:{
                        channel:1
                    }
                }
            ]
           }
        },
        {
           $lookup:{
             from:"videos",
             localField:"_id",
             foreignField:"owner",
             as:"video",
             pipeline:[
                {
                    $lookup:{
                        from:"likes",
                        localField:"_id",
                        foreignField:"video",
                        as:"likes",
                    }
                },
                {
                    $lookup:{
                        from:"comments",
                        localField:"_id",
                        foreignField:"video",
                        as:"comments",
                    }
                },
                {
                    $addFields:{
                        likes:{
                            $size:"$likes"
                        }
                    }
                },
                {
                    $addFields:{
                        comments:{
                            $size:"$comments"
                        }
                    }
                },
                {
                    $project:{
                        thumbnails:1,
                        title:1,
                        duration:1,
                        views:1,
                        likes:1,
                        comments:1,
                        isPublished:1
                    }
                }
             ]
           }
        },
        {
            $addFields:{
                totalLikes:{
                    $sum:"$video.likes"
                },
                totalComments:{
                    $sum:"$video.comments"
                },
                totalViews:{
                    $sum:"$video.views"
                }
            }
        },
        {
            $project:{
                username:1,
                fullname:1,
                email:1,
                avatar:1,
                coverImage:1,
                subscriber:1,
                subscribed:1,
                video:1,
                totalLikes:1,
                totalComments:1,
                totalViews:1
            }
        }
    ])

    if (!getChannelStats) {
        throw new ApiError(400,"error occured while fetching channel statistics");
    }

    return res.status(200)
    .json(new ApiResponse(200,channelStats[0],`channel statistics fetched successfully. ${channelStats[0].subscriber.length} people subscribed your channel.you subscribed ${channelStats[0].subscribed.length} channel`));
})

export{
    getChannelVideos,
    getChannelStats,
}