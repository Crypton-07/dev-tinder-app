const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Unauthorized acess. Please login again!!");
    }
    const userFromToken = jwt.verify(token, "DevTinder@1107");
    if (!userFromToken) {
      return res.status(401).send("Unauthorized acess. Please login again!!");
    }
    const getUser = await User.findById(userFromToken.id);
    if (!getUser) {
      throw new Error("User not found");
    }
    req.user = getUser;
    next();
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports = { userAuth };
