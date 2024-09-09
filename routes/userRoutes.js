const express = require('express');
const {  loginUser, registerUser, logoutUser, refreshAccessToken } = require('../controllers/user');
const router= express.Router()
const {authentication} = require("../middlewares/auth")


router.post("/register",registerUser);
router.post("/login",loginUser)
router.post("/refreshAccesToken", authentication, refreshAccessToken)
router.post("/logout",authentication, logoutUser)



module.exports = router 