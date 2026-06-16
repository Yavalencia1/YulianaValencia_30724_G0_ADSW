/**
 * Capa de Negocio: ControladorReal
 * Responsable de la lógica de negocio del sistema.
 * Implementa la interfaz IControladorPrincipal de forma directa.
 */
class ControladorReal {
    constructor() {
        this.repo = new RepositorioBaseDatos();
        this.gestorNotificaciones = new GestorNotificaciones(); // Bridge
    }

    /**
     * Valida las credenciales de un usuario.
     * Retorna el objeto del usuario si coincide, null de lo contrario.
     */
    validarCredenciales(user, pass) {
        const usuarios = this.repo.obtenerUsuarios();
        const usuarioEncontrado = usuarios.find(u => u.usuario === user && u.clave === pass);
        return usuarioEncontrado ? { ...usuarioEncontrado } : null;
    }

    /**
     * Gestiona las operaciones de CRUD para Clientes.
     * @param {Object} datos Contiene el tipo de acción y los datos del cliente.
     */
    gestionarCRUDCliente(datos) {
        const { accion } = datos;
        
        switch (accion) {
            case 'crear':
            case 'editar':
                // Validación básica de campos
                if (!datos.cliente.nombre || !datos.cliente.cedula || !datos.cliente.correo) {
                    throw new Error("Campos obligatorios faltantes para el cliente.");
                }

                // Validación de duplicados en cédula (excepto si es edición del mismo cliente)
                if (accion === 'crear' && this.repo.existeCedula(datos.cliente.cedula)) {
                    throw new Error("Esta cédula de identidad ya está registrada en el sistema.");
                }

                // Validación de duplicados en correo (excepto si es edición del mismo cliente)
                if (accion === 'crear' && this.repo.existeCorreoCliente(datos.cliente.correo)) {
                    throw new Error("Este correo electrónico ya está registrado en el sistema.");
                }

                // Validación de formato de correo
                if (!datos.cliente.correo.includes('@')) {
                    throw new Error("Ingrese un correo electrónico válido.");
                }

                return this.repo.guardarCliente(datos.cliente);
                
            case 'eliminar':
                if (!datos.cedula) {
                    throw new Error("Se requiere la cédula para eliminar el cliente.");
                }
                return this.repo.eliminarCliente(datos.cedula);
                
            case 'listar':
                return this.repo.obtenerClientes();
                
            case 'buscar':
                return this.repo.buscarClientePorCedula(datos.cedula);
                
            default:
                throw new Error(`Acción CRUD de Cliente no reconocida: ${accion}`);
        }
    }

    /**
     * Gestiona las operaciones de CRUD para Técnicos.
     * @param {Object} datos Contiene el tipo de acción y los datos del técnico.
     */
    gestionarCRUDTecnico(datos) {
        const { accion } = datos;

        switch (accion) {
            case 'crear':
            case 'editar':
                if (!datos.tecnico.nombre || !datos.tecnico.correo || !datos.tecnico.especialidad) {
                    throw new Error("Campos obligatorios faltantes para el técnico.");
                }

                // Validación de duplicados en correo (excepto si es edición del mismo técnico)
                if (accion === 'crear' && this.repo.existeCorreoTecnico(datos.tecnico.correo)) {
                    throw new Error("Este correo electrónico ya está registrado como técnico.");
                }

                // Validación de formato de correo
                if (!datos.tecnico.correo.includes('@')) {
                    throw new Error("Ingrese un correo electrónico válido para el técnico.");
                }

                // Validación de especialidad no vacía
                if (datos.tecnico.especialidad.trim().length === 0) {
                    throw new Error("La especialidad del técnico no puede estar vacía.");
                }

                return this.repo.guardarTecnico(datos.tecnico);

            case 'eliminar':
                if (!datos.correo) {
                    throw new Error("Se requiere el correo electrónico para eliminar al técnico.");
                }
                return this.repo.eliminarTecnico(datos.correo);

            case 'listar':
                return this.repo.obtenerTecnicos();

            case 'listarActivos':
                return this.repo.obtenerTecnicosActivos();

            default:
                throw new Error(`Acción CRUD de Técnico no reconocida: ${accion}`);
        }
    }

    /**
     * Registra, edita, elimina o consulta mantenimientos.
     * Lanza notificaciones vía Bridge en eventos clave.
     * @param {Object} datos Contiene la acción y los datos del mantenimiento.
     */
    registrarMantenimiento(datos) {
        const { accion } = datos;

        switch (accion) {
            case 'crear': {
                const mntRaw = datos.mantenimiento;
                if (!mntRaw.equipo || !mntRaw.cedulaCliente || !mntRaw.tecnicoAsignado) {
                    throw new Error("Datos incompletos para registrar el mantenimiento.");
                }

                // Generar ID único si no viene (REQ005 - Generar ID único)
                mntRaw.idMantenimiento = mntRaw.idMantenimiento || this.repo.generarIdMantenimientoUnico();
                mntRaw.fechaRegistro = mntRaw.fechaRegistro || new Date().toISOString().split('T')[0];
                mntRaw.costos = mntRaw.costos || {};
                mntRaw.costos.estado = 'Recibido';

                const mnt = new Mantenimiento(mntRaw);
                const exito = this.repo.guardarMantenimiento(mnt);

                if (exito) {
                    // Notificar al cliente (Bridge)
                    const cliente = this.repo.buscarClientePorCedula(mnt.cedulaCliente);
                    if (cliente) {
                        // Configurar proveedor preferido o por defecto
                        const provType = datos.proveedorNotificacion || 'WhatsApp';
                        this.gestorNotificaciones.setProveedor(
                            provType === 'Correo' ? new ProveedorCorreo() : new ProveedorWhatsApp()
                        );
                        
                        const mensaje = `su equipo ${mnt.equipo} (${mnt.marca}) ha sido registrado para mantenimiento. Cód: ${mnt.idMantenimiento}. Estado: Recibido. Fecha estimada: ${mnt.costos.fechaEstimadaEntrega || 'No especificada'}.`;
                        this.gestorNotificaciones.notificarCliente(cliente, mensaje);
                    }
                }
                return mnt;
            }

            case 'editar': {
                const mntRaw = datos.mantenimiento;
                if (!mntRaw.idMantenimiento) {
                    throw new Error("Se requiere el ID de mantenimiento para editar.");
                }

                // Obtener el mantenimiento anterior para ver si cambió el estado
                const mantenimientos = this.repo.obtenerMantenimientos();
                const mntAnterior = mantenimientos.find(m => m.idMantenimiento === mntRaw.idMantenimiento);
                const estadoAnterior = mntAnterior ? mntAnterior.costos?.estado : '';

                const mnt = new Mantenimiento(mntRaw);
                const exito = this.repo.guardarMantenimiento(mnt);

                if (exito && mntAnterior) {
                    const estadoNuevo = mnt.costos.estado;
                    if (estadoAnterior !== estadoNuevo) {
                        // Enviar notificación por cambio de estado (Bridge)
                        const cliente = this.repo.buscarClientePorCedula(mnt.cedulaCliente);
                        if (cliente) {
                            const provType = datos.proveedorNotificacion || 'WhatsApp';
                            this.gestorNotificaciones.setProveedor(
                                provType === 'Correo' ? new ProveedorCorreo() : new ProveedorWhatsApp()
                            );

                            let mensaje = `el estado de su equipo ${mnt.equipo} cambió a: "${estadoNuevo}".`;
                            if (estadoNuevo === 'Listo para Entrega') {
                                mensaje = `¡excelentes noticias! Su equipo ${mnt.equipo} está LISTO PARA ENTREGA. Saldo a pagar: $${mnt.costos.saldo.toFixed(2)}.`;
                            } else if (estadoNuevo === 'Entregado') {
                                mensaje = `su equipo ${mnt.equipo} ha sido entregado formalmente. ¡Gracias por confiar en nosotros!`;
                            }
                            this.gestorNotificaciones.notificarCliente(cliente, mensaje);
                        }
                    }
                }
                return mnt;
            }

            case 'actualizarEstado': {
                const { idMantenimiento, nuevoEstado } = datos;
                const mantenimientos = this.repo.obtenerMantenimientos();
                const mntRaw = mantenimientos.find(m => m.idMantenimiento === idMantenimiento);
                
                if (!mntRaw) {
                    throw new Error(`No se encontró el mantenimiento ${idMantenimiento}`);
                }

                const estadoAnterior = mntRaw.costos.estado;
                mntRaw.costos.estado = nuevoEstado;
                
                // Si pasa a entregado, el saldo idealmente se liquida (abono = total)
                if (nuevoEstado === 'Entregado') {
                    mntRaw.costos.abono = mntRaw.costos.totalMantenimiento;
                    mntRaw.costos.saldo = 0;
                }

                const mnt = new Mantenimiento(mntRaw);
                const exito = this.repo.guardarMantenimiento(mnt);

                if (exito && estadoAnterior !== nuevoEstado) {
                    const cliente = this.repo.buscarClientePorCedula(mnt.cedulaCliente);
                    if (cliente) {
                        const provType = datos.proveedorNotificacion || 'WhatsApp';
                        this.gestorNotificaciones.setProveedor(
                            provType === 'Correo' ? new ProveedorCorreo() : new ProveedorWhatsApp()
                        );

                        let mensaje = `el estado de su equipo ${mnt.equipo} cambió a: "${nuevoEstado}".`;
                        if (nuevoEstado === 'Listo para Entrega') {
                            mensaje = `¡excelentes noticias! Su equipo ${mnt.equipo} está LISTO PARA ENTREGA. Saldo a pagar: $${mnt.costos.saldo.toFixed(2)}.`;
                        } else if (nuevoEstado === 'Entregado') {
                            mensaje = `su equipo ${mnt.equipo} ha sido entregado con éxito. ¡Gracias por preferirnos!`;
                        }
                        this.gestorNotificaciones.notificarCliente(cliente, mensaje);
                    }
                }
                return mnt;
            }

            case 'eliminar':
                if (!datos.idMantenimiento) {
                    throw new Error("Se requiere el ID para eliminar el mantenimiento.");
                }
                return this.repo.eliminarMantenimiento(datos.idMantenimiento);

            case 'listar':
                return this.repo.obtenerMantenimientos();

            case 'buscarPorId': {
                const mntRaw = this.repo.obtenerMantenimientos().find(m => m.idMantenimiento === datos.idMantenimiento);
                return mntRaw ? new Mantenimiento(mntRaw) : null;
            }

            case 'buscarPorCliente': {
                // Filtra mantenimientos asociados a un cliente específico (para vistas de Cliente)
                return this.repo.obtenerMantenimientos()
                    .filter(m => m.cedulaCliente === datos.cedulaCliente)
                    .map(m => new Mantenimiento(m));
            }

            default:
                throw new Error(`Acción de Mantenimiento no reconocida: ${accion}`);
        }
    }

    /**
     * Genera estadísticas completas utilizando el patrón Composite.
     * Agrupa y calcula costos agregados y volumen.
     * @param {string} periodo Filtro temporal (opcional)
     * @param {string} filtro Filtro de criterio (opcional)
     */
    generarEstadisticas(periodo, filtro) {
        const mantenimientosRaw = this.repo.obtenerMantenimientos();
        
        // Crear el grupo compuesto principal
        const grupoGeneral = new GrupoMantenimientos('General');
        
        // Mapear mantenimientos crudos a objetos Mantenimiento (Hojas) y añadirlos al grupo general
        mantenimientosRaw.forEach(mRaw => {
            const mLeaf = new Mantenimiento(mRaw);
            grupoGeneral.agregar(mLeaf);
        });

        // 1. Cálculos generales usando la API Composite
        const totalFacturado = grupoGeneral.obtenerCostoTotal();
        const totalEquipos = grupoGeneral.obtenerCantidadEquipos();
        const promedioIngresos = totalEquipos > 0 ? (totalFacturado / totalEquipos) : 0;

        // Calcular saldos totales cobrados y pendientes
        let totalAbonado = 0;
        let totalSaldos = 0;
        mantenimientosRaw.forEach(m => {
            totalAbonado += parseFloat(m.costos.abono || 0);
            totalSaldos += parseFloat(m.costos.saldo || 0);
        });

        // 2. Agrupación por MARCA usando Composite
        const marcasUnicas = [...new Set(mantenimientosRaw.map(m => m.marca))];
        const gruposPorMarca = marcasUnicas.map(marca => {
            const grupoMarca = new GrupoMantenimientos(`Marca: ${marca}`);
            mantenimientosRaw.filter(m => m.marca === marca).forEach(m => {
                grupoMarca.agregar(new Mantenimiento(m));
            });
            return {
                marca: marca,
                cantidad: grupoMarca.obtenerCantidadEquipos(),
                facturado: grupoMarca.obtenerCostoTotal()
            };
        });

        // 3. Agrupación por ESTADO usando Composite
        const estados = ['Recibido', 'En Reparación', 'Listo para Entrega', 'Entregado'];
        const gruposPorEstado = estados.map(estado => {
            const grupoEstado = new GrupoMantenimientos(`Estado: ${estado}`);
            mantenimientosRaw.filter(m => m.costos.estado === estado).forEach(m => {
                grupoEstado.agregar(new Mantenimiento(m));
            });
            return {
                estado: estado,
                cantidad: grupoEstado.obtenerCantidadEquipos(),
                facturado: grupoEstado.obtenerCostoTotal()
            };
        });

        // 4. Agrupación por MES usando Composite
        // Agrupa por el formato YYYY-MM
        const meses = [...new Set(mantenimientosRaw.map(m => m.fechaRegistro.substring(0, 7)))].sort();
        const gruposPorMes = meses.map(mes => {
            const grupoMes = new GrupoMantenimientos(`Mes: ${mes}`);
            mantenimientosRaw.filter(m => m.fechaRegistro.startsWith(mes)).forEach(m => {
                grupoMes.agregar(new Mantenimiento(m));
            });
            return {
                mes: mes,
                cantidad: grupoMes.obtenerCantidadEquipos(),
                facturado: grupoMes.obtenerCostoTotal()
            };
        });

        return {
            totales: {
                totalEquipos,
                totalFacturado,
                totalAbonado,
                totalSaldos,
                promedioIngresos
            },
            porMarca: gruposPorMarca,
            porEstado: gruposPorEstado,
            porMes: gruposPorMes
        };
    }
}
