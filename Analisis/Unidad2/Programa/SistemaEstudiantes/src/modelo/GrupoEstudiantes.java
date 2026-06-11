package modelo;

import java.util.ArrayList;
import java.util.List;

public class GrupoEstudiantes implements IComponenteAcademico {
    private String id;
    private String nombreGrupo;
    private List<IComponenteAcademico> componentes;

    public GrupoEstudiantes(String id, String nombreGrupo) {
        this.id = id;
        this.nombreGrupo = nombreGrupo;
        this.componentes = new ArrayList<>();
    }

    public void agregar(IComponenteAcademico c) {
        componentes.add(c);
    }

    public void remover(String id) {
        componentes.removeIf(c -> c.getId().equals(id));
    }

    @Override
    public String getId() { return id; }

    @Override
    public String mostrarDatos() {
        StringBuilder sb = new StringBuilder();
        sb.append("[Grupo] ID: ").append(id).append(" | Nombre: ").append(nombreGrupo).append("\n");
        for (IComponenteAcademico comp : componentes) {
            sb.append("    ").append(comp.mostrarDatos());
        }
        return sb.toString();
    }
}