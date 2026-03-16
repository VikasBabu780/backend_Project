import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

// PUBLIC ROUTES
router.route("/channel/:channelId").get(getUserChannelSubscribers);
router.route("/user/:subscriberId").get(getSubscribedChannels);

// PROTECTED ROUTE
router.route("/channel/:channelId").post(verifyJWT, toggleSubscription);

export default router;