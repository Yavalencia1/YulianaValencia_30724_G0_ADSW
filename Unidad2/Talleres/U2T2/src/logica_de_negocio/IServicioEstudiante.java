package logica_de_negocio;

import datos.Estudiante;

import java.util.List;

public interface IServicioEstudiante {
    void guardar(Estudiante estudiante);

    List<Estudiante> listarTodos();
}