const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

// Post(create) new user
router.post("/create", userController.create);

// Post user log in
router.post("/", userController.user_POST);

// GET user information
router.get("/", userController.user_GET);

module.exports = router;
