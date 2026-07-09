jest.mock("../src/repositories/tecnico.repository");
jest.mock("../src/repositories/usuario.repository");
jest.mock("bcrypt");

const tecnicoService = require("../src/services/tecnico.service");

const tecnicoRepository = require("../src/repositories/tecnico.repository");
const usuarioRepository = require("../src/repositories/usuario.repository");

const bcrypt = require("bcrypt");

describe("TecnicoService", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Debe crear un técnico correctamente", async () => {

        tecnicoRepository.findByCorreo.mockResolvedValue(null);

        bcrypt.hash.mockResolvedValue("passwordHasheado");

        tecnicoRepository.create.mockResolvedValue({
            id: 1,
            nombre: "Carlos",
            especialidad: "Computadores"
        });

        usuarioRepository.create.mockResolvedValue({});

        const resultado = await tecnicoService.createTecnico({
            nombre: "Carlos",
            especialidad: "Computadores",
            correo: "carlos@gmail.com"
        });

        expect(resultado.nombre).toBe("Carlos");

    });

    test("No debe registrar un correo duplicado", async () => {

        tecnicoRepository.findByCorreo.mockResolvedValue({
            id: 1
        });

        await expect(

            tecnicoService.createTecnico({
                nombre: "Carlos",
                especialidad: "Computadores",
                correo: "carlos@gmail.com"
            })

        ).rejects.toThrow(
            "Ya existe un técnico registrado con este correo."
        );

    });

    test("Debe obtener todos los técnicos", async () => {

        tecnicoRepository.findAll.mockResolvedValue([
            {
                id: 1,
                nombre: "Carlos"
            }
        ]);

        const resultado = await tecnicoService.getTecnicos();

        expect(resultado.length).toBe(1);

    });

    test("Debe obtener un técnico por ID", async () => {

        tecnicoRepository.findById.mockResolvedValue({
            id: 1,
            nombre: "Carlos"
        });

        const resultado =
            await tecnicoService.getTecnicoById(1);

        expect(resultado.id).toBe(1);

    });

    test("Debe actualizar un técnico", async () => {

        tecnicoRepository.findById.mockResolvedValue({
            id: 1
        });

        tecnicoRepository.update.mockResolvedValue({
            id: 1,
            nombre: "Nuevo Técnico"
        });

        const resultado =
            await tecnicoService.updateTecnico(1, {
                nombre: "Nuevo Técnico"
            });

        expect(resultado.nombre)
            .toBe("Nuevo Técnico");

    });

    test("Debe eliminar un técnico", async () => {

        tecnicoRepository.findById.mockResolvedValue({
            id: 1,
            correo: "carlos@gmail.com"
        });

        tecnicoRepository.delete.mockResolvedValue({});

        await tecnicoService.deleteTecnico(1);

        expect(tecnicoRepository.delete)
            .toHaveBeenCalled();

    });

});