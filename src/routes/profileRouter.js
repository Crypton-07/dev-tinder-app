const express = require("express");
const { userAuth } = require("../middlewares/userAuth.js");
const { validateEditProfile } = require("../utils/validate.js");
const profileRouter = express.Router();
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const userData = req.user.toObject();
    res.status(200).json({ userData });
  } catch (error) {
    console.log({ error });
    res.status(500).send(error.message);
  }
});

profileRouter.post("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfile(req)) {
      throw new Error("Invalid edit fields");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res
      .status(200)
      .json({ message: "Profile updated successfully", data: loggedInUser });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

profileRouter.post("/profile/password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const loggedInUser = req.user;
    const isOldPasswordValid = await loggedInUser.validatePassword(oldPassword);
    if (!isOldPasswordValid) {
      throw new Error("Old password is incorrect");
    }
    const hashNewPassword = await bcrypt.hash(newPassword, 10);
    loggedInUser.password = hashNewPassword;
    await loggedInUser.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message, errorCode: "0001" });
  }
});

module.exports = profileRouter;
