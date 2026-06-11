package servicio;

import modelo.IComponenteAcademico;
import persistencia.IImplementadorMemoria;

import java.util.List;

public abstract class AbstractEstudiante implements IServicioEstudiante {
    protected IImplementadorMemoria implementador;

    public AbstractEstudiante(IImplementadorMemoria imp) {
        this.implementador = imp;
    }

    public abstract boolean guardar(IComponenteAcademico comp);
    public abstract boolean modificar(IComponenteAcademico comp);
    public abstract boolean borrar(String id);
    public abstract List<IComponenteAcademico> listar();
}