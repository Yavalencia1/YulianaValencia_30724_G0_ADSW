package controlador;

import modelo.Estudiante;
import modelo.GrupoEstudiantes;
import modelo.IComponenteAcademico;
import servicio.IServicioEstudiante;

import java.util.List;

public class ControlEstudiante {
    private IServicioEstudiante servicio;

    public ControlEstudiante(IServicioEstudiante servicio) {
        this.servicio = servicio;
    }

    public boolean agregarComponente(String id, String nombre, int edad) {
        Estudiante est = new Estudiante(id, nombre, edad);
        return servicio.guardar(est);
    }

    public boolean crearGrupo(String id, String nombre) {
        GrupoEstudiantes grupo = new GrupoEstudiantes(id, nombre);
        return servicio.guardar(grupo);
    }

    public boolean eliminarComponente(String id) {
        return servicio.borrar(id);
    }

    public List<IComponenteAcademico> mostrarTodos() {
        return servicio.listar();
    }
}