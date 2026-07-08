const express = require("express");
const tecnicoController = require("../controllers/tecnico.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// Proteger todas las rutas de técnicos con el middleware de autenticación
router.use(authMiddleware);

router.post("/", tecnicoController.create);
router.get("/", tecnicoController.getAll);
router.get("/:id", tecnicoController.getById);
router.put("/:id", tecnicoController.update);
router.delete("/:id", tecnicoController.delete);

module.exports = router;
