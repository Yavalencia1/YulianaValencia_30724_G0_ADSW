package logica_de_negocio;

import datos.Estudiante;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class AuditoriaDecorator extends ServicioEstudianteDecorator {
    private static final List<String> REGISTROS_AUDITORIA = new ArrayList<>();

    public AuditoriaDecorator(IServicioEstudiante servicioEnvoltorio) {
        super(servicioEnvoltorio);
    }

    @Override
    public void guardar(Estudiante estudiante) {
        registrarAuditoria("Guardar estudiante", estudiante);
        super.guardar(estudiante);
    }

    private void registrarAuditoria(String accion, Estudiante estudiante) {
        String registro = "[AUDITORIA] " + accion + " -> ID=" + estudiante.getId()
                + ", Nombre=" + estudiante.getNombre() + ", Edad=" + estudiante.getEdad();
        synchronized (REGISTROS_AUDITORIA) {
            REGISTROS_AUDITORIA.add(registro);
        }
        System.out.println(registro);
    }

    public static List<String> obtenerAuditoria() {
        synchronized (REGISTROS_AUDITORIA) {
            return Collections.unmodifiableList(new ArrayList<>(REGISTROS_AUDITORIA));
        }
    }
}