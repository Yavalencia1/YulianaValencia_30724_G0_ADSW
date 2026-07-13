const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usuarioRepository = require("../repositories/usuario.repository");
const clienteRepository = require("../repositories/cliente.repository");
const emailService = require("./email.service");

class AuthService {
    async register(nombre, usuario, password, rol = "Cliente", cedula = null, correo = "", telefono = "", especialidad = "") {
        if (!nombre || !usuario || !password) {
            throw new Error("Todos los campos (nombre, usuario, password) son obligatorios.");
        }

        const existingUser = await usuarioRepository.findByUsuario(usuario);
        if (existingUser) {
            throw new Error("El nombre de usuario ya está registrado.");
        }

        const prisma = require("../config/prisma");

        // Si es rol Cliente, registrarlo también en la tabla Cliente
        if (rol === "Cliente") {
            if (!cedula) {
                throw new Error("La cédula es obligatoria para registrarse como cliente.");
            }
            const existingCliente = await clienteRepository.findByCedula(cedula);
            if (existingCliente) {
                throw new Error("La cédula ya está registrada en el sistema.");
            }

            // Crear el cliente
            await clienteRepository.create({
                cedula,
                nombre,
                telefono: telefono || "",
                correo: correo || "",
                direccion: ""
            });
        }

        // Si es rol Técnico, registrarlo también en la tabla Tecnico
        if (rol === "Técnico") {
            if (!correo) {
                throw new Error("El correo electrónico es obligatorio para registrarse como técnico.");
            }
            const existingTecnico = await prisma.tecnico.findFirst({
                where: { correo }
            });
            if (existingTecnico) {
                throw new Error("Ya existe un técnico registrado con este correo.");
            }

            // Crear el técnico
            await prisma.tecnico.create({
                data: {
                    nombre,
                    especialidad: especialidad || "General",
                    telefono: telefono || "",
                    correo
                }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const debeCambiarPw = (rol === 'Técnico' || rol === 'Administrador');
        const newUser = await usuarioRepository.create({
            nombre,
            usuario,
            password: hashedPassword,
            rol,
            cedula,
            debeCambiarPw
        });

        let correoEnviado = false;
        let correoError = null;

        if (correo) {
            try {
                await emailService.sendCredentialsEmail({
                    to: correo,
                    nombre,
                    usuario,
                    password,
                    rol
                });
                correoEnviado = true;
            } catch (error) {
                correoError = error.message;
            }
        }

        // Retornar sin password
        const { password: _, ...userWithoutPassword } = newUser;
        return {
            ...userWithoutPassword,
            correoEnviado,
            correoError
        };
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
                cedula: user.cedula,
                debeCambiarPw: user.debeCambiarPw
            }
        };
    }

    async changePassword(usuario, oldPassword, newPassword) {
        if (!usuario || !oldPassword || !newPassword) {
            throw new Error("Todos los campos son requeridos.");
        }
        if (newPassword.length < 6) {
            throw new Error("La nueva contraseña debe tener al menos 6 caracteres.");
        }
        const user = await usuarioRepository.findByUsuario(usuario);
        if (!user) {
            throw new Error("Usuario no encontrado.");
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error("La contraseña actual es incorrecta.");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const prisma = require("../config/prisma");
        const updatedUser = await prisma.usuario.update({
            where: { usuario },
            data: {
                password: hashedPassword,
                debeCambiarPw: false
            }
        });
        
        const { password: _, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
}

module.exports = new AuthService();
