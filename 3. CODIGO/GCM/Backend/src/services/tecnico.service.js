const tecnicoRepository = require("../repositories/tecnico.repository");

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

        return await tecnicoRepository.create({
            nombre,
            especialidad,
            telefono: telefono || "",
            correo: correo || ""
        });
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
        await this.getTecnicoById(id); // Verificar existencia
        return await tecnicoRepository.delete(parseInt(id));
    }
}

module.exports = new TecnicoService();
