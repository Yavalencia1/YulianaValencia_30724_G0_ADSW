package com.crud.estudiante.negocio.observer;

import com.crud.estudiante.datos.Estudiante;

/**
 * Patrón: Observer (Observador Concreto del patrón Observer).
 * Escribe un registro o bitácora de auditoría de los eventos que ocurren con los estudiantes.
 */
public class HistorialObservador implements IObservador {
    @Override
    public void actualizar(String evento, Estudiante est) {
        System.out.println("[HISTORIAL BITÁCORA] Se disparó evento: " + evento + " | Estudiante: " + est);
    }
}
