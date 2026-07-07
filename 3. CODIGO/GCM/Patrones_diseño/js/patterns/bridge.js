/**
 * Capa de Patrones: Patrón BRIDGE
 * Desacopla la abstracción de notificaciones (GestorNotificaciones) 
 * de la implementación concreta de los canales de comunicación (IProveedorComunicaciones).
 */

/**
 * Interfaz de la Implementación (Simulada en JS)
 */
class IProveedorComunicaciones {
    constructor() {
        if (this.constructor === IProveedorComunicaciones) {
            throw new TypeError("No se puede instanciar directamente una interfaz.");
        }
    }

    enviarMensaje(destino, mensaje) {
        throw new Error("Método 'enviarMensaje()' debe ser implementado.");
    }
}

/**
 * Implementación Concreta 1: Proveedor de WhatsApp
 */
class ProveedorWhatsApp extends IProveedorComunicaciones {
    enviarMensaje(destino, mensaje) {
        console.log(`[Bridge - WhatsApp] Enviando mensaje a ${destino}: "${mensaje}"`);
        
        // Simulación: Guardamos en el registro del repositorio local
        const repo = new RepositorioBaseDatos();
        repo.guardarNotificacion('WhatsApp', destino, mensaje);
        
        return {
            exito: true,
            canal: 'WhatsApp',
            detalles: `Mensaje de WhatsApp enviado a ${destino}`
        };
    }
}

/**
 * Implementación Concreta 2: Proveedor de Correo Electrónico
 */
class ProveedorCorreo extends IProveedorComunicaciones {

    async enviarMensaje(destino, mensaje) {

        try{
            console.log("Destino:", destino);
            console.log("Mensaje:", mensaje);
            await emailjs.send(

                "service_0x6babk",

                "template_aa48rsq",

                {

                    to_email: destino,

                    mensaje: mensaje

                }

            );

            const repo = new RepositorioBaseDatos();

            repo.guardarNotificacion(
                "Correo",
                destino,
                mensaje
            );

            return{

                exito:true,

                canal:"Correo",

                detalles:`Correo enviado a ${destino}`

            };

        }catch(error){

            console.error(error);

            return{

                exito:false,

                canal:"Correo",

                detalles:"No se pudo enviar el correo"

            };

        }

    }

}

/**
 * Abstracción: GestorNotificaciones
 */
class GestorNotificaciones {
    constructor(proveedor = null) {
        this.proveedor = proveedor || new ProveedorWhatsApp(); // WhatsApp por defecto
    }

    /**
     * Define el proveedor de comunicaciones concreto a utilizar (Bridge Link).
     * @param {IProveedorComunicaciones} proveedor
     */
    setProveedor(proveedor) {
        if (proveedor instanceof IProveedorComunicaciones) {
            this.proveedor = proveedor;
        } else {
            throw new TypeError("El proveedor debe implementar IProveedorComunicaciones.");
        }
    }

    /**
     * Envía una notificación a un cliente con un mensaje.
     * @param {Object} cliente Objeto con datos del cliente (nombre, correo, telefono)
     * @param {string} mensaje Contenido del mensaje a enviar
     */
    notificarCliente(cliente, mensaje) {
        if (!cliente) {
            console.error("[GestorNotificaciones] Error: No se especificó el cliente para notificar.");
            return false;
        }

        // Elegir el destino adecuado según el proveedor activo
        let destino = '';
        if (this.proveedor instanceof ProveedorWhatsApp) {
            destino = cliente.telefono || 'Sin número';
        } else if (this.proveedor instanceof ProveedorCorreo) {
            destino = cliente.correo || 'Sin correo';
        } else {
            destino = cliente.correo || cliente.telefono || 'Sin destino';
        }

        // Formatear mensaje personalizado para el cliente
        const mensajePersonalizado = `Hola ${cliente.nombre}, ${mensaje}`;

        // Delegar envío a la implementación concreta (Bridge)
        return this.proveedor.enviarMensaje(destino, mensajePersonalizado);
    }
}
