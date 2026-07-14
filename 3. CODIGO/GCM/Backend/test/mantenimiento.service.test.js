// Mocks
jest.mock("../src/repositories/mantenimiento.repository");
jest.mock("../src/repositories/cliente.repository");
jest.mock("../src/repositories/tecnico.repository");

const mantenimientoService = require("../src/services/mantenimiento.service");

const mantenimientoRepository = require("../src/repositories/mantenimiento.repository");
const clienteRepository = require("../src/repositories/cliente.repository");
const tecnicoRepository = require("../src/repositories/tecnico.repository");

describe("MantenimientoService", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Debe crear un mantenimiento correctamente", async () => {

        clienteRepository.findById.mockResolvedValue({ id: 1 });

        tecnicoRepository.findById.mockResolvedValue({ id: 1 });

        mantenimientoRepository.create.mockResolvedValue({
            id: 1,
            tipo: "Preventivo"
        });

        const resultado = await mantenimientoService.createMantenimiento({
            tipo: "Preventivo",
            descripcion: "Cambio de pasta térmica",
            fechaIngreso: "2026-07-09",
            fechaEntrega: "2026-07-10",
            estado: "Pendiente",
            costo: 50,
            clienteId: 1,
            tecnicoId: 1
        });

        expect(resultado.tipo).toBe("Preventivo");

    });

    test("Debe impedir crear mantenimiento sin cliente", async () => {

        clienteRepository.findById.mockResolvedValue(null);

        await expect(

            mantenimientoService.createMantenimiento({
                tipo: "Preventivo",
                descripcion: "Cambio",
                fechaIngreso: "2026-07-09",
                fechaEntrega: "2026-07-10",
                estado: "Pendiente",
                costo: 50,
                clienteId: 1,
                tecnicoId: 1
            })

        ).rejects.toThrow(
            "El cliente especificado no existe."
        );

    });

    test("Debe impedir crear mantenimiento sin técnico", async () => {

        clienteRepository.findById.mockResolvedValue({ id: 1 });

        tecnicoRepository.findById.mockResolvedValue(null);

        await expect(

            mantenimientoService.createMantenimiento({
                tipo: "Preventivo",
                descripcion: "Cambio",
                fechaIngreso: "2026-07-09",
                fechaEntrega: "2026-07-10",
                estado: "Pendiente",
                costo: 50,
                clienteId: 1,
                tecnicoId: 1
            })

        ).rejects.toThrow(
            "El técnico especificado no existe."
        );

    });

    test("Debe listar todos los mantenimientos", async () => {

        mantenimientoRepository.findAll.mockResolvedValue([
            { id: 1 }
        ]);

        const resultado =
            await mantenimientoService.getMantenimientos();

        expect(resultado.length).toBe(1);

    });

    test("Debe buscar mantenimiento por ID", async () => {

        mantenimientoRepository.findById.mockResolvedValue({
            id: 1
        });

        const resultado =
            await mantenimientoService.getMantenimientoById(1);

        expect(resultado.id).toBe(1);

    });

    test("Debe actualizar un mantenimiento", async () => {

        mantenimientoRepository.findById.mockResolvedValue({
            id: 1
        });

        clienteRepository.findById.mockResolvedValue({
            id: 1
        });

        tecnicoRepository.findById.mockResolvedValue({
            id: 1
        });

        mantenimientoRepository.update.mockResolvedValue({
            id: 1,
            estado: "Finalizado"
        });

        const resultado =
            await mantenimientoService.updateMantenimiento(1, {
                estado: "Finalizado"
            });

        expect(resultado.estado).toBe("Finalizado");

    });

    test("Debe eliminar un mantenimiento", async () => {

        mantenimientoRepository.findById.mockResolvedValue({
            id: 1
        });

        mantenimientoRepository.delete.mockResolvedValue({});

        await mantenimientoService.deleteMantenimiento(1);

        expect(mantenimientoRepository.delete)
            .toHaveBeenCalled();

    });

    test("Debe impedir crear mantenimiento si fecha de entrega es anterior a fecha de ingreso", async () => {
        await expect(
            mantenimientoService.createMantenimiento({
                tipo: "Preventivo",
                descripcion: "Cambio",
                fechaIngreso: "2026-07-10",
                fechaEntrega: "2026-07-09",
                estado: "Pendiente",
                costo: 50,
                clienteId: 1,
                tecnicoId: 1
            })
        ).rejects.toThrow(
            "La fecha de entrega no puede ser anterior a la fecha de ingreso."
        );
    });

    test("Debe impedir actualizar mantenimiento si fecha de entrega es anterior a fecha de ingreso", async () => {
        mantenimientoRepository.findById.mockResolvedValue({
            id: 1,
            fechaIngreso: new Date("2026-07-10"),
            fechaEntrega: new Date("2026-07-12")
        });

        await expect(
            mantenimientoService.updateMantenimiento(1, {
                fechaEntrega: "2026-07-09"
            })
        ).rejects.toThrow(
            "La fecha de entrega no puede ser anterior a la fecha de ingreso."
        );
    });

});