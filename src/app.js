const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/database.js");
const cookieParser = require("cookie-parser");

app.use(cors({ origin: "http://13.203.212.7", credentials: true }));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");

app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", profileRouter);
app.use("/api", requestRouter);

// Test route to verify proxy and routing
app.get("/api/test", (req, res) => {
  res.send("API proxy working!");
});

connectDB()
  .then(() => {
    console.log("Database connected");
    app.listen(3000, () => {
      console.log("Server started at 3000");
    });
  })
  .catch((err) => {
    throw new Error({ err });
  });
