package com.crud.estudiante.negocio.adapter;

import com.crud.estudiante.datos.Estudiante;
import java.util.List;

/**
 * Patrón: Target (Interfaz objetivo del patrón Adapter).
 * Define el contrato que espera nuestra capa de negocio para leer datos de estudiantes.
 */
public interface ILectorDatos {
    List<Estudiante> obtenerEstudiantes();
}
