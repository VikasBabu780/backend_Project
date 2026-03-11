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

/* ---------- Public Routes ---------- */

router.route("/")
.get(getAllVideos);

router.route("/:videoId")
.get(getVideoById);


/* ---------- Protected Routes ---------- */

router.use(verifyJWT);

router.route("/")
.post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
);

router.route("/:videoId")
.patch(upload.single("thumbnail"), updateVideo)
.delete(deleteVideo);

router.route("/toggle/publish/:videoId")
.patch(togglePublishStatus);

export default router;