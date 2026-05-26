package servicio;

import modelo.IComponenteAcademico;
import persistencia.IImplementadorMemoria;

import java.util.List;

public class EstudianteEstudianteReal extends AbstractEstudiante {

    public EstudianteEstudianteReal(IImplementadorMemoria imp) {
        super(imp);
    }

    @Override
    public boolean guardar(IComponenteAcademico comp) {
        if (!implementador.existe(comp.getId())) {
            implementador.guardarMemoria(comp);
            return true;
        }
        return false;
    }

    @Override
    public boolean modificar(IComponenteAcademico comp) {
        if (implementador.existe(comp.getId())) {
            implementador.modificarMemoria(comp);
            return true;
        }
        return false;
    }

    @Override
    public boolean borrar(String id) {
        if (implementador.existe(id)) {
            implementador.borrarMemoria(id);
            return true;
        }
        return false;
    }

    @Override
    public List<IComponenteAcademico> listar() {
        return implementador.listarMemoria();
    }
}