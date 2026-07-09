const { ControladorReal } = require("../js/business/controlador");

global.RepositorioBaseDatos = jest.fn();
global.GestorNotificaciones = jest.fn();

describe("RF01 - Autenticación", () => {

    let controlador;
    let repoMock;

    beforeEach(() => {

        repoMock = {

            loginUsuario: jest.fn()

        };

        global.RepositorioBaseDatos.mockImplementation(() => repoMock);

        localStorage.clear();

        controlador = new ControladorReal();

    });

    test("Debe iniciar sesión correctamente", () => {

        repoMock.loginUsuario.mockReturnValue({

            token: "jwt123",

            user:{

                usuario:"admin",

                rol:"Administrador",

                nombre:"Justin",

                cedula:"1723456789"

            }

        });

        const resultado = controlador.validarCredenciales(

            "admin",

            "1234"

        );

        expect(resultado.usuario).toBe("admin");

        expect(resultado.token).toBe("jwt123");

        expect(localStorage.setItem).toHaveBeenCalled();

    });

    test("Debe devolver null cuando las credenciales son incorrectas",()=>{

        repoMock.loginUsuario.mockReturnValue(null);

        const resultado=

            controlador.validarCredenciales(

                "admin",

                "incorrecta"

            );

        expect(resultado).toBeNull();

    });

    test("Debe capturar excepciones del repositorio",()=>{

        repoMock.loginUsuario.mockImplementation(()=>{

            throw new Error("Error BD");

        });

        const resultado=

            controlador.validarCredenciales(

                "admin",

                "1234"

            );

        expect(resultado).toBeNull();

    });

});