import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// PUBLIC
router.route("/:videoId").get(getVideoComments);

// PROTECTED
router.route("/:videoId").post(verifyJWT, addComment);
router.route("/:commentId").delete(verifyJWT, deleteComment);
router.route("/:commentId").patch(verifyJWT, updateComment);

export default router;