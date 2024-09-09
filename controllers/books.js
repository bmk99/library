const booksSchema = require("../models/Books");
const librarySchema = require("../models/Libraries");
const userSchema = require("../models/User");
const {
  uploadImageToFirebase,
  deleteImageFromFirebaseUrl,
} = require("../middlewares/upload");

exports.name = async (req, res) => {
  const {} = req.body;
  const {} = req.params;
  const {} = req.query;
  try {
    if (true) {
      return res.status().json({});
    }

    return res.status().json({});
  } catch (error) {
    return res.status().json({});
  }
};

exports.createBook = async (req, res) => {
  const { bookId, name, authorId, fiction, libraryId, price } = req.body;

  try {
    // Check if the book already exists
    const book = await booksSchema.exists({ bookId: bookId });
    if (book) {
      return res.status(409).json({ message: "Book already exists." });
    }

    // Check if the author and library exist
    const author = await userSchema.exists({ _id: authorId });
    const library = await librarySchema.exists({ _id: libraryId });

    if (!author) {
      return res.status(404).json({ message: "Author ID not found." });
    }
    if (!library) {
      return res.status(404).json({ message: "Library ID not found." });
    }

    // Handle file uploads (if any)
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

    // Create a new book entry
    const newBook = await booksSchema.create({
      bookId,
      name,
      authorId,
      fiction,
      libraryId,
      price,
      createdBy: req.user._id,
      images,
    });

    return res
      .status(201)
      .json({ message: "Book created successfully.", book: newBook });
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.name === "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[field];
      const message = `The ${field} '${duplicateValue}' is already registered. Please use a different ${field}.`;
      return res.status(400).json({ message });
    }

    // Catch any other server errors
    return res.status(500).json({ message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  const { bookId } = req.params;
  const data = req.body;
  const book = await booksSchema.findById(bookId);

  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      const deltetdImages = await book.images.map(deleteImageFromFirebaseUrl);
      const url = await Promise.all(
        req.files.map((file) => uploadImageToFirebase(file, book.libraryId))
      );
      images = url;
    }
    let updatedBook;
    images.length > 0
      ? (updatedBook = await booksSchema.findByIdAndUpdate(
          bookId,
          { ...data, images },
          {
            new: true,
          }
        ))
      : (updatedBook = await booksSchema.findByIdAndUpdate(
          bookId,
          { ...data },
          {
            new: true,
          }
        ));

    return res.status(201).json({ updatedBook });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};

exports.getBook = async (req, res) => {
  const { bookId } = req.params;
  try {
    const book = await booksSchema
      .findById(bookId)
      .populate("authorId", "_id name role email")
      .populate("borrower", "_id name role email")
      .populate("libraryId", "_id name");

    return res.status(200).json({result : book });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const allbooks = await booksSchema
      .find({})
      .populate("authorId", "_id name role email")
      .populate("borrower", "_id name role email")
      .populate("libraryId", "_id name");

    return res.status(200).json(allbooks);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  const { bookId } = req.params;
  try {
    const deltetdImages = await book.images.map(deleteImageFromFirebaseUrl);
    const remove = await booksSchema.findByIdAndDelete(bookId);

    return res.status(204).json({ message: "success" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
