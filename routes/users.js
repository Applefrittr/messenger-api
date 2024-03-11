const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

// Post(create) new user
router.post("/create", userController.create);

// GET user login
router.get("/login", userController.login_GET);

// POST user login
router.post("/login", userController.login_POST);

router.get("/error", (req, res, next) => {
  try {
    throw new Error();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
