package com.crud.estudiante.negocio.strategy;

import com.crud.estudiante.datos.Estudiante;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Patrón: Concrete Strategy (Estrategia Concreta del patrón Strategy).
 * Implementa el algoritmo de ordenamiento de estudiantes por nombre alfabéticamente.
 */
public class OrdenPorNombre implements IEstrategiaOrdenamiento {
    @Override
    public List<Estudiante> ordenar(List<Estudiante> estudiantes) {
        List<Estudiante> ordenada = new ArrayList<>(estudiantes);
        ordenada.sort(Comparator.comparing(Estudiante::getNombre));
        return ordenada;
    }
}
