import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET,
    secure:true
})

const uploadOnCloudinary=async (localFilePath)=>{
   try {
     if (!localFilePath) {
        return null;
     }
     else{
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // console.log('file uploaded successfully',response.url);
        fs.unlinkSync(localFilePath);
        return response;
     }
   } catch (error) {
     fs.unlinkSync(localFilePath);//remove locally stored file as the upload operation got failed
     return null;
   }
}

export {
    uploadOnCloudinary
}