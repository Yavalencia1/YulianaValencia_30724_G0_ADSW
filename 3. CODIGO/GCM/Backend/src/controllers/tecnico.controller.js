const tecnicoService = require("../services/tecnico.service");

class TecnicoController {
    async create(req, res, next) {
        try {
            const tecnico = await tecnicoService.createTecnico(req.body);
            return res.status(201).json({
                ok: true,
                data: tecnico
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const tecnicos = await tecnicoService.getTecnicos();
            return res.status(200).json({
                ok: true,
                data: tecnicos
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const tecnico = await tecnicoService.getTecnicoById(req.params.id);
            return res.status(200).json({
                ok: true,
                data: tecnico
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updated = await tecnicoService.updateTecnico(req.params.id, req.body);
            return res.status(200).json({
                ok: true,
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await tecnicoService.deleteTecnico(req.params.id);
            return res.status(200).json({
                ok: true,
                mensaje: "Técnico eliminado correctamente."
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TecnicoController();
