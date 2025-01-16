const express = require("express");
const { userAuth } = require("../middlewares/userAuth.js");
const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const userData = req.user.toObject();
    delete userData.password;
    res.status(200).send(userData);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = profileRouter;
