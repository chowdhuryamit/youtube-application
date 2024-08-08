import mongoose, { model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const UserSchemma=new mongoose.Schema({
   username:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true,
    index:true
   },
   email:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    lowercase:true
   },
   fullname:{
    type:String,
    required:true,
    trim:true,
    index:true
   },
   avatar:{
    type:String,
    required:true,
   },
   coverImage:{
    type:String
   },
   watchHistory:[
    {
        type:Schema.Types.ObjectId,
        ref:"Video"
    }
   ],
   password:{
    type:String,
    required:[true,"password is required"]
   },
   refreshToken:{
    type:String,
   }
},{timestamps:true});

UserSchemma.pre("save",async function(next) {
    if (this.isModified("password")) {
        this.password=await bcrypt.hash(this.password,10);
        next();
    }
})

UserSchemma.methods.isPasswordCorrect=async function(password) {
    return await bcrypt.compare(password,this.password);
}

UserSchemma.methods.generateAccessToken=async function () {
   return jwt.sign({
        _id:this._id,
        username:this.username,
        fullname:this.fullname,
        email:this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}

UserSchemma.methods.generateRefreshToken=async function () {
    return jwt.sign({
         _id:this._id,
     },
     process.env.REFRESH_TOKEN_SECRET,
     {
       expiresIn:process.env.REFRESH_TOKEN_EXPIRY
     })
 }

const User=mongoose.model('User',UserSchemma);

export{
    User
}