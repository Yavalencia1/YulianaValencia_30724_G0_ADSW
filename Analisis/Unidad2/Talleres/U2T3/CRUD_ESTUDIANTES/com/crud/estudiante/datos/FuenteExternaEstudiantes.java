package com.crud.estudiante.datos;

import java.util.ArrayList;
import java.util.List;

/**
 * Patrón: Adaptee (Componente adaptado en el patrón Adapter).
 * Representa un sistema externo que provee datos en un formato incompatible con nuestra entidad Estudiante.
 */
public class FuenteExternaEstudiantes {

    /**
     * Retorna una lista de Object[] con el formato:
     * {Integer codigo, String nombreCompleto, Integer anios}
     */
    public List<Object[]> leerEstudiantesFormatoDistinto() {
        List<Object[]> datosExternos = new ArrayList<>();
        // Precarga de 3 estudiantes de ejemplo hardcodeados
        datosExternos.add(new Object[]{101, "Carlos Gomez", 20});
        datosExternos.add(new Object[]{102, "Maria Lopez", 22});
        datosExternos.add(new Object[]{103, "Juan Perez", 19});
        return datosExternos;
    }
}
