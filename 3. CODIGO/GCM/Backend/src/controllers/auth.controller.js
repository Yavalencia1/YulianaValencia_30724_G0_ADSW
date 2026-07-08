const authService = require("../services/auth.service");

class AuthController {
    async register(req, res, next) {
        try {
            const { nombre, usuario, password } = req.body;
            const newUser = await authService.register(nombre, usuario, password);
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
