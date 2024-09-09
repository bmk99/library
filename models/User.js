const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    name: {
      type: String,
      cast: "{value} is not a string",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique : [true, "email already exist"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      message: "{value} is not supported",
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// userSchema.post("save", function (error, req,res, next) {
//   if ((error.name = "MongoServerError" && error.code == 11000)) {
//     const field = Object.keys(error.keyValue[0]);
//     const duplicateValue = error.keyValue[field];
//     const message = `${field} ${duplicateValue} is already regiseterd .please use different ${field}`;
//     next(message);
//   } else {
//     next();
//   }
// });

// userSchema.post("updateOne", function (error, doc, next) {
//   if ((error.name = "MongoServerError" && error.code == 11000)) {
//     const field = Object.keys(error.keyValue[0]);
//     const duplicateValue = error.keyValue[field];
//     const message = `${field} ${duplicateValue} is already regiseterd .please use different ${field}`;
//     next(new Error(message));
//   } else {
//     next();
//   }
// });

module.exports = mongoose.model("User", userSchema);
