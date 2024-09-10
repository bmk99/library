const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");
const multer = require("multer");
const path = require("path");
const translate = require("@vitalets/google-translate-api");

const bucketid = process.env.STORAGE_BUCKET_ID;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: bucketid, // storage bucket URL
});

// Firestore Storage bucket instance
const bucket = admin.storage().bucket();
// Multer Configuration for File Upload
const storage = multer.memoryStorage(); // Memory storage for file handling
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileformat = path.extname(file.originalname);
    if (
      fileformat !== ".png" &&
      fileformat !== ".jpg" &&
      fileformat !== ".jpeg"
    ) {
      return cb(
        new Error("Only .png, .jpg, and .jpeg formats are allowed!"),
        false
      );
    }
    cb(null, true);
  },
});

// Helper function to upload the image to Firebase
async function uploadImageToFirebase(file, libraryId) {

  try {
    console.log("upload");
    // console.log(file);
    const fileName = `${libraryId}/${Date.now()}${file.originalname}`; // Unique file name
    const firebaseFile = bucket.file(fileName);

    const [signedUrl] = await firebaseFile.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // Set expiration date far in the future
    });
    // Upload the file to Firebase storage
    await firebaseFile.save(file.buffer, {
      resumable: false,
      contentType: file.mimetype,
    });

    return signedUrl;
  } catch (error) {
    console.error(error.message);
    console.log(error)
    // throw new Error(error.message);
    // const translationText = await translate(error.message ,{to : req.getLocale()})
    return res.status(500).json({message : error.message})
  }
}

function extractFilePathFromUrl(url) {
  const decodeUrl = decodeURIComponent(url); // Decode the URL
  const match = decodeUrl.match(/library-b2e33\.appspot\.com\/([^?]*)/); // Match the part after the bucket name
  if (match && match[1]) {
    return match[1]; // Return the extracted file path
  }
  return null;
}

const deleteImageFromFirebaseUrl = async (fileUrl) => {
  const filePath = extractFilePathFromUrl(fileUrl);

  if (filePath) {
    // Delete the file using Firebase Admin SDK
    bucket
      .file(filePath)
      .delete()
      .then(() => {
        console.log("File deleted successfully.");
      })
      .catch((error) => {
        console.error("Error deleting file:", error.message);
      });
  } else {
    console.error("Invalid file URL");
  }
};

module.exports = { uploadImageToFirebase, upload, deleteImageFromFirebaseUrl };
