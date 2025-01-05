const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://namastenode:namaste1107@cluster0.xqvai.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
