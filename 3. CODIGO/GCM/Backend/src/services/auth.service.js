const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usuarioRepository = require("../repositories/usuario.repository");

class AuthService {
    async register(nombre, usuario, password, rol = "Cliente", cedula = null) {
        if (!nombre || !usuario || !password) {
            throw new Error("Todos los campos (nombre, usuario, password) son obligatorios.");
        }

        const existingUser = await usuarioRepository.findByUsuario(usuario);
        if (existingUser) {
            throw new Error("El nombre de usuario ya está registrado.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await usuarioRepository.create({
            nombre,
            usuario,
            password: hashedPassword,
            rol,
            cedula
        });

        // Retornar sin password
        const { password: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async login(usuario, password) {
        if (!usuario || !password) {
            throw new Error("Usuario y contraseña son requeridos.");
        }

        const user = await usuarioRepository.findByUsuario(usuario);
        if (!user) {
            throw new Error("Usuario o contraseña incorrectos.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Usuario o contraseña incorrectos.");
        }

        const token = jwt.sign(
            { id: user.id, usuario: user.usuario, nombre: user.nombre, rol: user.rol, cedula: user.cedula },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "24h" }
        );

        return {
            token,
            user: {
                id: user.id,
                usuario: user.usuario,
                nombre: user.nombre,
                rol: user.rol,
                cedula: user.cedula
            }
        };
    }
}

module.exports = new AuthService();
