import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import fs, { stat } from "fs";
import { v2 as cloudinary } from "cloudinary";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    // filter object
    let filter = {}

    if(query){
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }

    if(userId && isValidObjectId(userId)){
        filter.owner = userId
    }

    // sorting
    let sortOptions = {}

    if(sortBy){
        sortOptions[sortBy] = sortType === "asc" ? 1 : -1
    }else{
        sortOptions.createdAt = -1
    }

    // pagination
    const skip = (page - 1) * limit

    const videos = await Video
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .populate("owner","username avatar")

    const totalVideos = await Video.countDocuments(filter)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                page: Number(page),
                limit: Number(limit),
                videos
            },
            "Videos fetched successfully"
        )
    )

})



const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    
    // checking input validity
    if(!title?.trim() || !description?.trim()){
        throw new ApiError(400,"Title and Description are required ")
    }

    // getting video and thumbnail using multer
    const videoFilePath = req.files?.videoFile?.[0]?.path;
    const thumbnailFilePath = req.files?.thumbnail?.[0]?.path;

    // checking validity for videofile path required
    if(!videoFilePath){
        throw new ApiError(400,"Video file is required")
    }

    // upload on cloudinary

    let videoUpload, thumbnailUpload = null;
    try {
        videoUpload = await uploadOnCloudinary(videoFilePath)
        if (!videoUpload?.secure_url) {
            throw new ApiError(500, "Video Upload failed")
        }

        if (thumbnailFilePath) {
            thumbnailUpload = await uploadOnCloudinary(thumbnailFilePath)
            if (!thumbnailUpload?.secure_url) {
                throw new ApiError(500, "Thumbnail Upload failed")
            }
        }
    } catch (error) {
        throw new ApiError(500, `Cloudinary upload failed: ${error.message}`);
    } 

    // saving video details in database
    const newVideo = await Video.create({
        title,
        description,
        videoFile: videoUpload.secure_url,
        thumbnail: thumbnailUpload?.secure_url || null,
        owner: req.user._id,                               // req.user comes from your auth middleware
    });

    // return response
    return res
    .status(201)
    .json(new ApiResponse(201,newVideo,"Video Uploaded Successfully"))
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // validate video id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    // Find video by id
    const video = await Video.findById(videoId).populate("owner","username email")

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // return response
    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video recieved Successfully !"))
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    // validate video id
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    // find video
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    console.log(req.user)
    // check ownership
    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to update this video")
    }

    // thumbnail update
    const thumbnailPath = req.file?.path

    if(thumbnailPath){
        const thumbnailUpload = await uploadOnCloudinary(thumbnailPath)

        if(!thumbnailUpload?.secure_url){
            throw new ApiError(500,"Thumbnail upload failed")
        }

        video.thumbnail = thumbnailUpload.secure_url
    }

    // update fields
    if(title){
        video.title = title
    }

    if(description){
        video.description = description
    }

    await video.save()

    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video updated successfully"))

})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to delete this video")
    }

    const getPublicId = (url) => {
        const parts = url.split("/")
        const filename = parts[parts.length - 1]
        return filename.split(".")[0]
    }

    const videoPublicId = getPublicId(video.videoFile)

    await cloudinary.uploader.destroy(videoPublicId,{ resource_type: "video" })

    if(video.thumbnail){
        const thumbnailPublicId = getPublicId(video.thumbnail)
        await cloudinary.uploader.destroy(thumbnailPublicId)
    }

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Video deleted successfully"))

})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to modify this video")
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            `Video ${video.isPublished ? "published" : "unpublished"} successfully`
        )
    )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}