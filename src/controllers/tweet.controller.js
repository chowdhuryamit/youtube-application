import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";


const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body;
    if (!content?.trim()) {
        throw new ApiError(400,"tweet content is required");
    }

    const tweet=await Tweet.create({
        content,
        owner:req.user._id
    })

    if (!tweet) {
        throw new ApiError(400,"error occured while tweeting");
    }

    return res.status(200)
    .json(new ApiResponse(200,tweet,"tweet created successfully"));
})


const getUserTweets=asyncHandler(async(req,res)=>{

    const tweets=await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user._id)
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
        }
    ])

    if (tweets.length<=0) {
        throw  new ApiError(404,"error occured while fetching tweets");
    }
    return res.status(200)
    .json(new ApiResponse(200,
    tweets,
    `tweets fetched successfully.you have tweeted ${tweets.length} tweet`
    ));
})


const getAllTweets=asyncHandler(async(req,res)=>{
    const { page = 1, limit = 4, sortBy, sortType} = req.query

    const parsedLimit = parseInt(limit);
    const pageSkip = (page - 1) * parsedLimit;
    const sortStage={};
    sortStage[sortBy] = sortType === 'asc' ? 1 : -1;

    const tweets=await Tweet.aggregate([
        {
            $sort:sortStage
        },
        {
            $skip: pageSkip,
        },
        {
            $limit: parsedLimit,
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
        }
    ])

    if (tweets.length<=0) {
        throw new ApiError(404,"error occured while fetching tweets")
    }

    return res.status(200)
    .json(new ApiResponse(200,tweets,`${tweets.length} tweets fetched successfully`));
})

const updateTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    if (!tweetId) {
        throw new ApiError(400,"tweet id is required");
    }

    const {updateContent}=req.body;
    if (!updateContent) {
        throw new ApiError(400,"updated content is required");
    }

    const tweet=await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(400,"invalid tweet id")
    }

    if(tweet.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"you are not the owner of this tweet");
    }

    const updatedTweet=await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
           content:updateContent
        }
    },
    {
        new:true
    })

    if (!updatedTweet) {
        throw new ApiError(400,"tweet updation is unsuccessfull");
    }

    return res.status(200)
    .json(new ApiResponse(200,updatedTweet,"tweet updated successfully"));
})


const deleteTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params;
    if(!tweetId){
        throw new ApiError(400,"tweet id is required");
    }

    const tweet=await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(400,"invalid tweet id");
    }

    if(tweet.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400,"you are not the owner of this tweet");
    }

    try {
        await Tweet.findByIdAndDelete(tweetId);
    } catch (error) {
        throw new ApiError(400,"error occured while deleting tweet");
    }

    return res.status(200)
    .json(new ApiResponse(200,"tweet deleted successfully"));
})

export{
    createTweet,
    getUserTweets,
    getAllTweets,
    updateTweet,
    deleteTweet
}