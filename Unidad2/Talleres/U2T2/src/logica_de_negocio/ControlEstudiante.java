package logica_de_negocio;

import datos.Estudiante;
import datos.ILectorDatos;
import datos.AdaptadorEstudianteExterno;
import datos.FuenteExternaEstudiantes;
import datos.RepositorioEstudiante;

import java.util.ArrayList;
import java.util.List;

public class ControlEstudiante {
    private final RepositorioEstudiante repositorio;
    private final IServicioEstudiante servicio;
    private final ILectorDatos lectorDatos;
    private String ultimoMensaje = "";

    public ControlEstudiante() {
        this(new RepositorioEstudiante());
    }

    private ControlEstudiante(RepositorioEstudiante repositorio) {
        this(repositorio,
                new AuditoriaDecorator(new ServicioEstudianteBase(repositorio)),
                new AdaptadorEstudianteExterno(new FuenteExternaEstudiantes()));
    }

    public ControlEstudiante(IServicioEstudiante servicio, ILectorDatos lectorDatos) {
        this(extraerRepositorio(servicio), servicio, lectorDatos);
    }

    private ControlEstudiante(RepositorioEstudiante repositorio, IServicioEstudiante servicio, ILectorDatos lectorDatos) {
        this.repositorio = repositorio;
        this.servicio = servicio;
        this.lectorDatos = lectorDatos;
    }

    public void agregarEstudiante(int id, String nombre, int edad) {
        String validacion = validarDatos(id, nombre, edad);
        if (!validacion.isBlank()) {
            ultimoMensaje = validacion;
            return;
        }
        if (repositorio.existeId(id)) {
            ultimoMensaje = "Ya existe un estudiante con ese ID.";
            return;
        }

        servicio.guardar(new Estudiante(id, nombre, edad));
        ultimoMensaje = "Estudiante registrado correctamente.";
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
        return servicio.listarTodos();
    }

    public Estudiante buscarPorId(int id) {
        return repositorio.buscarPorId(id);
    }

    public void cargarDesdeFuenteExterna() {
        List<Estudiante> estudiantesExternos = lectorDatos.obtenerEstudiantes();
        int cargados = 0;

        for (Estudiante estudiante : estudiantesExternos) {
            if (!repositorio.existeId(estudiante.getId())) {
                servicio.guardar(estudiante);
                cargados++;
            }
        }

        ultimoMensaje = "Se cargaron " + cargados + " estudiante(s) desde la fuente externa.";
    }

    public String getUltimoMensaje() {
        return ultimoMensaje;
    }

    public List<String> mostrarAuditoria() {
        return new ArrayList<>(AuditoriaDecorator.obtenerAuditoria());
    }

    public String validarDatos(int id, String nombre, int edad) {
        if (id <= 0) {
            return "El ID debe ser un número entero mayor que cero.";
        }
        if (nombre == null || nombre.isBlank()) {
            return "El nombre es obligatorio.";
        }
        if (edad <= 0 || edad > 100) {
            return "La edad debe ser un número entre 1 y 100.";
        }
        return "";
    }

    private static RepositorioEstudiante extraerRepositorio(IServicioEstudiante servicio) {
        if (servicio instanceof ServicioEstudianteBase base) {
            return base.obtenerRepositorio();
        }
        if (servicio instanceof ServicioEstudianteDecorator decorator) {
            return extraerRepositorio(decorator.obtenerServicioEnvoltorio());
        }
        return new RepositorioEstudiante();
    }
}