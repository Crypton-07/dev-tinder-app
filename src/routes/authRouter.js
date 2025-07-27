const express = require("express");
const { validateSignup } = require("../utils/validate.js");
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
    const savedUser = await userData.save();
    const token = await savedUser.getJwtToken();
    res.cookie("token", token);
    const userInfo = await savedUser.removePassword();
    res.json({ message: "User created successfully", data: userInfo });
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
      return res.status(400).json("Invalid credentials");
    }
    const isPasswordMatched = await user.validatePassword(password);
    if (isPasswordMatched) {
      const token = await user.getJwtToken();
      res.cookie("token", token);
      const userInfo = user.removePassword();
      return res.status(200).json(userInfo);
    } else {
      return res.status(400).json("Invalid credentials");
    }
  } catch (error) {
    res.status(500).send({ error });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, { maxAge: 0 });
    res.send("Logged out successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = authRouter;
