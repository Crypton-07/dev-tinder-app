const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    console.log({ token });
    const userFromToken = jwt.verify(token, "DevTinder@1107");
    if (!userFromToken) {
      throw new Error("Invalid token");
    }
    const getUser = await User.findById(userFromToken.id);
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
