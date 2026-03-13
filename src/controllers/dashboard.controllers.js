import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const channelId = req.user?._id

    if (!channelId) {
        throw new ApiError(401, "Unauthorized request")
    }

    const totalVideos = await Video.countDocuments({ owner: channelId })

    const viewsAggregation = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ])

    const totalViews = viewsAggregation[0]?.totalViews || 0

    const totalSubscribers = await Subscription.countDocuments({
        channel: channelId
    })

    const likesAggregation = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" }
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: { $sum: "$likesCount" }
            }
        }
    ])

    const totalLikes = likesAggregation[0]?.totalLikes || 0

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes
            },
            "Channel stats fetched successfully"
        )
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {

    const channelId = req.user?._id

    if (!channelId) {
        throw new ApiError(401, "Unauthorized request")
    }

    const videos = await Video.find({
        owner: channelId
    }).sort({ createdAt: -1 })

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Channel videos fetched successfully"
        )
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }