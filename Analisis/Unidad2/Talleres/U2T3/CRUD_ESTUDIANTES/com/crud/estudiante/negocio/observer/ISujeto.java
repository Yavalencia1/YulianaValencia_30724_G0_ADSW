package com.crud.estudiante.negocio.observer;

import com.crud.estudiante.datos.Estudiante;

/**
 * Patrón: Subject (Interfaz Sujeto del patrón Observer).
 * Define el contrato para agregar, eliminar y notificar a los observadores.
 */
public interface ISujeto {
    void agregarObservador(IObservador o);
    void eliminarObservador(IObservador o);
    void notificar(String evento, Estudiante est);
}
