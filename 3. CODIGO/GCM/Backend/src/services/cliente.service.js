const clienteRepository = require("../repositories/cliente.repository");

class ClienteService {
    async createCliente(data) {
        const { cedula, nombre, telefono, correo, direccion } = data;
        if (!cedula || !nombre) {
            throw new Error("Cédula y nombre son obligatorios.");
        }

        const existingCliente = await clienteRepository.findByCedula(cedula);
        if (existingCliente) {
            throw new Error("Ya existe un cliente registrado con esta cédula.");
        }

        return await clienteRepository.create({
            cedula,
            nombre,
            telefono: telefono || "",
            correo: correo || "",
            direccion: direccion || ""
        });
    }

    async getClientes() {
        return await clienteRepository.findAll();
    }

    async getClienteById(id) {
        const cliente = await clienteRepository.findById(parseInt(id));
        if (!cliente) {
            throw new Error("Cliente no encontrado.");
        }
        return cliente;
    }

    async getClienteByCedula(cedula) {
        const cliente = await clienteRepository.findByCedula(cedula);
        if (!cliente) {
            throw new Error("Cliente no encontrado.");
        }
        return cliente;
    }

    async updateCliente(id, data) {
        await this.getClienteById(id); // Verificar existencia
        return await clienteRepository.update(parseInt(id), data);
    }

    async deleteCliente(id) {
        await this.getClienteById(id); // Verificar existencia
        return await clienteRepository.delete(parseInt(id));
    }
}

module.exports = new ClienteService();
