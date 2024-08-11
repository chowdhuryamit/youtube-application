import mongoose, { model, Schema } from "mongoose";

const playlistSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    video:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true});

const Playlist=mongoose.model("Playlist",playlistSchema);
export{
    Playlist
}