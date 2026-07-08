const authService = require("../services/auth.service");

class AuthController {
    async register(req, res, next) {
        try {
            const { nombre, usuario, password, rol, cedula, correo, telefono } = req.body;

            // Restricción de seguridad: Solo un Administrador autenticado puede crear usuarios con roles especiales
            let targetRol = "Cliente";
            if (rol && rol !== "Cliente") {
                const authHeader = req.headers.authorization;
                if (!authHeader) {
                    return res.status(403).json({
                        ok: false,
                        error: "No tienes permisos para registrar usuarios con este rol."
                    });
                }
                
                try {
                    const jwt = require("jsonwebtoken");
                    const token = authHeader.split(" ")[1];
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
                    if (decoded.rol !== "Administrador") {
                        return res.status(403).json({
                            ok: false,
                            error: "No tienes permisos para registrar usuarios con este rol."
                        });
                    }
                    targetRol = rol; // Permitido
                } catch (e) {
                    return res.status(403).json({
                        ok: false,
                        error: "Sesión inválida. No tienes permisos para registrar usuarios con este rol."
                    });
                }
            }

            const newUser = await authService.register(nombre, usuario, password, targetRol, cedula, correo, telefono);
            return res.status(201).json({
                ok: true,
                data: newUser
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { usuario, password } = req.body;
            const loginResult = await authService.login(usuario, password);
            return res.status(200).json({
                ok: true,
                data: loginResult
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
