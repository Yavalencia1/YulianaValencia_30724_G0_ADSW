package com.crud.estudiante.negocio.servicio;

import com.crud.estudiante.datos.Estudiante;
import java.util.List;

/**
 * Patrón: Decorator (Decorador abstracto del patrón Decorator).
 * Mantiene la referencia al componente decorado y delega las llamadas.
 */
public abstract class ServicioEstudianteDecorator implements IServicioEstudiante {
    protected final IServicioEstudiante servicioEnvoltorio;

    public ServicioEstudianteDecorator(IServicioEstudiante servicioEnvoltorio) {
        this.servicioEnvoltorio = servicioEnvoltorio;
    }

    @Override
    public void guardar(Estudiante estudiante) {
        servicioEnvoltorio.guardar(estudiante);
    }

    @Override
    public void actualizar(Estudiante estudiante) {
        servicioEnvoltorio.actualizar(estudiante);
    }

    @Override
    public void eliminar(int id) {
        servicioEnvoltorio.eliminar(id);
    }

    @Override
    public List<Estudiante> listarTodos() {
        return servicioEnvoltorio.listarTodos();
    }
}
