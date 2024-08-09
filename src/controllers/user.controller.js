import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAcessAndRefreshToken=async(userId)=>{
   try {
     const user= await User.findById(userId);
     const accessToken=await user.generateAccessToken();
     const refreshToken=await user.generateRefreshToken();

     user.refreshToken=refreshToken;
     //console.log(user);
     await user.save({validateBeforeSave:false});

     return {accessToken,refreshToken};

   } catch (error) {
     throw new ApiError(500,"something went wrong while creating access token and refresh token");
   }
}

const registerUser=asyncHandler(async(req,res)=>{
   const {username,email,fullname,password}=req.body;

   if (fullname===""||email===""||username===""||password==="") {
     throw new ApiError(400,"all fields are required");
   }

   const existinUser=await User.findOne({
    $or:[{username},{password},{email}]
   })

   if (existinUser) {
     throw new ApiError(400,"user already has account try different username or password or email")
   }

   const avatarLocalPath=req.files?.avatar[0]?.path;
   //const coverImageLocalPath=req.files?.coverImage[0]?.path;
   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0) {
     coverImageLocalPath=req.files.coverImage[0].path;
   }
   

   if (!avatarLocalPath) {
      throw new ApiError(400,"avatar is required");
   }

   const avatar=await uploadOnCloudinary(avatarLocalPath);
   const coverImage=await uploadOnCloudinary(coverImageLocalPath);

   if (!avatar) {
      throw new ApiError(400,"avatar is not uploaded successfully");
   }

   const user=await User.create({
      username:username.toLowerCase(),
      email,
      fullname,
      avatar:avatar.url,
      coverImage:coverImage?.url||"",
      password
   })

   const createdUser=await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if (!createdUser) {
     throw new ApiError(500,"something went wrong while registering new user");
   }

   return res.status(201).json(
     new ApiResponse(200,createdUser,"user registered successfully")
   )
})


const loginUser=asyncHandler(async(req,res)=>{
   const {username,email,password}=req.body; 

   if (!(username||email)) {
     throw new ApiError(400,"email or username is required");
   }

   const user=await User.findOne({
    $or:[{username},{email}]
   });

   if (!user) {
     throw new ApiError(404,"user is not registered");
   }
    
   const isPasswordValid=await user.isPasswordCorrect(password);

   if (!isPasswordValid) {
     throw new ApiError(401,"invalid password");
   }

   const {accessToken,refreshToken}=await generateAcessAndRefreshToken(user._id);

   const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

   const options={
      httpOnly:true,
      secure:true
    }
    
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "user logedin successfully"
        )
    )
})


const logoutUser=asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
    req.user._id,
    {
        $unset:{
            refreshToken:1
        }
    },
    {
        new:true
    }
   )

   const options={
    httpOnly:true,
    secure:true
  }

   return res.status(200)
   .clearCookie('accessToken',options)
   .clearCookie('refreshToken',options)
   .json(
    new ApiResponse(200,{},"user logged out")
   )


})


const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incommingRefreshToken=req.cookies.refreshToken||req.body.refreshToken;

  if(!incommingRefreshToken){
    throw new ApiError(401,"unothorized request");
  }

  try {
    const decodedRefreshToken=jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
  
    const user=await User.findById(decodedRefreshToken?._id);
     
    if (!user) {
       throw new ApiError(400,"invalid refresh token");
    }
  
    if (incommingRefreshToken!==user.refreshToken) {
       throw new ApiError(400,"refresh token is expired or in valid");
    }
  
    const options={
      httpOnly:true,
      secure:true
    }
  
    const {accessToken,refreshToken}=await generateAcessAndRefreshToken(user.Id);
  
    res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,refreshToken
        },
        "accessToken refreshed successfully"
      )
    )
  } catch (error) {
     throw new ApiError(401,error?.message||"invalid refresh token");
  }
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}