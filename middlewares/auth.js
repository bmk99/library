const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = require("../models/User.js");
const translate = require("@vitalets/google-translate-api");

const authentication = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: res.__("unauthorized") });
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await userSchema
      .findById(decodedToken?._id)
      .select("-password -refreshToken");
    if (!user) {
      return res.staus(401).json({ message: res.__("invalidToken") });
    }

    req.user = user;
    next();
  } catch (error) {
    const translationText =
      req.getLocale() == "en"
        ? error.message
        : (await translate(error.message, { to: req.getLocale() })).text;
    return res
      .status(401)
      .json({ message: translationText || res.__("invalidToken") });
  }
};

const checkRole = async (req, res, next) => {
  const role = req.user.role;

  try {
    if (role == "admin") {
      next();
    } else {
      return res.status(403).json({ message:  res.__unauthorized});
    }
  } catch (error) {

    const translationText =
      req.getLocale() == "en"
        ? error.message
        : (await translate(error.message, { to: req.getLocale() })).text;

    return res.staus(500).json({ message: translationText || res.__unauthorized});
  }
};
module.exports = { authentication, checkRole };
