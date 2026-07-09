/**
 * Capa de Patrones: Patrón PROXY
 * Intercepta todas las llamadas a ControladorReal para aplicar:
 * 1. Validación de sesión activa.
 * 2. Control de acceso basado en Roles (Administrador, Técnico, Cliente).
 * 3. Registro de logs de seguridad y auditoría en LocalStorage.
 */

/**
 * Interfaz IControladorPrincipal (Simulada en JS)
 */
class IControladorPrincipal {
    constructor() {
        if (this.constructor === IControladorPrincipal) {
            throw new TypeError("No se puede instanciar directamente una interfaz.");
        }
    }

    validarCredenciales(user, pass) { throw new Error("Método no implementado."); }
    gestionarCRUDCliente(datos) { throw new Error("Método no implementado."); }
    gestionarCRUDTecnico(datos) { throw new Error("Método no implementado."); }
    registrarMantenimiento(datos) { throw new Error("Método no implementado."); }
    generarEstadisticas(periodo, filtro) { throw new Error("Método no implementado."); }
}

/**
 * Clase ProxyControlador
 * Implementa IControladorPrincipal y actúa como intermediario seguro.
 */
class ProxyControlador extends IControladorPrincipal {
    constructor() {
        super();
        this.controladorReal = new ControladorReal();
        // Cargar sesión activa persistida en LocalStorage (esencial para el esquema multi-página)
        this.sesionActiva = JSON.parse(localStorage.getItem('sesionActiva')) || null;
        this.repo = new RepositorioBaseDatos(); // Para auditoría directa en caso de error/bloqueo
    }

    /**
     * Verifica los permisos para una operación específica basada en la sesión activa y los parámetros.
     * @param {string} operacion Nombre del permiso requerido
     * @param {Object} contextoParámetros Parámetros opcionales para comprobaciones finas (ej. ID de cliente)
     */
    verificarPermisos(operacion, contextoParámetros = {}) {
        // Operaciones de login están siempre permitidas
        if (operacion === 'LOGIN') return true;

        // Validar sesión activa
        if (!this.sesionActiva) {
            this.repo.guardarLog('Anónimo', 'ACCESO_NO_AUTORIZADO', `Intento de operación '${operacion}' sin sesión activa.`);
            throw new Error("Sesión no iniciada. Debe ingresar al sistema.");
        }

        const rol = this.sesionActiva.rol;

        // ADMINISTRADOR: Acceso total
        if (rol === 'Administrador') {
            return true;
        }

        // TÉCNICO: Acceso limitado
        if (rol === 'Técnico') {
            const operacionesPermitidas = [
                'CRUD_CLIENTE_LEER',
                'MANTENIMIENTO_REGISTRAR',
                'MANTENIMIENTO_EDITAR',
                'MANTENIMIENTO_LEER'
            ];

            if (operacionesPermitidas.includes(operacion)) {
                return true;
            }
        }

        // CLIENTE: Acceso ultra-restringido
        if (rol === 'Cliente') {
            // El cliente solo puede consultar mantenimientos asociados a su propio número de cédula
            if (operacion === 'MANTENIMIENTO_CLIENTE_LEER') {
                const cedulaConsulta = contextoParámetros.cedulaCliente;
                if (cedulaConsulta === this.sesionActiva.cedula) {
                    return true;
                } else {
                    this.repo.guardarLog(
                        this.sesionActiva.usuario,
                        'VIOLACION_SEGURIDAD',
                        `El cliente intentó consultar mantenimientos de otra cédula: ${cedulaConsulta}`
                    );
                    throw new Error("Acceso denegado: Solo puede consultar sus propios equipos.");
                }
            }
        }

        // Si no cumple ningún criterio, bloquear
        this.repo.guardarLog(
            this.sesionActiva.usuario,
            'ACCESO_BLOQUEADO',
            `Intento de operación no autorizada: '${operacion}' con el rol '${rol}'`
        );
        throw new Error(`Acceso denegado: El rol '${rol}' no tiene permisos para realizar esta acción.`);
    }

    // ==========================================
    // MÉTODOS DE LA INTERFAZ DELEGADOS AL REAL BAJO SEGURIDAD
    // ==========================================

    validarCredenciales(user, pass) {
        // Esta operación es pública, pero el Proxy se encarga de auditarla
        try {
            const usuario = this.controladorReal.validarCredenciales(user, pass);
            if (usuario) {
                this.sesionActiva = usuario;
                localStorage.setItem('sesionActiva', JSON.stringify(usuario));
                this.repo.guardarLog(usuario.usuario, 'LOGIN_EXITOSO', `Inicio de sesión del usuario con rol: ${usuario.rol}`);
                return usuario;
            } else {
                this.repo.guardarLog(user, 'LOGIN_FALLIDO', `Intento de acceso fallido para el usuario.`);
                return null;
            }
        } catch (e) {
            this.repo.guardarLog(user, 'ERROR_SISTEMA', `Error en autenticación: ${e.message}`);
            throw e;
        }
    }

    /**
     * Cierra la sesión activa actual.
     */
    cerrarSesion() {
        if (this.sesionActiva) {
            const usuario = this.sesionActiva.usuario;
            this.sesionActiva = null;
            localStorage.removeItem('sesionActiva');
            this.repo.guardarLog(usuario, 'LOGOUT', 'Cierre de sesión voluntario.');
        }
        return true;
    }

    gestionarCRUDCliente(datos) {
        const { accion } = datos;
        let operacionRequerida = '';

        if (accion === 'listar' || accion === 'buscar') {
            operacionRequerida = 'CRUD_CLIENTE_LEER';
        } else {
            operacionRequerida = 'CRUD_CLIENTE_MODIFICAR'; // crear, editar, eliminar
        }

        // Evaluar permisos
        this.verificarPermisos(operacionRequerida);

        // Delegar al controlador real
        const resultado = this.controladorReal.gestionarCRUDCliente(datos);
        
        // Registrar log de auditoría
        this.repo.guardarLog(
            this.sesionActiva.usuario,
            `CLIENTE_${accion.toUpperCase()}`,
            `Operación de ${accion} cliente exitosa.`
        );

        return resultado;
    }

    gestionarCRUDTecnico(datos) {
        const { accion } = datos;
        
        // Todas las operaciones de técnico requieren permisos de administrador
        this.verificarPermisos('CRUD_TECNICO_GESTION');

        const resultado = this.controladorReal.gestionarCRUDTecnico(datos);

        this.repo.guardarLog(
            this.sesionActiva.usuario,
            `TECNICO_${accion.toUpperCase()}`,
            `Operación de ${accion} técnico realizada.`
        );

        return resultado;
    }

    registrarMantenimiento(datos) {
        const { accion } = datos;
        let operacionRequerida = '';

        if (accion === 'listar' || accion === 'buscarPorId') {
            operacionRequerida = 'MANTENIMIENTO_LEER';
        } else if (accion === 'buscarPorCliente') {
            operacionRequerida = 'MANTENIMIENTO_CLIENTE_LEER';
        } else if (accion === 'eliminar') {
            operacionRequerida = 'MANTENIMIENTO_ELIMINAR';
        } else {
            operacionRequerida = 'MANTENIMIENTO_REGISTRAR'; // crear, editar, actualizarEstado
        }

        // Evaluar permisos, pasando el contexto de cliente si aplica
        const contexto = {};
        if (accion === 'buscarPorCliente') {
            contexto.cedulaCliente = datos.cedulaCliente;
        }
        this.verificarPermisos(operacionRequerida, contexto);

        // Delegar al controlador real
        const resultado = this.controladorReal.registrarMantenimiento(datos);

        this.repo.guardarLog(
            this.sesionActiva.usuario,
            `MANTENIMIENTO_${accion.toUpperCase()}`,
            `Mantenimiento procesado (${accion}) ID: ${resultado?.idMantenimiento || datos.idMantenimiento || 'N/A'}`
        );

        return resultado;
    }

    generarEstadisticas(periodo, filtro) {
        // Solo administradores pueden ver estadísticas
        this.verificarPermisos('GENERAR_ESTADISTICAS');

        const resultado = this.controladorReal.generarEstadisticas(periodo, filtro);

        this.repo.guardarLog(
            this.sesionActiva.usuario,
            'VER_ESTADISTICAS',
            `Estadísticas generales generadas.`
        );

        return resultado;
    }
}

// Inicializar una instancia global del Proxy en el objeto window para uso de todas las pantallas
window.controlador = new ProxyControlador();
