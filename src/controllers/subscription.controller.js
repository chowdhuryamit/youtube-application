import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Subscription} from "../models/subscription.model.js"
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose, { mongo } from "mongoose";


const toggleSubscription=asyncHandler(async(req,res)=>{
    const {channelId}=req.params;

    if (!channelId) {
        throw new ApiError(400,"channel id is required");
    }

    const data=await Subscription.aggregate([
        {
            $match:{
               channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])
    
    if (data.length>0) {
        await Subscription.findByIdAndDelete(data[0]._id);
        return res.status(200)
        .json(new ApiResponse(200,data[0],`${data[0].channel} is unsubscribed successfully`));
    }

    const subscribed=await Subscription.create({
        subscriber:req.user._id,
        channel:channelId
    })

    if (!subscribed) {
        throw new ApiError(400,"error occured while subscribing a channel");
    }

    return res.status(200)
    .json(new ApiResponse(
    200,
    subscribed,
    `you successfully subscribed this ${subscribed.channel} channel`));
})

export{
    toggleSubscription
}