package com.crud.estudiante.datos;

import java.util.ArrayList;
import java.util.List;

/**
 * Patrón: Ninguno (Representa la capa de acceso a datos - DAO / Repositorio).
 * Almacena los estudiantes en memoria utilizando un ArrayList.
 */
public class RepositorioEstudiante {
    private final List<Estudiante> estudiantes = new ArrayList<>();

    public void guardar(Estudiante estudiante) {
        estudiantes.add(estudiante);
    }

    public void actualizar(Estudiante estudiante) {
        for (int i = 0; i < estudiantes.size(); i++) {
            if (estudiantes.get(i).getId() == estudiante.getId()) {
                estudiantes.set(i, estudiante);
                return;
            }
        }
    }

    public void eliminar(int id) {
        estudiantes.removeIf(est -> est.getId() == id);
    }

    public List<Estudiante> listarTodos() {
        return new ArrayList<>(estudiantes);
    }
}
