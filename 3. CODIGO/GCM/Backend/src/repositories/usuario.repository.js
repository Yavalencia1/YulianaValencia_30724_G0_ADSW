const prisma = require("../config/prisma");

class UsuarioRepository {
    async create(data) {
        return await prisma.usuario.create({
            data
        });
    }

    async findByUsuario(usuario) {
        return await prisma.usuario.findUnique({
            where: { usuario }
        });
    }

    async findById(id) {
        return await prisma.usuario.findUnique({
            where: { id }
        });
    }
}

module.exports = new UsuarioRepository();
