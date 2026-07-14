const mantenimientoRepository = require("../repositories/mantenimiento.repository");
const clienteRepository = require("../repositories/cliente.repository");
const tecnicoRepository = require("../repositories/tecnico.repository");

class MantenimientoService {
    async createMantenimiento(data) {
        const { tipo, descripcion, fechaIngreso, fechaEntrega, estado, costo, clienteId, tecnicoId } = data;

        if (!tipo || !descripcion || !fechaIngreso || !fechaEntrega || !estado || costo === undefined || !clienteId || !tecnicoId) {
            throw new Error("Todos los campos obligatorios para el mantenimiento deben ser proporcionados.");
        }

        const dIngreso = new Date(fechaIngreso);
        const dEntrega = new Date(fechaEntrega);

        dIngreso.setUTCHours(0, 0, 0, 0);
        dEntrega.setUTCHours(0, 0, 0, 0);

        if (dEntrega < dIngreso) {
            throw new Error("La fecha de entrega no puede ser anterior a la fecha de ingreso.");
        }

        // Validar si el cliente existe
        const cliente = await clienteRepository.findById(parseInt(clienteId));
        if (!cliente) {
            throw new Error("El cliente especificado no existe.");
        }

        // Validar si el técnico existe
        const tecnico = await tecnicoRepository.findById(parseInt(tecnicoId));
        if (!tecnico) {
            throw new Error("El técnico especificado no existe.");
        }

        return await mantenimientoRepository.create({
            tipo,
            descripcion,
            fechaIngreso: new Date(fechaIngreso),
            fechaEntrega: new Date(fechaEntrega),
            estado,
            costo: parseFloat(costo),
            clienteId: parseInt(clienteId),
            tecnicoId: parseInt(tecnicoId)
        });
    }

    async getMantenimientos() {
        return await mantenimientoRepository.findAll();
    }

    async getMantenimientoById(id) {
        const mantenimiento = await mantenimientoRepository.findById(parseInt(id));
        if (!mantenimiento) {
            throw new Error("Mantenimiento no encontrado.");
        }
        return mantenimiento;
    }

    async getMantenimientosByCliente(clienteId) {
        return await mantenimientoRepository.findByClienteId(parseInt(clienteId));
    }

    async getMantenimientosByTecnico(tecnicoId) {
        return await mantenimientoRepository.findByTecnicoId(parseInt(tecnicoId));
    }

    async updateMantenimiento(id, data) {
        const currentMnt = await this.getMantenimientoById(id); // Verificar existencia

        const updateData = { ...data };
        if (updateData.fechaIngreso) {
            updateData.fechaIngreso = new Date(updateData.fechaIngreso);
        }
        if (updateData.fechaEntrega) {
            updateData.fechaEntrega = new Date(updateData.fechaEntrega);
        }

        const dIngreso = updateData.fechaIngreso || new Date(currentMnt.fechaIngreso);
        const dEntrega = updateData.fechaEntrega || new Date(currentMnt.fechaEntrega);

        const checkIngreso = new Date(dIngreso);
        const checkEntrega = new Date(dEntrega);
        checkIngreso.setUTCHours(0, 0, 0, 0);
        checkEntrega.setUTCHours(0, 0, 0, 0);

        if (checkEntrega < checkIngreso) {
            throw new Error("La fecha de entrega no puede ser anterior a la fecha de ingreso.");
        }

        if (updateData.costo !== undefined) {
            updateData.costo = parseFloat(updateData.costo);
        }
        if (updateData.clienteId !== undefined) {
            updateData.clienteId = parseInt(updateData.clienteId);
            const cliente = await clienteRepository.findById(updateData.clienteId);
            if (!cliente) throw new Error("El cliente especificado no existe.");
        }
        if (updateData.tecnicoId !== undefined) {
            updateData.tecnicoId = parseInt(updateData.tecnicoId);
            const tecnico = await tecnicoRepository.findById(updateData.tecnicoId);
            if (!tecnico) throw new Error("El técnico especificado no existe.");
        }

        return await mantenimientoRepository.update(parseInt(id), updateData);
    }

    async deleteMantenimiento(id) {
        await this.getMantenimientoById(id); // Verificar existencia
        return await mantenimientoRepository.delete(parseInt(id));
    }
}

module.exports = new MantenimientoService();
