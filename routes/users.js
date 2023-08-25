const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

// Post(create) new user
router.post("/create", userController.create);

// Post user log in
router.post("/", userController.user_POST);

// GET user information
router.get("/", userController.user_GET);

// GET user profile
router.get("/:user/profile", userController.profile_GET);

// Post user profile edits
router.post("/:user/profile", userController.profile_POST);

module.exports = router;
