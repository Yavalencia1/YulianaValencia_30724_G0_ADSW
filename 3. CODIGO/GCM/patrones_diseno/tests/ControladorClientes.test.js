const { ControladorReal } = require("../js/business/controlador");

global.RepositorioBaseDatos = jest.fn();
global.GestorNotificaciones = jest.fn();

describe("RF03 - RF04 Gestión CRUD Clientes", () => {

    let controlador;
    let repoMock;

    beforeEach(() => {

        repoMock = {

            guardarCliente: jest.fn(),

            eliminarCliente: jest.fn(),

            obtenerClientes: jest.fn(),

            buscarClientePorCedula: jest.fn(),

            existeCedula: jest.fn(),

            existeCorreoCliente: jest.fn()

        };

        global.RepositorioBaseDatos.mockImplementation(() => repoMock);

        controlador = new ControladorReal();

    });

    const clienteValido = {

        nombre: "Justin",

        cedula: "1723456789",

        correo: "justin@test.com"

    };

    test("Debe crear un cliente correctamente", () => {

        repoMock.existeCedula.mockReturnValue(false);
        repoMock.existeCorreoCliente.mockReturnValue(false);

        repoMock.guardarCliente.mockReturnValue(true);

        const resultado = controlador.gestionarCRUDCliente({

            accion: "crear",

            cliente: clienteValido

        });

        expect(resultado).toBe(true);

        expect(repoMock.guardarCliente)

            .toHaveBeenCalledWith(clienteValido);

    });

    test("Debe editar un cliente", () => {

        repoMock.guardarCliente.mockReturnValue(true);

        const resultado = controlador.gestionarCRUDCliente({

            accion: "editar",

            cliente: clienteValido

        });

        expect(resultado).toBe(true);

    });

    test("Debe eliminar un cliente", () => {

        repoMock.eliminarCliente.mockReturnValue(true);

        const resultado = controlador.gestionarCRUDCliente({

            accion: "eliminar",

            cedula: "1723456789"

        });

        expect(resultado).toBe(true);

        expect(repoMock.eliminarCliente)

            .toHaveBeenCalledWith("1723456789");

    });

    test("Debe listar clientes", () => {

        repoMock.obtenerClientes.mockReturnValue([

            clienteValido

        ]);

        const resultado = controlador.gestionarCRUDCliente({

            accion: "listar"

        });

        expect(resultado.length).toBe(1);

    });

    test("Debe buscar un cliente por cédula", () => {

        repoMock.buscarClientePorCedula.mockReturnValue(

            clienteValido

        );

        const resultado = controlador.gestionarCRUDCliente({

            accion: "buscar",

            cedula: "1723456789"

        });

        expect(resultado.nombre).toBe("Justin");

    });

    test("Debe lanzar excepción si faltan campos obligatorios", () => {

        expect(() => {

            controlador.gestionarCRUDCliente({

                accion: "crear",

                cliente: {

                    nombre: "",

                    cedula: "",

                    correo: ""

                }

            });

        }).toThrow(

            "Campos obligatorios faltantes para el cliente."

        );

    });

    test("Debe impedir cédulas duplicadas", () => {

        repoMock.existeCedula.mockReturnValue(true);

        expect(() => {

            controlador.gestionarCRUDCliente({

                accion: "crear",

                cliente: clienteValido

            });

        }).toThrow(

            "Esta cédula de identidad ya está registrada en el sistema."

        );

    });

    test("Debe impedir correos duplicados", () => {

        repoMock.existeCedula.mockReturnValue(false);

        repoMock.existeCorreoCliente.mockReturnValue(true);

        expect(() => {

            controlador.gestionarCRUDCliente({

                accion: "crear",

                cliente: clienteValido

            });

        }).toThrow(

            "Este correo electrónico ya está registrado en el sistema."

        );

    });

    test("Debe validar formato del correo", () => {

        repoMock.existeCedula.mockReturnValue(false);

        repoMock.existeCorreoCliente.mockReturnValue(false);

        expect(() => {

            controlador.gestionarCRUDCliente({

                accion: "crear",

                cliente: {

                    nombre: "Justin",

                    cedula: "1723456789",

                    correo: "correoInvalido"

                }

            });

        }).toThrow(

            "Ingrese un correo electrónico válido."

        );

    });

    test("Debe lanzar excepción si no se envía cédula para eliminar", () => {

        expect(() => {

            controlador.gestionarCRUDCliente({

                accion: "eliminar"

            });

        }).toThrow(

            "Se requiere la cédula para eliminar el cliente."

        );

    });

    test("Debe lanzar excepción si la acción no existe", () => {

        expect(() => {

            controlador.gestionarCRUDCliente({

                accion: "accionInventada"

            });

        }).toThrow(

            "Acción CRUD de Cliente no reconocida: accionInventada"

        );

    });

});