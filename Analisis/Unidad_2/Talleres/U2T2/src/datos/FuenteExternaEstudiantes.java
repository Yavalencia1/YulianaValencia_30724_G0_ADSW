package datos;

import java.util.ArrayList;
import java.util.List;

public class FuenteExternaEstudiantes {
    public List<RegistroExterno> leerEstudiantesFormatoDistinto() {
        List<RegistroExterno> registros = new ArrayList<>();
        registros.add(new RegistroExterno("EXT-101", "Ana Torres", 20));
        registros.add(new RegistroExterno("EXT-102", "Luis Paredes", 22));
        registros.add(new RegistroExterno("EXT-103", "Marta Ruiz", 19));
        return registros;
    }

    public static class RegistroExterno {
        private final String codigo;
        private final String nombreCompleto;
        private final int anios;

        public RegistroExterno(String codigo, String nombreCompleto, int anios) {
            this.codigo = codigo;
            this.nombreCompleto = nombreCompleto;
            this.anios = anios;
        }

        public String getCodigo() {
            return codigo;
        }

        public String getNombreCompleto() {
            return nombreCompleto;
        }

        public int getAnios() {
            return anios;
        }
    }
}