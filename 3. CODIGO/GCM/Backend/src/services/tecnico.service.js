const tecnicoRepository = require("../repositories/tecnico.repository");
const usuarioRepository = require("../repositories/usuario.repository");
const bcrypt = require("bcrypt");

class TecnicoService {
    async createTecnico(data) {
        const { nombre, especialidad, telefono, correo } = data;
        if (!nombre || !especialidad) {
            throw new Error("Nombre y especialidad del técnico son obligatorios.");
        }

        // Si se provee correo, validamos que no esté duplicado
        if (correo) {
            const existingTecnico = await tecnicoRepository.findByCorreo(correo);
            if (existingTecnico) {
                throw new Error("Ya existe un técnico registrado con este correo.");
            }
        }

        const newTecnico = await tecnicoRepository.create({
            nombre,
            especialidad,
            telefono: telefono || "",
            correo: correo || ""
        });

        // Crear usuario para login automáticamente
        if (correo) {
            try {
                const username = correo.split("@")[0];
                const hashedPassword = await bcrypt.hash("tec123", 10); // Clave genérica para técnicos
                await usuarioRepository.create({
                    nombre,
                    usuario: username,
                    password: hashedPassword,
                    rol: "Técnico"
                });
            } catch (err) {
                console.error("Error al crear el usuario para el técnico:", err);
            }
        }

        return newTecnico;
    }

    async getTecnicos() {
        return await tecnicoRepository.findAll();
    }

    async getTecnicoById(id) {
        const tecnico = await tecnicoRepository.findById(parseInt(id));
        if (!tecnico) {
            throw new Error("Técnico no encontrado.");
        }
        return tecnico;
    }

    async updateTecnico(id, data) {
        await this.getTecnicoById(id); // Verificar existencia
        return await tecnicoRepository.update(parseInt(id), data);
    }

    async deleteTecnico(id) {
        const tecnico = await this.getTecnicoById(id); // Verificar existencia
        
        // Eliminar usuario asociado
        if (tecnico.correo) {
            try {
                const username = tecnico.correo.split("@")[0];
                const prisma = require("../config/prisma");
                await prisma.usuario.deleteMany({
                    where: { usuario: username }
                });
            } catch (err) {
                console.error("Error al eliminar usuario asociado al técnico:", err);
            }
        }

        return await tecnicoRepository.delete(parseInt(id));
    }
}

module.exports = new TecnicoService();
