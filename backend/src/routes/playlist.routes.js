import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// PUBLIC ROUTES
router.route("/:playlistId").get(getPlaylistById);
router.route("/user/:userId").get(getUserPlaylists);

// PROTECTED ROUTES
router.route("/").post(verifyJWT, createPlaylist);

router
  .route("/:playlistId")
  .patch(verifyJWT, updatePlaylist)
  .delete(verifyJWT, deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(verifyJWT, addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyJWT, removeVideoFromPlaylist);

export default router;