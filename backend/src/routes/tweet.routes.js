import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// PUBLIC ROUTE
router.route("/user/:userId").get(getUserTweets);

// PROTECTED ROUTES
router.route("/").post(verifyJWT, createTweet);
router.route("/:tweetId")
  .patch(verifyJWT, updateTweet)
  .delete(verifyJWT, deleteTweet);

export default router;