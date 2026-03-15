import { Router } from 'express';
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
} from "../controllers/like.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router();
router.use(verifyJWT);

//  Fix paths to match frontend likeAPI.js calls
router.route("/toggle/v/:videoId").post(toggleVideoLike);     // was /toggle/video/:videoId
router.route("/toggle/c/:commentId").post(toggleCommentLike); // was /toggle/comment/:commentId
router.route("/toggle/t/:tweetId").post(toggleTweetLike);     // was /toggle/tweet/:tweetId
router.route("/videos").get(getLikedVideos);

export default router