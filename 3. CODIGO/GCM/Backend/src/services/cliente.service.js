const clienteRepository = require("../repositories/cliente.repository");
const usuarioRepository = require("../repositories/usuario.repository");
const bcrypt = require("bcrypt");
const { validarCedulaEcuatoriana, validarTelefonoEcuatoriano, validarEdadPermitida } = require("../utils/validation");

class ClienteService {
    async createCliente(data) {
        const { cedula, nombre, telefono, correo, direccion, usuario, fechaNacimiento } = data;
        if (!cedula || !nombre) {
            throw new Error("Cédula y nombre son obligatorios.");
        }

        if (!validarCedulaEcuatoriana(cedula)) {
            throw new Error("La cédula ingresada no es válida.");
        }

        if (telefono && !validarTelefonoEcuatoriano(telefono)) {
            throw new Error("El número de teléfono celular no es válido. Debe tener 10 dígitos y empezar con 09.");
        }

        if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            throw new Error("El correo electrónico no tiene un formato válido.");
        }

        if (fechaNacimiento && !validarEdadPermitida(fechaNacimiento)) {
            throw new Error("La edad permitida para el registro debe estar entre 18 y 100 años.");
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
                cedula: cedula,
                fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null
            });
        } catch (err) {
            console.error("Error al crear el usuario para el cliente:", err);
        }

        return newCliente;
    }

    async getClientes() {
        const clientes = await clienteRepository.findAll();
        const prisma = require("../config/prisma");
        const usuarios = await prisma.usuario.findMany({
            where: {
                cedula: { in: clientes.map(c => c.cedula) }
            }
        });
        
        const usuariosMap = {};
        usuarios.forEach(u => {
            usuariosMap[u.cedula] = u.fechaNacimiento;
        });
        
        return clientes.map(c => ({
            ...c,
            fechaNacimiento: usuariosMap[c.cedula] ? usuariosMap[c.cedula].toISOString().split('T')[0] : null
        }));
    }

    async getClienteById(id) {
        const cliente = await clienteRepository.findById(parseInt(id));
        if (!cliente) {
            throw new Error("Cliente no encontrado.");
        }
        const prisma = require("../config/prisma");
        const usuario = await prisma.usuario.findFirst({
            where: { cedula: cliente.cedula }
        });
        return {
            ...cliente,
            fechaNacimiento: usuario && usuario.fechaNacimiento ? usuario.fechaNacimiento.toISOString().split('T')[0] : null
        };
    }

    async getClienteByCedula(cedula) {
        const cliente = await clienteRepository.findByCedula(cedula);
        if (!cliente) {
            throw new Error("Cliente no encontrado.");
        }
        const prisma = require("../config/prisma");
        const usuario = await prisma.usuario.findFirst({
            where: { cedula }
        });
        return {
            ...cliente,
            fechaNacimiento: usuario && usuario.fechaNacimiento ? usuario.fechaNacimiento.toISOString().split('T')[0] : null
        };
    }

    async updateCliente(id, data) {
        const originalCliente = await this.getClienteById(id); // Verificar existencia

        const { cedula, nombre, telefono, correo, direccion, fechaNacimiento } = data;

        if (cedula && !validarCedulaEcuatoriana(cedula)) {
            throw new Error("La cédula ingresada no es válida.");
        }

        if (telefono && !validarTelefonoEcuatoriano(telefono)) {
            throw new Error("El número de teléfono celular no es válido. Debe tener 10 dígitos y empezar con 09.");
        }

        if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            throw new Error("El correo electrónico no tiene un formato válido.");
        }

        if (fechaNacimiento && !validarEdadPermitida(fechaNacimiento)) {
            throw new Error("La edad permitida para el registro debe estar entre 18 y 100 años.");
        }

        // Si cambia la cédula, validar que no esté duplicada
        if (cedula && cedula !== originalCliente.cedula) {
            const existing = await clienteRepository.findByCedula(cedula);
            if (existing) throw new Error("Ya existe un cliente registrado con esta cédula.");
        }

        // Actualizar cliente
        const updated = await clienteRepository.update(parseInt(id), {
            cedula: cedula !== undefined ? cedula : originalCliente.cedula,
            nombre: nombre !== undefined ? nombre : originalCliente.nombre,
            telefono: telefono !== undefined ? telefono : originalCliente.telefono,
            correo: correo !== undefined ? correo : originalCliente.correo,
            direccion: direccion !== undefined ? direccion : originalCliente.direccion
        });

        // Actualizar usuario asociado si cambia nombre, cédula o fechaNacimiento
        try {
            const prisma = require("../config/prisma");
            const updateUsuarioData = {};
            if (nombre !== undefined) updateUsuarioData.nombre = nombre;
            if (cedula !== undefined) updateUsuarioData.cedula = cedula;
            if (fechaNacimiento !== undefined) {
                updateUsuarioData.fechaNacimiento = fechaNacimiento ? new Date(fechaNacimiento) : null;
            }

            if (Object.keys(updateUsuarioData).length > 0) {
                await prisma.usuario.updateMany({
                    where: { cedula: originalCliente.cedula },
                    data: updateUsuarioData
                });
            }
        } catch (err) {
            console.error("Error al actualizar usuario asociado al cliente:", err);
        }

        return updated;
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
