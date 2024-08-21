import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

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
        pipeline: [
          {
            $project: {
              fullname: 1,
              avatar: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  return res.status(200).json(new ApiResponse(200, video[0], "video found"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { title, description } = req.body;

  if (!videoId) {
    throw new ApiError(400, "video id is required to update particular video");
  }

  const thumbnailsLocalPath = req.file?.path;

  const video = await Video.findById(videoId);

  if (!video.owner.equals(req.user._id)) {
    throw new ApiError(400, "you are unathorized to update this video");
  }

  if (title) {
    video.title = title;
  }
  if (description) {
    video.description = description;
  }
  if (thumbnailsLocalPath) {
    const thumbnailUrl = video.thumbnails;
    const lastIndexBackslash = thumbnailUrl.lastIndexOf("/");
    const lastIndexDot = thumbnailUrl.lastIndexOf(".");
    const public_id = thumbnailUrl.substring(
      lastIndexBackslash + 1,
      lastIndexDot
    );

    await cloudinary.uploader.destroy(public_id).then(async () => {
      const response = await uploadOnCloudinary(thumbnailsLocalPath);
      if (!response) {
        throw new ApiError(400, "error occured while uploading thumbnail");
      }

      video.thumbnails = response.url;

    }).catch(async()=>{
      throw new ApiError(400,"error occured while deleting thumbnail from cloudinary");
    });
  }
  await video.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200,video,"video updated successfully"));
});

export { publishAVideo, getVideoById, updateVideo };
