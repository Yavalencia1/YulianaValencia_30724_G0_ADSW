const prisma = require("../config/prisma");

class MantenimientoRepository {
    async create(data) {
        return await prisma.mantenimiento.create({
            data,
            include: {
                cliente: true,
                tecnico: true
            }
        });
    }

    async findAll() {
        return await prisma.mantenimiento.findMany({
            include: {
                cliente: true,
                tecnico: true
            }
        });
    }

    async findById(id) {
        return await prisma.mantenimiento.findUnique({
            where: { id },
            include: {
                cliente: true,
                tecnico: true
            }
        });
    }

    async findByClienteId(clienteId) {
        return await prisma.mantenimiento.findMany({
            where: { clienteId },
            include: {
                cliente: true,
                tecnico: true
            }
        });
    }

    async findByTecnicoId(tecnicoId) {
        return await prisma.mantenimiento.findMany({
            where: { tecnicoId },
            include: {
                cliente: true,
                tecnico: true
            }
        });
    }

    async update(id, data) {
        return await prisma.mantenimiento.update({
            where: { id },
            data,
            include: {
                cliente: true,
                tecnico: true
            }
        });
    }

    async delete(id) {
        return await prisma.mantenimiento.delete({
            where: { id }
        });
    }
}

module.exports = new MantenimientoRepository();
