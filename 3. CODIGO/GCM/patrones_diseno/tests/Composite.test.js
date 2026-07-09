const {
    Mantenimiento,
    GrupoMantenimientos
} = require("../js/patterns/composite");

describe("Patrón Composite - Gestión de Mantenimientos", () => {

    let mantenimiento1;
    let mantenimiento2;
    let mantenimiento3;

    beforeEach(() => {

        mantenimiento1 = new Mantenimiento({

            idMantenimiento: "MNT-001",

            equipo: "Laptop",

            marca: "Dell",

            modelo: "Latitude",

            costos: {

                totalMantenimiento: 100,

                abono: 20

            }

        });

        mantenimiento2 = new Mantenimiento({

            idMantenimiento: "MNT-002",

            equipo: "Celular",

            marca: "Samsung",

            modelo: "S24",

            costos: {

                totalMantenimiento: 250,

                abono: 100

            }

        });

        mantenimiento3 = new Mantenimiento({

            idMantenimiento: "MNT-003",

            equipo: "Tablet",

            marca: "Apple",

            modelo: "iPad",

            costos: {

                totalMantenimiento: 150,

                abono: 50

            }

        });

    });

    test("Una hoja debe representar un solo equipo", () => {

        expect(

            mantenimiento1.obtenerCantidadEquipos()

        ).toBe(1);

    });

    test("Una hoja debe devolver su costo correctamente", () => {

        expect(

            mantenimiento1.obtenerCostoTotal()

        ).toBe(100);

    });

    test("Debe calcular automáticamente el saldo", () => {

        expect(

            mantenimiento1.costos.saldo

        ).toBe(80);

    });

    test("Un grupo vacío debe costar cero", () => {

        const grupo = new GrupoMantenimientos();

        expect(

            grupo.obtenerCostoTotal()

        ).toBe(0);

    });

    test("Un grupo vacío debe contener cero equipos", () => {

        const grupo = new GrupoMantenimientos();

        expect(

            grupo.obtenerCantidadEquipos()

        ).toBe(0);

    });

    test("Debe sumar correctamente los costos", () => {

        const grupo = new GrupoMantenimientos();

        grupo.agregar(mantenimiento1);

        grupo.agregar(mantenimiento2);

        grupo.agregar(mantenimiento3);

        expect(

            grupo.obtenerCostoTotal()

        ).toBe(500);

    });

    test("Debe sumar correctamente la cantidad de equipos", () => {

        const grupo = new GrupoMantenimientos();

        grupo.agregar(mantenimiento1);

        grupo.agregar(mantenimiento2);

        grupo.agregar(mantenimiento3);

        expect(

            grupo.obtenerCantidadEquipos()

        ).toBe(3);

    });

    test("Debe remover un mantenimiento", () => {

        const grupo = new GrupoMantenimientos();

        grupo.agregar(mantenimiento1);

        grupo.agregar(mantenimiento2);

        grupo.remover(mantenimiento2);

        expect(

            grupo.obtenerCantidadEquipos()

        ).toBe(1);

    });

    test("Debe soportar Composite anidado", () => {

        const grupoPrincipal = new GrupoMantenimientos();

        const grupoSecundario = new GrupoMantenimientos();

        grupoPrincipal.agregar(mantenimiento1);

        grupoSecundario.agregar(mantenimiento2);

        grupoSecundario.agregar(mantenimiento3);

        grupoPrincipal.agregar(grupoSecundario);

        expect(

            grupoPrincipal.obtenerCantidadEquipos()

        ).toBe(3);

        expect(

            grupoPrincipal.obtenerCostoTotal()

        ).toBe(500);

    });

    test("Debe lanzar excepción cuando se agrega un objeto inválido", () => {

        const grupo = new GrupoMantenimientos();

        expect(() => {

            grupo.agregar({

                nombre: "Objeto"

            });

        }).toThrow();

    });

});