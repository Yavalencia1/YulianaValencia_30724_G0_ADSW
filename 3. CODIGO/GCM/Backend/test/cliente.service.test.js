// Mocks
jest.mock("../src/repositories/cliente.repository");
jest.mock("../src/repositories/usuario.repository");
jest.mock("../src/config/prisma", () => ({
    usuario: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn()
    },
    mantenimiento: {
        deleteMany: jest.fn()
    }
}));
jest.mock("bcrypt");

const clienteService = require("../src/services/cliente.service");
const clienteRepository = require("../src/repositories/cliente.repository");
const usuarioRepository = require("../src/repositories/usuario.repository");
const prisma = require("../src/config/prisma");
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
            cedula: "1710034065",
            nombre: "Sebastian"
        });
        usuarioRepository.create.mockResolvedValue({});

        const resultado = await clienteService.createCliente({
            cedula: "1710034065",
            nombre: "Sebastian",
            telefono: "0999999999",
            correo: "test@mail.com",
            fechaNacimiento: "1995-05-15"
        });

        expect(resultado.nombre).toBe("Sebastian");
    });

    test("No debe crear un cliente con cédula repetida", async () => {
        clienteRepository.findByCedula.mockResolvedValue({ id: 1 });

        await expect(
            clienteService.createCliente({
                cedula: "1710034065",
                nombre: "Sebastian"
            })
        ).rejects.toThrow(
            "Ya existe un cliente registrado con esta cédula."
        );
    });

    test("Debe impedir crear cliente con cédula inválida", async () => {
        await expect(
            clienteService.createCliente({
                cedula: "1111111111",
                nombre: "Sebastian"
            })
        ).rejects.toThrow(
            "La cédula ingresada no es válida."
        );
    });

    test("Debe impedir crear cliente con teléfono inválido", async () => {
        await expect(
            clienteService.createCliente({
                cedula: "1710034065",
                nombre: "Sebastian",
                telefono: "12345678"
            })
        ).rejects.toThrow(
            "El número de teléfono celular no es válido. Debe tener 10 dígitos y empezar con 09."
        );
    });

    test("Debe impedir crear cliente menor de 18 años", async () => {
        const hoy = new Date();
        const menorFecha = `${hoy.getFullYear() - 5}-01-01`; // Hace 5 años

        await expect(
            clienteService.createCliente({
                cedula: "1710034065",
                nombre: "Sebastian",
                fechaNacimiento: menorFecha
            })
        ).rejects.toThrow(
            "La edad permitida para el registro debe estar entre 18 y 100 años."
        );
    });

    test("Debe obtener todos los clientes", async () => {
        clienteRepository.findAll.mockResolvedValue([
            { id: 1, cedula: "1710034065", nombre: "Sebastian" }
        ]);
        prisma.usuario.findMany.mockResolvedValue([
            { cedula: "1710034065", fechaNacimiento: new Date("1995-05-15") }
        ]);

        const resultado = await clienteService.getClientes();

        expect(resultado.length).toBe(1);
        expect(resultado[0].fechaNacimiento).toBe("1995-05-15");
    });

    test("Debe obtener un cliente por ID", async () => {
        clienteRepository.findById.mockResolvedValue({
            id: 1,
            cedula: "1710034065",
            nombre: "Sebastian"
        });
        prisma.usuario.findFirst.mockResolvedValue({
            cedula: "1710034065",
            fechaNacimiento: new Date("1995-05-15")
        });

        const resultado = await clienteService.getClienteById(1);

        expect(resultado.id).toBe(1);
        expect(resultado.fechaNacimiento).toBe("1995-05-15");
    });

    test("Debe actualizar un cliente", async () => {
        clienteRepository.findById.mockResolvedValue({
            id: 1,
            cedula: "1710034065"
        });
        prisma.usuario.findFirst.mockResolvedValue({
            cedula: "1710034065",
            fechaNacimiento: new Date("1995-05-15")
        });
        clienteRepository.update.mockResolvedValue({
            id: 1,
            nombre: "Nuevo Nombre"
        });
        prisma.usuario.updateMany.mockResolvedValue({});

        const resultado = await clienteService.updateCliente(1, {
            nombre: "Nuevo Nombre",
            telefono: "0999999999",
            fechaNacimiento: "1990-01-01"
        });

        expect(resultado.nombre).toBe("Nuevo Nombre");
    });

    test("Debe eliminar un cliente", async () => {
        clienteRepository.findById.mockResolvedValue({
            id: 1,
            cedula: "1710034065"
        });
        clienteRepository.delete.mockResolvedValue({});
        prisma.usuario.findFirst.mockResolvedValue({
            cedula: "1710034065",
            fechaNacimiento: new Date("1995-05-15")
        });
        prisma.usuario.deleteMany.mockResolvedValue({});
        prisma.mantenimiento.deleteMany.mockResolvedValue({});

        await clienteService.deleteCliente(1);

        expect(clienteRepository.delete).toHaveBeenCalled();
    });

});