const express = require("express");
const cors = require("cors");

const testRoutes = require("./routes/test.routes");
const authRoutes = require("./routes/auth.routes");
const clienteRoutes = require("./routes/cliente.routes");
const tecnicoRoutes = require("./routes/tecnico.routes");
const mantenimientoRoutes = require("./routes/mantenimiento.routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// Registro de rutas
app.use("/api/auth", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/tecnicos", tecnicoRoutes);
app.use("/api/mantenimientos", mantenimientoRoutes);
app.use("/api/test", testRoutes);

app.get("/", (req, res) => {
    res.json({
        mensaje: "API del Sistema de Mantenimientos funcionando"
    });
});

// Middleware global de manejo de errores (Chain of Responsibility)
app.use(errorMiddleware);

module.exports = app;