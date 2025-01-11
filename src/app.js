const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/userSchema");

app.use(express.json());

app.post("/signup", async (req, res) => {
  // console.log(req.body);
  const userData = new User(req.body);
  try {
    await userData.save();
    res.status(201).send("User data saved successfully");
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/user", async (req, res) => {
  const user = await User.find({ email: req.body.email });
  // console.log({ user });

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

app.get("/feed", async (req, res) => {
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

app.delete("/user", async (req, res) => {
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

app.patch("/user", async (req, res) => {
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
