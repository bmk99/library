const express = require("express");
const router = express.Router();
const { checkRole } = require("../middlewares/auth");
const bookSchema = require("../models/Books");
const {
  updateBook,
  deleteBook,
  getAllBooks,
  createBook,
  getBook,
} = require("../controllers/books");
const { upload } = require("../middlewares/upload");

router.param("bookId", async (req, res, next) => {
  console.log(req.params.bookId);
  const id = req.params.bookId;
  const book = await bookSchema.exists({_id : id});
  if (!book) {
    return res.status(404).json({ message: res.__("notFound") });
  }
  next();
});

router.post("/", checkRole, upload.array("images"), createBook);
router.get("/", getAllBooks);

router.route("/:bookId").get(getBook).delete(checkRole, deleteBook);

router.put("/:bookId", checkRole, upload.array("images"), updateBook);

//

module.exports = router;
