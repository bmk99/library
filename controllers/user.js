const jwt = require("jsonwebtoken");
const userSchema = require("../models/User.js");

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await userSchema.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          "Something went wrong while generating referesh and access token"
        )
      );
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, address, role, phone } = req.body;

    const existedUser = await userSchema.findOne({
      email,
    });
    if (!existedUser) {
      return res.status(209).json({ message: "User already exists" });
    }
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
      return res
        .status(500)
        .json({ message: "something went wrong while registering" });
    }

    return res
      .status(201)
      .json({ message: "user created succesfully ", result: createdUser });
  } catch (error) {
    console.log(error);
    console.log(Object.keys(error.keyValue));
    if (error.name == "MongoServerError" && error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[field];
      const message = `The ${field} '${duplicateValue}' is already registered. Please use a different ${field}.`;
      return res.status(400).json({ message });
    }
    return res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      return res.status(500).json({ messages: "both required" });
    }

    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "invalid user details" });
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

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "Succesfully ",
        user: loggedInUser,
        accessToken,
        refreshToken,
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const logoutUser = async (req, res) => {
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
    .json({ message: "Logout succesfully " });
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
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
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
        message: "Access token refreshed",
        accessToken,
        refreshToken: newRefreshToken,
      });
  } catch (error) {
    return res.status(401).json({message : error?.message || "Invalid refresh token"});
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
