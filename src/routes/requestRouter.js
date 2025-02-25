const express = require("express");
const { userAuth } = require("../middlewares/userAuth.js");
const connectionRequestModel = require("../models/connectionRequestSchema.js");
const { ALLOWED_STATUS } = require("../utils/constants.js");
const User = require("../models/userSchema.js");
const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      let message;
      const connectionRequest = new connectionRequestModel({
        fromUserId,
        toUserId,
        status,
      });
      const toUser = await User.findById(toUserId);
      const existingRequest = await connectionRequestModel.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (!toUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (
        ALLOWED_STATUS.INTERESTED !== status &&
        ALLOWED_STATUS.IGNORED !== status
      ) {
        return res
          .status(400)
          .json({ message: `Inavalid request status: ${status}` });
      }
      if (existingRequest) {
        return res
          .status(400)
          .json({ message: "Connection request already exists" });
      }
      if (status === ALLOWED_STATUS.INTERESTED) {
        message = `${req.user.firstName} has sent the connection request to ${toUser.firstName}`;
      }
      if (status === ALLOWED_STATUS.IGNORED) {
        message = `${req.user.firstName} has ignored the connection request for ${toUser.firstName}`;
      }
      const data = await connectionRequest.save();
      res.json({ message: message, data });
    } catch (err) {
      res.json({ message: err.message });
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user._id;
      const { status, requestId } = req.params;
      // if (
      //   status === ALLOWED_STATUS.ACCEPTED ||
      //   status === ALLOWED_STATUS.REJECTED
      // ) {
      //   return res
      //     .status(400)
      //     .json({ message: `Request is already ${status}` });
      // }
      if (
        ALLOWED_STATUS.ACCEPTED !== status &&
        ALLOWED_STATUS.REJECTED !== status
      ) {
        return res.status(400).json({ message: `Invalid request status` });
      }
      const connectionRequest = await connectionRequestModel.findOne({
        _id: requestId,
        toUserId: loggedInUser,
        status: ALLOWED_STATUS.INTERESTED,
      });
      if (!connectionRequest) {
        return res.status(404).json({ message: "Request id not found" });
      }
      connectionRequest.status = status;
      await connectionRequest.save();
      res.json({
        message: `Connection request ${status} successfully`,
        data: connectionRequest,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = requestRouter;
