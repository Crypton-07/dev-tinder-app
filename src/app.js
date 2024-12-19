const express = require("express");
const app = express();

app.use("/vishesh", (req, res) => {
  res.send("Hello Vishesh !");
});

app.use("/hello", (req, res) => {
  res.send("Hello again vishesh!");
});

app.listen(3000, () => {
  console.log("Server started");
});
