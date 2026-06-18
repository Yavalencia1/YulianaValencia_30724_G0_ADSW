# Patrones de Diseño - Explicación para Exposición
## Proyecto GCM (Gestor y Control de Mantenimientos)

---

## 📖 ANTES DE EMPEZAR

Los **patrones de diseño** son **soluciones reutilizables** a problemas comunes en programación. 

Nuestro proyecto GCM usa **3 patrones**. Vamos a explicar cada uno de forma muy sencilla.

---

# 🔗 PATRÓN 1: BRIDGE (Puente)

## 1️⃣ ¿EN QUÉ SE BASA?

### El Problema Común (Sin Bridge)
Imagina que necesitas enviar notificaciones a clientes. Podrías hacer esto:

```
Si notificar por WhatsApp:
  - Abre conexión WhatsApp
  - Envía mensaje
  - Cierra conexión

Si notificar por Correo:
  - Abre conexión de correo
  - Envía email
  - Cierra conexión
```

**Problema:** Si necesitas agregar SMS, debes cambiar TODO el código. Las notificaciones y los canales están **mezclados**.

### La Solución: BRIDGE
El patrón Bridge **separa dos cosas que están acopladas:**
- **Qué enviar** (la notificación)
- **Cómo enviarlo** (el canal: WhatsApp, Correo, SMS)

```
┌─────────────────────┐
│  Notificaciones     │  (Abstracción)
│ - notificar()       │
└──────────┬──────────┘
           │ usa
           ↓
┌─────────────────────────────────────────────┐
│  Canales de Comunicación (Implementaciones)  │
├─────────────────────────────────────────────┤
│ • WhatsApp                                   │
│ • Correo Electrónico                         │
│ • SMS (fácil de agregar)                     │
└─────────────────────────────────────────────┘
```

**Ventaja:** Puedes cambiar el canal sin tocar la lógica de notificaciones.

---

## 2️⃣ ¿CÓMO SE IMPLEMENTÓ EN GCM?

### Archivo: `js/patterns/bridge.js`

#### Paso 1: Definir la Interfaz (El Contrato)
```javascript
class IProveedorComunicaciones {
    enviarMensaje(destino, mensaje) {
        throw new Error("Debe implementarse");
    }
}
```
**Explicación:** Dice "Cualquier canal DEBE tener un método `enviarMensaje`"

#### Paso 2: Crear Implementaciones Concretas (Los Canales)

**Canal 1: WhatsApp**
```javascript
class ProveedorWhatsApp extends IProveedorComunicaciones {
    enviarMensaje(destino, mensaje) {
        console.log(`Enviando WhatsApp a ${destino}: "${mensaje}"`);
        // Aquí va la lógica de WhatsApp
        return { exito: true, canal: 'WhatsApp' };
    }
}
```

**Canal 2: Correo**
```javascript
class ProveedorCorreo extends IProveedorComunicaciones {
    enviarMensaje(destino, mensaje) {
        console.log(`Enviando Email a ${destino}: "${mensaje}"`);
        // Aquí va la lógica de correo
        return { exito: true, canal: 'Correo' };
    }
}
```

#### Paso 3: Crear el PUENTE (La Abstracción)
```javascript
class GestorNotificaciones {
    constructor(proveedor = null) {
        // Por defecto usa WhatsApp
        this.proveedor = proveedor || new ProveedorWhatsApp();
    }

    // ⭐ CAMBIAR EL CANAL EN TIEMPO DE EJECUCIÓN
    setProveedor(proveedor) {
        this.proveedor = proveedor;
    }

    // ⭐ ENVIAR NOTIFICACIÓN (Sin importar el canal)
    notificarCliente(cliente, mensaje) {
        let destino = '';
        
        // Elegir destino según el canal
        if (this.proveedor instanceof ProveedorWhatsApp) {
            destino = cliente.telefono;
        } else if (this.proveedor instanceof ProveedorCorreo) {
            destino = cliente.correo;
        }
        
        // Usar el canal actual para enviar
        return this.proveedor.enviarMensaje(destino, mensaje);
    }
}
```

#### Paso 4: Usar el Puente
```javascript
const gestor = new GestorNotificaciones();

// Notificar por WhatsApp (por defecto)
gestor.notificarCliente(cliente, "Tu equipo está listo");

// Cambiar a Correo
gestor.setProveedor(new ProveedorCorreo());
gestor.notificarCliente(cliente, "Tu equipo está listo");

// Agregar SMS es fácil sin tocar nada más:
class ProveedorSMS extends IProveedorComunicaciones { ... }
gestor.setProveedor(new ProveedorSMS());
```

### ¿DÓNDE SE USA EN GCM?

En `controlador.js`:
```javascript
class ControladorReal {
    constructor() {
        this.gestorNotificaciones = new GestorNotificaciones(); // ← Bridge
    }

    registrarMantenimiento(datos) {
        // ... registra el mantenimiento ...
        
        // Notificar al técnico por WhatsApp
        this.gestorNotificaciones.notificarCliente(tecnico, "Nuevo equipo asignado");
        
        // Notificar al cliente por Correo
        this.gestorNotificaciones.setProveedor(new ProveedorCorreo());
        this.gestorNotificaciones.notificarCliente(cliente, "Tu equipo recibido");
    }
}
```

---

---

# 🌳 PATRÓN 2: COMPOSITE (Composición)

## 1️⃣ ¿EN QUÉ SE BASA?

### El Problema Común (Sin Composite)
Tienes dos tipos de cosas en tu sistema:
- **Mantenimientos individuales** (un iPhone dañado)
- **Grupos de mantenimientos** (los 5 iPhones de un cliente)

¿Cómo calcular el costo total?
- Si es individual: retorna el costo directo
- Si es grupo: suma todos los costos (bucle)

```javascript
// Código de diferente para cada caso
if (es_individual) {
    costo = mantenimiento.costo;
} else if (es_grupo) {
    costo = 0;
    for (let m of grupo.mantenimientos) {
        costo += m.costo;
    }
}
```

**Problema:** Código duplicado, difícil de mantener.

### La Solución: COMPOSITE
El patrón Composite permite **tratar individuales y grupos de forma idéntica**.

```
┌──────────────────────────────┐
│  IComponenteMantenimiento     │ (Interfaz)
│  - obtenerCostoTotal()        │
│  - obtenerCantidadEquipos()   │
└──────────────────────────────┘
          ↑
    ┌─────┴─────┐
    │           │
┌───────┐  ┌──────────────────┐
│ Hoja  │  │  Composición     │
│       │  │                  │
│Mante- │  │ GrupoManteni-    │
│nimiento  │ mientos          │
│       │  │ (contiene muchos)│
└───────┘  └──────────────────┘
```

**Ventaja:** El mismo código funciona para uno o cientos.

---

## 2️⃣ ¿CÓMO SE IMPLEMENTÓ EN GCM?

### Archivo: `js/patterns/composite.js`

#### Paso 1: Definir la Interfaz Común
```javascript
class IComponenteMantenimiento {
    obtenerCostoTotal() {
        throw new Error("Debe implementarse");
    }

    obtenerCantidadEquipos() {
        throw new Error("Debe implementarse");
    }
}
```

#### Paso 2: Crear la HOJA (Mantenimiento Individual)
```javascript
class Mantenimiento extends IComponenteMantenimiento {
    constructor(datos) {
        super();
        this.idMantenimiento = datos.idMantenimiento;
        this.equipo = datos.equipo; // "iPhone 13"
        this.costos = {
            totalMantenimiento: 150.00,
            abono: 50.00
        };
    }

    // ⭐ Un mantenimiento tiene su propio costo
    obtenerCostoTotal() {
        return this.costos.totalMantenimiento; // 150
    }

    // ⭐ Un mantenimiento = 1 equipo
    obtenerCantidadEquipos() {
        return 1;
    }
}
```

#### Paso 3: Crear la COMPOSICIÓN (Grupo de Mantenimientos)
```javascript
class GrupoMantenimientos extends IComponenteMantenimiento {
    constructor(criterioAgrupacion) {
        super();
        this.criterioAgrupacion = criterioAgrupacion; // "Por Cliente"
        this.componentes = []; // Array que guarda Mantenimientos u otros Grupos
    }

    // ⭐ Agregar un componente (puede ser Hoja o Grupo)
    agregarComponente(componente) {
        if (componente instanceof IComponenteMantenimiento) {
            this.componentes.push(componente);
        }
    }

    // ⭐ MAGIA: Suma de TODOS los costos (recursivo)
    obtenerCostoTotal() {
        let total = 0;
        for (let componente of this.componentes) {
            total += componente.obtenerCostoTotal(); // Llama al método del componente
        }
        return total;
    }

    // ⭐ MAGIA: Suma de TODOS los equipos (recursivo)
    obtenerCantidadEquipos() {
        let cantidad = 0;
        for (let componente of this.componentes) {
            cantidad += componente.obtenerCantidadEquipos();
        }
        return cantidad;
    }
}
```

#### Paso 4: Usar la Composición
```javascript
// Crear mantenimientos individuales
const m1 = new Mantenimiento({ 
    idMantenimiento: 'MNT-001', 
    equipo: 'iPhone', 
    costos: { totalMantenimiento: 150 }
});

const m2 = new Mantenimiento({ 
    idMantenimiento: 'MNT-002', 
    equipo: 'iPad', 
    costos: { totalMantenimiento: 220 }
});

// Crear grupo del cliente "Juan"
const grupoJuan = new GrupoMantenimientos("Cliente: Juan Pérez");
grupoJuan.agregarComponente(m1);  // iPhone
grupoJuan.agregarComponente(m2);  // iPad

// ⭐ MISMO CÓDIGO para 1 o 1000 mantenimientos
console.log(grupoJuan.obtenerCostoTotal());    // 370 (150 + 220)
console.log(grupoJuan.obtenerCantidadEquipos()); // 2
```

#### Paso 5: Composición Anidada (Lo Poderoso)
```javascript
// Grupo de clientes del Técnico "Carlos"
const grupoTecnicoCarlos = new GrupoMantenimientos("Técnico: Carlos");
grupoTecnicoCarlos.agregarComponente(grupoJuan);      // Grupo de Juan
grupoTecnicoCarlos.agregarComponente(grupoMaría);     // Grupo de María
grupoTecnicoCarlos.agregarComponente(grupoSofía);     // Grupo de Sofía

// ⭐ Calcula TODOS los costos sin bucles adicionales
console.log(grupoTecnicoCarlos.obtenerCostoTotal());
// Suma: Juan(370) + María(X) + Sofía(Y) = Total
```

### ¿DÓNDE SE USA EN GCM?

En `repositorio.js` se obtienen los datos:
```javascript
class RepositorioBaseDatos {
    obtenerMantenimientosPorCliente(cedulaCliente) {
        // Obtener del LocalStorage
        const datos = JSON.parse(localStorage.getItem('mantenimientos'));
        const mtos = datos.filter(m => m.cedulaCliente === cedulaCliente);
        
        // Crear estructura COMPOSITE
        const grupo = new GrupoMantenimientos(`Cliente: ${cedulaCliente}`);
        for (let dato of mtos) {
            grupo.agregarComponente(new Mantenimiento(dato));
        }
        
        return grupo; // Devolver el grupo, no los individuales
    }
}
```

En `estadisticas.html` se usa sin complejidad:
```javascript
// Obtener el grupo (no importa si tiene 1 o 100 mantenimientos)
const grupoClientes = new GrupoMantenimientos("Todos los Clientes");
for (let cliente of clientes) {
    grupoClientes.agregarComponente(
        repo.obtenerMantenimientosPorCliente(cliente.cedula)
    );
}

// ⭐ Calcular total sin bucles complicados
const costoTotal = grupoClientes.obtenerCostoTotal();
const equiposTotales = grupoClientes.obtenerCantidadEquipos();
```

---

---

# 🛡️ PATRÓN 3: PROXY (Representante)

## 1️⃣ ¿EN QUÉ SE BASA?

### El Problema Común (Sin Proxy)
Imagina un sistema donde **cualquiera puede acceder a cualquier cosa**:

```javascript
const controlador = new ControladorReal();

// ¿Sin validación?
controlador.gestionarCRUDCliente(datos);      // Cualquiera lo puede hacer
controlador.generarEstadisticas();             // Cualquiera ve los reportes
controlador.eliminarMantenimiento(id);         // ¡Cualquiera elimina!
```

**Problema:** 
- No hay control de acceso
- ¿Cómo saber quién hizo qué?
- Cliente puede ver datos de otros clientes

### La Solución: PROXY
El patrón Proxy es un "intermediario" o "representante" que:
1. **Valida** antes de hacer algo
2. **Controla acceso** según roles
3. **Registra** quién hizo qué

```
┌─────────────────────┐
│   UI / Usuario      │
└──────────┬──────────┘
           │ accede
           ↓
┌──────────────────────────────────┐
│  ProxyControlador                │  ← Guardaespaldas
│  1. ¿Tienes sesión?              │
│  2. ¿Tu rol tiene permiso?        │
│  3. ¿El contexto es válido?       │
│  4. Registrar en logs             │
└──────────┬───────────────────────┘
           │ delega (si todo OK)
           ↓
┌──────────────────────────────────┐
│  ControladorReal                 │  ← El verdadero
│  - Lógica de negocio             │
│  - Sin preocuparse por seguridad  │
└──────────────────────────────────┘
```

**Ventaja:** Toda la seguridad en UN lugar.

---

## 2️⃣ ¿CÓMO SE IMPLEMENTÓ EN GCM?

### Archivo: `js/patterns/proxy.js`

#### Paso 1: Definir la Interfaz (El Contrato)
```javascript
class IControladorPrincipal {
    gestionarCRUDCliente(datos) { throw new Error("..."); }
    gestionarCRUDTecnico(datos) { throw new Error("..."); }
    registrarMantenimiento(datos) { throw new Error("..."); }
    generarEstadisticas(periodo, filtro) { throw new Error("..."); }
}
```

#### Paso 2: El Controlador Real (Sin Seguridad)
```javascript
class ControladorReal extends IControladorPrincipal {
    constructor() {
        this.repo = new RepositorioBaseDatos();
    }

    gestionarCRUDCliente(datos) {
        // Lógica pura: crea/edita/elimina clientes
        // SIN VALIDAR PERMISOS
        return this.repo.guardarCliente(datos.cliente);
    }

    registrarMantenimiento(datos) {
        // Lógica pura: registra equipos dañados
        // SIN VALIDAR PERMISOS
        return this.repo.guardarMantenimiento(datos);
    }
}
```

#### Paso 3: El PROXY (Con Control de Acceso)
```javascript
class ProxyControlador extends IControladorPrincipal {
    constructor() {
        super();
        // Crear el verdadero controlador (lo encapsulamos)
        this.controladorReal = new ControladorReal();
        
        // Cargar sesión actual
        this.sesionActiva = JSON.parse(localStorage.getItem('sesionActiva'));
        
        // Para registrar intentos
        this.repo = new RepositorioBaseDatos();
    }

    // ⭐ VALIDAR PERMISOS (La magia del Proxy)
    verificarPermisos(operacion, contexto = {}) {
        // Login siempre permitido
        if (operacion === 'LOGIN') return true;

        // ¿Existe sesión?
        if (!this.sesionActiva) {
            throw new Error("Debes iniciar sesión");
        }

        const rol = this.sesionActiva.rol;

        // ¿Es ADMINISTRADOR? → Acceso total
        if (rol === 'Administrador') {
            return true;
        }

        // ¿Es TÉCNICO? → Acceso limitado
        if (rol === 'Técnico') {
            const permitidas = [
                'CRUD_CLIENTE_LEER',
                'MANTENIMIENTO_REGISTRAR',
                'MANTENIMIENTO_EDITAR'
            ];
            if (permitidas.includes(operacion)) {
                return true;
            }
        }

        // ¿Es CLIENTE? → Ultra-limitado
        if (rol === 'Cliente') {
            // Solo ver SUS mantenimientos
            if (operacion === 'MANTENIMIENTO_CLIENTE_LEER') {
                // ¿La cédula es la suya?
                if (contexto.cedula === this.sesionActiva.cedula) {
                    return true;
                } else {
                    // Intento de acceso a datos de otro
                    this.repo.guardarLog(
                        this.sesionActiva.usuario,
                        'VIOLACION_SEGURIDAD',
                        `Intentó ver cédula: ${contexto.cedula}`
                    );
                    throw new Error("No puedes ver datos de otro cliente");
                }
            }
        }

        // Si llegó aquí: NO tiene permisos
        throw new Error(`Rol '${rol}' no tiene permiso para '${operacion}'`);
    }

    // ⭐ MÉTODOS DEL PROXY (Valida, luego delega)
    gestionarCRUDCliente(datos) {
        // 1. Validar
        this.verificarPermisos('CRUD_CLIENTE_EDITAR');
        
        // 2. Si OK, delegar al real
        return this.controladorReal.gestionarCRUDCliente(datos);
    }

    registrarMantenimiento(datos) {
        // 1. Validar
        this.verificarPermisos('MANTENIMIENTO_REGISTRAR');
        
        // 2. Si OK, delegar al real
        return this.controladorReal.registrarMantenimiento(datos);
    }

    generarEstadisticas(periodo, filtro) {
        // 1. Validar (solo Admin)
        this.verificarPermisos('ESTADISTICAS_VER');
        
        // 2. Si OK, delegar al real
        return this.controladorReal.generarEstadisticas(periodo, filtro);
    }
}
```

#### Paso 4: Usar el Proxy
```javascript
// Crear el proxy (no el controlador real directo)
const controlador = new ProxyControlador();

try {
    // Intenta registrar mantenimiento
    const resultado = controlador.registrarMantenimiento({
        equipo: 'iPhone',
        cliente: '1712345678'
    });
    
    console.log("✓ Mantenimiento registrado");
} catch (error) {
    console.log("✗ " + error.message);
    // Si falla: sin sesión, sin permisos, etc.
}
```

### ¿DÓNDE SE USA EN GCM?

En `index.html` (Punto de entrada):
```html
<script src="js/data/repositorio.js"></script>
<script src="js/patterns/composite.js"></script>
<script src="js/patterns/bridge.js"></script>
<script src="js/business/controlador.js"></script>
<script src="js/patterns/proxy.js"></script>        <!-- ← El Proxy va DESPUÉS
<script src="js/presentation/ui.js"></script>
```

En `ui.js` (Interfaz de Usuario):
```javascript
class UI_SistemaMantenimiento {
    constructor() {
        // Usar el PROXY, no el controlador real
        this.controlador = new ProxyControlador();
    }

    mostrarPantallaClientes() {
        try {
            // El proxy valida automáticamente
            const clientes = this.controlador.gestionarCRUDCliente({
                accion: 'listar'
            });
            this.renderizarTabla(clientes);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    mostrarMisEquipos() {
        try {
            // El proxy verifica que sea su cédula
            const equipos = this.controlador.registrarMantenimiento({
                cedula: this.controlador.sesionActiva.cedula
            });
            this.renderizarTabla(equipos);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
}
```

---

---

# 📊 RESUMEN COMPARATIVO

| Aspecto | BRIDGE | COMPOSITE | PROXY |
|---------|--------|-----------|-------|
| **Problema que resuelve** | Mezcla de abstracción e implementación | Código duplicado para individuales y grupos | Falta de control de acceso |
| **Solución** | Separar en interfaz + implementaciones | Interfaz común para hoja y composición | Intermediario que valida |
| **Ubicación en GCM** | `bridge.js` (notificaciones) | `composite.js` (mantenimientos) | `proxy.js` (seguridad) |
| **Cuando se usa** | Al enviar notificaciones | Al agrupar mantenimientos | Al acceder a cualquier función |
| **Ventaja principal** | Agregar canales sin cambiar código | Calcular totales sin bucles | Control centralizado de acceso |
| **Analógico real** | Enchufe universal (voltaje + tipo) | Cajas rusas (pequeña dentro de grande) | Guardaespaldas (valida acceso) |

---

# 🎯 PUNTOS CLAVE PARA LA EXPOSICIÓN

## Bridge
✅ "Desacoplamos **QUÉ** enviar del **CÓMO** enviarlo"  
✅ Agregar nuevos canales es agregar una nueva clase  
✅ No modificamos el código existente  

## Composite
✅ "Mismo código para 1 equipo o 1000"  
✅ Cálculos recursivos automáticos  
✅ Estructuras jerárquicas sin límite  

## Proxy
✅ "Un guardaespaldas para todas las operaciones"  
✅ Valida, controla, registra  
✅ Seguridad centralizada  

---

**¡Listo para tu exposición!** 🎤
