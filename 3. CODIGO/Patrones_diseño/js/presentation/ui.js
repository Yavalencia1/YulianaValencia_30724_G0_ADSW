/**
 * Capa de Presentación: UI_SistemaMantenimiento
 * Coordina la representación visual y los eventos de interacción del usuario.
 * Utiliza el controlador global (ProxyControlador) para procesar requerimientos.
 */
class UI_SistemaMantenimiento {
    constructor() {
        this.controlador = window.controlador;
        this.detectarYInicializarPantalla();
    }

    /**
     * Detecta la página actual y carga la lógica de presentación correspondiente.
     */
    detectarYInicializarPantalla() {
        const path = window.location.pathname;
        const pagina = path.substring(path.lastIndexOf('/') + 1);

        // Si no hay sesión y no estamos en login.html, redirigir a login
        if (!this.controlador.sesionActiva && pagina !== 'login.html') {
            window.location.href = 'login.html';
            return;
        }

        // Si ya hay sesión activa e ingresa a login, redirigir a index (que decidirá a dónde mandarlo)
        if (this.controlador.sesionActiva && pagina === 'login.html') {
            this.redirigirUsuarioSegunRol();
            return;
        }

        // Cargar componentes de estructura común (Sidebar y Navbar) si no estamos en Login
        if (pagina !== 'login.html' && pagina !== 'index.html' && pagina !== '') {
            this.inyectarEstructuraComun(pagina);
        }

        // Inicializar pantallas
        switch (pagina) {
            case 'index.html':
            case '':
                this.redirigirUsuarioSegunRol();
                break;
            case 'login.html':
                this.mostrarPantallaLogin();
                break;
            case 'clientes.html':
                this.mostrarPantallaClientes();
                break;
            case 'tecnicos.html':
                this.mostrarPantallaTecnicos();
                break;
            case 'mantenimientos.html':
                this.mostrarPantallaMantenimientos();
                break;
            case 'estadisticas.html':
                this.mostrarPantallaEstadisticas();
                break;
            default:
                // Si es un path local o no mapeado, pero tiene sesión
                if (this.controlador.sesionActiva) {
                    this.redirigirUsuarioSegunRol();
                }
                break;
        }
    }

    /**
     * Redirige al usuario a la pantalla adecuada al entrar al index.html
     */
    redirigirUsuarioSegunRol() {
        if (!this.controlador.sesionActiva) {
            window.location.href = 'login.html';
            return;
        }

        const rol = this.controlador.sesionActiva.rol;
        if (rol === 'Administrador') {
            window.location.href = 'estadisticas.html';
        } else if (rol === 'Técnico') {
            window.location.href = 'mantenimientos.html';
        } else if (rol === 'Cliente') {
            window.location.href = 'mantenimientos.html';
        }
    }

    /**
     * Inyecta dinámicamente el Sidebar, Navbar y Consola de Auditoría.
     */
    inyectarEstructuraComun(paginaActiva) {
        const sesion = this.controlador.sesionActiva;
        if (!sesion) return;

        // --- INYECCIÓN DEL SIDEBAR (Azul Presentación) ---
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            let menuItemsHTML = '';
            
            // Administrador: Acceso total
            if (sesion.rol === 'Administrador') {
                menuItemsHTML += `
                    <li class="sidebar-item ${paginaActiva === 'estadisticas.html' ? 'active' : ''}">
                        <a href="estadisticas.html"><i class="bi bi-speedometer2"></i> Dashboard</a>
                    </li>
                    <li class="sidebar-item ${paginaActiva === 'clientes.html' ? 'active' : ''}">
                        <a href="clientes.html"><i class="bi bi-people"></i> Clientes</a>
                    </li>
                    <li class="sidebar-item ${paginaActiva === 'tecnicos.html' ? 'active' : ''}">
                        <a href="tecnicos.html"><i class="bi bi-person-badge"></i> Técnicos</a>
                    </li>
                    <li class="sidebar-item ${paginaActiva === 'mantenimientos.html' ? 'active' : ''}">
                        <a href="mantenimientos.html"><i class="bi bi-tools"></i> Mantenimientos</a>
                    </li>
                `;
            } 
            // Técnico: Clientes y Mantenimientos
            else if (sesion.rol === 'Técnico') {
                menuItemsHTML += `
                    <li class="sidebar-item ${paginaActiva === 'clientes.html' ? 'active' : ''}">
                        <a href="clientes.html"><i class="bi bi-people"></i> Ver Clientes</a>
                    </li>
                    <li class="sidebar-item ${paginaActiva === 'mantenimientos.html' ? 'active' : ''}">
                        <a href="mantenimientos.html"><i class="bi bi-tools"></i> Mantenimientos</a>
                    </li>
                `;
            }
            // Cliente: Únicamente sus Mantenimientos
            else if (sesion.rol === 'Cliente') {
                menuItemsHTML += `
                    <li class="sidebar-item ${paginaActiva === 'mantenimientos.html' ? 'active' : ''}">
                        <a href="mantenimientos.html"><i class="bi bi-laptop"></i> Mis Equipos</a>
                    </li>
                `;
            }

            sidebarContainer.innerHTML = `
                <div class="sidebar">
                    <div>
                        <div class="sidebar-header">
                            <div class="sidebar-logo">M</div>
                            <div class="sidebar-brand">SISTEMA<br><span style="font-size: 0.75rem; font-weight: normal; color: var(--color-pres-accent)">Mantenimientos</span></div>
                        </div>
                        <ul class="sidebar-menu">
                            ${menuItemsHTML}
                        </ul>
                    </div>
                    <div class="sidebar-footer">
                        <div class="sidebar-profile">
                            <div class="profile-avatar">${sesion.nombre.charAt(0)}</div>
                            <div class="profile-info">
                                <div class="profile-name" title="${sesion.nombre}">${sesion.nombre}</div>
                                <div class="profile-role">${sesion.rol}</div>
                            </div>
                        </div>
                        <button class="btn btn-outline-danger btn-sm w-100 mt-3" id="btn-cerrar-sesion">
                            <i class="bi bi-box-arrow-right"></i> Salir
                        </button>
                    </div>
                </div>
            `;

            // Enlazar botón cerrar sesión
            document.getElementById('btn-cerrar-sesion')?.addEventListener('click', () => {
                this.controlador.cerrarSesion();
                window.location.href = 'login.html';
            });
        }

        // --- INYECCIÓN DE NAVBAR SUPERIOR ---
        const navbarContainer = document.getElementById('navbar-container');
        if (navbarContainer) {
            let titulo = '';
            if (paginaActiva === 'clientes.html') titulo = 'Gestión de Clientes';
            else if (paginaActiva === 'tecnicos.html') titulo = 'Gestión de Técnicos';
            else if (paginaActiva === 'mantenimientos.html') titulo = sesion.rol === 'Cliente' ? 'Mis Mantenimientos' : 'Gestión de Mantenimientos';
            else if (paginaActiva === 'estadisticas.html') titulo = 'Dashboard de Estadísticas';

            navbarContainer.innerHTML = `
                <div class="top-navbar">
                    <div class="d-flex align-items-center">
                        <button class="btn btn-primary d-lg-none me-3" id="toggle-sidebar-btn">
                            <i class="bi bi-list"></i>
                        </button>
                        <h4 class="page-title">${titulo}</h4>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-secondary p-2"><i class="bi bi-clock"></i> Sesión: ${sesion.usuario} (${sesion.rol})</span>
                    </div>
                </div>
            `;

            // Toggle para móviles
            document.getElementById('toggle-sidebar-btn')?.addEventListener('click', () => {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('show');
                }
            });
        }

        // --- INYECCIÓN DE LA CONSOLA DE AUDITORÍA (Naranja Negocio) ---
        const consoleContainer = document.getElementById('console-container');
        if (consoleContainer) {
            if (sesion.rol === 'Administrador') {
                consoleContainer.style.display = 'block';
                consoleContainer.innerHTML = `
                    <div class="console-container">
                        <div class="console-header">
                            <span class="console-title"><i class="bi bi-terminal"></i> Terminal de Auditoría & Notificaciones (Capa Negocio/Proxy)</span>
                            <button class="btn btn-sm btn-outline-secondary text-white border-0 py-0" id="btn-limpiar-logs"><i class="bi bi-trash"></i></button>
                        </div>
                        <div class="console-logs" id="console-logs-content">
                            <!-- Cargar logs dinámicamente -->
                        </div>
                    </div>
                `;

                document.getElementById('btn-limpiar-logs')?.addEventListener('click', () => {
                    localStorage.setItem('logs', JSON.stringify([]));
                    localStorage.setItem('notificaciones_enviadas', JSON.stringify([]));
                    this.actualizarConsolaLogs();
                });

                this.actualizarConsolaLogs();
            } else {
                consoleContainer.style.display = 'none';
            }
        }
    }

    /**
     * Lee y renderiza en la consola visual los últimos logs de seguridad y notificaciones.
     */
    actualizarConsolaLogs() {
        const logsBox = document.getElementById('console-logs-content');
        if (!logsBox) return;

        const logs = this.controlador.repo.obtenerLogs().slice(0, 15);
        const notificaciones = this.controlador.repo.obtenerNotificaciones().slice(0, 10);
        
        let htmlContent = '';

        if (logs.length === 0 && notificaciones.length === 0) {
            htmlContent = `<div class="text-muted text-center py-3">No hay eventos registrados en LocalStorage.</div>`;
            logsBox.innerHTML = htmlContent;
            return;
        }

        // Combinar eventos y ordenarlos por fecha descendente
        const eventosCombinados = [];
        
        logs.forEach(log => {
            eventosCombinados.push({
                tipo: 'log',
                fecha: new Date(log.fecha),
                usuario: log.usuario,
                operacion: log.operacion,
                detalle: log.detalle
            });
        });

        notificaciones.forEach(notif => {
            eventosCombinados.push({
                tipo: 'notificacion',
                fecha: new Date(notif.fecha),
                proveedor: notif.proveedor,
                destino: notif.destino,
                mensaje: notif.mensaje
            });
        });

        eventosCombinados.sort((a, b) => b.fecha - a.fecha);

        eventosCombinados.slice(0, 20).forEach(ev => {
            const timeStr = ev.fecha.toLocaleTimeString();
            if (ev.tipo === 'log') {
                let colorClass = 'log-success';
                if (ev.operacion.includes('FALLIDO') || ev.operacion.includes('BLOQUEADO')) {
                    colorClass = 'log-danger';
                } else if (ev.operacion.includes('VIOLACION') || ev.operacion.includes('NO_AUTORIZADO')) {
                    colorClass = 'log-warning';
                }

                htmlContent += `
                    <div class="log-entry">
                        <span class="log-time">[${timeStr}]</span>
                        <span class="badge bg-dark text-warning border border-warning px-1 py-0 me-1">PROXY</span>
                        Usuario <span class="log-user">${ev.usuario}</span>: 
                        <span class="${colorClass}">${ev.operacion}</span> -> ${ev.detalle}
                    </div>
                `;
            } else {
                htmlContent += `
                    <div class="log-entry text-info">
                        <span class="log-time">[${timeStr}]</span>
                        <span class="badge bg-dark text-info border border-info px-1 py-0 me-1">BRIDGE</span>
                        Notificación enviada por <strong class="text-white">${ev.proveedor}</strong> a <strong>${ev.destino}</strong>: 
                        <span class="fst-italic text-light">"${ev.mensaje}"</span>
                    </div>
                `;
            }
        });

        logsBox.innerHTML = htmlContent;
        logsBox.scrollTop = 0; // Mostrar siempre el evento más reciente arriba
    }

    // ==========================================================================
    // PANTALLAS ESPECÍFICAS
    // ==========================================================================

    /**
     * Lógica para login.html
     */
    mostrarPantallaLogin() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const usuario = document.getElementById('txt-usuario').value.trim();
            const clave = document.getElementById('txt-clave').value;
            const feedback = document.getElementById('login-feedback');

            if (!usuario || !clave) {
                feedback.classList.remove('d-none');
                feedback.textContent = 'Ingrese todos los campos obligatorios.';
                return;
            }

            try {
                const sesion = this.controlador.validarCredenciales(usuario, clave);
                if (sesion) {
                    feedback.classList.add('d-none');
                    // Redirigir según rol
                    this.redirigirUsuarioSegunRol();
                } else {
                    feedback.classList.remove('d-none');
                    feedback.textContent = 'Credenciales inválidas. Intente nuevamente.';
                }
            } catch (err) {
                feedback.classList.remove('d-none');
                feedback.textContent = 'Error: ' + err.message;
            }
        });
    }

    /**
     * Lógica para clientes.html
     */
    mostrarPantallaClientes() {
        const tablaBody = document.getElementById('tabla-clientes-body');
        const formCliente = document.getElementById('form-cliente');
        const btnGuardarCliente = document.getElementById('btn-guardar-cliente');
        const modalElement = document.getElementById('modalCliente');
        const searchInput = document.getElementById('buscar-cliente');

        if (!tablaBody) return;

        let bootstrapModal = null;
        if (modalElement) {
            bootstrapModal = new bootstrap.Modal(modalElement);
        }

        // Renderizar tabla de clientes
        const renderTable = (clientesList) => {
            tablaBody.innerHTML = '';
            
            if (clientesList.length === 0) {
                tablaBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay clientes registrados.</td></tr>`;
                return;
            }

            const sesionRol = this.controlador.sesionActiva.rol;

            clientesList.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${c.nombre}</strong></td>
                    <td>${c.cedula}</td>
                    <td>${c.correo}</td>
                    <td>${c.telefono}</td>
                    <td>
                        ${sesionRol === 'Administrador' ? `
                                <button class="btn btn-sm btn-outline-primary btn-editar-cli" data-cedula="${c.cedula}">
                                    <i class="bi bi-pencil"></i>
                                </button>
                            ` : '<span class="text-muted">-</span>'}
                    </td>
                `;
                tablaBody.appendChild(tr);
            });

            // Enlazar botones de edición
            document.querySelectorAll('.btn-editar-cli').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cedula = btn.getAttribute('data-cedula');
                    const cliente = this.controlador.gestionarCRUDCliente({ accion: 'buscar', cedula });
                    
                    if (cliente) {
                        document.getElementById('cli-cedula').value = cliente.cedula;
                        document.getElementById('cli-cedula').readOnly = true; // No permitir cambiar la cédula al editar
                        document.getElementById('cli-nombre').value = cliente.nombre;
                        document.getElementById('cli-correo').value = cliente.correo;
                        document.getElementById('cli-telefono').value = cliente.telefono;
                        document.getElementById('cli-usuario').value = cliente.usuario || '';
                        
                        document.getElementById('modalClienteTitle').textContent = 'Editar Cliente';
                        bootstrapModal.show();
                    }
                });
            });

            
        };

        const cargarYRenderizar = () => {
            try {
                const clientes = this.controlador.gestionarCRUDCliente({ accion: 'listar' });
                renderTable(clientes);
                this.actualizarConsolaLogs();
            } catch (err) {
                tablaBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">No tiene permisos para ver esta sección o ocurrió un error.</td></tr>`;
            }
        };

        // Escuchar búsquedas
        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const todos = this.controlador.gestionarCRUDCliente({ accion: 'listar' });
            const filtrados = todos.filter(c => 
                c.nombre.toLowerCase().includes(query) || 
                c.cedula.includes(query) ||
                c.correo.toLowerCase().includes(query)
            );
            renderTable(filtrados);
        });

        // Crear nuevo cliente
        document.getElementById('btn-nuevo-cliente')?.addEventListener('click', () => {
            formCliente.reset();
            document.getElementById('cli-cedula').readOnly = false;
            document.getElementById('modalClienteTitle').textContent = 'Crear Cliente';
            bootstrapModal.show();
        });

        // Enviar formulario (Crear / Editar)
        formCliente?.addEventListener('submit', (e) => {
            e.preventDefault();
            const cedula = document.getElementById('cli-cedula').value.trim();
            const nombre = document.getElementById('cli-nombre').value.trim();
            const correo = document.getElementById('cli-correo').value.trim();
            const telefono = document.getElementById('cli-telefono').value.trim();
            const usuario = document.getElementById('cli-usuario').value.trim() || undefined;

            // Validaciones adicionales
            if (!cedula || !nombre || !correo || !telefono) {
                alert("Todos los campos obligatorios deben ser completados.");
                return;
            }

            if (!correo.includes('@')) {
                alert("Ingrese un correo electrónico válido.");
                return;
            }

            const esEdicion = document.getElementById('cli-cedula').readOnly;
            const accion = esEdicion ? 'editar' : 'crear';

            const cliente = {
                cedula,
                nombre,
                correo,
                telefono,
                usuario
            };

            try {
                this.controlador.gestionarCRUDCliente({ accion, cliente });
                bootstrapModal.hide();
                cargarYRenderizar();
            } catch (err) {
                alert("Error al guardar cliente: " + err.message);
            }
        });

        cargarYRenderizar();
    }

    /**
     * Lógica para tecnicos.html
     */
    mostrarPantallaTecnicos() {
        const tablaBody = document.getElementById('tabla-tecnicos-body');
        const formTecnico = document.getElementById('form-tecnico');
        const modalElement = document.getElementById('modalTecnico');
        const searchInput = document.getElementById('buscar-tecnico');

        if (!tablaBody) return;

        let bootstrapModal = null;
        if (modalElement) {
            bootstrapModal = new bootstrap.Modal(modalElement);
        }

        const renderTable = (tecnicosList) => {
            tablaBody.innerHTML = '';
            if (tecnicosList.length === 0) {
                tablaBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No hay técnicos registrados.</td></tr>`;
                return;
            }

            tecnicosList.forEach(t => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${t.nombre}</strong></td>
                    <td>${t.especialidad}</td>
                    <td>${t.correo}</td>
                    <td>${t.telefono}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-editar-tec" data-correo="${t.correo}"><i class="bi bi-pencil"></i></button>
                    </td>
                `;
                tablaBody.appendChild(tr);
            });

            // Enlazar editar
            document.querySelectorAll('.btn-editar-tec').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const correo = btn.getAttribute('data-correo');
                    const lista = this.controlador.gestionarCRUDTecnico({ accion: 'listar' });
                    const tecnico = lista.find(t => t.correo === correo);

                    if (tecnico) {
                        document.getElementById('tec-correo').value = tecnico.correo;
                        document.getElementById('tec-correo').readOnly = true;
                        document.getElementById('tec-nombre').value = tecnico.nombre;
                        document.getElementById('tec-especialidad').value = tecnico.especialidad;
                        document.getElementById('tec-telefono').value = tecnico.telefono;

                        document.getElementById('modalTecnicoTitle').textContent = 'Editar Técnico';
                        bootstrapModal.show();
                    }
                });
            });

            // Enlazar eliminar
            document.querySelectorAll('.btn-eliminar-tec').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const correo = btn.getAttribute('data-correo');
                    if (confirm(`¿Está seguro de eliminar al técnico ${correo}?`)) {
                        try {
                            this.controlador.gestionarCRUDTecnico({ accion: 'eliminar', correo });
                            cargarYRenderizar();
                        } catch (err) {
                            alert("Error al eliminar: " + err.message);
                        }
                    }
                });
            });
        };

        const cargarYRenderizar = () => {
            try {
                const tecnicos = this.controlador.gestionarCRUDTecnico({ accion: 'listar' });
                renderTable(tecnicos);
                this.actualizarConsolaLogs();
            } catch (err) {
                tablaBody.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Acceso no autorizado: Solo Administradores pueden gestionar técnicos.</td></tr>`;
            }
        };

        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const todos = this.controlador.gestionarCRUDTecnico({ accion: 'listar' });
            const filtrados = todos.filter(t => 
                t.nombre.toLowerCase().includes(query) || 
                t.especialidad.toLowerCase().includes(query) ||
                t.correo.toLowerCase().includes(query)
            );
            renderTable(filtrados);
        });

        document.getElementById('btn-nuevo-tecnico')?.addEventListener('click', () => {
            formTecnico.reset();
            document.getElementById('tec-correo').readOnly = false;
            document.getElementById('modalTecnicoTitle').textContent = 'Crear Técnico';
            bootstrapModal.show();
        });

        formTecnico?.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('tec-nombre').value.trim();
            const especialidad = document.getElementById('tec-especialidad').value.trim();
            const correo = document.getElementById('tec-correo').value.trim();
            const telefono = document.getElementById('tec-telefono').value.trim();

            // Validaciones adicionales
            if (!nombre || !especialidad || !correo || !telefono) {
                alert("Todos los campos obligatorios deben ser completados.");
                return;
            }

            if (!correo.includes('@')) {
                alert("Ingrese un correo electrónico válido.");
                return;
            }

            if (especialidad.length === 0) {
                alert("La especialidad del técnico no puede estar vacía.");
                return;
            }

            const esEdicion = document.getElementById('tec-correo').readOnly;
            const accion = esEdicion ? 'editar' : 'crear';

            const tecnico = {
                nombre,
                especialidad,
                correo,
                telefono
            };

            try {
                this.controlador.gestionarCRUDTecnico({ accion, tecnico });
                bootstrapModal.hide();
                cargarYRenderizar();
            } catch (err) {
                alert("Error al guardar: " + err.message);
            }
        });

        cargarYRenderizar();
    }

    /**
     * Lógica para mantenimientos.html
     */
    mostrarPantallaMantenimientos() {
        const tablaBody = document.getElementById('tabla-mantenimientos-body');
        const formMnt = document.getElementById('form-mantenimiento');
        const modalElement = document.getElementById('modalMantenimiento');
        const searchInput = document.getElementById('buscar-mantenimiento');
        const selectCliente = document.getElementById('mnt-cliente');
        const selectTecnico = document.getElementById('mnt-tecnico');

        if (!tablaBody) return;

        let bootstrapModal = null;
        if (modalElement) {
            bootstrapModal = new bootstrap.Modal(modalElement);
        }

        const sesion = this.controlador.sesionActiva;

        // Cargar selectores de clientes y técnicos para el formulario (si el rol no es Cliente)
        const cargarSelectores = () => {
            if (sesion.rol === 'Cliente') return;

            try {
                const clientes = this.controlador.gestionarCRUDCliente({ accion: 'listar' });
                selectCliente.innerHTML = '<option value="">-- Seleccionar Cliente --</option>';
                clientes.forEach(c => {
                    selectCliente.innerHTML += `<option value="${c.cedula}">${c.nombre} (${c.cedula})</option>`;
                });

                const tecnicos = this.controlador.gestionarCRUDTecnico({ accion: 'listar' });
                selectTecnico.innerHTML = '<option value="">-- Seleccionar Técnico --</option>';
                tecnicos.forEach(t => {
                    selectTecnico.innerHTML += `<option value="${t.correo}">${t.nombre} (${t.especialidad})</option>`;
                });
            } catch (err) {
                console.warn("No se pudieron cargar selectores:", err.message);
            }
        };

        const renderTable = (mntList) => {
            tablaBody.innerHTML = '';
            if (mntList.length === 0) {
                tablaBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No hay mantenimientos registrados.</td></tr>`;
                return;
            }

            mntList.forEach(m => {
                let badgeClass = 'badge-recibido';
                if (m.costos.estado === 'En Reparación') badgeClass = 'badge-reparacion';
                else if (m.costos.estado === 'Listo para Entrega') badgeClass = 'badge-listo';
                else if (m.costos.estado === 'Entregado') badgeClass = 'badge-entregado';
                else if (m.costos.estado === 'Cancelado')
                badgeClass = 'bg-danger';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${m.idMantenimiento}</strong></td>
                    <td>
                        <span class="d-block"><strong>${m.equipo}</strong></span>
                        <small class="text-muted">${m.marca} ${m.modelo}</small>
                    </td>
                    <td>${m.tipoEquipo}</td>
                    <td>${m.fechaRegistro}</td>
                    <td>
                        <span class="badge-estado ${badgeClass}">${m.costos.estado}</span>
                    </td>
                    <td>
                        <strong class="text-success">$${m.costos.totalMantenimiento.toFixed(2)}</strong><br>
                        <small class="text-danger">Saldo: $${m.costos.saldo.toFixed(2)}</small>
                    </td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-info btn-ver-detalles" data-id="${m.idMantenimiento}" title="Ver detalles y fallas"><i class="bi bi-eye"></i></button>
                            ${sesion.rol !== 'Cliente' ? `
                                <button class="btn btn-sm btn-outline-primary btn-editar-mnt" data-id="${m.idMantenimiento}" title="Editar ficha completa"><i class="bi bi-pencil"></i></button>
                                <button class="btn btn-sm btn-outline-warning btn-estado-quick" data-id="${m.idMantenimiento}" title="Cambiar Estado Rápido"><i class="bi bi-arrow-repeat"></i></button>
                            ` : ''}
                            ${sesion.rol === 'Administrador' && m.costos.estado !== 'Cancelado' ? `
                                <button class="btn btn-sm btn-outline-danger btn-cancelar-mnt"
                                    data-id="${m.idMantenimiento}"
                                    title="Cancelar mantenimiento">
                                    <i class="bi bi-x-circle"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                `;
                tablaBody.appendChild(tr);
            });

            // Registrar eventos para botones de detalles
            document.querySelectorAll('.btn-ver-detalles').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const mnt = this.controlador.registrarMantenimiento({ 
                        accion: sesion.rol === 'Cliente' ? 'buscarPorCliente' : 'buscarPorId',
                        idMantenimiento: id,
                        cedulaCliente: sesion.cedula
                    });

                    // Si es cliente, la búsqueda por cliente devuelve array
                    const mntFicha = Array.isArray(mnt) ? mnt.find(m => m.idMantenimiento === id) : mnt;
                    
                    if (mntFicha) {
                        this.mostrarModalDetalles(mntFicha);
                    }
                });
            });

            // Registrar eventos para edición
            document.querySelectorAll('.btn-editar-mnt').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const mnt = this.controlador.registrarMantenimiento({ accion: 'buscarPorId', idMantenimiento: id });
                    if (mnt) {
                        this.cargarDatosEnFormulario(mnt);
                        document.getElementById('modalMantenimientoTitle').textContent = `Editar Mantenimiento: ${id}`;
                        bootstrapModal.show();
                    }
                });
            });

            // Registrar eventos para cambio de estado rápido
            document.querySelectorAll('.btn-estado-quick').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const mnt = this.controlador.registrarMantenimiento({ accion: 'buscarPorId', idMantenimiento: id });
                    
                    if (mnt) {
                        const nuevoEstado = prompt(`Cambiar estado para ${id}. Estados disponibles:\n1. Recibido\n2. En Reparación\n3. Listo para Entrega\n4. Entregado\n\nEscriba el nuevo estado:`, mnt.costos.estado);
                        
                        if (nuevoEstado && ['Recibido', 'En Reparación', 'Listo para Entrega', 'Entregado'].includes(nuevoEstado)) {
                            const canal = confirm("¿Desea enviar la notificación por Correo Electrónico? (Cancelar = WhatsApp)") ? 'Correo' : 'WhatsApp';
                            try {
                                this.controlador.registrarMantenimiento({
                                    accion: 'actualizarEstado',
                                    idMantenimiento: id,
                                    nuevoEstado: nuevoEstado,
                                    proveedorNotificacion: canal
                                });
                                cargarYRenderizar();
                            } catch (err) {
                                alert("Error: " + err.message);
                            }
                        } else if (nuevoEstado) {
                            alert("Estado no válido. Operación cancelada.");
                        }
                    }
                });
            });

            // Registrar eventos para cancelar mantenimiento
            document.querySelectorAll('.btn-cancelar-mnt').forEach(btn => {
                btn.addEventListener('click', () => {

                    const id = btn.getAttribute('data-id');

                    if(confirm(`¿Desea cancelar el mantenimiento ${id}?`)){

                        try{

                            const mantenimiento = this.controlador.registrarMantenimiento({
                                accion:'buscarPorId',
                                idMantenimiento:id
                            });

                            mantenimiento.costos.estado = "Cancelado";

                            this.controlador.registrarMantenimiento({
                                accion:'editar',
                                mantenimiento
                            });

                            cargarYRenderizar();

                        }catch(err){
                            alert("Error: "+err.message);
                        }

                    }

                });
            });
        };

        const cargarYRenderizar = () => {
            try {
                let mantenimientos = [];
                if (sesion.rol === 'Cliente') {
                    // El Proxy verificará que la cédula coincida con su sesión
                    mantenimientos = this.controlador.registrarMantenimiento({ 
                        accion: 'buscarPorCliente', 
                        cedulaCliente: sesion.cedula 
                    });
                } else {
                    mantenimientos = this.controlador.registrarMantenimiento({ accion: 'listar' });
                }
                renderTable(mantenimientos);
                this.actualizarConsolaLogs();
            } catch (err) {
                tablaBody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error al cargar mantenimientos: ${err.message}</td></tr>`;
            }
        };

        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            let todos = [];
            if (sesion.rol === 'Cliente') {
                todos = this.controlador.registrarMantenimiento({ accion: 'buscarPorCliente', cedulaCliente: sesion.cedula });
            } else {
                todos = this.controlador.registrarMantenimiento({ accion: 'listar' });
            }
            const filtrados = todos.filter(m => 
                m.idMantenimiento.toLowerCase().includes(query) || 
                m.equipo.toLowerCase().includes(query) || 
                m.marca.toLowerCase().includes(query) ||
                m.costos.estado.toLowerCase().includes(query)
            );
            renderTable(filtrados);
        });

        // Crear nuevo
        document.getElementById('btn-nuevo-mantenimiento')?.addEventListener('click', () => {
            formMnt.reset();
            document.getElementById('mnt-id').value = ''; // Se autogenerará
            document.getElementById('modalMantenimientoTitle').textContent = 'Registrar Mantenimiento';
            bootstrapModal.show();
        });

        // Guardar formulario
        formMnt?.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validaciones de campos obligatorios
            const equipo = document.getElementById('mnt-equipo').value.trim();
            const marca = document.getElementById('mnt-marca').value.trim();
            const modelo = document.getElementById('mnt-modelo').value.trim();
            const serial = document.getElementById('mnt-serial').value.trim();
            const pin = document.getElementById('mnt-pin').value.trim();
            const cliente = document.getElementById('mnt-cliente').value;
            const tecnico = document.getElementById('mnt-tecnico').value;
            const totalMnt = parseFloat(document.getElementById('mnt-total').value || 0);
            const fechaEntrega = document.getElementById('mnt-fecha-entrega').value;
            const observaciones = document.getElementById('mnt-observaciones').value.trim();

            if (!equipo || !marca || !modelo || !serial || !pin) {
                alert("Todos los datos del dispositivo son obligatorios.");
                return;
            }

            if (!cliente) {
                alert("Debe seleccionar un cliente.");
                return;
            }

            if (!tecnico) {
                alert("Debe asignar un técnico (REQ008 - Asignación inicial de técnico).");
                return;
            }

            if (totalMnt <= 0) {
                alert("El total del mantenimiento debe ser mayor a 0.");
                return;
            }

            if (!fechaEntrega) {
                alert("Debe especificar la fecha estimada de entrega.");
                return;
            }

            // Validar que la fecha de entrega no sea del día de hoy
            const hoy = new Date();
            const yyyy = hoy.getFullYear();
            const mm = String(hoy.getMonth() + 1).padStart(2, '0');
            const dd = String(hoy.getDate()).padStart(2, '0');
            const fechaHoyStr = `${yyyy}-${mm}-${dd}`;

            if (fechaEntrega === fechaHoyStr) {
                alert("La fecha estimada de entrega no puede ser el día de hoy.");
                return;
            }

            // Validar que el abono (saldo abonado) no sea mayor al total del mantenimiento
            const abono = parseFloat(document.getElementById('mnt-abono').value || 0);
            if (abono > totalMnt) {
                alert("El abono inicial (saldo abonado) no puede ser mayor al precio total del mantenimiento.");
                return;
            }

            if (!observaciones) {
                alert("Debe ingresar el detalle de la falla/diagnóstico.");
                return;
            }

            const mntId = document.getElementById('mnt-id').value;
            const accion = mntId ? 'editar' : 'crear';

            // Obtener el checklist de daños
            const daños = {
                enciende: document.getElementById('dmg-enciende').checked,
                botones: document.getElementById('dmg-botones').checked,
                camara: document.getElementById('dmg-camara').checked,
                sensores: document.getElementById('dmg-sensores').checked,
                touchId: document.getElementById('dmg-touchid').checked,
                wifi: document.getElementById('dmg-wifi').checked,
                senal: document.getElementById('dmg-senal').checked,
                sonido: document.getElementById('dmg-sonido').checked,
                carga: document.getElementById('dmg-carga').checked
            };

            const mntData = {
                idMantenimiento: mntId || undefined,
                equipo: equipo,
                marca: marca,
                modelo: modelo,
                clavePin: pin,
                numeroSerieImei: serial,
                accesorios: document.getElementById('mnt-accesorios').value.trim(),
                tipoEquipo: document.getElementById('mnt-tipo').value,
                cedulaCliente: cliente,
                tecnicoAsignado: tecnico,
                daños: daños,
                costos: {
                    observaciones: observaciones,
                    totalMantenimiento: totalMnt,
                    abono: abono,
                    saldo: totalMnt - abono,
                    fechaEstimadaEntrega: fechaEntrega,
                    estado: document.getElementById('mnt-estado').value
                }
            };

            // Preguntar canal de notificación
            const canal = confirm("¿Desea enviar notificaciones de este cambio al cliente por Correo Electrónico? (Cancelar = WhatsApp)") ? 'Correo' : 'WhatsApp';

            try {
                this.controlador.registrarMantenimiento({
                    accion,
                    mantenimiento: mntData,
                    proveedorNotificacion: canal
                });
                bootstrapModal.hide();
                cargarYRenderizar();
            } catch (err) {
                alert("Error al guardar mantenimiento: " + err.message);
            }
        });

        // Calcular saldo dinámicamente en el formulario
        const calcSaldo = () => {
            const total = parseFloat(document.getElementById('mnt-total').value || 0);
            const abono = parseFloat(document.getElementById('mnt-abono').value || 0);
            document.getElementById('mnt-saldo').value = (total - abono).toFixed(2);
        };
        document.getElementById('mnt-total')?.addEventListener('input', calcSaldo);
        document.getElementById('mnt-abono')?.addEventListener('input', calcSaldo);

        cargarSelectores();
        cargarYRenderizar();
    }

    /**
     * Muestra una ventana modal de Bootstrap personalizada con todos los detalles de la ficha técnica.
     */
    mostrarModalDetalles(mnt) {
        // Buscar o crear contenedor para el modal de detalles
        let modalDetalles = document.getElementById('modalDetallesMnt');
        if (!modalDetalles) {
            const div = document.createElement('div');
            div.id = 'modalDetallesMnt';
            div.className = 'modal fade';
            div.setAttribute('tabindex', '-1');
            document.body.appendChild(div);
            modalDetalles = div;
        }

        // Checklist de daños
        let fallasHTML = '';
        const fallasClaves = {
            enciende: 'Enciende',
            botones: 'Botones físicos',
            camara: 'Cámaras',
            sensores: 'Sensores de proximidad',
            touchId: 'Biometría (TouchID/FaceID)',
            wifi: 'Conexión Wi-Fi',
            senal: 'Señal Celular/Red',
            sonido: 'Audio (Parlante/Mic)',
            carga: 'Pin de Carga'
        };

        Object.keys(fallasClaves).forEach(key => {
            const tieneFalla = !mnt.daños[key]; // Si es false, significa que el daño está presente o no funciona.
            // Nota: En la persistencia guardamos true = funcional, false = dañado/averiado.
            const icon = mnt.daños[key] 
                ? '<i class="bi bi-check-circle-fill text-success"></i> Funciona' 
                : '<i class="bi bi-exclamation-triangle-fill text-danger"></i> Reporta Daño';

            fallasHTML += `
                <div class="col-6 mb-2">
                    <div class="border rounded p-2 bg-light d-flex justify-content-between align-items-center">
                        <span class="small font-weight-bold">${fallasClaves[key]}</span>
                        <span class="small">${icon}</span>
                    </div>
                </div>
            `;
        });

        // Obtener cliente y técnico asignado
        const cliente = this.controlador.repo.buscarClientePorCedula(mnt.cedulaCliente);
        const tecnicos = this.controlador.repo.obtenerTecnicos();
        const tecnico = tecnicos.find(t => t.correo === mnt.tecnicoAsignado);

        modalDetalles.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header modal-header-pres">
                        <h5 class="modal-title"><i class="bi bi-file-earmark-text"></i> Ficha Técnica: ${mnt.idMantenimiento}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="row">
                            <div class="col-md-6 border-end">
                                <h6 class="text-primary border-bottom pb-2 mb-3"><i class="bi bi-laptop"></i> Información del Dispositivo</h6>
                                <p class="mb-1"><strong>Equipo:</strong> ${mnt.equipo}</p>
                                <p class="mb-1"><strong>Marca/Modelo:</strong> ${mnt.marca} / ${mnt.modelo}</p>
                                <p class="mb-1"><strong>Tipo de Dispositivo:</strong> ${mnt.tipoEquipo}</p>
                                <p class="mb-1"><strong>N° Serie / IMEI:</strong> ${mnt.numeroSerieImei}</p>
                                <p class="mb-1"><strong>Clave/PIN:</strong> <code class="text-dark">${mnt.clavePin}</code></p>
                                <p class="mb-3"><strong>Accesorios:</strong> ${mnt.accesorios || 'Ninguno'}</p>

                                <h6 class="text-primary border-bottom pb-2 mb-3"><i class="bi bi-person"></i> Asignaciones y Contacto</h6>
                                <p class="mb-1"><strong>Cliente:</strong> ${cliente ? cliente.nombre : 'Desconocido'} (${mnt.cedulaCliente})</p>
                                <p class="mb-1"><strong>Teléfono Cliente:</strong> ${cliente ? cliente.telefono : 'N/A'}</p>
                                <p class="mb-3"><strong>Técnico Asignado:</strong> ${tecnico ? tecnico.nombre : mnt.tecnicoAsignado}</p>
                            </div>
                            <div class="col-md-6 ps-md-4">
                                <h6 class="text-primary border-bottom pb-2 mb-3"><i class="bi bi-cash-coin"></i> Estado Financiero y Entrega</h6>
                                <div class="row text-center mb-3">
                                    <div class="col-4 border-end">
                                        <small class="text-muted d-block">Total</small>
                                        <strong class="text-dark">$${mnt.costos.totalMantenimiento.toFixed(2)}</strong>
                                    </div>
                                    <div class="col-4 border-end">
                                        <small class="text-muted d-block">Abono</small>
                                        <strong class="text-primary">$${mnt.costos.abono.toFixed(2)}</strong>
                                    </div>
                                    <div class="col-4">
                                        <small class="text-muted d-block">Saldo</small>
                                        <strong class="text-danger">$${mnt.costos.saldo.toFixed(2)}</strong>
                                    </div>
                                </div>
                                <p class="mb-1"><strong>Fecha Registro:</strong> ${mnt.fechaRegistro}</p>
                                <p class="mb-1"><strong>Fecha Entrega:</strong> ${mnt.costos.fechaEstimadaEntrega || 'No definida'}</p>
                                <p class="mb-3"><strong>Estado Actual:</strong> <span class="badge bg-secondary">${mnt.costos.estado}</span></p>
                                
                                <h6 class="text-primary border-bottom pb-2 mb-2"><i class="bi bi-chat-left-text"></i> Diagnóstico / Observaciones</h6>
                                <p class="bg-light p-2 rounded small border text-muted" style="min-height: 60px;">${mnt.costos.observaciones || 'Sin observaciones registradas.'}</p>
                            </div>
                        </div>

                        <h6 class="text-primary border-bottom pb-2 my-3"><i class="bi bi-check2-square"></i> Diagnóstico Inicial de Funcionalidad</h6>
                        <div class="row">
                            ${fallasHTML}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar Ficha</button>
                    </div>
                </div>
            </div>
        `;

        const detailsModal = new bootstrap.Modal(modalDetalles);
        detailsModal.show();
    }

    /**
     * Rellena el formulario de edición con los valores de un mantenimiento seleccionado.
     */
    cargarDatosEnFormulario(mnt) {
        document.getElementById('mnt-id').value = mnt.idMantenimiento;
        document.getElementById('mnt-equipo').value = mnt.equipo;
        document.getElementById('mnt-marca').value = mnt.marca;
        document.getElementById('mnt-modelo').value = mnt.modelo;
        document.getElementById('mnt-pin').value = mnt.clavePin;
        document.getElementById('mnt-serial').value = mnt.numeroSerieImei;
        document.getElementById('mnt-accesorios').value = mnt.accesorios;
        document.getElementById('mnt-tipo').value = mnt.tipoEquipo;
        document.getElementById('mnt-cliente').value = mnt.cedulaCliente;
        document.getElementById('mnt-tecnico').value = mnt.tecnicoAsignado;
        
        // Checklist
        document.getElementById('dmg-enciende').checked = mnt.daños.enciende;
        document.getElementById('dmg-botones').checked = mnt.daños.botones;
        document.getElementById('dmg-camara').checked = mnt.daños.camara;
        document.getElementById('dmg-sensores').checked = mnt.daños.sensores;
        document.getElementById('dmg-touchid').checked = mnt.daños.touchId;
        document.getElementById('dmg-wifi').checked = mnt.daños.wifi;
        document.getElementById('dmg-senal').checked = mnt.daños.senal;
        document.getElementById('dmg-sonido').checked = mnt.daños.sonido;
        document.getElementById('dmg-carga').checked = mnt.daños.carga;

        // Costos
        document.getElementById('mnt-observaciones').value = mnt.costos.observaciones;
        document.getElementById('mnt-total').value = mnt.costos.totalMantenimiento;
        document.getElementById('mnt-abono').value = mnt.costos.abono;
        document.getElementById('mnt-saldo').value = mnt.costos.saldo.toFixed(2);
        document.getElementById('mnt-fecha-entrega').value = mnt.costos.fechaEstimadaEntrega;
        document.getElementById('mnt-estado').value = mnt.costos.estado;
    }

    /**
     * Lógica para estadisticas.html
     */
    mostrarPantallaEstadisticas() {
        const dashboardStats = document.getElementById('dashboard-stats-container');
        if (!dashboardStats) return;

        try {
            // Generar estadísticas usando el patrón Composite en el controlador
            const stats = this.controlador.generarEstadisticas();

            // Rellenar las tarjetas de KPIs
            document.getElementById('stat-total-mantenimientos').textContent = stats.totales.totalEquipos;
            document.getElementById('stat-total-facturado').textContent = `$${stats.totales.totalFacturado.toFixed(2)}`;
            document.getElementById('stat-total-abonado').textContent = `$${stats.totales.totalAbonado.toFixed(2)}`;
            document.getElementById('stat-total-saldos').textContent = `$${stats.totales.totalSaldos.toFixed(2)}`;
            document.getElementById('stat-promedio-ingresos').textContent = `$${stats.totales.promedioIngresos.toFixed(2)}`;

            // Renderizar gráficos con Chart.js
            this.renderizarGraficoMarcas(stats.porMarca);
            this.renderizarGraficoEstados(stats.porEstado);
            this.renderizarGraficoMeses(stats.porMes);

            this.actualizarConsolaLogs();
        } catch (err) {
            dashboardStats.innerHTML = `
                <div class="alert alert-danger text-center my-4">
                    <h4><i class="bi bi-exclamation-triangle"></i> Acceso Denegado</h4>
                    <p>No tiene permisos para visualizar las estadísticas financieras y operativas.</p>
                    <p class="small text-muted">${err.message}</p>
                </div>
            `;
        }
    }

    renderizarGraficoMarcas(datosMarca) {
        const ctx = document.getElementById('chart-marcas');
        if (!ctx) return;

        const labels = datosMarca.map(d => d.marca);
        const data = datosMarca.map(d => d.cantidad);
        const revenues = datosMarca.map(d => d.facturado);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Equipos Reparados',
                        data: data,
                        backgroundColor: '#457b9d', // Presentación (Azul)
                        borderRadius: 5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Ingresos ($)',
                        data: revenues,
                        backgroundColor: '#2a9d8f', // Datos (Verde)
                        borderRadius: 5,
                        yAxisID: 'y1',
                        type: 'line',
                        borderColor: '#1b4332',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Cantidad' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        title: { display: true, text: 'Ingresos ($)' }
                    }
                }
            }
        });
    }

    renderizarGraficoEstados(datosEstado) {
        const ctx = document.getElementById('chart-estados');
        if (!ctx) return;

        const labels = datosEstado.map(d => d.estado);
        const data = datosEstado.map(d => d.cantidad);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#e2e3e5', // Recibido (Gris)
                        '#f4a261', // En Reparación (Naranja)
                        '#a8dadc', // Listo para Entrega (Celeste)
                        '#2a9d8f'  // Entregado (Verde)
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    renderizarGraficoMeses(datosMes) {
        const ctx = document.getElementById('chart-meses');
        if (!ctx) return;

        const labels = datosMes.map(d => d.mes);
        const revenues = datosMes.map(d => d.facturado);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Facturación Mensual ($)',
                    data: revenues,
                    borderColor: '#e76f51', // Negocio (Naranja)
                    backgroundColor: 'rgba(231, 111, 81, 0.1)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 3,
                    pointBackgroundColor: '#d65a31',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Total Facturado ($)' }
                    }
                }
            }
        });
    }
}

// Inicializar la interfaz una vez cargado el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UI_SistemaMantenimiento();
});
