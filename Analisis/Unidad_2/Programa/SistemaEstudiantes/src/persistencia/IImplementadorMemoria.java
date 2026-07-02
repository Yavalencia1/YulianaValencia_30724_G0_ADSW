package persistencia;

import modelo.IComponenteAcademico;

import java.util.List;

public interface IImplementadorMemoria {
    boolean existe(String id);
    void guardarMemoria(IComponenteAcademico comp);
    void modificarMemoria(IComponenteAcademico comp);
    void borrarMemoria(String id);
    List<IComponenteAcademico> listarMemoria();
}