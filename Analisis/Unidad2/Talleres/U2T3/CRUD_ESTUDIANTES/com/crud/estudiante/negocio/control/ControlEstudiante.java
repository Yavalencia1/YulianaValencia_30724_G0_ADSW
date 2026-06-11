package com.crud.estudiante.negocio.control;

import com.crud.estudiante.datos.Estudiante;
import com.crud.estudiante.negocio.adapter.ILectorDatos;
import com.crud.estudiante.negocio.servicio.IServicioEstudiante;
import com.crud.estudiante.negocio.strategy.IEstrategiaOrdenamiento;
import com.crud.estudiante.negocio.strategy.IEstrategiaBusqueda;
import java.util.List;

/**
 * Patrón: Ninguno (Forma parte de la arquitectura en capas - Capa de Negocio / Controlador).
 * Actúa como punto de entrada de la presentación para interactuar con las reglas de negocio,
 * administrando las estrategias de ordenamiento y búsqueda, y el adaptador de datos externos.
 */
public class ControlEstudiante {
    private final IServicioEstudiante servicioEstudiante;
    private final ILectorDatos lectorDatos;
    private IEstrategiaOrdenamiento estrategiaOrdenamiento;
    private IEstrategiaBusqueda estrategiaBusqueda;

    public ControlEstudiante(IServicioEstudiante servicioEstudiante, ILectorDatos lectorDatos) {
        this.servicioEstudiante = servicioEstudiante;
        this.lectorDatos = lectorDatos;
    }

    public void setEstrategiaOrden(IEstrategiaOrdenamiento estrategiaOrdenamiento) {
        this.estrategiaOrdenamiento = estrategiaOrdenamiento;
    }

    public void setEstrategiaBusqueda(IEstrategiaBusqueda estrategiaBusqueda) {
        this.estrategiaBusqueda = estrategiaBusqueda;
    }

    public void agregarEstudiante(int id, String nombre, int edad) {
        Estudiante estudiante = new Estudiante(id, nombre, edad);
        servicioEstudiante.guardar(estudiante);
    }

    public void actualizarEstudiante(int id, String nombre, int edad) {
        Estudiante estudiante = new Estudiante(id, nombre, edad);
        servicioEstudiante.actualizar(estudiante);
    }

    public void eliminarEstudiante(int id) {
        servicioEstudiante.eliminar(id);
    }

    public List<Estudiante> mostrarEstudiantes() {
        return servicioEstudiante.listarTodos();
    }

    public List<Estudiante> mostrarOrdenados() {
        if (estrategiaOrdenamiento == null) {
            throw new IllegalStateException("Debe establecer una estrategia de ordenamiento antes de ordenar.");
        }
        return estrategiaOrdenamiento.ordenar(servicioEstudiante.listarTodos());
    }

    public List<Estudiante> buscarEstudiantes(String criterio) {
        if (estrategiaBusqueda == null) {
            throw new IllegalStateException("Debe establecer una estrategia de búsqueda antes de buscar.");
        }
        return estrategiaBusqueda.buscar(servicioEstudiante.listarTodos(), criterio);
    }

    public void cargarDatosExternos() {
        List<Estudiante> estudiantesExternos = lectorDatos.obtenerEstudiantes();
        for (Estudiante est : estudiantesExternos) {
            servicioEstudiante.guardar(est);
        }
    }
}
