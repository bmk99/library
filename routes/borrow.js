const express = require("express");
const router = express.Router();
const { checkRole } = require("../middlewares/auth");
const bookSchema = require("../models/Books");
const { borrowBook, returnBook } = require("../controllers/borrow");

router.param("bookId", async (req, res, next) => {
//   console.log(req.params.bookId);
  const id = req.params.bookId;
  const book = await bookSchema.exists({_id : id});
  if (!book) {
    return res.status(404).json({ message: "Not found " });
  }
  next();
});

router.put("/borrow/:bookId",borrowBook)
router.put("/return/:bookId",returnBook)

module.exports = router;
