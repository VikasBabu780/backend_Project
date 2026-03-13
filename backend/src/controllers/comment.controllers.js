import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    // validate videoId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    const skip = (pageNumber - 1) * limitNumber

    const comments = await Comment.find({ video: videoId })
        .populate("owner", "username avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)

    return res.status(200).json(
        new ApiResponse(
            200,
            comments,
            "Video comments fetched successfully"
        )
    )
})


const addComment = asyncHandler(async (req, res) => {
    // add a comment to a video

    const { videoId } = req.params
    const { comment } = req.body

    // check comment text
    if (!comment || comment.trim() === "") {
        throw new ApiError(400, "Comment text is required")
    }

    // validate video id
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    // create comment
    const newComment = await Comment.create({
        comment: comment.trim(),
        video: videoId,
        owner: req.user._id
    })

    return res.status(201).json(
        new ApiResponse(
            201,
            newComment,
            "Comment added successfully"
        )
    )
})


const updateComment = asyncHandler(async (req, res) => {
    // update a comment

    const { commentId } = req.params
    const { comment } = req.body

    // validate commentId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    // check comment text
    if (!comment || comment.trim() === "") {
        throw new ApiError(400, "Comment text is required")
    }

    // find the comment
    const existingComment = await Comment.findById(commentId)

    if (!existingComment) {
        throw new ApiError(404, "Comment not found")
    }

    // check ownership
    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment")
    }

    // update comment
    existingComment.comment = comment.trim()
    await existingComment.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            existingComment,
            "Comment updated successfully"
        )
    )
})


const deleteComment = asyncHandler(async (req, res) => {
    // delete a comment

    const { commentId } = req.params

    // validate commentId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    // find comment
    const existingComment = await Comment.findById(commentId)

    if (!existingComment) {
        throw new ApiError(404, "Comment not found")
    }

    // check ownership
    if (existingComment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to delete this comment")
    }

    // delete comment
    await existingComment.deleteOne()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }