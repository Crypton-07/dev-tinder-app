const express = require("express");
const User = require("../models/userSchema.js");
const { userAuth } = require("../middlewares/userAuth.js");
const connectionRequestModel = require("../models/connectionRequestSchema.js");
const { ALLOWED_STATUS, POPULATE_DATA } = require("../utils/constants.js");
const { set } = require("mongoose");
const userRouter = express.Router();

userRouter.get("/users", userAuth, async (req, res) => {
  try {
    const allUsers = await User.find({}, { password: false });
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
      .populate(
        "fromUserId",
        POPULATE_DATA.split(" ").slice(0, POPULATE_DATA.length)
      );
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

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 20 ? 20 : limit;
    const skip = (page - 1) * limit;
    const hideProfileFromFeed = new Set();
    const allConnectionRequests = await connectionRequestModel
      .find({
        $or: [{ fromUserId: loggedInUser }, { toUserId: loggedInUser }],
      })
      .select("fromUserId toUserId");
    allConnectionRequests.forEach((user) => {
      hideProfileFromFeed.add(user.fromUserId.toString());
      hideProfileFromFeed.add(user.toUserId.toString());
    });
    const showUserInFeed = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideProfileFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(POPULATE_DATA)
      .skip(skip)
      .limit(limit);
    res.status(200).json({ data: showUserInFeed });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = userRouter;
