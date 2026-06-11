package com.crud.estudiante.negocio.observer;

import com.crud.estudiante.datos.Estudiante;

/**
 * Patrón: Observer (Interfaz Observador del patrón Observer).
 * Define el contrato que deben cumplir los objetos que desean ser notificados de cambios.
 */
public interface IObservador {
    void actualizar(String evento, Estudiante est);
}
