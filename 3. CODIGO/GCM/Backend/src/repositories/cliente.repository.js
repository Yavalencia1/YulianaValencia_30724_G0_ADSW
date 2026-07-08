const prisma = require("../config/prisma");

class ClienteRepository {
    async create(data) {
        return await prisma.cliente.create({
            data
        });
    }

    async findAll() {
        return await prisma.cliente.findMany({
            include: {
                mantenimientos: true
            }
        });
    }

    async findById(id) {
        return await prisma.cliente.findUnique({
            where: { id },
            include: {
                mantenimientos: true
            }
        });
    }

    async findByCedula(cedula) {
        return await prisma.cliente.findUnique({
            where: { cedula },
            include: {
                mantenimientos: true
            }
        });
    }

    async update(id, data) {
        return await prisma.cliente.update({
            where: { id },
            data
        });
    }

    async delete(id) {
        return await prisma.cliente.delete({
            where: { id }
        });
    }
}

module.exports = new ClienteRepository();
