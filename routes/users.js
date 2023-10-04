const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");
const requestController = require("../controllers/request-controller");
const friendController = require("../controllers/friend-controller");

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

// GET all friends requests
router.post("/:user/request", requestController.request_GET);

// POST new friend request
router.post("/:user/request/:recipient", requestController.request_POST);

// POST accept pending request
router.post(
  "/:user/request/:recipient/accept",
  requestController.accept_request_POST
);

// POST decline pending request
router.post(
  "/:user/request/:recipient/decline",
  requestController.decline_request_POST
);

// GET friend profile
router.get("/:user/friends/:friend", friendController.profile_GET);

// POST remve friend
router.post("/:user/friends/:friend/remove", friendController.remove_POST);

module.exports = router;
