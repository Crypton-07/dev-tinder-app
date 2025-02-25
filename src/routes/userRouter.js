const express = require("express");
const User = require("../models/userSchema.js");
const { userAuth } = require("../middlewares/userAuth.js");
const connectionRequestModel = require("../models/connectionRequestSchema.js");
const { ALLOWED_STATUS, POPULATE_DATA } = require("../utils/constants.js");
const userRouter = express.Router();

userRouter.get("/users", userAuth, async (req, res) => {
  try {
    const allUsers = await User.find();
    res.json({ data: allUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const allConnectionRequests = await connectionRequestModel
      .find({
        toUserId: loggedInUser,
        status: ALLOWED_STATUS.INTERESTED,
      })
      .populate("fromUserId", POPULATE_DATA.split(" ").slice(0, 2));
    res.status(200).json({
      message: "Connection requests fetched successfully",
      data: allConnectionRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const connectionRequest = await connectionRequestModel
      .find({
        $or: [
          { toUserId: loggedInUser, status: ALLOWED_STATUS.ACCEPTED },
          { fromUserId: loggedInUser, status: ALLOWED_STATUS.ACCEPTED },
        ],
      })
      .populate("fromUserId", POPULATE_DATA)
      .populate("toUserId", POPULATE_DATA);

    const data = connectionRequest.map((userData) => {
      if (loggedInUser.equals(userData.fromUserId._id)) {
        return userData.toUserId;
      }
      return userData.fromUserId;
    });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
module.exports = userRouter;
