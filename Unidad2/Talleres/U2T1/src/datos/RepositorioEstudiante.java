package datos;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class RepositorioEstudiante {
    private final Map<Integer, Estudiante> estudiantes = new LinkedHashMap<>();

    public boolean existeId(int id) {
        return estudiantes.containsKey(id);
    }

    public void guardar(Estudiante estudiante) {
        estudiantes.put(estudiante.getId(), estudiante);
    }

    public Estudiante buscarPorId(int id) {
        return estudiantes.get(id);
    }

    public void actualizar(Estudiante estudiante) {
        estudiantes.put(estudiante.getId(), estudiante);
    }

    public void eliminar(int id) {
        estudiantes.remove(id);
    }

    public List<Estudiante> listarTodos() {
        return new ArrayList<>(estudiantes.values());
    }
}