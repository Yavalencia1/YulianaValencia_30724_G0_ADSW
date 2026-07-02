package com.crud.estudiante.negocio.strategy;

import com.crud.estudiante.datos.Estudiante;
import java.util.ArrayList;
import java.util.List;

/**
 * Patrón: Concrete Strategy (Estrategia de búsqueda por ID).
 * Busca estudiantes cuyo ID coincida con el criterio proporcionado.
 */
public class BusquedaPorId implements IEstrategiaBusqueda {
    @Override
    public List<Estudiante> buscar(List<Estudiante> estudiantes, String criterio) {
        List<Estudiante> resultado = new ArrayList<>();
        if (criterio == null || criterio.trim().isEmpty()) {
            return resultado;
        }
        try {
            int idBusqueda = Integer.parseInt(criterio.trim());
            for (Estudiante est : estudiantes) {
                if (est.getId() == idBusqueda) {
                    resultado.add(est);
                }
            }
        } catch (NumberFormatException e) {
            // El criterio no es un entero válido
        }
        return resultado;
    }
}
