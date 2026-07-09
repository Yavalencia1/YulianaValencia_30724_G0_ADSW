// Primero los mocks
jest.mock("../src/repositories/usuario.repository");
jest.mock("../src/repositories/cliente.repository");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

// Luego las importaciones
const authService = require("../src/services/auth.service");

const usuarioRepository = require("../src/repositories/usuario.repository");
const clienteRepository = require("../src/repositories/cliente.repository");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

describe("AuthService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

test("Debe registrar un cliente correctamente", async () => {

        usuarioRepository.findByUsuario.mockResolvedValue(null);

        clienteRepository.findByCedula.mockResolvedValue(null);

        bcrypt.hash.mockResolvedValue("passwordHasheado");

        usuarioRepository.create.mockResolvedValue({
            id: 1,
            nombre: "Sebastian",
            usuario: "sebastian",
            rol: "Cliente",
            password: "passwordHasheado"
        });

        clienteRepository.create.mockResolvedValue({
            id: 1,
            cedula: "1720000000",
            nombre: "Sebastian"
        });

        const resultado = await authService.register(
            "Sebastian",
            "sebastian",
            "123456",
            "Cliente",
            "1720000000"
        );

        expect(resultado.usuario).toBe("sebastian");

        expect(usuarioRepository.create).toHaveBeenCalled();

        expect(clienteRepository.create).toHaveBeenCalled();

    });

    test("No debe registrar un usuario existente", async () => {

    usuarioRepository.findByUsuario.mockResolvedValue({
        id: 1,
        usuario: "sebastian"
    });

    await expect(

        authService.register(
            "Sebastian",
            "sebastian",
            "123456",
            "Cliente",
            "1720000000"
        )

    ).rejects.toThrow(
        "El nombre de usuario ya está registrado."
    );

});

test("Debe iniciar sesión correctamente", async () => {

    usuarioRepository.findByUsuario.mockResolvedValue({
        id: 1,
        nombre: "Sebastian",
        usuario: "sebastian",
        password: "passwordHasheado",
        rol: "Cliente",
        cedula: "1720000000"
    });

    bcrypt.compare.mockResolvedValue(true);

    jwt.sign.mockReturnValue("token123");

    const resultado = await authService.login(
        "sebastian",
        "123456"
    );

    expect(resultado.token).toBe("token123");

    expect(resultado.user.usuario).toBe("sebastian");

});

test("Debe lanzar error cuando el usuario no existe", async () => {

    usuarioRepository.findByUsuario.mockResolvedValue(null);

    await expect(

        authService.login(
            "usuario",
            "123456"
        )

    ).rejects.toThrow(
        "Usuario o contraseña incorrectos."
    );

});


test("Debe lanzar error cuando la contraseña es incorrecta", async () => {

    usuarioRepository.findByUsuario.mockResolvedValue({
        id: 1,
        usuario: "sebastian",
        password: "hash"
    });

    bcrypt.compare.mockResolvedValue(false);

    await expect(

        authService.login(
            "sebastian",
            "123456"
        )

    ).rejects.toThrow(
        "Usuario o contraseña incorrectos."
    );

});

test("Debe validar usuario y contraseña obligatorios", async () => {

    await expect(

        authService.login(
            "",
            ""
        )

    ).rejects.toThrow(
        "Usuario y contraseña son requeridos."
    );

});



});