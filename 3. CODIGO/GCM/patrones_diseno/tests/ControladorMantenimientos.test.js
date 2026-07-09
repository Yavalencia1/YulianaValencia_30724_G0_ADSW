const { ControladorReal } = require("../js/business/controlador");

global.RepositorioBaseDatos = jest.fn();
global.GestorNotificaciones = jest.fn();
global.ProveedorCorreo = jest.fn();
global.ProveedorWhatsApp = jest.fn();

global.Mantenimiento = jest.fn(function(datos){
    return datos;
});

describe("RF05 - RF09 Gestión de Mantenimientos", () => {

    let controlador;
    let repoMock;
    let gestorMock;

    beforeEach(() => {

        gestorMock = {

            setProveedor: jest.fn(),

            notificarCliente: jest.fn()

        };

        repoMock = {

            generarIdMantenimientoUnico: jest.fn(),

            guardarMantenimiento: jest.fn(),

            buscarClientePorCedula: jest.fn(),

            obtenerMantenimientos: jest.fn(),

            eliminarMantenimiento: jest.fn(),

            obtenerTecnicos: jest.fn()

        };

        global.RepositorioBaseDatos.mockImplementation(() => repoMock);

        global.GestorNotificaciones.mockImplementation(() => gestorMock);

        controlador = new ControladorReal();

    });

    const mantenimiento = {

        equipo:"Laptop",

        marca:"Dell",

        modelo:"Latitude",

        cedulaCliente:"1723456789",

        tecnicoAsignado:"tec@test.com",

        costos:{}

    };

    test("Debe registrar un mantenimiento",()=>{

        repoMock.generarIdMantenimientoUnico

            .mockReturnValue("MNT-000001");

        repoMock.guardarMantenimiento

            .mockReturnValue(true);

        repoMock.buscarClientePorCedula

            .mockReturnValue({

                nombre:"Justin",

                correo:"cliente@test.com"

            });

        const resultado=

            controlador.registrarMantenimiento({

                accion:"crear",

                mantenimiento

            });

        expect(resultado.idMantenimiento)

            .toBe("MNT-000001");

        expect(repoMock.guardarMantenimiento)

            .toHaveBeenCalled();

    });

    test("Debe generar un ID automáticamente",()=>{

        repoMock.generarIdMantenimientoUnico

            .mockReturnValue("MNT-999999");

        repoMock.guardarMantenimiento

            .mockReturnValue(true);

        repoMock.buscarClientePorCedula

            .mockReturnValue({

                nombre:"Justin"

            });

        const resultado=

            controlador.registrarMantenimiento({

                accion:"crear",

                mantenimiento

            });

        expect(resultado.idMantenimiento)

            .toBe("MNT-999999");

    });

    test("Debe rechazar datos incompletos",()=>{

        expect(()=>{

            controlador.registrarMantenimiento({

                accion:"crear",

                mantenimiento:{}

            });

        }).toThrow(

            "Datos incompletos para registrar el mantenimiento."

        );

    });

    test("Debe listar mantenimientos",()=>{

        repoMock.obtenerMantenimientos

            .mockReturnValue([

                {idMantenimiento:"MNT-1"},

                {idMantenimiento:"MNT-2"}

            ]);

        const resultado=

            controlador.registrarMantenimiento({

                accion:"listar"

            });

        expect(resultado.length).toBe(2);

    });

    test("Debe buscar un mantenimiento por ID",()=>{

        repoMock.obtenerMantenimientos

            .mockReturnValue([

                {

                    idMantenimiento:"MNT-1"

                }

            ]);

        const resultado=

            controlador.registrarMantenimiento({

                accion:"buscarPorId",

                idMantenimiento:"MNT-1"

            });

        expect(resultado.idMantenimiento)

            .toBe("MNT-1");

    });

    test("Debe buscar mantenimientos por cliente",()=>{

        repoMock.obtenerMantenimientos

            .mockReturnValue([

                {

                    idMantenimiento:"1",

                    cedulaCliente:"172"

                },

                {

                    idMantenimiento:"2",

                    cedulaCliente:"999"

                }

            ]);

        const resultado=

            controlador.registrarMantenimiento({

                accion:"buscarPorCliente",

                cedulaCliente:"172"

            });

        expect(resultado.length).toBe(1);

    });

    test("Debe eliminar un mantenimiento",()=>{

        repoMock.eliminarMantenimiento

            .mockReturnValue(true);

        const resultado=

            controlador.registrarMantenimiento({

                accion:"eliminar",

                idMantenimiento:"MNT-000001"

            });

        expect(resultado).toBe(true);

    });

    test("Debe lanzar error si no existe ID para eliminar",()=>{

        expect(()=>{

            controlador.registrarMantenimiento({

                accion:"eliminar"

            });

        }).toThrow(

            "Se requiere el ID para eliminar el mantenimiento."

        );

    });

    test("Debe lanzar error cuando la acción no existe",()=>{

        expect(()=>{

            controlador.registrarMantenimiento({

                accion:"inventada"

            });

        }).toThrow(

            "Acción de Mantenimiento no reconocida: inventada"

        );

    });

});