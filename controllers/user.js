const jwt = require("jsonwebtoken");
const userSchema = require("../models/User.js");
const translate = require("@vitalets/google-translate-api");
const {  translateTo } = require("../utils/Multilingul.js");

// console.log(process.env.PORT)
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await userSchema.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    const translationText =
      req.getLocale() == "en"
        ? error.message
        : (await translate(error.message, { to: req.getLocale() })).text;
    return res
      .status(500)
      .json({ message: translationText || res.__("errorRegister") });
  }
};
const registerUser = async (req, res) => {
  try {
    const { name, email, password, address, role, phone } = req.body;

    const existedUser = await userSchema.findOne({ email });

    // if (existedUser) {
    //   return res.status(209).json({ message: res.__("userExist") });
    // }

    // Create user
    const user = await userSchema.create({
      phone,
      email,
      password,
      name: name.toLowerCase(),
      address,
      role,
    });

    const createdUser = await userSchema
      .findById(user._id)
      .select("-password -refreshToken");

    if (!createdUser) {
      return res.status(500).json({ message: res.__("errorRegister") });
    }

    return res
      .status(201)
      .json({ message: res.__("userCreated"), result: createdUser });
  } catch (error) {
    console.log(error);

    // Handle duplicate entry error
    if (error.name == "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[field];
      const message = res.__("duplicateExist", {
        field: field,
        duplicateValue: duplicateValue,
      });
      return res.status(400).json({ message: message });
    }

    // Handle validation error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);

      console.log(errors.join(""));

      return res.status(400).json({ message: errors.join(", ") });
    }

    const errorMessage = translateTo(error, req.getLocale());

    return res.status(500).json({ error: errorMessage });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      return res.status(500).json({ messages: res.__("required") });
    }

    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: res.__("notfound") });
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: res.__("invalidData") });
    }
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );
    const loggedInUser = await userSchema
      .findById(user._id)
      .select("-password -refreshToken");

    const options = {
      httpOnly: true,
      secure: true,
    };
    // cookies.set("lang","en")

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: res.__("success"),
        result: loggedInUser,
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.log({error});
    const errorMessage = translateTo(error, req.getLocale());
    console.log(errorMessage)
    // const translationText =
    //   req.getLocale() == "en"
    //     ? error.message
    //     : (await translate(error.message, { to: req.getLocale() })).text || res.__("serverError");
    return res
      .status(500)
      .json({ message: errorMessage || res.__("serverError") });
  }
};

const logoutUser = async (req, res) => {
  try {
    await userSchema.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1, // this removes the field from document
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(205)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: res.__("logout") });
  } catch (error) {
    return res.status(500).json({ messages: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(404).json({ message: "" });
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await userSchema.findById(decodedToken?._id);

    if (!user) {
      return res.status(401).json({ message: res.__("invalidToken") });
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      return res.status(404).json({ message: res.__("refreshExpired") });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        message: res.__("tokenRefresh"),
        accessToken,
        refreshToken: newRefreshToken,
      });
  } catch (error) {
    const translationText =
      req.getLocale() == "en"
        ? error.message
        : (await translate(error.message, { to: req.getLocale() })).text;

    return res
      .status(401)
      .json({ message: error?.message || "Invalid refresh token" });
  }
};

const changeCurrentPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await userSchema.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    return res.status(400).json({ message: " invalid passowerd" });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({ message: "your password chagned" });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
};
