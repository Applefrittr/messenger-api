const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

// Post(create) new user
router.post("/create", userController.create);

// Post user log in
//router.post("/", userController.user_POST);

// GET all users in the database
router.get("/", userController.users_GET);

// GET user login
router.get("/login", userController.login_GET);

// POST user login
router.post("/login", userController.login_POST);

// GET user profile
router.get("/:user/profile", userController.profile_GET);

// Post user profile edits
router.post("/:user/profile", userController.profile_POST);

module.exports = router;
