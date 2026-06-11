package com.crud.estudiante.presentacion;

import com.crud.estudiante.negocio.observer.IObservador;
import javax.swing.JOptionPane;
import javax.swing.SwingUtilities;

/**
 * Patrón: Observer (Observador Concreto del patrón Observer).
 * Notifica directamente a través de un diálogo visual en pantalla (JOptionPane)
 * para evidenciar el comportamiento del patrón Observer ante eventos en el Sujeto.
 * 
 * Cumpliendo la restricción de que la capa de presentación no importe directamente
 * clases de la capa de datos, se utiliza el tipo completamente calificado de Estudiante.
 */
public class PanelUIObservador implements IObservador {
    @Override
    public void actualizar(String evento, com.crud.estudiante.datos.Estudiante est) {
        SwingUtilities.invokeLater(() -> {
            JOptionPane.showMessageDialog(
                null,
                "[OBSERVER] Notificación de Cambio:\nEvento: " + evento + "\nEstudiante: [ID=" + est.getId() + ", Nombre=" + est.getNombre() + ", Edad=" + est.getEdad() + "]",
                "Notificación - PanelUIObservador",
                JOptionPane.INFORMATION_MESSAGE
            );
        });
    }
}
