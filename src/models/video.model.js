import mongoose, { model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchemma=new mongoose.Schema({
   videoFile:{
    type:String,
    required:true,
   },
   thumbnails:{
    type:String,
    required:true,
   },
   title:{
    type:String,
    required:true,
   },
   description:{
    type:String,
    required:true,
   },
   duration:{
    type:Number,
    required:true,
   },
   views:{
    type:Number,
    default:0,
   },
   isPublished:{
    type:Boolean,
    default:true,
   },
   owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
   }
},{timestamps:true})

videoSchemma.plugin(mongooseAggregatePaginate);

const Video=mongoose.model("Video",videoSchemma);

module.exports=Video;