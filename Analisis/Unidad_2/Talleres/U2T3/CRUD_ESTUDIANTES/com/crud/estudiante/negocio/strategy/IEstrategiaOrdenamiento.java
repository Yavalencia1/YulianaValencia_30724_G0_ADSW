package com.crud.estudiante.negocio.strategy;

import com.crud.estudiante.datos.Estudiante;
import java.util.List;

/**
 * Patrón: Strategy (Interfaz Estrategia del patrón Strategy).
 * Define la interfaz común para todas las estrategias de ordenamiento de estudiantes.
 */
public interface IEstrategiaOrdenamiento {
    List<Estudiante> ordenar(List<Estudiante> estudiantes);
}
