const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const { authentication } = require("./middlewares/auth");
const libraryRoutes = require("./routes/libraryRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowRoutes = require("./routes/borrow");
const multer = require("multer");
const bodyParser = require("body-parser");

dotenv.config();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    "Access-Control-Allow-Origin": "http://localhost:3000",
  })
);



// MongoDB connection
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(`Failed to Connect - ${error}`);
  }
  // app.use("/*", (req, res) => {
  //   return res.status(404).json({ message: "check the url" });
  // });

  // app.use()
  // Define routes
  app.use("/api/users", userRoutes);
  // app.use(authentication);
  app.use("/api/libraries", libraryRoutes);
  app.use("/api/books", bookRoutes);
  app.use("/api", borrowRoutes);

  // Start the server
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server running at -> http://localhost:${PORT}`);
  });
}

// Call the main function to run the server
main().catch((err) => console.log(err));
