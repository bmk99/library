const booksSchema = require("../models/Books");

exports.borrowBook = async (req,res) => {
  const { bookId } = req.params;
//   console.log(req.params.bookId)

  const book = await booksSchema.findById(bookId);
//   console.log(book)

  try {
    const check = book.borrower.includes(req.user._id);
    if (check) {
      return res.status(200).json({ message: "already borroweed" });
    }
    const updatedBook = await booksSchema.updateOne(
      { _id: bookId },
      { $push: { borrower: req.user._id } },
      { new: true }
    );

    return res.status(201).json(updatedBook);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.returnBook = async (req,res) => {
  const { bookId } = req.params;

  const book = await booksSchema.findById(bookId);

  try {
    const check = book.borrower.includes(req.user._id);
    if (!check) {
      return res.status(200).json({ message: "already returned" });
    }
    const updatedBook = await booksSchema.updateOne(
      { _id: bookId },
      { $pull: { borrower: req.user._id } },
      { new: true }
    );

    return res.status(201).json(updatedBook);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
