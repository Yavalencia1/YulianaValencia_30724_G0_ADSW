const express = require("express");
const mantenimientoController = require("../controllers/mantenimiento.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

const router = express.Router();

// Proteger todas las rutas de mantenimientos con el middleware de autenticación
router.use(authMiddleware);

router.post("/", mantenimientoController.create);
router.get("/", mantenimientoController.getAll);
router.get("/:id", mantenimientoController.getById);
router.get("/cliente/:clienteId", mantenimientoController.getByCliente);
router.get("/tecnico/:tecnicoId", mantenimientoController.getByTecnico);
router.put("/:id", mantenimientoController.update);
router.delete("/:id", mantenimientoController.delete);

module.exports = router;
