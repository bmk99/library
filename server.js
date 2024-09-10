const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const i18n = require("i18n")
const cookieParser = require('cookie-parser')
const userRoutes = require("./routes/userRoutes");
const { authentication } = require("./middlewares/auth");
const libraryRoutes = require("./routes/libraryRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowRoutes = require("./routes/borrow");
const {translate} = require('@vitalets/google-translate-api');


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    "Access-Control-Allow-Origin": "http://localhost:3000",
  })
);
app.use(cookieParser()); // Parse the cookies from the request

// Configure i18n
i18n.configure({
  locales: ['en', 'hi'],  // Add all the languages you want to support
  defaultLocale: 'en',  // Default language if none is set
  cookie: 'locale',  // The cookie that stores the user's preferred language
  directory: path.join(__dirname, 'locales'),  // Where your translation files are stored
  autoReload: true,  // Automatically reloads the translations when files are changed
  updateFiles: false, // Don't automatically create translation files if they don't exist
  objectNotation: true,  // Enable nested key structure like en.errors.serverError
});
app.use(i18n.init);      // Initialize i18n to handle language detection and translation

// Middleware to detect language preference from cookies or fallback to default
app.use((req, res, next) => {
  const lang = req.cookies.locale || 'en';  // Get language from cookies or default to 'en'
  i18n.setLocale(req, lang);
  console.log(req.getLocale())
  next();
});

// MongoDB connection
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(`Failed to Connect - ${error}`);
  }

  // app.use()
  // Define routes
  app.use("/api/users", userRoutes);
  app.use(authentication);
  app.use("/api/libraries", libraryRoutes);
  app.use("/api/books", bookRoutes);
  app.use("/api", borrowRoutes);

  app.get("/setLanguage/:lang", (req, res) => {
    const { lang } = req.params;
    
    // Check if the language is supported
    if (['en', 'hi'].includes(lang)) {
      res.cookie('locale', lang);  // Set the language preference in cookies
      return res.json({ message: `Language set to ${lang}` });
    } else {
      return res.status(400).json({ message: "Language not supported" });
    }
  });
  app.get("/check",async (req,res) =>{
    try {
      
      let traslate = "hello world how are you"
      const translation = (await translate(traslate, { to: req.getLocale() })).text;
      return res.status(200).json({message : res.__("success") })
      
    } catch (error) {
      console.log(error)
      const translation = (await translate(error.message, { to: req.getLocale() })).text;
      return res.status(500).json({message : translation})
      
    }

  })

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500);
    return res.status(err.status ).json({
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
   });

  
  

  app.use("/*", (req, res) => {
    return res.status(404).json({ message: "check the url" });
  });

  // Start the server
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server running at -> http://localhost:${PORT}`);
  });
}

// Call the main function to run the server
main().catch((err) => console.log(err));
