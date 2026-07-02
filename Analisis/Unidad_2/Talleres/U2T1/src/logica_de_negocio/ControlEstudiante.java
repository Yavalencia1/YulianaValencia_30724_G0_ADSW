package logica_de_negocio;

import datos.Estudiante;
import datos.RepositorioEstudiante;

import java.util.List;

public class ControlEstudiante {
    private final RepositorioEstudiante repositorio = new RepositorioEstudiante();

    public String agregarEstudiante(int id, String nombre, int edad) {
        String validacion = validarDatos(id, nombre, edad);
        if (!validacion.isBlank()) {
            return validacion;
        }
        if (repositorio.existeId(id)) {
            return "Ya existe un estudiante con ese ID.";
        }

        repositorio.guardar(new Estudiante(id, nombre, edad));
        return "Estudiante registrado correctamente.";
    }

    public String actualizarEstudiante(int id, String nombre, int edad) {
        String validacion = validarDatos(id, nombre, edad);
        if (!validacion.isBlank()) {
            return validacion;
        }
        if (!repositorio.existeId(id)) {
            return "No existe un estudiante con ese ID.";
        }

        repositorio.actualizar(new Estudiante(id, nombre, edad));
        return "Estudiante actualizado correctamente.";
    }

    public String eliminarEstudiante(int id) {
        if (!repositorio.existeId(id)) {
            return "No existe un estudiante con ese ID.";
        }

        repositorio.eliminar(id);
        return "Estudiante eliminado correctamente.";
    }

    public List<Estudiante> mostrarTodos() {
        return repositorio.listarTodos();
    }

    public Estudiante buscarPorId(int id) {
        return repositorio.buscarPorId(id);
    }

    public String validarDatos(int id, String nombre, int edad) {
        if (id <= 0) {
            return "El ID debe ser un número entero mayor que cero.";
        }
        if (nombre == null || nombre.isBlank()) {
            return "El nombre es obligatorio.";
        }
        if (edad <= 0) {
            return "La edad debe ser mayor que cero.";
        }
        return "";
    }
}