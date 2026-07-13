const { ControladorReal } = require("../js/business/controlador");
const { Mantenimiento, GrupoMantenimientos } = require("../js/patterns/composite");

global.Mantenimiento = Mantenimiento;
global.GrupoMantenimientos = GrupoMantenimientos;
global.RepositorioBaseDatos = jest.fn();
global.GestorNotificaciones = jest.fn();

describe("RF12 - RF18 Consultas y Estadísticas", () => {

    let controlador;
    let repoMock;

    beforeEach(() => {

        repoMock = {

            obtenerMantenimientos: jest.fn()

        };

        global.RepositorioBaseDatos.mockImplementation(() => repoMock);

        controlador = new ControladorReal();

    });

    const mantenimientos = [

        {

            idMantenimiento:"MNT-001",

            marca:"Dell",

            fechaRegistro:"2026-07-01",

            cedulaCliente:"111",

            tecnicoAsignado:"tec1@test.com",

            costos:{

                totalMantenimiento:100,

                abono:50,

                saldo:50,

                estado:"Recibido"

            }

        },

        {

            idMantenimiento:"MNT-002",

            marca:"HP",

            fechaRegistro:"2026-07-02",

            cedulaCliente:"222",

            tecnicoAsignado:"tec2@test.com",

            costos:{

                totalMantenimiento:200,

                abono:200,

                saldo:0,

                estado:"Entregado"

            }

        },

        {

            idMantenimiento:"MNT-003",

            marca:"Dell",

            fechaRegistro:"2026-08-01",

            cedulaCliente:"111",

            tecnicoAsignado:"tec1@test.com",

            costos:{

                totalMantenimiento:300,

                abono:100,

                saldo:200,

                estado:"En Reparación"

            }

        }

    ];

    test("Debe buscar mantenimientos por cliente",()=>{

        repoMock.obtenerMantenimientos.mockReturnValue(mantenimientos);

        const resultado=

            controlador.registrarMantenimiento({

                accion:"buscarPorCliente",

                cedulaCliente:"111"

            });

        expect(resultado.length).toBe(2);

    });

    test("Debe buscar mantenimiento por ID",()=>{

        repoMock.obtenerMantenimientos.mockReturnValue(mantenimientos);

        const resultado=

            controlador.registrarMantenimiento({

                accion:"buscarPorId",

                idMantenimiento:"MNT-002"

            });

        expect(resultado.idMantenimiento)

            .toBe("MNT-002");

    });

    test("Debe listar todos los mantenimientos",()=>{

        repoMock.obtenerMantenimientos.mockReturnValue(mantenimientos);

        const resultado=

            controlador.registrarMantenimiento({

                accion:"listar"

            });

        expect(resultado.length)

            .toBe(3);

    });

    test("Debe calcular correctamente el total facturado",()=>{

        repoMock.obtenerMantenimientos.mockReturnValue(mantenimientos);

        const estadisticas=

            controlador.generarEstadisticas();

        expect(

            estadisticas.totales.totalFacturado

        ).toBe(600);

    });

    test("Debe calcular correctamente el total abonado",()=>{

        repoMock.obtenerMantenimientos.mockReturnValue(mantenimientos);

        const estadisticas=

            controlador.generarEstadisticas();

        expect(

            estadisticas.totales.totalAbonado

        ).toBe(350);

    });

    test("Debe calcular correctamente el saldo pendiente",()=>{

        repoMock.obtenerMantenimientos.mockReturnValue(mantenimientos);

        const estadisticas=

            controlador.generarEstadisticas();

        expect(

            estadisticas.totales.totalSaldos

        ).toBe(250);

    });

    test("Debe calcular el promedio de ingresos",()=>{

        repoMock.obtenerMantenimientos.mockReturnValue(mantenimientos);

        const estadisticas=

            controlador.generarEstadisticas();

        expect(

            estadisticas.totales.promedioIngresos

        ).toBe(200);

    });

    test("Debe agrupar correctamente por marca",()=>{

        repoMock.obtenerMantenimientos.mockReturnValue(mantenimientos);

        const estadisticas=

            controlador.generarEstadisticas();

        expect(

            estadisticas.porMarca.length

        ).toBe(2);

    });

    test("Debe agrupar correctamente por estado",()=>{

        repoMock.obtenerMantenimientos.mockReturnValue(mantenimientos);

        const estadisticas=

            controlador.generarEstadisticas();

        expect(

            estadisticas.porEstado.length

        ).toBe(4);

    });

    test("Debe agrupar correctamente por mes",()=>{

        repoMock.obtenerMantenimientos.mockReturnValue(mantenimientos);

        const estadisticas=

            controlador.generarEstadisticas();

        expect(

            estadisticas.porMes.length

        ).toBe(2);

    });

    test("Debe devolver cero cuando no existen mantenimientos",()=>{

        repoMock.obtenerMantenimientos.mockReturnValue([]);

        const estadisticas=

            controlador.generarEstadisticas();

        expect(

            estadisticas.totales.totalFacturado

        ).toBe(0);

        expect(

            estadisticas.totales.totalEquipos

        ).toBe(0);

    });

});