const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid - " + value);
        }
      },
    },
    password: { type: String, required: true },
    age: { type: Number, min: 18 },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value.toLowerCase())) {
          throw new Error("Gender data is invalid");
        }
      },
    },
    photoUrl: { type: String },
    about: { type: String, default: "Default description of user" },
    skills: { type: [String] },
  },
  { timestamps: true }
);

userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.getJwtToken = async function () {
  const user = this;
  const token = await jwt.sign({ id: user._id }, "DevTinder@1107", {
    expiresIn: "1h",
  });
  return token;
};

userSchema.methods.validatePassword = async function (userInputPassword) {
  const hashedPassword = this.password;
  const isValidPassword = await bcrypt.compare(
    userInputPassword,
    hashedPassword
  );
  return isValidPassword;
};

userSchema.methods.removePassword = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
