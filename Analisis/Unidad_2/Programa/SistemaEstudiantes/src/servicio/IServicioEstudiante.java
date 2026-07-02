package servicio;

import modelo.IComponenteAcademico;

import java.util.List;

public interface IServicioEstudiante {
    boolean guardar(IComponenteAcademico comp);
    boolean modificar(IComponenteAcademico comp);
    boolean borrar(String id);
    List<IComponenteAcademico> listar();
}