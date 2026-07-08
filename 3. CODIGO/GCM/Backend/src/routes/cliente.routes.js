const express = require("express");
const clienteController = require("../controllers/cliente.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// Proteger todas las rutas de clientes con el middleware de autenticación
router.use(authMiddleware);

router.post("/", clienteController.create);
router.get("/", clienteController.getAll);
router.get("/:id", clienteController.getById);
router.get("/cedula/:cedula", clienteController.getByCedula);
router.put("/:id", clienteController.update);
router.delete("/:id", clienteController.delete);

module.exports = router;
