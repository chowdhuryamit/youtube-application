import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";



const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!(title || description)) {
    throw new ApiError(400, "video title and description is required");
  }

  const videoFileLocalPath = req.files?.videoFile[0].path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "video file is required");
  }

  const thumbnailsLocalPath = req.files?.thumbnails[0].path;

  if (!thumbnailsLocalPath) {
    throw new ApiError(400, "thumbnails file is required");
  }

  const videoFileUploadResponse = await uploadOnCloudinary(videoFileLocalPath);

  const thumbnailfileUploadResponse =
    await uploadOnCloudinary(thumbnailsLocalPath);

  if (!videoFileUploadResponse) {
    throw new ApiError(400, "error occured while uploading video");
  }
  if (!thumbnailfileUploadResponse) {
    throw new ApiError(400, "error occured while uploading thumbnail");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFileUploadResponse?.url,
    thumbnails: thumbnailfileUploadResponse?.url,
    duration: videoFileUploadResponse?.duration,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(
      400,
      "something went wrong while uploading video on database"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video uploaded successfully"));
});


const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "video Id not found");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline:[
            {
                $project:{
                    fullname:1,
                    avatar:1,
                    username:1
                },
            },
        ]
      }
    },
    {
        $addFields:{
            owner:{
                $first:"$owner"
            }
        }
    }
  ]);


  return res.status(200).json(new ApiResponse(200, video[0], "video found"));
});

export { publishAVideo, getVideoById };
