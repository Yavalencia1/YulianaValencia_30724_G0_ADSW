package datos;

import java.util.ArrayList;
import java.util.List;

public class AdaptadorEstudianteExterno implements ILectorDatos {
    private final FuenteExternaEstudiantes fuenteExterna;

    public AdaptadorEstudianteExterno(FuenteExternaEstudiantes fuenteExterna) {
        this.fuenteExterna = fuenteExterna;
    }

    @Override
    public List<Estudiante> obtenerEstudiantes() {
        List<Estudiante> estudiantes = new ArrayList<>();
        for (FuenteExternaEstudiantes.RegistroExterno registro : fuenteExterna.leerEstudiantesFormatoDistinto()) {
            estudiantes.add(mapearAEstudiante(registro.getCodigo(), registro.getNombreCompleto(), registro.getAnios()));
        }
        return estudiantes;
    }

    private Estudiante mapearAEstudiante(String codigo, String nombreCompleto, int anios) {
        return new Estudiante(convertirCodigoAId(codigo), nombreCompleto, anios);
    }

    private int convertirCodigoAId(String codigo) {
        String soloDigitos = codigo == null ? "" : codigo.replaceAll("\\D+", "");
        if (!soloDigitos.isBlank()) {
            return Integer.parseInt(soloDigitos);
        }
        return Math.abs(codigo == null ? 0 : codigo.hashCode());
    }
}