package com.crud.estudiante.negocio.strategy;

import com.crud.estudiante.datos.Estudiante;
import java.util.ArrayList;
import java.util.List;

/**
 * Patrón: Concrete Strategy (Estrategia de búsqueda por Nombre).
 * Busca estudiantes cuyo nombre contenga el criterio proporcionado (insensible a mayúsculas/minúsculas).
 */
public class BusquedaPorNombre implements IEstrategiaBusqueda {
    @Override
    public List<Estudiante> buscar(List<Estudiante> estudiantes, String criterio) {
        List<Estudiante> resultado = new ArrayList<>();
        if (criterio == null || criterio.trim().isEmpty()) {
            return resultado;
        }
        String criterioLower = criterio.trim().toLowerCase();
        for (Estudiante est : estudiantes) {
            if (est.getNombre().toLowerCase().contains(criterioLower)) {
                resultado.add(est);
            }
        }
        return resultado;
    }
}
