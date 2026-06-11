/**
 * Capa de Datos: RepositorioBaseDatos
 * Encargado de la persistencia de datos utilizando LocalStorage.
 * Aplica diseño de almacenamiento para el sistema de mantenimientos.
 */
class RepositorioBaseDatos {
    constructor() {
        this.initDatabase();
    }

    /**
     * Inicializa las tablas en LocalStorage si no existen y carga datos de prueba.
     */
    initDatabase() {
        if (!localStorage.getItem('usuarios')) {
            const usuariosIniciales = [
                { usuario: 'admin', clave: 'admin123', rol: 'Administrador', nombre: 'Administrador del Sistema' },
                { usuario: 'tecnico1', clave: 'tec123', rol: 'Técnico', nombre: 'Carlos Gómez' },
                { usuario: 'cliente1', clave: 'cli123', rol: 'Cliente', nombre: 'Juan Pérez', cedula: '1712345678' }
            ];
            localStorage.setItem('usuarios', JSON.stringify(usuariosIniciales));
        }

        if (!localStorage.getItem('clientes')) {
            const clientesIniciales = [
                { nombre: 'Juan Pérez', cedula: '1712345678', correo: 'juan.perez@mail.com', telefono: '0987654321', usuario: 'cliente1' },
                { nombre: 'María Rodríguez', cedula: '1787654321', correo: 'maria.rod@mail.com', telefono: '0991122334', usuario: 'cliente2' },
                { nombre: 'Sofía Martínez', cedula: '0912345678', correo: 'sofia.mtz@mail.com', telefono: '0995566778', usuario: 'cliente3' }
            ];
            localStorage.setItem('clientes', JSON.stringify(clientesIniciales));
        }

        if (!localStorage.getItem('tecnicos')) {
            const tecnicosIniciales = [
                { nombre: 'Carlos Gómez', especialidad: 'Dispositivos Móviles', correo: 'carlos@mantenimiento.com', telefono: '0988888888' },
                { nombre: 'Diana López', especialidad: 'Computadoras y Redes', correo: 'diana@mantenimiento.com', telefono: '0977777777' }
            ];
            localStorage.setItem('tecnicos', JSON.stringify(tecnicosIniciales));
        }

        if (!localStorage.getItem('mantenimientos')) {
            const mantenimientosIniciales = [
                {
                    idMantenimiento: 'MNT-001',
                    fechaRegistro: '2026-06-01',
                    equipo: 'iPhone 13 Pro',
                    modelo: 'A2638',
                    marca: 'Apple',
                    clavePin: '1234',
                    numeroSerieImei: '358942104829103',
                    accesorios: 'Funda protectora',
                    tipoEquipo: 'Celular',
                    daños: {
                        enciende: true,
                        botones: true,
                        camara: false,
                        sensores: true,
                        touchId: true,
                        wifi: false,
                        senal: true,
                        sonido: true,
                        carga: false
                    },
                    costos: {
                        observaciones: 'Falla en pin de carga y módulo de cámara principal rayado. No se conecta a redes Wi-Fi.',
                        totalMantenimiento: 150.00,
                        abono: 50.00,
                        saldo: 100.00,
                        fechaEstimadaEntrega: '2026-06-05',
                        estado: 'En Reparación'
                    },
                    cedulaCliente: '1712345678',
                    tecnicoAsignado: 'carlos@mantenimiento.com'
                },
                {
                    idMantenimiento: 'MNT-002',
                    fechaRegistro: '2026-06-05',
                    equipo: 'iPad Air 5',
                    modelo: 'A2588',
                    marca: 'Apple',
                    clavePin: '9988',
                    numeroSerieImei: 'DMPHG912Q16Y',
                    accesorios: 'Apple Pencil',
                    tipoEquipo: 'Tablet',
                    daños: {
                        enciende: true,
                        botones: true,
                        camara: true,
                        sensores: true,
                        touchId: false,
                        wifi: true,
                        senal: true,
                        sonido: true,
                        carga: true
                    },
                    costos: {
                        observaciones: 'Pantalla trisada y Touch ID inoperable debido al golpe.',
                        totalMantenimiento: 220.00,
                        abono: 100.00,
                        saldo: 120.00,
                        fechaEstimadaEntrega: '2026-06-09',
                        estado: 'Listo para Entrega'
                    },
                    cedulaCliente: '1712345678',
                    tecnicoAsignado: 'carlos@mantenimiento.com'
                },
                {
                    idMantenimiento: 'MNT-003',
                    fechaRegistro: '2026-06-10',
                    equipo: 'Laptop XPS 15',
                    modelo: '9520',
                    marca: 'Dell',
                    clavePin: 'xps123',
                    numeroSerieImei: '7X8Y9Z1',
                    accesorios: 'Cargador tipo C de 130W',
                    tipoEquipo: 'Laptop',
                    daños: {
                        enciende: false,
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
                        observaciones: 'No enciende. Posible cortocircuito en placa madre después de sobretensión eléctrica.',
                        totalMantenimiento: 350.00,
                        abono: 0.00,
                        saldo: 350.00,
                        fechaEstimadaEntrega: '2026-06-15',
                        estado: 'Recibido'
                    },
                    cedulaCliente: '1787654321',
                    tecnicoAsignado: 'diana@mantenimiento.com'
                },
                {
                    idMantenimiento: 'MNT-004',
                    fechaRegistro: '2026-05-15',
                    equipo: 'Galaxy S22 Ultra',
                    modelo: 'SM-S908B',
                    marca: 'Samsung',
                    clavePin: '0000',
                    numeroSerieImei: '357123456789123',
                    accesorios: 'Ninguno',
                    tipoEquipo: 'Celular',
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
                        observaciones: 'Mantenimiento preventivo general y limpieza de parlantes.',
                        totalMantenimiento: 45.00,
                        abono: 45.00,
                        saldo: 0.00,
                        fechaEstimadaEntrega: '2026-05-16',
                        estado: 'Entregado'
                    },
                    cedulaCliente: '0912345678',
                    tecnicoAsignado: 'carlos@mantenimiento.com'
                }
            ];
            localStorage.setItem('mantenimientos', JSON.stringify(mantenimientosIniciales));
        }

        if (!localStorage.getItem('logs')) {
            const logsIniciales = [
                { fecha: new Date('2026-06-11T09:00:00').toISOString(), usuario: 'admin', operacion: 'LOGIN_EXITOSO', detalle: 'Inicio de sesión del Administrador' }
            ];
            localStorage.setItem('logs', JSON.stringify(logsIniciales));
        }

        if (!localStorage.getItem('notificaciones_enviadas')) {
            localStorage.setItem('notificaciones_enviadas', JSON.stringify([]));
        }
    }

    // ==========================================
    // MÉTODOS REQUERIDOS POR EL DIAGRAMA UML / REQUISITOS
    // ==========================================

    /**
     * Guarda o actualiza un usuario en LocalStorage.
     */
    guardarUsuario(usuario) {
        const usuarios = this.obtenerUsuarios();
        const index = usuarios.findIndex(u => u.usuario === usuario.usuario);
        if (index >= 0) {
            usuarios[index] = usuario;
        } else {
            usuarios.push(usuario);
        }
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        return true;
    }

    /**
     * Busca un cliente por su número de cédula.
     */
    buscarClientePorCedula(cedula) {
        const clientes = this.obtenerClientes();
        return clientes.find(c => c.cedula === cedula) || null;
    }

    /**
     * Guarda o actualiza un mantenimiento en la base de datos local.
     */
    guardarMantenimiento(mantenimiento) {
        const mantenimientos = this.obtenerMantenimientos();
        const index = mantenimientos.findIndex(m => m.idMantenimiento === mantenimiento.idMantenimiento);
        if (index >= 0) {
            mantenimientos[index] = mantenimiento;
        } else {
            mantenimientos.push(mantenimiento);
        }
        localStorage.setItem('mantenimientos', JSON.stringify(mantenimientos));
        return true;
    }

    /**
     * Retorna estadísticas del volumen de información del sistema.
     */
    obtenerVolumen() {
        return {
            totalClientes: this.obtenerClientes().length,
            totalTecnicos: this.obtenerTecnicos().length,
            totalMantenimientos: this.obtenerMantenimientos().length,
            totalLogs: this.obtenerLogs().length
        };
    }

    // ==========================================
    // MÉTODOS ADICIONALES PARA CRUD COMPLETO
    // ==========================================

    obtenerUsuarios() {
        return JSON.parse(localStorage.getItem('usuarios')) || [];
    }

    obtenerClientes() {
        return JSON.parse(localStorage.getItem('clientes')) || [];
    }

    guardarCliente(cliente) {
        const clientes = this.obtenerClientes();
        const index = clientes.findIndex(c => c.cedula === cliente.cedula);
        if (index >= 0) {
            clientes[index] = cliente;
        } else {
            clientes.push(cliente);
            // También crear un usuario de rol Cliente automáticamente para que pueda loguearse
            const usuarioCliente = {
                usuario: cliente.usuario || cliente.cedula,
                clave: cliente.cedula, // La clave inicial es su propia cédula
                rol: 'Cliente',
                nombre: cliente.nombre,
                cedula: cliente.cedula
            };
            this.guardarUsuario(usuarioCliente);
        }
        localStorage.setItem('clientes', JSON.stringify(clientes));
        return true;
    }

    eliminarCliente(cedula) {
        let clientes = this.obtenerClientes();
        const cliente = clientes.find(c => c.cedula === cedula);
        if (cliente) {
            clientes = clientes.filter(c => c.cedula !== cedula);
            localStorage.setItem('clientes', JSON.stringify(clientes));

            // Eliminar su usuario correspondiente
            let usuarios = this.obtenerUsuarios();
            usuarios = usuarios.filter(u => u.cedula !== cedula);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            return true;
        }
        return false;
    }

    obtenerTecnicos() {
        return JSON.parse(localStorage.getItem('tecnicos')) || [];
    }

    guardarTecnico(tecnico) {
        const tecnicos = this.obtenerTecnicos();
        const index = tecnicos.findIndex(t => t.correo === tecnico.correo);
        if (index >= 0) {
            tecnicos[index] = tecnico;
        } else {
            tecnicos.push(tecnico);
            // También crear un usuario de rol Técnico automáticamente
            const usuarioTecnico = {
                usuario: tecnico.correo.split('@')[0], // nombre de usuario derivado del correo
                clave: 'tec123', // Clave genérica para pruebas
                rol: 'Técnico',
                nombre: tecnico.nombre,
                correo: tecnico.correo
            };
            this.guardarUsuario(usuarioTecnico);
        }
        localStorage.setItem('tecnicos', JSON.stringify(tecnicos));
        return true;
    }

    eliminarTecnico(correo) {
        let tecnicos = this.obtenerTecnicos();
        const tecnico = tecnicos.find(t => t.correo === correo);
        if (tecnico) {
            tecnicos = tecnicos.filter(t => t.correo !== correo);
            localStorage.setItem('tecnicos', JSON.stringify(tecnicos));

            // Eliminar usuario correspondiente
            let usuarios = this.obtenerUsuarios();
            usuarios = usuarios.filter(u => u.correo !== correo);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            return true;
        }
        return false;
    }

    obtenerMantenimientos() {
        return JSON.parse(localStorage.getItem('mantenimientos')) || [];
    }

    eliminarMantenimiento(idMantenimiento) {
        let mantenimientos = this.obtenerMantenimientos();
        const index = mantenimientos.findIndex(m => m.idMantenimiento === idMantenimiento);
        if (index >= 0) {
            mantenimientos.splice(index, 1);
            localStorage.setItem('mantenimientos', JSON.stringify(mantenimientos));
            return true;
        }
        return false;
    }

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
        logs.unshift(nuevoLog); // Insertar al inicio para ver los más nuevos primero
        localStorage.setItem('logs', JSON.stringify(logs.slice(0, 500))); // Limitar a los últimos 500 logs
        return true;
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
}
