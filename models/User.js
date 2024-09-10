const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      require:[true, "Name is Required"]
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"], // Minimum length validation
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      required: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);  // RegExp for exactly 10 digits
        },
        message: (props) => `${props.value} is not a valid 10-digit phone number!`,
      },
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



module.exports = mongoose.model("User", userSchema);
