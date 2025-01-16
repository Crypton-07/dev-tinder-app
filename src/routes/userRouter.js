const express = require("express");
const User = require("../models/userSchema.js");
const userRouter = express.Router();

userRouter.get("/user", async (req, res) => {
  const user = await User.find({ email: req.body.email });
  try {
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

userRouter.delete("/user", async (req, res) => {
  const { userId } = req.body;
  try {
    if (userId) {
      await User.findByIdAndDelete(userId);
      res.status(200).send("User deleted successfully");
    }
  } catch (error) {
    res.status(500).send("Internal server error");
  }
});

userRouter.patch("/user", async (req, res) => {
  const data = req.body;
  const ALLOWED_UPDATES = [
    "firstName",
    "lastName",
    "age",
    "skills",
    "about",
    "photoUrl",
    "gender",
  ];
  try {
    const isAllowedUpdates = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    const fieldIsNotAllowed = Object.keys(data).filter(
      (k) => !ALLOWED_UPDATES.includes(k)
    );
    if (!isAllowedUpdates) {
      throw new Error(
        `Field ${fieldIsNotAllowed} is not allowed to update in user data`
      );
    }
    await User.findOneAndUpdate({ email: data.email }, data, {
      runValidators: true,
    });
    res.status(200).send("User data updated successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

userRouter.get("/feed", async (req, res) => {
  const allUsers = await User.find();
  try {
    if (allUsers.length) {
      res.status(200).send(allUsers);
    } else {
      res.status(404).send("No users found");
    }
  } catch (error) {
    console.log(error);

    res.status(500).send("Internal server error");
  }
});

module.exports = userRouter;
