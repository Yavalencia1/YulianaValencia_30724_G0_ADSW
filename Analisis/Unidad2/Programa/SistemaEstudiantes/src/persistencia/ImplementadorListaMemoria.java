package persistencia;

import modelo.IComponenteAcademico;

import java.util.ArrayList;
import java.util.List;

public class ImplementadorListaMemoria implements IImplementadorMemoria {
    private List<IComponenteAcademico> lista = new ArrayList<>();

    @Override
    public boolean existe(String id) {
        return lista.stream().anyMatch(c -> c.getId().equals(id));
    }

    @Override
    public void guardarMemoria(IComponenteAcademico comp) {
        lista.add(comp);
    }

    @Override
    public void modificarMemoria(IComponenteAcademico comp) {
        borrarMemoria(comp.getId());
        guardarMemoria(comp);
    }

    @Override
    public void borrarMemoria(String id) {
        lista.removeIf(c -> c.getId().equals(id));
    }

    @Override
    public List<IComponenteAcademico> listarMemoria() {
        return lista;
    }
}