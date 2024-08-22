import mongoose, { Schema } from "mongoose";

const subscriptionSchemma= new mongoose.Schema({
   subscriber:{
    type:Schema.Types.ObjectId,
    ref:"User"
   },
   channel:{
    type:Schema.Types.ObjectId,
    ref:"User"
   }
},{timestamps:true})

const Subscription=mongoose.model("subscription",subscriptionSchemma);

export{
    Subscription
}