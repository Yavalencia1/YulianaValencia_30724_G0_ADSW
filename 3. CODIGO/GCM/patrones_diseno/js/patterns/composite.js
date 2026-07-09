/**
 * Capa de Datos/Patrones: Patrón COMPOSITE
 * Permite estructurar mantenimientos individuales y grupos de mantenimientos
 * para tratarlos de manera uniforme.
 */

/**
 * Interfaz IComponenteMantenimiento (Simulada en JS)
 * Métodos obligatorios:
 * - obtenerCostoTotal()
 * - obtenerCantidadEquipos()
 */
class IComponenteMantenimiento {
    constructor() {
        if (this.constructor === IComponenteMantenimiento) {
            throw new TypeError("No se puede instanciar directamente una interfaz.");
        }
    }

    obtenerCostoTotal() {
        throw new Error("Método 'obtenerCostoTotal()' debe ser implementado.");
    }

    obtenerCantidadEquipos() {
        throw new Error("Método 'obtenerCantidadEquipos()' debe ser implementado.");
    }
}

/**
 * Clase Hoja (Leaf): Mantenimiento
 * Representa un mantenimiento técnico individual.
 */
class Mantenimiento extends IComponenteMantenimiento {
    constructor(datos) {
        super();
        this.idMantenimiento = datos.idMantenimiento;
        this.fechaRegistro = datos.fechaRegistro || new Date().toISOString().split('T')[0];
        
        // Datos del equipo
        this.equipo = datos.equipo;
        this.modelo = datos.modelo;
        this.marca = datos.marca;
        this.clavePin = datos.clavePin;
        this.numeroSerieImei = datos.numeroSerieImei;
        this.accesorios = datos.accesorios || '';
        this.tipoEquipo = datos.tipoEquipo; // Celular, Tablet, Laptop, etc.
        
        // Datos adicionales
        this.cedulaCliente = datos.cedulaCliente;
        this.tecnicoAsignado = datos.tecnicoAsignado;

        // Daños (check list de fallas)
        this.daños = {
            enciende: datos.daños?.enciende ?? false,
            botones: datos.daños?.botones ?? false,
            camara: datos.daños?.camara ?? false,
            sensores: datos.daños?.sensores ?? false,
            touchId: datos.daños?.touchId ?? false,
            wifi: datos.daños?.wifi ?? false,
            senal: datos.daños?.senal ?? false,
            sonido: datos.daños?.sonido ?? false,
            carga: datos.daños?.carga ?? false
        };

        // Costos e información de entrega
        this.costos = {
            observaciones: datos.costos?.observaciones || '',
            totalMantenimiento: parseFloat(datos.costos?.totalMantenimiento || 0),
            abono: parseFloat(datos.costos?.abono || 0),
            saldo: parseFloat(datos.costos?.saldo || 0),
            fechaEstimadaEntrega: datos.costos?.fechaEstimadaEntrega || '',
            estado: datos.costos?.estado || 'Recibido' // Recibido, En Reparación, Listo para Entrega, Entregado
        };
        
        // Calcular saldo automáticamente si se omitió
        this.costos.saldo = this.costos.totalMantenimiento - this.costos.abono;
    }

    /**
     * Retorna el costo total de este mantenimiento individual.
     */
    obtenerCostoTotal() {
        return this.costos.totalMantenimiento;
    }

    /**
     * Retorna la cantidad de equipos en este nodo (siempre 1 para una hoja).
     */
    obtenerCantidadEquipos() {
        return 1;
    }
}

/**
 * Clase Compuesta (Composite): GrupoMantenimientos
 * Agrupa varios objetos IComponenteMantenimiento bajo un criterio de agrupación.
 */
class GrupoMantenimientos extends IComponenteMantenimiento {
    constructor(criterioAgrupacion = 'General') {
        super();
        this.mantenimientos = []; // Contiene instancias de IComponenteMantenimiento (Mantenimiento o GrupoMantenimientos)
        this.criterioAgrupacion = criterioAgrupacion;
    }

    /**
     * Agrega un componente al grupo (hoja o compuesto).
     */
    agregar(componente) {
        if (componente instanceof IComponenteMantenimiento) {
            this.mantenimientos.push(componente);
        } else {
            throw new TypeError("El componente debe ser una instancia de IComponenteMantenimiento.");
        }
    }

    /**
     * Remueve un componente del grupo.
     */
    remover(componente) {
        const index = this.mantenimientos.indexOf(componente);
        if (index >= 0) {
            this.mantenimientos.splice(index, 1);
        }
    }

    /**
     * Obtiene el costo total sumando de forma recursiva los costos de todos sus componentes.
     */
    obtenerCostoTotal() {
        return this.mantenimientos.reduce((total, componente) => {
            return total + componente.obtenerCostoTotal();
        }, 0);
    }

    /**
     * Obtiene la cantidad total de equipos sumando de forma recursiva todos sus componentes.
     */
    obtenerCantidadEquipos() {
        return this.mantenimientos.reduce((cantidad, componente) => {
            return cantidad + componente.obtenerCantidadEquipos();
        }, 0);
    }
    
}

if (typeof module !== "undefined") {

    module.exports = {

        Mantenimiento,

        GrupoMantenimientos,

        IComponenteMantenimiento

    };

}
