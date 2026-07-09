/**
 * Capa de Datos: RepositorioBaseDatos
 * Encargado de la persistencia de datos mediante comunicación síncrona con el Backend (PostgreSQL en Docker).
 * Implementa el patrón Adapter para transformar respuestas de la base de datos a estructuras del frontend.
 */
class RepositorioBaseDatos {
    constructor() {
        this.initDatabase();
    }

    /**
     * Inicializa logs y notificaciones en LocalStorage si no existen.
     */
    initDatabase() {
        if (!localStorage.getItem('logs')) {
            localStorage.setItem('logs', JSON.stringify([]));
        }
        if (!localStorage.getItem('notificaciones_enviadas')) {
            localStorage.setItem('notificaciones_enviadas', JSON.stringify([]));
        }
    }

    /**
     * Cliente HTTP síncrono para comunicarse con la API de Node/Express.
     */
    apiRequest(method, endpoint, body = null) {
        const xhr = new XMLHttpRequest();
        const url = `http://localhost:3000/api${endpoint}`;
        xhr.open(method, url, false); // Petición síncrona para compatibilidad con la arquitectura del frontend
        xhr.setRequestHeader("Content-Type", "application/json");

        // Adjuntar Token JWT en las cabeceras de autorización
        const sesion = JSON.parse(localStorage.getItem('sesionActiva'));
        if (sesion && sesion.token) {
            xhr.setRequestHeader("Authorization", `Bearer ${sesion.token}`);
        }

        try {
            xhr.send(body ? JSON.stringify(body) : null);
            if (xhr.status >= 200 && xhr.status < 300) {
                const res = JSON.parse(xhr.responseText);
                return res.ok ? res.data : null;
            } else {
                console.error(`Error en API ${method} ${endpoint}:`, xhr.responseText);
                const errRes = JSON.parse(xhr.responseText || "{}");
                throw new Error(errRes.error || `HTTP error ${xhr.status}`);
            }
        } catch (error) {
            console.error(`Error de conexión a ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Llama al servicio de login del backend.
     */
    loginUsuario(usuario, password) {
        return this.apiRequest('POST', '/auth/login', { usuario, password });
    }

    /**
     * Registra un cliente de forma pública (no requiere token JWT).
     */
    registrarClientePublico(datos) {
        return this.apiRequest('POST', '/auth/register', datos);
    }

    // ==========================================
    // CAPA CLIENTES
    // ==========================================

    obtenerClientes() {
        return this.apiRequest('GET', '/clientes') || [];
    }

    buscarClientePorCedula(cedula) {
        return this.apiRequest('GET', `/clientes/cedula/${cedula}`);
    }

    guardarCliente(cliente) {
        try {
            const existente = this.buscarClientePorCedula(cliente.cedula);
            if (existente) {
                return this.apiRequest('PUT', `/clientes/${existente.id}`, cliente);
            }
        } catch (e) {
            // Si el backend responde 404, asumimos que no existe y pasamos al POST
        }
        return this.apiRequest('POST', '/clientes', cliente);
    }

    eliminarCliente(cedula) {
        const cliente = this.buscarClientePorCedula(cedula);
        if (cliente) {
            this.apiRequest('DELETE', `/clientes/${cliente.id}`);
            return true;
        }
        return false;
    }

    // ==========================================
    // CAPA TÉCNICOS
    // ==========================================

    obtenerTecnicos() {
        return this.apiRequest('GET', '/tecnicos') || [];
    }

    guardarTecnico(tecnico) {
        const tecnicos = this.obtenerTecnicos();
        const existente = tecnicos.find(t => t.correo === tecnico.correo);
        if (existente) {
            return this.apiRequest('PUT', `/tecnicos/${existente.id}`, tecnico);
        }
        return this.apiRequest('POST', '/tecnicos', tecnico);
    }

    eliminarTecnico(correo) {
        const tecnicos = this.obtenerTecnicos();
        const tecnico = tecnicos.find(t => t.correo === correo);
        if (tecnico) {
            this.apiRequest('DELETE', `/tecnicos/${tecnico.id}`);
            return true;
        }
        return false;
    }

    // ==========================================
    // CAPA MANTENIMIENTOS
    // ==========================================

    obtenerMantenimientos() {
        const sesion = JSON.parse(localStorage.getItem('sesionActiva'));
        let mantenimientos = [];
        if (sesion && sesion.rol === 'Cliente' && sesion.cedula) {
            try {
                const cliente = this.buscarClientePorCedula(sesion.cedula);
                if (cliente) {
                    mantenimientos = this.apiRequest('GET', `/mantenimientos/cliente/${cliente.id}`) || [];
                }
            } catch (err) {
                console.error("Error al obtener mantenimientos específicos del cliente:", err);
            }
        } else {
            mantenimientos = this.apiRequest('GET', '/mantenimientos') || [];
        }
        return mantenimientos.map(m => this.mapMantenimientoToFrontend(m));
    }

    guardarMantenimiento(mantenimiento) {
        const cliente = this.buscarClientePorCedula(mantenimiento.cedulaCliente);
        if (!cliente) throw new Error(`El cliente con cédula ${mantenimiento.cedulaCliente} no existe.`);

        const tecnicos = this.obtenerTecnicos();
        const tecnico = tecnicos.find(t => t.correo === mantenimiento.tecnicoAsignado);
        if (!tecnico) throw new Error(`El técnico con correo ${mantenimiento.tecnicoAsignado} no existe.`);

        const payload = {
            tipo: mantenimiento.tipoEquipo || "General",
            descripcion: `${mantenimiento.equipo} (${mantenimiento.marca} ${mantenimiento.modelo}). Obs: ${mantenimiento.costos?.observaciones || ""}`,
            fecha: mantenimiento.fechaRegistro ? new Date(mantenimiento.fechaRegistro) : new Date(),
            estado: mantenimiento.costos?.estado || "Recibido",
            costo: parseFloat(mantenimiento.costos?.totalMantenimiento || 0),
            clienteId: cliente.id,
            tecnicoId: tecnico.id
        };

        // Buscar si el mantenimiento ya existe por ID
        let existente = null;
        try {
            const numericId = parseInt(mantenimiento.idMantenimiento?.replace("MNT-", ""));
            if (!isNaN(numericId)) {
                existente = this.apiRequest('GET', `/mantenimientos/${numericId}`);
            }
        } catch (e) {}

        if (existente) {
            this.apiRequest('PUT', `/mantenimientos/${existente.id}`, payload);
        } else {
            this.apiRequest('POST', '/mantenimientos', payload);
        }
        return true;
    }

    eliminarMantenimiento(idMantenimiento) {
        const numericId = parseInt(idMantenimiento.replace("MNT-", ""));
        if (!isNaN(numericId)) {
            this.apiRequest('DELETE', `/mantenimientos/${numericId}`);
            return true;
        }
        return false;
    }

    /**
     * Mapea un modelo de base de datos Postgres a la estructura esperada por el Frontend.
     * Implementación del Patrón Adapter.
     */
    mapMantenimientoToFrontend(m) {
        let equipo = "Dispositivo";
        let marca = "";
        let modelo = "";
        let observaciones = m.descripcion;

        if (m.descripcion.includes(" (") && m.descripcion.includes(")")) {
            equipo = m.descripcion.split(" (")[0];
            const parts = m.descripcion.split(" (")[1].split(")")[0].split(" ");
            marca = parts[0] || "";
            modelo = parts.slice(1).join(" ") || "";
        }

        if (m.descripcion.includes(". Obs: ")) {
            observaciones = m.descripcion.split(". Obs: ")[1];
        }

        return {
            idMantenimiento: `MNT-${m.id.toString().padStart(6, '0')}`,
            fechaRegistro: m.fecha ? m.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
            equipo: equipo,
            modelo: modelo,
            marca: marca,
            clavePin: "1234",
            numeroSerieImei: "N/A",
            accesorios: "Ninguno",
            tipoEquipo: m.tipo,
            daños: {
                enciende: true,
                botones: true,
                camara: true,
                sensores: true,
                touchId: true,
                wifi: true,
                senal: true,
                sonido: true,
                carga: true
            },
            costos: {
                observaciones: observaciones,
                totalMantenimiento: m.costo,
                abono: m.costo,
                saldo: 0,
                fechaEstimadaEntrega: m.fecha ? m.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
                estado: m.estado
            },
            cedulaCliente: m.cliente?.cedula || "",
            tecnicoAsignado: m.tecnico?.correo || ""
        };
    }

    // ==========================================
    // AUDITORÍA Y REGISTROS LOCALES (LocalStorage)
    // ==========================================

    obtenerLogs() {
        return JSON.parse(localStorage.getItem('logs')) || [];
    }

    guardarLog(usuario, operacion, detalle) {
        const logs = this.obtenerLogs();
        const nuevoLog = {
            fecha: new Date().toISOString(),
            usuario: usuario || 'Anónimo',
            operacion: operacion,
            detalle: detalle
        };
        logs.unshift(nuevoLog);
        localStorage.setItem('logs', JSON.stringify(logs.slice(0, 500)));
        return true;
    }

    registrarLog(logData) {
        return this.guardarLog(logData.usuario, logData.operacion, logData.detalle);
    }

    obtenerNotificaciones() {
        return JSON.parse(localStorage.getItem('notificaciones_enviadas')) || [];
    }

    guardarNotificacion(proveedor, destino, mensaje) {
        const notificaciones = this.obtenerNotificaciones();
        const nuevaNotif = {
            fecha: new Date().toISOString(),
            proveedor: proveedor,
            destino: destino,
            mensaje: mensaje
        };
        notificaciones.unshift(nuevaNotif);
        localStorage.setItem('notificaciones_enviadas', JSON.stringify(notificaciones.slice(0, 200)));
        return true;
    }

    // ==========================================
    // CAPA VALIDACIONES
    // ==========================================

    existeCedula(cedula) {
        try {
            const c = this.buscarClientePorCedula(cedula);
            return !!c;
        } catch (e) {
            return false;
        }
    }

    existeCorreoCliente(correo) {
        const clientes = this.obtenerClientes();
        return clientes.some(c => c.correo.toLowerCase() === correo.toLowerCase());
    }

    existeCorreoTecnico(correo) {
        const tecnicos = this.obtenerTecnicos();
        return tecnicos.some(t => t.correo.toLowerCase() === correo.toLowerCase());
    }

    generarIdMantenimientoUnico() {
        return `MNT-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
    }

    obtenerTecnicosActivos() {
        return this.obtenerTecnicos();
    }

    obtenerVolumen() {
        return {
            totalClientes: this.obtenerClientes().length,
            totalTecnicos: this.obtenerTecnicos().length,
            totalMantenimientos: this.obtenerMantenimientos().length,
            totalLogs: this.obtenerLogs().length
        };
    }
}
if (typeof module !== "undefined") {

    module.exports = {

        RepositorioBaseDatos

    };

}