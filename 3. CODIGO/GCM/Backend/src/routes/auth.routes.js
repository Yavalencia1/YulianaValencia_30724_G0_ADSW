const express = require("express");
const authController = require("../controllers/auth.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/change-password", authController.changePassword);
router.get("/administradores", authMiddleware, authController.getAdministradores);

module.exports = router;
