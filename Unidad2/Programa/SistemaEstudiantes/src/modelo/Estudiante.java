package modelo;

import modelo.IComponenteAcademico;

public class Estudiante implements IComponenteAcademico {
    private String id;
    private String nombre;
    private int edad;

    public Estudiante(String id, String nombre, int edad) {
        this.id = id;
        this.nombre = nombre;
        this.edad = edad;
    }

    @Override
    public String getId() { return id; }

    public String getNombre() { return nombre; }
    public int getEdad() { return edad; }

    @Override
    public String mostrarDatos() {
        return "  [Estudiante] ID: " + id + " | Nombre: " + nombre + " | Edad: " + edad + "\n";
    }
}