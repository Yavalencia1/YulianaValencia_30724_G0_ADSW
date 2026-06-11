package logica_de_negocio;

import datos.Estudiante;
import datos.RepositorioEstudiante;

import java.util.List;

public class ServicioEstudianteBase implements IServicioEstudiante {
    private final RepositorioEstudiante repositorio;

    public ServicioEstudianteBase(RepositorioEstudiante repositorio) {
        this.repositorio = repositorio;
    }

    @Override
    public void guardar(Estudiante estudiante) {
        repositorio.guardar(estudiante);
    }

    @Override
    public List<Estudiante> listarTodos() {
        return repositorio.listarTodos();
    }

    public RepositorioEstudiante obtenerRepositorio() {
        return repositorio;
    }
}