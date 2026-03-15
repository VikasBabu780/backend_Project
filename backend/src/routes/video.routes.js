import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

//  Optional auth middleware — sets req.user if token exists, doesn't fail if not
const optionalAuth = (req, res, next) => {
  const token = req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "")

  if (!token) return next() // no token — continue as guest

  import("jsonwebtoken").then(({ default: jwt }) => {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      import("../models/user.models.js").then(({ User }) => {
        User.findById(decoded._id).select("-password -refreshToken").then((user) => {
          if (user) req.user = user
          next()
        })
      })
    } catch {
      next() // invalid token — continue as guest
    }
  })
}

/* ---------- Public Routes ---------- */
router.route("/").get(getAllVideos)

// Use optionalAuth so req.user is set for logged-in users
router.route("/:videoId").get(optionalAuth, getVideoById)

/* ---------- Protected Routes ---------- */
router.use(verifyJWT)

router.route("/").post(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  publishAVideo
)

router.route("/:videoId")
  .patch(upload.single("thumbnail"), updateVideo)
  .delete(deleteVideo)

router.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default router