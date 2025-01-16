const express = require("express");
const { userAuth } = require("../middlewares/userAuth.js");
const requestRouter = express.Router();

requestRouter.post("/sendRequest", userAuth, async (req, res) => {
  const user = req.user;
  res.send("Request sent by " + user.firstName);
});

module.exports = requestRouter;
