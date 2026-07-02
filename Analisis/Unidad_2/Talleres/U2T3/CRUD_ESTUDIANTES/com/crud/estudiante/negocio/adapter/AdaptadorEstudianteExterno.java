package com.crud.estudiante.negocio.adapter;

import com.crud.estudiante.datos.Estudiante;
import com.crud.estudiante.datos.FuenteExternaEstudiantes;
import java.util.ArrayList;
import java.util.List;

/**
 * Patrón: Adapter (Adaptador concreto del patrón Adapter).
 * Traduce el formato incompatible de FuenteExternaEstudiantes al formato estándar
 * de la entidad Estudiante esperado por nuestra aplicación.
 */
public class AdaptadorEstudianteExterno implements ILectorDatos {
    private final FuenteExternaEstudiantes fuenteExterna;

    public AdaptadorEstudianteExterno(FuenteExternaEstudiantes fuenteExterna) {
        this.fuenteExterna = fuenteExterna;
    }

    @Override
    public List<Estudiante> obtenerEstudiantes() {
        List<Object[]> datosExternos = fuenteExterna.leerEstudiantesFormatoDistinto();
        List<Estudiante> estudiantesAdaptados = new ArrayList<>();

        for (Object[] dato : datosExternos) {
            Integer codigo = (Integer) dato[0];
            String nombreCompleto = (String) dato[1];
            Integer anios = (Integer) dato[2];

            // Adaptación de los datos planos a la entidad Estudiante
            Estudiante estudiante = new Estudiante(codigo, nombreCompleto, anios);
            estudiantesAdaptados.add(estudiante);
        }

        return estudiantesAdaptados;
    }
}
