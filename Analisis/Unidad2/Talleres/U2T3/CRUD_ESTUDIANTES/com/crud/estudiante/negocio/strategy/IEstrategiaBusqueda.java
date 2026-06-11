package com.crud.estudiante.negocio.strategy;

import com.crud.estudiante.datos.Estudiante;
import java.util.List;

/**
 * Patrón: Strategy (Interfaz Estrategia para Búsqueda).
 * Define el contrato para las diferentes estrategias de búsqueda de estudiantes.
 */
public interface IEstrategiaBusqueda {
    List<Estudiante> buscar(List<Estudiante> estudiantes, String criterio);
}
