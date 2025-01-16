const express = require("express");
const validateSignup = require("../utils/validate.js");
const bcrypt = require("bcrypt");
const User = require("../models/userSchema.js");
const validator = require("validator");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    // Validate the request body
    validateSignup(req);
    const {
      email,
      password,
      firstName,
      lastName,
      gender,
      skills,
      about,
      photoUrl,
      age,
    } = req.body;

    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user data
    const userData = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      age,
      about,
      skills,
      gender,
      photoUrl,
    });
    await userData.save();
    res.status(201).send("User data saved successfully");
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validator.isEmail(email)) {
      throw new Error("Invalid credentials");
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordMatched = await user.validatePassword(password);
    if (isPasswordMatched) {
      const token = await user.getJwtToken();
      res.cookie("token", token);
      res.status(200).send("Login successful");
    } else {
      res.status(400).send("Invalid credentials");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = authRouter;
