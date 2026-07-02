package com.crud.estudiante.negocio.servicio;

import com.crud.estudiante.datos.Estudiante;

/**
 * Patrón: Concrete Decorator (Decorador Concreto del patrón Decorator).
 * Agrega comportamiento adicional (auditoría/logs) de forma dinámica a los métodos de modificación y eliminación.
 */
public class AuditoriaDecorator extends ServicioEstudianteDecorator {

    public AuditoriaDecorator(IServicioEstudiante servicioEnvoltorio) {
        super(servicioEnvoltorio);
    }

    @Override
    public void guardar(Estudiante estudiante) {
        System.out.println("[AUDITORIA] Guardando estudiante: " + estudiante.getNombre());
        super.guardar(estudiante);
    }

    @Override
    public void actualizar(Estudiante estudiante) {
        System.out.println("[AUDITORIA] Actualizando estudiante: " + estudiante.getNombre());
        super.actualizar(estudiante);
    }

    @Override
    public void eliminar(int id) {
        System.out.println("[AUDITORIA] Eliminando estudiante con ID: " + id);
        super.eliminar(id);
    }
}
