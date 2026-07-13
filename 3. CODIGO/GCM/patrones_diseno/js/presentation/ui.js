/**
 * Capa de Presentación: UI_SistemaMantenimiento
 * Coordina la representación visual y los eventos de interacción del usuario.
 * Utiliza el controlador global (ProxyControlador) para procesar requerimientos.
 * 
 * Tareas:
 * - [x] Inyectar html2pdf.js y botones de impresión en los archivos HTML
 *     - [x] Modificar `mantenimientos.html` para incluir el botón y script CDN
 *     - [x] Modificar `estadisticas.html` para incluir el botón y script CDN
 * - [x] Agregar estilos CSS para la visualización del modal e impresión
 *     - [x] Definir reglas en `css/estilos.css` para el modal y panel de previsualización
 *     - [x] Configurar reglas de `@media print` para ocultar la UI e imprimir
 * - [x] Implementar el modal y eventos de impresión en `js/presentation/ui.js`
 *     - [x] Crear la función `inyectarModalImpresion` en `UI_SistemaMantenimiento`
 *     - [x] Vincular los botones de impresión en las pantallas respectivas
 *     - [x] Desarrollar la lógica de previsualización (clonación de tablas / conversión de canvas a base64 de gráficos)
 *     - [x] Programar el botón "Guardar" para PDF y cola de impresión nativa, incluyendo simulaciones de errores
 * - [x] Realizar pruebas manuales de funcionamiento y verificar rendimiento
 */
class UI_SistemaMantenimiento {
    constructor() {
        this.controlador = window.controlador;
        this.detectarYInicializarPantalla();
    }

    /**
     * Inyecta dinámicamente el modal y botón para que el Administrador registre nuevo personal (Admin / Técnico).
     */
    inyectarModalRegistrarPersonal() {
        const sesion = this.controlador.sesionActiva;
        if (!sesion || sesion.rol !== 'Administrador') return;

        // 1. Inyectar el HTML del modal en el body si no existe
        if (!document.getElementById('modalRegistrarPersonal')) {
            const modalHTML = `
                <div class="modal fade" id="modalRegistrarPersonal" tabindex="-1" aria-labelledby="modalRegistrarPersonalTitle" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header modal-header-pres" style="background-color: var(--color-pres-dark); color: white;">
                                <h5 class="modal-title" id="modalRegistrarPersonalTitle"><i class="bi bi-person-plus-fill"></i> Registrar Personal</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <form id="form-registrar-personal">
                                <div class="modal-body p-4">
                                    <div class="alert alert-danger d-none" id="reg-pers-error"></div>
                                    <div class="alert alert-success d-none" id="reg-pers-exito">¡Personal registrado con éxito!</div>
                                    
                                    <div class="mb-3">
                                        <label for="pers-rol" class="form-label small fw-semibold text-secondary">Rol del Personal</label>
                                        <select class="form-select" id="pers-rol" required>
                                            <option value="Técnico" selected>Técnico</option>
                                            <option value="Administrador">Administrador</option>
                                        </select>
                                    </div>
                                    <div class="mb-3">
                                        <label for="pers-nombre" class="form-label small fw-semibold text-secondary">Nombre Completo</label>
                                        <input type="text" class="form-control" id="pers-nombre" placeholder="ej. Carlos Gómez" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="pers-usuario" class="form-label small fw-semibold text-secondary">Nombre de Usuario (Login)</label>
                                        <input type="text" class="form-control" id="pers-usuario" placeholder="ej. cgomez" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="pers-correo" class="form-label small fw-semibold text-secondary">Correo Electrónico</label>
                                        <input type="email" class="form-control" id="pers-correo" placeholder="ej. carlos@mantenimiento.com" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="pers-telefono" class="form-label small fw-semibold text-secondary">Teléfono de Contacto</label>
                                        <input type="text" class="form-control" id="pers-telefono" placeholder="ej. 0988888888" required>
                                    </div>
                                    <div class="mb-3" id="group-pers-especialidad">
                                        <label for="pers-especialidad" class="form-label small fw-semibold text-secondary">Especialidad Técnica</label>
                                        <input type="text" class="form-control" id="pers-especialidad" placeholder="ej. Dispositivos Móviles" list="especialidades-list" required>
                                        <datalist id="especialidades-list"></datalist>
                                    </div>
                                    <div class="mb-3">
                                        <label for="pers-clave" class="form-label small fw-semibold text-secondary">Contraseña de Acceso</label>
                                        <input type="password" class="form-control" id="pers-clave" placeholder="Mínimo 6 caracteres" required>
                                    </div>
                                </div>
                                <div class="modal-footer bg-light border-top-0">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                    <button type="submit" class="btn btn-pres" style="background-color: var(--color-pres-accent); color: white;">Guardar Colaborador</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            this.actualizarDatalistEspecialidades();
        }

        // 2. Vincular el botón del Sidebar para abrir el modal
        let bootstrapModal = null;
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            bootstrapModal = new bootstrap.Modal(document.getElementById('modalRegistrarPersonal'));
        }
        
        // Se requiere usar event delegation por la inyección dinámica del sidebar
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('#btn-registrar-personal-sidebar');
            if (btn) {
                e.preventDefault();
                
                // Reset form
                const form = document.getElementById('form-registrar-personal');
                form.reset();
                document.getElementById('reg-pers-error').classList.add('d-none');
                document.getElementById('reg-pers-exito').classList.add('d-none');
                document.getElementById('group-pers-especialidad').classList.remove('d-none');
                document.getElementById('pers-especialidad').required = true;
                
                if (bootstrapModal) {
                    bootstrapModal.show();
                } else if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                    bootstrapModal = new bootstrap.Modal(document.getElementById('modalRegistrarPersonal'));
                    bootstrapModal.show();
                } else {
                    console.warn("Bootstrap JS is not loaded. Cannot display registration modal.");
                }
            }
        });

        // Ocultar/Mostrar especialidad según el rol seleccionado
        document.getElementById('pers-rol')?.addEventListener('change', (e) => {
            const especialidadGroup = document.getElementById('group-pers-especialidad');
            const especialidadInput = document.getElementById('pers-especialidad');
            if (e.target.value === 'Administrador') {
                especialidadGroup.classList.add('d-none');
                especialidadInput.required = false;
            } else {
                especialidadGroup.classList.remove('d-none');
                especialidadInput.required = true;
            }
        });

        // 3. Manejar el submit del formulario de registro
        document.getElementById('form-registrar-personal')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('reg-pers-error');
            const exitoDiv = document.getElementById('reg-pers-exito');
            errorDiv.classList.add('d-none');
            exitoDiv.classList.add('d-none');

            const rol = document.getElementById('pers-rol').value;
            const nombre = document.getElementById('pers-nombre').value.trim();
            const usuario = document.getElementById('pers-usuario').value.trim();
            const correo = document.getElementById('pers-correo').value.trim();
            const telefono = document.getElementById('pers-telefono').value.trim();
            const especialidad = document.getElementById('pers-especialidad').value.trim();
            const clave = document.getElementById('pers-clave').value;

            if (clave.length < 6) {
                errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
                errorDiv.classList.remove('d-none');
                return;
            }

            try {
                // Utilizar el repositorio para realizar el registro del personal
                this.controlador.repo.registrarClientePublico({
                    nombre,
                    usuario,
                    password: clave,
                    rol,
                    correo,
                    telefono,
                    especialidad: rol === 'Técnico' ? especialidad : undefined
                });

                // Registrar log de seguridad local
                this.controlador.repo.registrarLog({
                    fecha: new Date().toISOString(),
                    usuario: sesion.usuario,
                    operacion: 'REGISTRO_PERSONAL_EXITOSO',
                    detalle: `Administrador registró nuevo ${rol}: ${nombre} (${usuario})`
                });

                exitoDiv.classList.remove('d-none');
                setTimeout(() => {
                    if (bootstrapModal) {
                        bootstrapModal.hide();
                    } else if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                        const instance = bootstrap.Modal.getInstance(document.getElementById('modalRegistrarPersonal'));
                        instance?.hide();
                    }
                    // Si estamos en la pantalla de técnicos y registramos un técnico, recargar la tabla
                    if (window.location.pathname.includes('tecnicos.html')) {
                        window.location.reload();
                    }
                }, 1500);

            } catch (err) {
                errorDiv.textContent = 'Error al registrar: ' + err.message;
                errorDiv.classList.remove('d-none');
            }
        });
    }

    /**
     * Detecta la página actual y carga la lógica de presentación correspondiente.
     */
    detectarYInicializarPantalla() {
        const path = window.location.pathname;
        const pagina = path.substring(path.lastIndexOf('/') + 1);

        // Si no hay sesión y no estamos en login.html o registro.html, redirigir a login
        if (!this.controlador.sesionActiva && pagina !== 'login.html' && pagina !== 'registro.html') {
            window.location.href = 'login.html';
            return;
        }

        // Si el usuario debe cambiar su contraseña por primera vez, forzar redirección a cambiar-contrasena.html
        if (this.controlador.sesionActiva && this.controlador.sesionActiva.debeCambiarPw && pagina !== 'cambiar-contrasena.html') {
            window.location.href = 'cambiar-contrasena.html';
            return;
        }

        // Si ya hay sesión activa e ingresa a login o registro (y no debe cambiar contraseña), redirigir a index
        if (this.controlador.sesionActiva && !this.controlador.sesionActiva.debeCambiarPw && (pagina === 'login.html' || pagina === 'registro.html' || pagina === 'cambiar-contrasena.html')) {
            this.redirigirUsuarioSegunRol();
            return;
        }

        // Cargar componentes de estructura común (Sidebar y Navbar) si no estamos en Login, Registro o Cambiar Contraseña
        if (pagina !== 'login.html' && pagina !== 'registro.html' && pagina !== 'cambiar-contrasena.html' && pagina !== 'index.html' && pagina !== '') {
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
            case 'registro.html':
                this.mostrarPantallaRegistro();
                break;
            case 'registrar-personal.html':
                this.mostrarPantallaRegistrarPersonalPage();
                break;
            case 'cambiar-contrasena.html':
                this.mostrarPantallaCambiarContrasena();
                break;
            case 'clientes.html':
                this.mostrarPantallaClientes();
                break;
            case 'tecnicos.html':
                this.mostrarPantallaTecnicos();
                break;
            case 'administradores.html':
                this.mostrarPantallaAdministradores();
                break;
            case 'mantenimientos.html':
                this.mostrarPantallaMantenimientos();
                break;
            case 'editar-cliente.html':
                this.mostrarPantallaEditarCliente();
                break;
            case 'editar-tecnico.html':
                this.mostrarPantallaEditarTecnico();
                break;
            case 'editar-mantenimiento.html':
                this.mostrarPantallaEditarMantenimiento();
                break;
            case 'estadisticas.html':
                this.mostrarPantallaEstadisticas();
                break;
            case 'imprimir-informe.html':
                this.mostrarPantallaImprimirInforme();
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
                    <li class="sidebar-item ${paginaActiva === 'administradores.html' ? 'active' : ''}">
                        <a href="administradores.html"><i class="bi bi-shield-check"></i> Administradores</a>
                    </li>
                    <li class="sidebar-item ${paginaActiva === 'mantenimientos.html' ? 'active' : ''}">
                        <a href="mantenimientos.html"><i class="bi bi-tools"></i> Mantenimientos</a>
                    </li>
                    <li class="sidebar-item ${paginaActiva === 'registrar-personal.html' ? 'active' : ''}">
                        <a href="registrar-personal.html"><i class="bi bi-person-plus-fill"></i> Registrar Personal</a>
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

        // Toggle password visibility
        const toggleBtn = document.getElementById('btn-toggle-password');
        const claveInput = document.getElementById('txt-clave');
        const icon = document.getElementById('toggle-password-icon');
        if (toggleBtn && claveInput && icon) {
            toggleBtn.addEventListener('click', () => {
                if (claveInput.type === 'password') {
                    claveInput.type = 'text';
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                } else {
                    claveInput.type = 'password';
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                }
            });
        }

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
     * Lógica para registro.html
     */
    mostrarPantallaRegistro() {
        const registroForm = document.getElementById('registro-form');
        if (!registroForm) return;

        // Toggle password visibility
        const toggleBtn = document.getElementById('btn-toggle-password');
        const claveInput = document.getElementById('txt-clave');
        const icon = document.getElementById('toggle-password-icon');
        if (toggleBtn && claveInput && icon) {
            toggleBtn.addEventListener('click', () => {
                if (claveInput.type === 'password') {
                    claveInput.type = 'text';
                    icon.classList.remove('bi-eye');
                    icon.classList.add('bi-eye-slash');
                } else {
                    claveInput.type = 'password';
                    icon.classList.remove('bi-eye-slash');
                    icon.classList.add('bi-eye');
                }
            });
        }

        // Toggle confirm password visibility
        const toggleConfirmBtn = document.getElementById('btn-toggle-confirm-password');
        const confirmClaveInput = document.getElementById('txt-confirmar-clave');
        const confirmIcon = document.getElementById('toggle-confirm-password-icon');
        if (toggleConfirmBtn && confirmClaveInput && confirmIcon) {
            toggleConfirmBtn.addEventListener('click', () => {
                if (confirmClaveInput.type === 'password') {
                    confirmClaveInput.type = 'text';
                    confirmIcon.classList.remove('bi-eye');
                    confirmIcon.classList.add('bi-eye-slash');
                } else {
                    confirmClaveInput.type = 'password';
                    confirmIcon.classList.remove('bi-eye-slash');
                    confirmIcon.classList.add('bi-eye');
                }
            });
        }

        registroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const cedula = document.getElementById('txt-cedula').value.trim();
            const nombre = document.getElementById('txt-nombre').value.trim();
            const usuario = document.getElementById('txt-usuario').value.trim();
            const correo = document.getElementById('txt-correo').value.trim();
            const telefono = document.getElementById('txt-telefono').value.trim();
            const clave = document.getElementById('txt-clave').value;
            const confirmarClave = document.getElementById('txt-confirmar-clave').value;
            const feedback = document.getElementById('registro-feedback');
            const exito = document.getElementById('registro-exito');

            feedback.classList.add('d-none');
            exito.classList.add('d-none');

            if (!cedula || !nombre || !usuario || !correo || !telefono || !clave || !confirmarClave) {
                feedback.classList.remove('d-none');
                feedback.textContent = 'Todos los campos son obligatorios.';
                return;
            }

            if (clave.length < 6) {
                feedback.classList.remove('d-none');
                feedback.textContent = 'La contraseña debe tener al menos 6 caracteres.';
                return;
            }

            if (clave !== confirmarClave) {
                feedback.classList.remove('d-none');
                feedback.textContent = 'Las contraseñas no coinciden.';
                return;
            }

            try {
                this.controlador.repo.registrarClientePublico({
                    nombre,
                    usuario,
                    password: clave,
                    rol: 'Cliente',
                    cedula,
                    correo,
                    telefono
                });

                exito.classList.remove('d-none');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (err) {
                feedback.classList.remove('d-none');
                feedback.textContent = 'Error al registrar: ' + err.message;
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
                                <button class="btn btn-sm btn-outline-primary btn-editar-cli" data-cedula="${c.cedula}" title="Editar">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger btn-eliminar-cli" data-cedula="${c.cedula}" title="Eliminar">
                                    <i class="bi bi-trash"></i>
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
                    window.location.href = `editar-cliente.html?cedula=${cedula}`;
                });
            });

            // Enlazar botones de eliminación
            document.querySelectorAll('.btn-eliminar-cli').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cedula = btn.getAttribute('data-cedula');
                    if (confirm(`¿Está seguro de eliminar al cliente con cédula ${cedula}? Se eliminarán también sus mantenimientos asociados.`)) {
                        try {
                            this.controlador.gestionarCRUDCliente({ accion: 'eliminar', cedula });
                            cargarYRenderizar();
                        } catch (err) {
                            alert("Error al eliminar cliente: " + err.message);
                        }
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
            window.location.href = 'editar-cliente.html';
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
                        <button class="btn btn-sm btn-outline-primary btn-editar-tec" data-correo="${t.correo}" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-sm btn-outline-danger btn-eliminar-tec" data-correo="${t.correo}" data-nombre="${t.nombre}" title="Eliminar"><i class="bi bi-trash"></i></button>
                    </td>
                `;
                tablaBody.appendChild(tr);
            });

            // Enlazar editar
            document.querySelectorAll('.btn-editar-tec').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const correo = btn.getAttribute('data-correo');
                    window.location.href = `editar-tecnico.html?correo=${correo}`;
                });
            });


            // Enlazar eliminar
            document.querySelectorAll('.btn-eliminar-tec').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const correo = btn.getAttribute('data-correo');
                    const nombre = btn.getAttribute('data-nombre') || correo;
                    if (confirm(`¿Está seguro de eliminar al técnico ${nombre}? Se eliminarán también sus mantenimientos asociados.`)) {
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
            window.location.href = 'editar-tecnico.html';
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
                            <button class="btn btn-sm btn-outline-secondary btn-imprimir-fila" data-id="${m.idMantenimiento}" title="Imprimir Ficha Técnica"><i class="bi bi-printer"></i></button>
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
                    window.location.href = `editar-mantenimiento.html?id=${id}`;
                });
            });

            // Registrar eventos para imprimir fila
            document.querySelectorAll('.btn-imprimir-fila').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    window.location.href = `imprimir-informe.html?tipo=Mantenimiento&id=${id}`;
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

        const filtrarYRenderizar = () => {
            try {
                let todos = [];
                if (sesion.rol === 'Cliente') {
                    todos = this.controlador.registrarMantenimiento({ 
                        accion: 'buscarPorCliente', 
                        cedulaCliente: sesion.cedula 
                    });
                } else {
                    todos = this.controlador.registrarMantenimiento({ accion: 'listar' });
                }

                // 1. Filtro por buscador de texto
                const query = searchInput?.value.toLowerCase() || "";
                
                // 2. Filtro por estado
                const estadoFiltro = document.getElementById('filtro-estado')?.value || "Todos";
                
                // 3. Filtro por mes (formato input type="month": YYYY-MM)
                const mesFiltro = document.getElementById('filtro-mes')?.value || "";

                const filtrados = todos.filter(m => {
                    // Texto
                    const matchesText = !query || 
                        m.idMantenimiento.toLowerCase().includes(query) || 
                        m.equipo.toLowerCase().includes(query) || 
                        m.marca.toLowerCase().includes(query) ||
                        m.costos.estado.toLowerCase().includes(query);

                    // Estado
                    const matchesEstado = estadoFiltro === "Todos" || m.costos.estado === estadoFiltro;

                    // Mes (m.fechaRegistro es YYYY-MM-DD)
                    let matchesMes = true;
                    if (mesFiltro) {
                        const mFecha = m.fechaRegistro; // ej: "2026-06-01"
                        if (mFecha && mFecha.startsWith(mesFiltro)) {
                            matchesMes = true;
                        } else {
                            matchesMes = false;
                        }
                    }

                    return matchesText && matchesEstado && matchesMes;
                });

                renderTable(filtrados);
                this.actualizarConsolaLogs();
            } catch (err) {
                tablaBody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Error al cargar mantenimientos: ${err.message}</td></tr>`;
            }
        };

        const cargarYRenderizar = filtrarYRenderizar;

        // Escuchar cambios en los filtros
        searchInput?.addEventListener('input', filtrarYRenderizar);
        document.getElementById('filtro-estado')?.addEventListener('change', filtrarYRenderizar);
        document.getElementById('filtro-mes')?.addEventListener('input', filtrarYRenderizar);
        
        // Botón para limpiar filtros
        document.getElementById('btn-limpiar-filtros')?.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            const selectEstado = document.getElementById('filtro-estado');
            if (selectEstado) selectEstado.value = 'Todos';
            const inputMes = document.getElementById('filtro-mes');
            if (inputMes) inputMes.value = '';
            filtrarYRenderizar();
        });

        // Crear nuevo
        document.getElementById('btn-nuevo-mantenimiento')?.addEventListener('click', () => {
            window.location.href = 'editar-mantenimiento.html';
        });

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

            // Botón de imprimir estadísticas
            document.getElementById('btn-imprimir-estadisticas')?.addEventListener('click', () => {
                window.location.href = 'imprimir-informe.html?tipo=Estadísticas';
            });

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

    mostrarPantallaEditarCliente() {
        const formCliente = document.getElementById('form-cliente');
        if (!formCliente) return;

        const params = new URLSearchParams(window.location.search);
        const cedula = params.get('cedula');

        const breadcrumbAction = document.getElementById('breadcrumb-action');
        const formTitle = document.getElementById('form-title');

        const esEdicion = !!cedula;

        if (esEdicion) {
            breadcrumbAction.textContent = 'Editar Cliente';
            formTitle.textContent = `Editar Cliente: ${cedula}`;
            document.getElementById('cli-cedula').value = cedula;
            document.getElementById('cli-cedula').readOnly = true;

            try {
                const clientes = this.controlador.gestionarCRUDCliente({ accion: 'listar' });
                const cliente = clientes.find(c => c.cedula === cedula);
                if (cliente) {
                    document.getElementById('cli-nombre').value = cliente.nombre;
                    document.getElementById('cli-correo').value = cliente.correo;
                    document.getElementById('cli-telefono').value = cliente.telefono;
                    
                    const groupUsuario = document.getElementById('group-cli-usuario');
                    if (groupUsuario) groupUsuario.classList.add('d-none');
                } else {
                    alert("Cliente no encontrado.");
                    window.location.href = 'clientes.html';
                }
            } catch (err) {
                alert("Error al cargar datos del cliente: " + err.message);
                window.location.href = 'clientes.html';
            }
        } else {
            breadcrumbAction.textContent = 'Registrar Cliente';
            formTitle.textContent = 'Registrar Nuevo Cliente';
            document.getElementById('cli-cedula').readOnly = false;
        }

        formCliente.addEventListener('submit', (e) => {
            e.preventDefault();
            const cliCedula = document.getElementById('cli-cedula').value.trim();
            const nombre = document.getElementById('cli-nombre').value.trim();
            const correo = document.getElementById('cli-correo').value.trim();
            const telefono = document.getElementById('cli-telefono').value.trim();
            const usuario = document.getElementById('cli-usuario')?.value.trim() || undefined;

            if (!cliCedula || !nombre || !correo || !telefono) {
                alert("Todos los campos obligatorios deben ser completados.");
                return;
            }

            if (!correo.includes('@')) {
                alert("Ingrese un correo electrónico válido.");
                return;
            }

            const accion = esEdicion ? 'editar' : 'crear';
            const cliente = {
                cedula: cliCedula,
                nombre,
                correo,
                telefono,
                usuario
            };

            try {
                this.controlador.gestionarCRUDCliente({ accion, cliente });
                alert(esEdicion ? "Cliente actualizado con éxito." : "Cliente registrado con éxito.");
                window.location.href = 'clientes.html';
            } catch (err) {
                alert("Error al guardar cliente: " + err.message);
            }
        });
    }

    mostrarPantallaEditarTecnico() {
        const formTecnico = document.getElementById('form-tecnico');
        if (!formTecnico) return;

        this.actualizarDatalistEspecialidades();

        const params = new URLSearchParams(window.location.search);
        const correo = params.get('correo');

        const breadcrumbAction = document.getElementById('breadcrumb-action');
        const formTitle = document.getElementById('form-title');

        const esEdicion = !!correo;

        if (esEdicion) {
            breadcrumbAction.textContent = 'Editar Técnico';
            formTitle.textContent = `Editar Técnico: ${correo}`;
            document.getElementById('tec-correo').value = correo;
            document.getElementById('tec-correo').readOnly = true;

            try {
                const tecnicos = this.controlador.gestionarCRUDTecnico({ accion: 'listar' });
                const tecnico = tecnicos.find(t => t.correo === correo);
                if (tecnico) {
                    document.getElementById('tec-nombre').value = tecnico.nombre;
                    document.getElementById('tec-especialidad').value = tecnico.especialidad;
                    document.getElementById('tec-telefono').value = tecnico.telefono;
                } else {
                    alert("Técnico no encontrado.");
                    window.location.href = 'tecnicos.html';
                }
            } catch (err) {
                alert("Error al cargar datos del técnico: " + err.message);
                window.location.href = 'tecnicos.html';
            }
        } else {
            alert("El registro de nuevos técnicos debe realizarse desde la sección 'Registrar Personal'.");
            window.location.href = 'registrar-personal.html';
            return;
        }

        formTecnico.addEventListener('submit', (e) => {
            e.preventDefault();
            const tecCorreo = document.getElementById('tec-correo').value.trim();
            const nombre = document.getElementById('tec-nombre').value.trim();
            const especialidad = document.getElementById('tec-especialidad').value.trim();
            const telefono = document.getElementById('tec-telefono').value.trim();

            if (!tecCorreo || !nombre || !especialidad || !telefono) {
                alert("Todos los campos obligatorios deben ser completados.");
                return;
            }

            if (!tecCorreo.includes('@')) {
                alert("Ingrese un correo electrónico válido.");
                return;
            }

            const accion = esEdicion ? 'editar' : 'crear';
            const tecnico = {
                nombre,
                especialidad,
                correo: tecCorreo,
                telefono
            };

            try {
                this.controlador.gestionarCRUDTecnico({ accion, tecnico });
                alert(esEdicion ? "Técnico actualizado con éxito." : "Técnico registrado con éxito.");
                window.location.href = 'tecnicos.html';
            } catch (err) {
                alert("Error al guardar técnico: " + err.message);
            }
        });
    }

    /**
     * Llena dinámicamente el datalist de especialidades con las especialidades de los técnicos cargados.
     */
    actualizarDatalistEspecialidades() {
        const datalists = document.querySelectorAll('#especialidades-list');
        if (datalists.length === 0) return;
        try {
            const tecnicos = this.controlador.gestionarCRUDTecnico({ accion: 'listar' });
            const specs = [...new Set(tecnicos.map(t => t.especialidad).filter(Boolean))];
            datalists.forEach(datalist => {
                datalist.innerHTML = '';
                specs.forEach(spec => {
                    const option = document.createElement('option');
                    option.value = spec;
                    datalist.appendChild(option);
                });
            });
        } catch (err) {
            console.warn("No se pudieron cargar especialidades para el autocompletado:", err.message);
        }
    }

    /**
     * Lógica para administradores.html
     */
    mostrarPantallaAdministradores() {
        const tablaBody = document.getElementById('tabla-administradores-body');
        const searchInput = document.getElementById('buscar-administrador');

        if (!tablaBody) return;

        const renderTable = (adminsList) => {
            tablaBody.innerHTML = '';
            if (adminsList.length === 0) {
                tablaBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">No hay administradores registrados.</td></tr>`;
                return;
            }

            adminsList.forEach(a => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${a.nombre}</strong></td>
                    <td>${a.usuario}</td>
                    <td><span class="badge bg-primary">${a.rol}</span></td>
                `;
                tablaBody.appendChild(tr);
            });
        };

        const cargarYRenderizar = () => {
            try {
                const admins = this.controlador.obtenerAdministradores();
                renderTable(admins);
                this.actualizarConsolaLogs();
            } catch (err) {
                tablaBody.innerHTML = `<tr><td colspan="3" class="text-danger text-center">Acceso no autorizado: Solo Administradores pueden ver esta sección.</td></tr>`;
            }
        };

        searchInput?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const todos = this.controlador.obtenerAdministradores();
            const filtrados = todos.filter(a => 
                a.nombre.toLowerCase().includes(query) || 
                a.usuario.toLowerCase().includes(query)
            );
            renderTable(filtrados);
        });

        cargarYRenderizar();
    }

    mostrarPantallaEditarMantenimiento() {
        const formMnt = document.getElementById('form-mantenimiento');
        if (!formMnt) return;

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        const breadcrumbAction = document.getElementById('breadcrumb-action');
        const formTitle = document.getElementById('form-title');
        const selectCliente = document.getElementById('mnt-cliente');
        const selectTecnico = document.getElementById('mnt-tecnico');
        const totalInput = document.getElementById('mnt-total');
        const abonoInput = document.getElementById('mnt-abono');
        const saldoInput = document.getElementById('mnt-saldo');

        const sesion = this.controlador.sesionActiva;
        const esEdicion = !!id;

        const cargarSelectores = () => {
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

        cargarSelectores();

        const calcularSaldo = () => {
            const total = parseFloat(totalInput.value || 0);
            const abono = parseFloat(abonoInput.value || 0);
            const saldo = Math.max(0, total - abono);
            saldoInput.value = saldo.toFixed(2);
        };

        totalInput.addEventListener('input', calcularSaldo);
        abonoInput.addEventListener('input', calcularSaldo);

        if (esEdicion) {
            breadcrumbAction.textContent = 'Editar Ficha';
            formTitle.textContent = `Editar Ficha de Mantenimiento: ${id}`;
            document.getElementById('mnt-id').value = id;

            try {
                const mnt = this.controlador.registrarMantenimiento({ accion: 'buscarPorId', idMantenimiento: id });
                if (mnt) {
                    document.getElementById('mnt-equipo').value = mnt.equipo;
                    document.getElementById('mnt-marca').value = mnt.marca;
                    document.getElementById('mnt-modelo').value = mnt.modelo;
                    document.getElementById('mnt-tipo').value = mnt.tipoEquipo;
                    document.getElementById('mnt-serial').value = mnt.numeroSerieImei;
                    document.getElementById('mnt-pin').value = mnt.clavePin;
                    document.getElementById('mnt-accesorios').value = mnt.accesorios || '';

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

                    // Costos y asignación
                    selectCliente.value = mnt.cedulaCliente;
                    selectTecnico.value = mnt.tecnicoAsignado;
                    totalInput.value = mnt.costos.totalMantenimiento;
                    abonoInput.value = mnt.costos.abono;
                    saldoInput.value = mnt.costos.saldo.toFixed(2);
                    document.getElementById('mnt-fecha-entrega').value = mnt.costos.fechaEstimadaEntrega;
                    document.getElementById('mnt-estado').value = mnt.costos.estado;
                    document.getElementById('mnt-observaciones').value = mnt.costos.observaciones;
                } else {
                    alert("Ficha de mantenimiento no encontrada.");
                    window.location.href = 'mantenimientos.html';
                }
            } catch (err) {
                alert("Error al cargar datos del mantenimiento: " + err.message);
                window.location.href = 'mantenimientos.html';
            }
        } else {
            breadcrumbAction.textContent = 'Registrar Mantenimiento';
            formTitle.textContent = 'Registrar Nuevo Mantenimiento';
            document.getElementById('mnt-id').value = '';
        }

        formMnt.addEventListener('submit', (e) => {
            e.preventDefault();

            const equipo = document.getElementById('mnt-equipo').value.trim();
            const marca = document.getElementById('mnt-marca').value.trim();
            const modelo = document.getElementById('mnt-modelo').value.trim();
            const serial = document.getElementById('mnt-serial').value.trim();
            const pin = document.getElementById('mnt-pin').value.trim();
            const cliente = selectCliente.value;
            const tecnico = selectTecnico.value;
            const totalMnt = parseFloat(totalInput.value || 0);
            const abono = parseFloat(abonoInput.value || 0);
            const fechaEntrega = document.getElementById('mnt-fecha-entrega').value;
            const estado = document.getElementById('mnt-estado').value;
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
                alert("Debe seleccionar un técnico.");
                return;
            }

            if (totalMnt <= 0) {
                alert("El costo total del mantenimiento debe ser mayor a 0.");
                return;
            }

            const mntObject = {
                idMantenimiento: id || undefined,
                equipo,
                marca,
                modelo,
                tipoEquipo: document.getElementById('mnt-tipo').value,
                numeroSerieImei: serial,
                clavePin: pin,
                accesorios: document.getElementById('mnt-accesorios').value.trim(),
                cedulaCliente: cliente,
                tecnicoAsignado: tecnico,
                daños: {
                    enciende: document.getElementById('dmg-enciende').checked,
                    botones: document.getElementById('dmg-botones').checked,
                    camara: document.getElementById('dmg-camara').checked,
                    sensores: document.getElementById('dmg-sensores').checked,
                    touchId: document.getElementById('dmg-touchid').checked,
                    wifi: document.getElementById('dmg-wifi').checked,
                    senal: document.getElementById('dmg-senal').checked,
                    sonido: document.getElementById('dmg-sonido').checked,
                    carga: document.getElementById('dmg-carga').checked
                },
                costos: {
                    totalMantenimiento: totalMnt,
                    abono: abono,
                    saldo: totalMnt - abono,
                    estado: estado,
                    fechaEstimadaEntrega: fechaEntrega,
                    observaciones: observaciones
                }
            };

            const accion = esEdicion ? 'editar' : 'crear';
            
            // Preguntar canal de notificación
            const canal = confirm("¿Desea enviar notificaciones de este cambio al cliente por Correo Electrónico? (Cancelar = WhatsApp)") ? 'Correo' : 'WhatsApp';

            try {
                this.controlador.registrarMantenimiento({ 
                    accion, 
                    mantenimiento: mntObject,
                    proveedorNotificacion: canal
                });
                alert(esEdicion ? "Mantenimiento actualizado." : "Mantenimiento registrado.");
                window.location.href = 'mantenimientos.html';
            } catch (err) {
                alert("Error al guardar mantenimiento: " + err.message);
            }
        });
    }

    /**
     * Lógica para imprimir-informe.html
     */
    mostrarPantallaImprimirInforme() {
        const targetSheet = document.getElementById('print-preview-area-target');
        if (!targetSheet) return;

        const urlParams = new URLSearchParams(window.location.search);
        const tipo = urlParams.get('tipo');
        const id = urlParams.get('id');

        const parentLink = document.getElementById('breadcrumb-parent');
        const actionBreadcrumb = document.getElementById('breadcrumb-action');
        const printTitle = document.getElementById('print-title');
        
        const sesion = this.controlador.sesionActiva;
        document.getElementById('print-preview-date').textContent = new Date().toLocaleDateString();
        document.getElementById('print-preview-user').textContent = sesion ? sesion.nombre : 'Usuario';

        // Configuración de los Breadcrumbs y del título según el tipo
        if (tipo === 'Estadísticas') {
            parentLink.href = 'estadisticas.html';
            parentLink.textContent = 'Estadísticas';
            actionBreadcrumb.textContent = 'Reporte de Gestión';
            if (printTitle) printTitle.innerHTML = `<i class="bi bi-bar-chart-line-fill text-primary"></i> Reporte de Gestión Financiera y Operativa`;
            
            // Cargar datos del Reporte Estadístico
            try {
                const stats = this.controlador.generarEstadisticas();
                const totalMnt = stats.totales.totalEquipos;
                const totalFacturado = `$${stats.totales.totalFacturado.toFixed(2)}`;
                const totalAbonado = `$${stats.totales.totalAbonado.toFixed(2)}`;
                const totalSaldos = `$${stats.totales.totalSaldos.toFixed(2)}`;
                const promedioIngresos = `$${stats.totales.promedioIngresos.toFixed(2)}`;
                
                const statsHTML = `
                    <div style="font-family: var(--font-primary); color: #333;">
                        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid var(--color-pres-dark); padding-bottom: 10px;">
                            <h3 style="margin: 0; font-weight: bold; color: var(--color-pres-dark);">REPORTE ESTADÍSTICO DE GESTIÓN Y RENDIMIENTO</h3>
                            <h5 style="margin: 5px 0 0 0; color: var(--color-pres-light);">GCM - Consolidado de Mantenimientos</h5>
                        </div>
                        
                        <!-- KPIs en reporte -->
                        <div style="display: flex; justify-content: space-between; margin-bottom: 25px; gap: 10px; text-align: center;">
                            <div style="flex: 1; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 10px;">
                                <span style="font-size: 0.75rem; color: #777; display: block; font-weight: bold; margin-bottom: 2px;">MANTENIMIENTOS</span>
                                <strong style="font-size: 1.25rem; color: var(--color-pres-medium);">${totalMnt}</strong>
                            </div>
                            <div style="flex: 1; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 10px;">
                                <span style="font-size: 0.75rem; color: #777; display: block; font-weight: bold; margin-bottom: 2px;">FACTURACIÓN</span>
                                <strong style="font-size: 1.25rem; color: #2a9d8f;">${totalFacturado}</strong>
                            </div>
                            <div style="flex: 1; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 10px;">
                                <span style="font-size: 0.75rem; color: #777; display: block; font-weight: bold; margin-bottom: 2px;">INGRESOS EN CAJA</span>
                                <strong style="font-size: 1.25rem; color: var(--color-pres-light);">${totalAbonado}</strong>
                            </div>
                            <div style="flex: 1; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 10px;">
                                <span style="font-size: 0.75rem; color: #777; display: block; font-weight: bold; margin-bottom: 2px;">CUENTAS POR COBRAR</span>
                                <strong style="font-size: 1.25rem; color: #d65a31;">${totalSaldos}</strong>
                            </div>
                        </div>
                        
                        <!-- Gráficos -->
                        <div style="margin-bottom: 25px;">
                            <h6 style="color: var(--color-pres-medium); font-weight: bold; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; margin-bottom: 15px;"><i class="bi bi-tag-fill"></i> Equipos e Ingresos por Marca</h6>
                            <div style="height: 180px; width: 100%; position: relative;">
                                <canvas id="print-chart-marcas"></canvas>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                            <div style="width: 40%;">
                                <h6 style="color: var(--color-pres-medium); font-weight: bold; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; margin-bottom: 15px;"><i class="bi bi-pie-chart-fill"></i> Distribución por Estado</h6>
                                <div style="height: 160px; width: 100%; position: relative;">
                                    <canvas id="print-chart-estados"></canvas>
                                </div>
                            </div>
                            <div style="width: 60%;">
                                <h6 style="color: var(--color-pres-medium); font-weight: bold; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; margin-bottom: 15px;"><i class="bi bi-calendar-event"></i> Tendencia de Facturación Mensual</h6>
                                <div style="height: 160px; width: 100%; position: relative;">
                                    <canvas id="print-chart-meses"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.getElementById('print-preview-body-content').innerHTML = statsHTML;
                
                // Dibujar gráficos sobre el lienzo preliminar
                this.renderizarGraficoMarcasSección(stats.porMarca, 'print-chart-marcas');
                this.renderizarGraficoEstadosSección(stats.porEstado, 'print-chart-estados');
                this.renderizarGraficoMesesSección(stats.porMes, 'print-chart-meses');
            } catch (err) {
                document.getElementById('print-preview-body-content').innerHTML = `<div class="alert alert-danger">Error al generar reporte estadístico: ${err.message}</div>`;
            }

        } else {
            parentLink.href = 'mantenimientos.html';
            parentLink.textContent = 'Mantenimientos';
            actionBreadcrumb.textContent = `Ficha Técnica: ${id || ''}`;
            if (printTitle) printTitle.innerHTML = `<i class="bi bi-laptop-fill text-primary"></i> Ficha Técnica de Mantenimiento`;

            // Cargar datos de la Ficha del Cliente
            try {
                const mnt = this.controlador.registrarMantenimiento({ accion: 'buscarPorId', idMantenimiento: id });
                if (!mnt) {
                    alert("Ficha de mantenimiento no encontrada.");
                    window.location.href = 'mantenimientos.html';
                    return;
                }
                
                const cliente = this.controlador.repo.buscarClientePorCedula(mnt.cedulaCliente);
                const tecnicos = this.controlador.repo.obtenerTecnicos();
                const tecnico = tecnicos.find(t => t.correo === mnt.tecnicoAsignado);

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
                    const icon = mnt.daños[key] 
                        ? '<span style="color: #2a9d8f; font-weight: bold;">✓ Funciona</span>' 
                        : '<span style="color: #d65a31; font-weight: bold;">✗ Reporta Daño</span>';
                    
                    fallasHTML += `
                        <div style="width: 48%; margin-bottom: 6px; font-size: 0.85rem; display: flex; justify-content: space-between; border-bottom: 1px dashed #eee; padding-bottom: 4px;">
                            <span style="color: #555;"><strong>${fallasClaves[key]}:</strong></span>
                            <span>${icon}</span>
                        </div>
                    `;
                });

                const contentHTML = `
                    <div style="font-family: var(--font-primary); color: #333; line-height: 1.4;">
                        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid var(--color-pres-dark); padding-bottom: 10px;">
                            <h3 style="margin: 0; font-weight: bold; color: var(--color-pres-dark);">ORDEN DE SERVICIO / FICHA TÉCNICA</h3>
                            <h5 style="margin: 5px 0 0 0; color: var(--color-pres-light);">Código de Ticket: ${mnt.idMantenimiento}</h5>
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <tr>
                                <td style="width: 50%; vertical-align: top; padding-right: 15px; border-right: 1px solid #dee2e6;">
                                    <h5 style="color: var(--color-pres-medium); border-bottom: 1px solid #dee2e6; padding-bottom: 5px; margin-top: 0;"><i class="bi bi-laptop"></i> Datos del Dispositivo</h5>
                                    <p style="margin: 4px 0;"><strong>Equipo:</strong> ${mnt.equipo}</p>
                                    <p style="margin: 4px 0;"><strong>Marca / Modelo:</strong> ${mnt.marca} / ${mnt.modelo}</p>
                                    <p style="margin: 4px 0;"><strong>Tipo:</strong> ${mnt.tipoEquipo}</p>
                                    <p style="margin: 4px 0;"><strong>N° Serie / IMEI:</strong> ${mnt.numeroSerieImei}</p>
                                    <p style="margin: 4px 0;"><strong>Clave / PIN:</strong> <code class="text-dark">${mnt.clavePin}</code></p>
                                    <p style="margin: 4px 0;"><strong>Accesorios:</strong> ${mnt.accesorios || 'Ninguno'}</p>
                                </td>
                                <td style="width: 50%; vertical-align: top; padding-left: 15px;">
                                    <h5 style="color: var(--color-pres-medium); border-bottom: 1px solid #dee2e6; padding-bottom: 5px; margin-top: 0;"><i class="bi bi-person"></i> Datos del Cliente</h5>
                                    <p style="margin: 4px 0;"><strong>Cliente:</strong> ${cliente ? cliente.nombre : 'Desconocido'}</p>
                                    <p style="margin: 4px 0;"><strong>Cédula de Identidad:</strong> ${mnt.cedulaCliente}</p>
                                    <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${cliente ? cliente.telefono : 'N/A'}</p>
                                    <p style="margin: 4px 0;"><strong>Correo Electrónico:</strong> ${cliente ? cliente.correo : 'N/A'}</p>
                                    <p style="margin: 4px 0;"><strong>Técnico Responsable:</strong> ${tecnico ? tecnico.nombre : mnt.tecnicoAsignado}</p>
                                </td>
                            </tr>
                        </table>
                        
                        <h5 style="color: var(--color-pres-medium); border-bottom: 1px solid #dee2e6; padding-bottom: 5px; margin-bottom: 12px;"><i class="bi bi-check2-square"></i> Diagnóstico de Daños Inicial</h5>
                        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 20px;">
                            ${fallasHTML}
                        </div>
                        
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <tr>
                                <td style="width: 55%; vertical-align: top; padding-right: 15px;">
                                    <h5 style="color: var(--color-pres-medium); border-bottom: 1px solid #dee2e6; padding-bottom: 5px; margin-top: 0;"><i class="bi bi-chat-left-text"></i> Diagnóstico y Observaciones</h5>
                                    <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; border-radius: 6px; font-size: 0.85rem; min-height: 100px; color: #555;">
                                        ${mnt.costos.observaciones || 'Sin observaciones registradas en el diagnóstico inicial.'}
                                    </div>
                                </td>
                                <td style="width: 45%; vertical-align: top; padding-left: 15px; background-color: #fcfcfc; border-left: 3px solid var(--color-pres-medium); padding-top: 5px;">
                                    <h5 style="color: var(--color-pres-medium); border-bottom: 1px solid #dee2e6; padding-bottom: 5px; margin-top: 0;"><i class="bi bi-cash-coin"></i> Balance Económico</h5>
                                    <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                                        <span>Total Servicio:</span>
                                        <strong>$${mnt.costos.totalMantenimiento.toFixed(2)}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin: 5px 0; color: #2a9d8f;">
                                        <span>Abonado a Caja:</span>
                                        <strong>$${mnt.costos.abono.toFixed(2)}</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin: 5px 0; color: #d65a31; border-top: 1px solid #dee2e6; padding-top: 6px; font-size: 1.05rem;">
                                        <span>Saldo Pendiente:</span>
                                        <strong>$${mnt.costos.saldo.toFixed(2)}</strong>
                                    </div>
                                    <div style="margin-top: 15px; font-size: 0.82rem; border-top: 1px solid #eee; padding-top: 10px;">
                                        <p style="margin: 2px 0;"><strong>Fecha Registro:</strong> ${mnt.fechaRegistro}</p>
                                        <p style="margin: 2px 0;"><strong>Fecha Estimada Entrega:</strong> ${mnt.costos.fechaEstimadaEntrega || 'No configurada'}</p>
                                        <p style="margin: 2px 0;"><strong>Estado del Mantenimiento:</strong> <span class="badge bg-secondary">${mnt.costos.estado}</span></p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        
                        <div style="margin-top: 60px; display: flex; justify-content: space-around; text-align: center;">
                            <div style="width: 40%;">
                                <div style="border-top: 1px solid #333; margin-top: 30px; padding-top: 5px; font-size: 0.8rem; font-weight: bold; color: #555;">
                                    Firma Técnico Encargado
                                </div>
                            </div>
                            <div style="width: 40%;">
                                <div style="border-top: 1px solid #333; margin-top: 30px; padding-top: 5px; font-size: 0.8rem; font-weight: bold; color: #555;">
                                    Firma de Conformidad Cliente
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.getElementById('print-preview-body-content').innerHTML = contentHTML;
            } catch (err) {
                document.getElementById('print-preview-body-content').innerHTML = `<div class="alert alert-danger">Error al generar ficha técnica: ${err.message}</div>`;
            }
        }

        // Bind interactive events of print settings page
        // Destino selector
        document.getElementById('print-destino').addEventListener('change', () => {
            document.getElementById('print-error-alert').classList.add('d-none');
            document.getElementById('print-success-alert').classList.add('d-none');
        });

        // Páginas radio selections
        document.getElementsByName('print-paginas').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const rangoInput = document.getElementById('print-paginas-rango');
                if (e.target.id === 'paginas-personalizado') {
                    rangoInput.classList.remove('d-none');
                    rangoInput.focus();
                } else {
                    rangoInput.classList.add('d-none');
                }
            });
        });

        // Diseño Portrait / Landscape
        const btnPortrait = document.getElementById('btn-design-portrait');
        const btnLandscape = document.getElementById('btn-design-landscape');

        btnPortrait.addEventListener('click', () => {
            btnPortrait.classList.add('active');
            btnLandscape.classList.remove('active');
            targetSheet.classList.remove('preview-horizontal');
            targetSheet.classList.add('preview-vertical');
        });

        btnLandscape.addEventListener('click', () => {
            btnLandscape.classList.add('active');
            btnPortrait.classList.remove('active');
            targetSheet.classList.remove('preview-vertical');
            targetSheet.classList.add('preview-horizontal');
        });

        // Márgenes dropdown
        document.getElementById('print-margins').addEventListener('change', (e) => {
            const marginVal = e.target.value;
            targetSheet.classList.remove('margin-default', 'margin-minimum', 'margin-none', 'margin-custom');
            targetSheet.classList.add(`margin-${marginVal}`);
        });

        // Escala dropdown
        document.getElementById('print-scale').addEventListener('change', (e) => {
            const scaleVal = e.target.value;
            const scaleWrapper = document.getElementById('print-scale-wrapper');
            scaleWrapper.classList.remove('scale-default', 'scale-75', 'scale-50', 'scale-120');
            scaleWrapper.classList.add(`scale-${scaleVal}`);
        });

        // Opciones checkbox headers y background graphics
        const cbHeaders = document.getElementById('print-opt-headers');
        const headerDiv = document.getElementById('print-preview-header');
        const footerDiv = document.getElementById('print-preview-footer');

        cbHeaders.addEventListener('change', () => {
            if (cbHeaders.checked) {
                headerDiv.classList.remove('d-none');
                footerDiv.classList.remove('d-none');
            } else {
                headerDiv.classList.add('d-none');
                footerDiv.classList.add('d-none');
            }
        });

        // Botón Cancelar redirecciona de vuelta a la página correspondiente
        const btnCancelar = document.getElementById('btn-print-cancelar');
        const btnVolver = document.getElementById('btn-print-volver');
        const returnUrl = tipo === 'Estadísticas' ? 'estadisticas.html' : 'mantenimientos.html';
        
        const goBack = () => {
            window.location.href = returnUrl;
        };
        btnCancelar.addEventListener('click', goBack);
        btnVolver.addEventListener('click', goBack);

        // Botón Guardar / Imprimir
        const btnConfirmar = document.getElementById('btn-print-confirmar-guardar');
        const errAlert = document.getElementById('print-error-alert');
        const succAlert = document.getElementById('print-success-alert');

        btnConfirmar.addEventListener('click', () => {
            const startTime = performance.now();
            const destino = document.getElementById('print-destino').value;
            const isLandscape = btnLandscape.classList.contains('active');
            
            errAlert.classList.add('d-none');
            succAlert.classList.add('d-none');
            
            // Simular carga de procesamiento
            btnConfirmar.disabled = true;
            btnConfirmar.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...`;
            
            setTimeout(() => {
                // EXCEPCIÓN: Impresora No Disponible
                if (destino === 'offline') {
                    btnConfirmar.disabled = false;
                    btnConfirmar.innerHTML = `<i class="bi bi-save"></i> Guardar / Imprimir`;
                    errAlert.textContent = "Impresora no disponible. Verifique la conexión o seleccione otra impresora";
                    errAlert.classList.remove('d-none');
                    return;
                }
                
                // EXCEPCIÓN: Fallo de impresión
                if (destino === 'fail') {
                    btnConfirmar.disabled = false;
                    btnConfirmar.innerHTML = `<i class="bi bi-save"></i> Guardar / Imprimir`;
                    errAlert.textContent = "Error en la impresión. Intente nuevamente o seleccione otra impresora";
                    errAlert.classList.remove('d-none');
                    return;
                }
                
                // SECUENCIA NORMAL: PDF
                if (destino === 'pdf') {
                    const opt = {
                        margin:       10,
                        filename:     `Reporte_${tipo || 'Mantenimiento'}_${new Date().toISOString().slice(0, 10)}.pdf`,
                        image:        { type: 'jpeg', quality: 0.98 },
                        html2canvas:  { scale: 2, useCORS: true },
                        jsPDF:        { unit: 'mm', format: 'a4', orientation: isLandscape ? 'landscape' : 'portrait' }
                    };
                    
                    html2pdf().set(opt).from(targetSheet).save()
                        .then(() => {
                            const endTime = performance.now();
                            const elapsedSec = ((endTime - startTime) / 1000).toFixed(2);
                            
                            btnConfirmar.disabled = false;
                            btnConfirmar.innerHTML = `<i class="bi bi-save"></i> Guardar / Imprimir`;
                            
                            succAlert.textContent = `Reporte exportado con éxito en ${elapsedSec}s.`;
                            succAlert.classList.remove('d-none');
                            
                            // Registrar log de auditoría
                            this.controlador.repo.registrarLog({
                                fecha: new Date().toISOString(),
                                usuario: sesion ? sesion.usuario : 'Anónimo',
                                operacion: 'EXPORTAR_REPORTE_PDF',
                                detalle: `Reporte de ${tipo || 'Mantenimiento'} exportado a PDF correctamente en ${elapsedSec}s.`
                            });
                            this.actualizarConsolaLogs();
                            
                            setTimeout(() => goBack(), 1500);
                        })
                        .catch(err => {
                            btnConfirmar.disabled = false;
                            btnConfirmar.innerHTML = `<i class="bi bi-save"></i> Guardar / Imprimir`;
                            errAlert.textContent = "Error al exportar PDF: " + err.message;
                            errAlert.classList.remove('d-none');
                        });
                }
                
                // SECUENCIA NORMAL: Impresora nativa
                if (destino === 'printer') {
                    btnConfirmar.disabled = false;
                    btnConfirmar.innerHTML = `<i class="bi bi-save"></i> Guardar / Imprimir`;
                    
                    // Disparar diálogo de impresión nativo del navegador
                    window.print();
                    
                    // Registrar log de auditoría
                    this.controlador.repo.registrarLog({
                        fecha: new Date().toISOString(),
                        usuario: sesion ? sesion.usuario : 'Anónimo',
                        operacion: 'IMPRIMIR_REPORTE',
                        detalle: `Reporte de ${tipo || 'Mantenimiento'} enviado a cola de impresión.`
                    });
                    this.actualizarConsolaLogs();
                    
                    setTimeout(() => goBack(), 1000);
                }
            }, 600);
        });
    }

    renderizarGraficoMarcasSección(datosMarca, canvasId) {
        const ctx = document.getElementById(canvasId);
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
                        backgroundColor: '#457b9d',
                        borderRadius: 5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Ingresos ($)',
                        data: revenues,
                        backgroundColor: '#2a9d8f',
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
                maintainAspectRatio: false,
                animation: false, // Desactivar animación para captura instantánea / impresión limpia
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

    renderizarGraficoEstadosSección(datosEstado, canvasId) {
        const ctx = document.getElementById(canvasId);
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
                        '#e2e3e5',
                        '#f4a261',
                        '#a8dadc',
                        '#2a9d8f'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    renderizarGraficoMesesSección(datosMes, canvasId) {
        const ctx = document.getElementById(canvasId);
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
                    borderColor: '#e76f51',
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
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    /**
     * Lógica para registrar-personal.html
     */
    mostrarPantallaRegistrarPersonalPage() {
        const form = document.getElementById('form-registrar-personal-page');
        if (!form) return;

        this.actualizarDatalistEspecialidades();

        const normalizarTexto = (texto) => texto
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase();

        const generarUsuario = () => {
            const pNombre = document.getElementById('pers-primer-nombre').value.trim();
            const sNombre = document.getElementById('pers-segundo-nombre').value.trim();
            const pApellido = document.getElementById('pers-primer-apellido').value.trim();

            if (!pNombre || !pApellido) {
                return '';
            }

            const init1 = normalizarTexto(pNombre).charAt(0);
            const init2 = sNombre ? normalizarTexto(sNombre).charAt(0) : '';
            const apellido = normalizarTexto(pApellido).replace(/\s+/g, '');

            return `${init1}${init2}${apellido}`;
        };

        const generarClave = () => {
            const fechaNac = document.getElementById('pers-fecha-nacimiento').value;
            if (!fechaNac) {
                return '';
            }

            const parts = fechaNac.split('-');
            if (parts.length !== 3) {
                return '';
            }

            const year = parts[0].slice(2);
            const month = parts[1];
            const day = parts[2];
            return `${day}${month}${year}`;
        };

        const sincronizarCredenciales = () => {
            document.getElementById('pers-usuario').value = generarUsuario();
            document.getElementById('pers-clave').value = generarClave();
        };

        // Auto-generation of username and password as user types names and date of birth
        const nameInputs = document.querySelectorAll('.name-input');
        const updateUsername = sincronizarCredenciales;

        nameInputs.forEach(input => {
            input.addEventListener('input', updateUsername);
        });

        const dobInput = document.getElementById('pers-fecha-nacimiento');
        dobInput.addEventListener('change', sincronizarCredenciales);

        // Hide/Show specialty according to role
        document.getElementById('pers-rol').addEventListener('change', (e) => {
            const especialidadGroup = document.getElementById('group-pers-especialidad');
            const especialidadInput = document.getElementById('pers-especialidad');
            if (e.target.value === 'Administrador') {
                especialidadGroup.classList.add('d-none');
                especialidadInput.required = false;
            } else {
                especialidadGroup.classList.remove('d-none');
                especialidadInput.required = true;
            }
        });

        // Submit form
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('reg-pers-error');
            const exitoDiv = document.getElementById('reg-pers-exito');
            errorDiv.classList.add('d-none');
            exitoDiv.classList.add('d-none');

            const rol = document.getElementById('pers-rol').value;
            const pNombre = document.getElementById('pers-primer-nombre').value.trim();
            const sNombre = document.getElementById('pers-segundo-nombre').value.trim();
            const pApellido = document.getElementById('pers-primer-apellido').value.trim();
            const sApellido = document.getElementById('pers-segundo-apellido').value.trim();
            
            // Full name format
            const nombre = `${pNombre} ${sNombre} ${pApellido} ${sApellido}`.replace(/\s+/g, ' ').trim();
            const correo = document.getElementById('pers-correo').value.trim();
            const telefono = document.getElementById('pers-telefono').value.trim();
            const especialidad = document.getElementById('pers-especialidad').value.trim();
            sincronizarCredenciales();
            const usuario = document.getElementById('pers-usuario').value.trim();
            const clave = document.getElementById('pers-clave').value;

            if (!usuario || !clave) {
                errorDiv.textContent = 'Complete nombre, apellido y fecha de nacimiento para generar usuario y contraseña.';
                errorDiv.classList.remove('d-none');
                return;
            }

            try {
                // Register user via database repo adapter
                const resultadoRegistro = this.controlador.repo.registrarClientePublico({
                    nombre,
                    usuario,
                    password: clave,
                    rol,
                    correo,
                    telefono,
                    especialidad: rol === 'Técnico' ? especialidad : undefined
                });

                if (resultadoRegistro && resultadoRegistro.correoEnviado === false) {
                    errorDiv.textContent = resultadoRegistro.correoError
                        ? `El usuario fue registrado, pero no se pudo enviar el correo: ${resultadoRegistro.correoError}`
                        : 'El usuario fue registrado, pero no se pudo enviar el correo con las credenciales.';
                    errorDiv.classList.remove('d-none');
                    return;
                }

                // Register security audit log locally
                this.controlador.repo.registrarLog({
                    fecha: new Date().toISOString(),
                    usuario: this.controlador.sesionActiva.usuario,
                    operacion: 'REGISTRO_PERSONAL_EXITOSO',
                    detalle: `Administrador registró nuevo ${rol}: ${nombre} (${usuario})`
                });

                exitoDiv.classList.remove('d-none');
                setTimeout(() => {
                    window.location.href = 'tecnicos.html';
                }, 2500);

            } catch (err) {
                errorDiv.textContent = 'Error al registrar: ' + err.message;
                errorDiv.classList.remove('d-none');
            }
        });
    }

    /**
     * Lógica para cambiar-contrasena.html
     */
    mostrarPantallaCambiarContrasena() {
        const form = document.getElementById('change-password-form');
        if (!form) return;

        const sesion = this.controlador.sesionActiva;
        if (!sesion) {
            window.location.href = 'login.html';
            return;
        }

        // Pre-llenar el usuario
        document.getElementById('txt-usuario-change').value = sesion.usuario;

        // Configurar toggles de visibilidad
        const setupToggle = (btnId, inputId, iconId) => {
            const btn = document.getElementById(btnId);
            const input = document.getElementById(inputId);
            const icon = document.getElementById(iconId);
            if (btn && input && icon) {
                btn.addEventListener('click', () => {
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.classList.remove('bi-eye');
                        icon.classList.add('bi-eye-slash');
                    } else {
                        input.type = 'password';
                        icon.classList.remove('bi-eye-slash');
                        icon.classList.add('bi-eye');
                    }
                });
            }
        };

        setupToggle('btn-toggle-actual', 'txt-clave-actual', 'toggle-actual-icon');
        setupToggle('btn-toggle-nueva', 'txt-nueva-clave', 'toggle-nueva-icon');
        setupToggle('btn-toggle-confirmar', 'txt-confirmar-nueva', 'toggle-confirmar-icon');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const feedback = document.getElementById('change-feedback');
            const exito = document.getElementById('change-exito');
            feedback.classList.add('d-none');
            exito.classList.add('d-none');

            const oldPassword = document.getElementById('txt-clave-actual').value;
            const newPassword = document.getElementById('txt-nueva-clave').value;
            const confirmPassword = document.getElementById('txt-confirmar-nueva').value;

            if (newPassword.length < 6) {
                feedback.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
                feedback.classList.remove('d-none');
                return;
            }

            if (newPassword !== confirmPassword) {
                feedback.textContent = 'La nueva contraseña y su confirmación no coinciden.';
                feedback.classList.remove('d-none');
                return;
            }

            if (oldPassword === newPassword) {
                feedback.textContent = 'La nueva contraseña debe ser diferente a la contraseña temporal.';
                feedback.classList.remove('d-none');
                return;
            }

            try {
                // Llamar al endpoint del backend para cambiar contraseña
                this.controlador.repo.apiRequest('POST', '/auth/change-password', {
                    usuario: sesion.usuario,
                    oldPassword,
                    newPassword
                });

                // Si tiene éxito, actualizar la sesión en localStorage
                sesion.debeCambiarPw = false;
                localStorage.setItem('sesionActiva', JSON.stringify(sesion));

                exito.classList.remove('d-none');
                setTimeout(() => {
                    this.redirigirUsuarioSegunRol();
                }, 2000);

            } catch (err) {
                feedback.textContent = 'Error al actualizar contraseña: ' + err.message;
                feedback.classList.remove('d-none');
            }
        });
    }
}

// Inicializar la interfaz una vez cargado el DOM
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UI_SistemaMantenimiento();
});
