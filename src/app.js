const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/userSchema");

app.post("/signup", async (req, res) => {
  const userData = new User({
    firstName: "Vishesh",
    lastName: "Prajapati",
    email: "visheh@gmail.com",
    password: "3efdc4",
    age: 25,
    gender: "male",
  });

  try {
    await userData.save();
    res.status(201).send("User data saved successfully");
  } catch (error) {
    res.status(400).send("Failed to save user data");
  }
});

connectDB()
  .then(() => {
    console.log("Database connected");
    app.listen(3000, () => {
      console.log("Server started at 3000");
    });
  })
  .catch((err) => {
    console.log({ err });
  });
