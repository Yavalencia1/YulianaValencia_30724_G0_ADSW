// Mocks
jest.mock("../src/repositories/cliente.repository");
jest.mock("../src/repositories/usuario.repository");
jest.mock("bcrypt");

const clienteService = require("../src/services/cliente.service");

const clienteRepository = require("../src/repositories/cliente.repository");
const usuarioRepository = require("../src/repositories/usuario.repository");

const bcrypt = require("bcrypt");

describe("ClienteService", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Debe crear un cliente correctamente", async () => {

        clienteRepository.findByCedula.mockResolvedValue(null);

        bcrypt.hash.mockResolvedValue("passwordHasheado");

        clienteRepository.create.mockResolvedValue({
            id: 1,
            cedula: "1720000000",
            nombre: "Sebastian"
        });

        usuarioRepository.create.mockResolvedValue({});

        const resultado = await clienteService.createCliente({
            cedula: "1720000000",
            nombre: "Sebastian"
        });

        expect(resultado.nombre).toBe("Sebastian");

    });

    test("No debe crear un cliente con cédula repetida", async () => {

        clienteRepository.findByCedula.mockResolvedValue({
            id: 1
        });

        await expect(

            clienteService.createCliente({
                cedula: "1720000000",
                nombre: "Sebastian"
            })

        ).rejects.toThrow(
            "Ya existe un cliente registrado con esta cédula."
        );

    });

    test("Debe obtener todos los clientes", async () => {

        clienteRepository.findAll.mockResolvedValue([
            {
                id: 1,
                nombre: "Sebastian"
            }
        ]);

        const resultado = await clienteService.getClientes();

        expect(resultado.length).toBe(1);

    });

    test("Debe obtener un cliente por ID", async () => {

        clienteRepository.findById.mockResolvedValue({
            id: 1,
            nombre: "Sebastian"
        });

        const resultado =
            await clienteService.getClienteById(1);

        expect(resultado.id).toBe(1);

    });

    test("Debe actualizar un cliente", async () => {

        clienteRepository.findById.mockResolvedValue({
            id: 1
        });

        clienteRepository.update.mockResolvedValue({
            id: 1,
            nombre: "Nuevo Nombre"
        });

        const resultado =
            await clienteService.updateCliente(1,{
                nombre:"Nuevo Nombre"
            });

        expect(resultado.nombre)
            .toBe("Nuevo Nombre");

    });

    test("Debe eliminar un cliente", async () => {

        clienteRepository.findById.mockResolvedValue({
            id:1,
            cedula:"1720000000"
        });

        clienteRepository.delete.mockResolvedValue({});

        const resultado =
            await clienteService.deleteCliente(1);

        expect(clienteRepository.delete)
            .toHaveBeenCalled();

    });

});