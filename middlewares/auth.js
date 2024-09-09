const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = require("../models/User.js");

const authentication = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized request" });
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await userSchema
      .findById(decodedToken?._id)
      .select("-password -refreshToken");
    if (!user) {
      return res.staus(401).json({ message: "Invalid Access Token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: error?.message || "Invalid access token" });
  }
};

const checkRole = async (req, res, next) => {
  const role = req.user.role;

  try {
    if (role == "admin") {
      next();
    } else {
      return res.status(403).json({ message: "not authorised" });
    }
  } catch (error) {
    return res.staus(500).json({ message: error.message });
  }
};
module.exports = { authentication, checkRole };
