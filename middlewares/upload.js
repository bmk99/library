const admin = require("firebase-admin");
const { getStorage, getDownloadURL } = require('firebase-admin/storage');

const serviceAccount = require("../serviceAccountKey.json");
const multer = require("multer");
const path = require("path");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://library-b2e33.appspot.com", // storage bucket URL
});

// Firestore Storage bucket instance
const bucket = admin.storage().bucket();
// Multer Configuration for File Upload
const storage = multer.memoryStorage(); // Memory storage for file handling
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileformat = path.extname(file.originalname);
    if (fileformat !== ".png" && fileformat !== ".jpg" && fileformat !== ".jpeg") {
      return cb(
        new Error("Only .png, .jpg, and .jpeg formats are allowed!"),
        false
      );
    }
    cb(null, true);
  },
});

// Helper function to upload the image to Firebase
async function uploadImageToFirebase(file,libraryId) {
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

// const fileUrl = "https://storage.googleapis.com/library-b2e33.appspot.com/66defeb42639f4e0aaa46017/1725904490368editedPandas1.png?GoogleAccessId=firebase-adminsdk-thh20%40library-b2e33.iam.gserviceaccount.com&Expires=16730303400&Signature=bOtZIw18huoeea55WIHjBOmP43RJPIKW8FcjhkGUAEjxsp%2B8jjyTDM0vXIIuGSStXxRAND%2FOkxUyrgvLt4uP6p0myD9jO6XW6GpRxFGUugYD9ZW6VTSQJigcTKsVu9diWAVlpvZS7EHxH%2FgyQygFVTIxUz3%2B%2FQw%2Bzix8Kalpv0onJTS6uEfA%2Bgu8UnJuc3w9f5QvDN3Ich5Rm886reXWASIdhL0qQGU%2BrJ%2Fzzeeh2TU7vt%2BqZlB1Ij0Fc4V%2BdhodOULFA9VRZzQ3fu3RRs5Z7z9dSHmqMaXkYrdf8ZHUZ6Urne6KtM0oLV4ysCYVeQWCEc3f3iIPWvzTY3LlHRlAIQ%3D%3D"
// const filePath = extractFilePathFromUrl(fileUrl);
// console.log(filePath)

// Example URL (replace with your actual file URL)
const deleteImageFromFirebaseUrl = async (fileUrl) =>{

// console.log(downloadURL)
  const filePath = extractFilePathFromUrl(fileUrl);
  // const filePath = '66defeb42639f4e0aaa46017/editedPandas1.png'
  console.log(filePath)

if (filePath) {
  // Delete the file using Firebase Admin SDK
  bucket.file(filePath).delete()
    .then(() => {
      console.log("File deleted successfully.");
    })
    .catch((error) => {
      console.error("Error deleting file:", error.message);
    });
} else {
  console.error("Invalid file URL");
}

  
}
// Extract the file path from the URL

// Example usage: delete a file using its URL




module.exports = { uploadImageToFirebase, upload, deleteImageFromFirebaseUrl };
