const clienteRepository = require("../repositories/cliente.repository");
const usuarioRepository = require("../repositories/usuario.repository");
const bcrypt = require("bcrypt");

class ClienteService {
    async createCliente(data) {
        const { cedula, nombre, telefono, correo, direccion, usuario } = data;
        if (!cedula || !nombre) {
            throw new Error("Cédula y nombre son obligatorios.");
        }

        const existingCliente = await clienteRepository.findByCedula(cedula);
        if (existingCliente) {
            throw new Error("Ya existe un cliente registrado con esta cédula.");
        }

        const newCliente = await clienteRepository.create({
            cedula,
            nombre,
            telefono: telefono || "",
            correo: correo || "",
            direccion: direccion || ""
        });

        // Crear usuario para login automáticamente
        try {
            const username = usuario || cedula;
            const hashedPassword = await bcrypt.hash(cedula, 10); // Clave por defecto: cedula
            await usuarioRepository.create({
                nombre,
                usuario: username,
                password: hashedPassword,
                rol: "Cliente",
                cedula: cedula
            });
        } catch (err) {
            console.error("Error al crear el usuario para el cliente:", err);
        }

        return newCliente;
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
        const cliente = await this.getClienteById(id); // Verificar existencia
        
        // Eliminar mantenimientos asociados
        try {
            const prisma = require("../config/prisma");
            await prisma.mantenimiento.deleteMany({
                where: { clienteId: parseInt(id) }
            });
        } catch (err) {
            console.error("Error al eliminar mantenimientos del cliente:", err);
        }

        // Eliminar usuario asociado
        try {
            const prisma = require("../config/prisma");
            await prisma.usuario.deleteMany({
                where: { cedula: cliente.cedula }
            });
        } catch (err) {
            console.error("Error al eliminar usuario asociado al cliente:", err);
        }

        return await clienteRepository.delete(parseInt(id));
    }
}

module.exports = new ClienteService();
