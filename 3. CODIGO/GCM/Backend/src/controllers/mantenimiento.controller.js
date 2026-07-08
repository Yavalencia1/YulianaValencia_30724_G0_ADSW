const mantenimientoService = require("../services/mantenimiento.service");

class MantenimientoController {
    async create(req, res, next) {
        try {
            const mantenimiento = await mantenimientoService.createMantenimiento(req.body);
            return res.status(201).json({
                ok: true,
                data: mantenimiento
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const mantenimientos = await mantenimientoService.getMantenimientos();
            return res.status(200).json({
                ok: true,
                data: mantenimientos
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const mantenimiento = await mantenimientoService.getMantenimientoById(req.params.id);
            return res.status(200).json({
                ok: true,
                data: mantenimiento
            });
        } catch (error) {
            next(error);
        }
    }

    async getByCliente(req, res, next) {
        try {
            const mantenimientos = await mantenimientoService.getMantenimientosByCliente(req.params.clienteId);
            return res.status(200).json({
                ok: true,
                data: mantenimientos
            });
        } catch (error) {
            next(error);
        }
    }

    async getByTecnico(req, res, next) {
        try {
            const mantenimientos = await mantenimientoService.getMantenimientosByTecnico(req.params.tecnicoId);
            return res.status(200).json({
                ok: true,
                data: mantenimientos
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updated = await mantenimientoService.updateMantenimiento(req.params.id, req.body);
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
            await mantenimientoService.deleteMantenimiento(req.params.id);
            return res.status(200).json({
                ok: true,
                mensaje: "Mantenimiento eliminado correctamente."
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new MantenimientoController();
