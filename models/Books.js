const { mongoose, Schema } = require("mongoose");

const booksSchema = new Schema(
  {
    bookId: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fiction: {
      type: String,
      required: true,
    },
    libraryId: {
      type: Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },
    borrower: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    images:[
      {
        type: String,
        // required : true
      },
    ],
   
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    price: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);



module.exports = mongoose.model("Books", booksSchema);
