package com.crud.estudiante.negocio.servicio;

import com.crud.estudiante.datos.Estudiante;
import java.util.List;

/**
 * Patrón: Component (Interfaz Componente del patrón Decorator).
 * Define las operaciones básicas de negocio de la entidad Estudiante.
 */
public interface IServicioEstudiante {
    void guardar(Estudiante estudiante);
    void actualizar(Estudiante estudiante);
    void eliminar(int id);
    List<Estudiante> listarTodos();
}
