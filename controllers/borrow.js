const booksSchema = require("../models/Books");
const {translateTo} = require("../utils/Multilingul")

exports.borrowBook = async (req, res) => {
  const { bookId } = req.params;

  const book = await booksSchema.findById(bookId);

  try {
    const check = book.borrower.includes(req.user._id);
    if (check) {
      return res.status(200).json({ message:res.__("alreadyBorrow")});
    }
    const updatedBook = await booksSchema.updateOne(
      { _id: bookId },
      { $push: { borrower: req.user._id } },
      { new: true }
    );

    return res.status(201).json({message :res.__("borrowed")});
  } catch (error) {

    const translationText = translateTo(error) || res.__("serverError");
    return res.status(500).json({ message: translationText });
  }
};

exports.returnBook = async (req, res) => {
  const { bookId } = req.params;

  const book = await booksSchema.findById(bookId);

  try {
    const check = book.borrower.includes(req.user._id);
    if (!check) {
      return res.status(200).json({ message: res.__("alreadyReturn") });
    }
    const updatedBook = await booksSchema.updateOne(
      { _id: bookId },
      { $pull: { borrower: req.user._id } },
      { new: true }
    );

    return res.status(201).json(updatedBook);
  } catch (error) {
    const translationText = translateTo(error) || res.__("serverError");
    return res.status(500).json({ message: translationText });
  }
};
