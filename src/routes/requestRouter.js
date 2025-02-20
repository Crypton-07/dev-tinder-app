const express = require("express");
const { userAuth } = require("../middlewares/userAuth.js");
const connectionRequestModel = require("../models/connectionRequestSchema.js");
const { ALLOWED_STATUS } = require("../utils/constants.js");
const User = require("../models/userSchema.js");
const requestRouter = express.Router();

requestRouter.post("/request/:status/:toUserId", userAuth, async (req, res) => {
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
      console.log(typeof status);
      console.log(typeof ALLOWED_STATUS.IGNORED);
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
});

module.exports = requestRouter;
