package logica_de_negocio;

import datos.Estudiante;

import java.util.List;

public abstract class ServicioEstudianteDecorator implements IServicioEstudiante {
    protected final IServicioEstudiante servicioEnvoltorio;

    protected ServicioEstudianteDecorator(IServicioEstudiante servicioEnvoltorio) {
        this.servicioEnvoltorio = servicioEnvoltorio;
    }

    @Override
    public void guardar(Estudiante estudiante) {
        servicioEnvoltorio.guardar(estudiante);
    }

    @Override
    public List<Estudiante> listarTodos() {
        return servicioEnvoltorio.listarTodos();
    }

    public IServicioEstudiante obtenerServicioEnvoltorio() {
        return servicioEnvoltorio;
    }
}