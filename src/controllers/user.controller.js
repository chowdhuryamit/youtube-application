import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser=asyncHandler(async(req,res)=>{
   const {username,email,fullname,password}=req.body;

   if (fullname===""||email===""||username===""||password==="") {
     throw new ApiError(400,"all fields are required");
   }

   const existinUser=User.findOne({
    $or:[{username},{password},{email}]
   })

   if (existinUser) {
     throw new ApiError(400,"user already has account try different username or password or email")
   }

   const avatarLocalPath=req.files?.avatar[0]?.path;
   const coverImageLocalPath=req.files?.coverImage[0]?.path;

   if (!avatarLocalPath) {
      throw new ApiError(400,"avatar is required");
   }

   const avatar=await uploadOnCloudinary(avatarLocalPath);
   const coverImage=await uploadOnCloudinary(coverImageLocalPath);

   if (!avatar) {
      throw new ApiError(400,"avatar is required");
   }

   const user=await User.create({
      username:username.toLowerCase(),
      email,
      fullname,
      avatar:avatar.url,
      coverImage:coverImage?.url||"",
      password
   })

   const createdUser=User.findById(user._id).select(
    "-password -refreshToken"
   )
   if (!createdUser) {
     throw new ApiError(500,"something went wrong while registering new user");
   }

   return res.status(201).json(
     new ApiResponse(200,createdUser,"user registered successfully")
   )
})

export {
    registerUser
}