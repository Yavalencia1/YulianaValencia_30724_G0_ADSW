const clienteService = require("../services/cliente.service");

class ClienteController {
    async create(req, res, next) {
        try {
            const cliente = await clienteService.createCliente(req.body);
            return res.status(201).json({
                ok: true,
                data: cliente
            });
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            const clientes = await clienteService.getClientes();
            return res.status(200).json({
                ok: true,
                data: clientes
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const cliente = await clienteService.getClienteById(req.params.id);
            return res.status(200).json({
                ok: true,
                data: cliente
            });
        } catch (error) {
            next(error);
        }
    }

    async getByCedula(req, res, next) {
        try {
            const cliente = await clienteService.getClienteByCedula(req.params.cedula);
            return res.status(200).json({
                ok: true,
                data: cliente
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updated = await clienteService.updateCliente(req.params.id, req.body);
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
            await clienteService.deleteCliente(req.params.id);
            return res.status(200).json({
                ok: true,
                mensaje: "Cliente eliminado correctamente."
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ClienteController();
