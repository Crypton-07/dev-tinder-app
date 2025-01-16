const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    const userFromToken = jwt.verify(token, "DevTinder@1107");
    if (!userFromToken) {
      throw new Error("Invalid token");
    }
    const getUser = await User.findById(userFromToken.id, {
      email,
      about,
      age,
      skills,
      firstName,
      lastName,
      gender,
      photoUrl,
      createdAt,
    });
    if (!getUser) {
      throw new Error("User not found");
    }
    req.user = getUser;
    next();
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = { userAuth };
