const {
    GestorNotificaciones,
    ProveedorCorreo,
    ProveedorWhatsApp,
    IProveedorComunicaciones
} = require("../js/patterns/bridge");

global.RepositorioBaseDatos = jest.fn();

global.emailjs = {

    send: jest.fn(() => Promise.resolve())

};

describe("RF10 - RF11 Patrón Bridge", () => {

    let repoMock;

    beforeEach(() => {

        repoMock = {

            guardarNotificacion: jest.fn()

        };

        global.RepositorioBaseDatos.mockImplementation(() => repoMock);

        jest.clearAllMocks();

    });

    test("Debe utilizar WhatsApp por defecto", () => {

        const gestor = new GestorNotificaciones();

        expect(

            gestor.proveedor

        ).toBeInstanceOf(ProveedorWhatsApp);

    });

    test("Debe cambiar correctamente a proveedor Correo", () => {

        const gestor = new GestorNotificaciones();

        gestor.setProveedor(

            new ProveedorCorreo()

        );

        expect(

            gestor.proveedor

        ).toBeInstanceOf(ProveedorCorreo);

    });

    test("Debe lanzar excepción cuando el proveedor no implementa la interfaz", () => {

        const gestor = new GestorNotificaciones();

        expect(() => {

            gestor.setProveedor({});

        }).toThrow(

            "El proveedor debe implementar IProveedorComunicaciones."

        );

    });

    test("Debe enviar mensaje por WhatsApp", () => {

        const proveedor = new ProveedorWhatsApp();

        const spy = jest.spyOn(

            proveedor,

            "enviarMensaje"

        );

        const gestor = new GestorNotificaciones(proveedor);

        gestor.notificarCliente({

            nombre:"Justin",

            telefono:"0999999999"

        },

        "Su equipo está listo");

        expect(

            spy

        ).toHaveBeenCalled();

    });

    test("Debe enviar mensaje por Correo", async () => {

        const proveedor = new ProveedorCorreo();

        const spy = jest.spyOn(

            proveedor,

            "enviarMensaje"

        );

        const gestor = new GestorNotificaciones(proveedor);

        await gestor.notificarCliente({

            nombre:"Justin",

            correo:"justin@test.com"

        },

        "Su equipo está listo");

        expect(

            spy

        ).toHaveBeenCalled();

    });

    test("Debe utilizar el teléfono cuando el proveedor es WhatsApp", () => {

        const proveedor = new ProveedorWhatsApp();

        const spy = jest.spyOn(

            proveedor,

            "enviarMensaje"

        );

        const gestor = new GestorNotificaciones(proveedor);

        gestor.notificarCliente({

            nombre:"Justin",

            telefono:"0999999999"

        },

        "Mensaje");

        expect(

            spy

        ).toHaveBeenCalledWith(

            "0999999999",

            expect.stringContaining("Hola Justin")

        );

    });

    test("Debe utilizar el correo cuando el proveedor es Correo", async () => {

        const proveedor = new ProveedorCorreo();

        const spy = jest.spyOn(

            proveedor,

            "enviarMensaje"

        );

        const gestor = new GestorNotificaciones(proveedor);

        await gestor.notificarCliente({

            nombre:"Justin",

            correo:"justin@test.com"

        },

        "Mensaje");

        expect(

            spy

        ).toHaveBeenCalledWith(

            "justin@test.com",

            expect.stringContaining("Hola Justin")

        );

    });

    test("Debe retornar false cuando no existe cliente", () => {

        const gestor = new GestorNotificaciones();

        expect(

            gestor.notificarCliente(

                null,

                "Mensaje"

            )

        ).toBe(false);

    });

    test("Proveedor WhatsApp debe registrar la notificación", () => {

        const proveedor = new ProveedorWhatsApp();

        proveedor.enviarMensaje(

            "0999999999",

            "Hola"

        );

        expect(

            repoMock.guardarNotificacion

        ).toHaveBeenCalled();

    });

    test("Proveedor Correo debe llamar EmailJS", async () => {

        const proveedor = new ProveedorCorreo();

        await proveedor.enviarMensaje(

            "correo@test.com",

            "Hola"

        );

        expect(

            emailjs.send

        ).toHaveBeenCalled();

    });

    test("Proveedor Correo debe registrar la notificación", async () => {

        const proveedor = new ProveedorCorreo();

        await proveedor.enviarMensaje(

            "correo@test.com",

            "Hola"

        );

        expect(

            repoMock.guardarNotificacion

        ).toHaveBeenCalled();

    });

    test("Debe personalizar el mensaje para el cliente", () => {

        const proveedor = new ProveedorWhatsApp();

        const spy = jest.spyOn(

            proveedor,

            "enviarMensaje"

        );

        const gestor = new GestorNotificaciones(proveedor);

        gestor.notificarCliente({

            nombre:"Carlos",

            telefono:"0999"

        },

        "su equipo fue entregado");

        expect(

            spy.mock.calls[0][1]

        ).toContain(

            "Hola Carlos"

        );

    });

});