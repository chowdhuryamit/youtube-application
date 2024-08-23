import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

//import all routes
import userRoutes from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";
import subscriptionRoutes  from "./routes/subscription.routes.js";
import commentRoutes from "./routes/comment.routes.js"
import likeRoutes from "./routes/like.routes.js"


app.use('/api/v1/user',userRoutes);
app.use('/api/v1/video',videoRoutes);
app.use('/api/v1/subscription',subscriptionRoutes);
app.use('/api/v1/comment',commentRoutes);
app.use('/api/v1/like',likeRoutes);

export default app;