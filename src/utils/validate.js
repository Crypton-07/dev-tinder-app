const validator = require("validator");
const validateSignup = (req) => {
  const { email, password, firstName, lastName, age, gender } = req.body;
  if (!firstName || !lastName) {
    throw new Error("First name and last name are required");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Email is invalid");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
  if (age < 18) {
    throw new Error("Age must be 18 or above");
  }
};

const validateEditProfile = (req) => {
  const isEditAllowed = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];

  return Object.keys(req.body).every((field) => isEditAllowed.includes(field));
};
module.exports = { validateSignup, validateEditProfile };
