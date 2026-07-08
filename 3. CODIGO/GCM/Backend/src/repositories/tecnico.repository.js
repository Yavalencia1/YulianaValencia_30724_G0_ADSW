const prisma = require("../config/prisma");

class TecnicoRepository {
    async create(data) {
        return await prisma.tecnico.create({
            data
        });
    }

    async findAll() {
        return await prisma.tecnico.findMany({
            include: {
                mantenimientos: true
            }
        });
    }

    async findById(id) {
        return await prisma.tecnico.findUnique({
            where: { id },
            include: {
                mantenimientos: true
            }
        });
    }

    async findByCorreo(correo) {
        // En schema.prisma, correo no es único, así que usamos findFirst o findUnique si fuese.
        // Asumiendo findFirst para ser seguro ya que no tiene @unique en schema.prisma.
        return await prisma.tecnico.findFirst({
            where: { correo },
            include: {
                mantenimientos: true
            }
        });
    }

    async update(id, data) {
        return await prisma.tecnico.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return await prisma.tecnico.delete({
            where: { id }
        });
    }
}

module.exports = new TecnicoRepository();
