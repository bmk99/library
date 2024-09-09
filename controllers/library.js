const librarySchema = require("../models/Libraries");
const booksSchema = require("../models/Books");
const userSchema = require("../models/User");
const {uploadImageToFirebase,deleteImageFromFirebaseUrl} = require("../middlewares/upload")

exports.createLibrary = async (req, res) => {
  const { libraryId, name } = req.body;
  const library = await librarySchema.exists({ libraryId: libraryId });
  try {
    if (library) {
      return res.status(404).json({ message: "already exist" });
    }
    const newLibrary = new librarySchema({
      libraryId,
      entryBy: req.user._id,
    });
    await newLibrary.save();
    return res.status(201).json(newLibrary);
  } catch (error) {
    if (error.name == "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[field];
      const message = `The ${field} '${duplicateValue}' is already registered. Please use a different ${field}.`;
      return res.status(400).json({ message });
    }
    return res.status(500).json({ error: error });
  }
};

exports.deleteLibraray = async (req, res) => {
  const { libraryId } = req.params;
  try {
    const remove = await librarySchema.findByIdAndDelete(libraryId);
    return res.status(200).json({ message: "deleted succsfully " });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateDetails = async (req, res) => {
  const { libraryId } = req.params;
  const data = req.body;

  try {
    const updatedLib = await librarySchema.findByIdAndUpdate(libraryId, data, {
      new: true,
    });

    return res.status(201).json(updatedLib);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ error: error.message });
  }
};

exports.details = async (req, res) => {
  const { libraryId } = req.params;

  try {
    const library = await librarySchema.findById(libraryId);
    return res.status(200).json({ library });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.allDetails = async (req, res) => {
  try {
    const allLibraries = await librarySchema.find({});

    return res.status(200).json(allLibraries);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

exports.getInventory = async (req, res) => {
  const { libraryId } = req.params;
  try {
    const books = await booksSchema
      .find({ libraryId })
      .select("_id name email role")
      .populate("authorId", "_id name role email")
      .populate("borrower", "_id name role email");
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createBookInInventory = async (req, res) => {
  const { libraryId } = req.params;
  const data = req.body;

  try {
    const book = await booksSchema.findOne({bookId : data.bookId});
    if (book) {
      return res.status(409).json({ message: "Book already exists." });
    }
    // Check if the author and library exist
    const author = await userSchema.exists({ _id: data.authorId });

    if (!author) {
      return res.status(404).json({ message: "Author ID not found." });
    }
    let images = [];
    if (req.files && req.files.length > 0) {
      try {
        const uploadedImages = await Promise.all(
          req.files.map((file) => uploadImageToFirebase(file, libraryId))
        );
        images = uploadedImages; // Store the URLs of uploaded images
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error uploading images.", error: error.message });
      }
    }
    const newBook = new booksSchema({ ...data, libraryId: libraryId, images });
    await newBook.save();
    return res
      .status(201)
      .json({ message: "succesfully created", result: newBook });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.delteBookInInventory = async (req, res) => {
  const { libraryId, bookId } = req.params;
  const checkBook = await booksSchema.findById(bookId);
  console.log(checkBook)
  try {
    if (checkBook) {
      const deleteImage = await checkBook.images.map(deleteImageFromFirebaseUrl)
      const remove = await booksSchema.deleteOne({ libraryId, bookId });
      return res.status(204).json({message : "succesfully deleted"})
    } else {
      return res.status(404).json({ message: "Not found---" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
