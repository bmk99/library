const express = require("express");
const router = express.Router();
const { authentication } = require("../middlewares/auth");
const {
  createLibrary,
  details,
  updateDetails,
  deleteLibraray,
  allDetails,
  getInventory,
  createBookInInventory,
  delteBookInInventory,
} = require("../controllers/library");
const librarySchema = require("../models/Libraries");
const { upload } = require("../middlewares/upload");

router.use((req, res, next) => {
  try {
    if (req.user.role == "admin") {
      console.log(req.user.role);
      next();
    } else {
      return res.status(403).json({ messge: res.__("unauthorized")});
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

router.param("libraryId", async (req, res, next) => {
  console.log(req.params.libraryId);
  const id = req.params.libraryId;
  const library = await librarySchema.exists({_id : id});
  if (!library) {
    return res.status(404).json({ message: res.__("notFound") });
  }
  next();
});

router.route("/").post(createLibrary).get(allDetails);

router
  .route("/:libraryId")
  .get(details)
  .put(updateDetails)
  .delete(deleteLibraray);

router.route("/:libraryId/inventory").get(getInventory).post(upload.array("images"),createBookInInventory);

router.delete("/:libraryId/inventory/:bookId", delteBookInInventory);

module.exports = router;
