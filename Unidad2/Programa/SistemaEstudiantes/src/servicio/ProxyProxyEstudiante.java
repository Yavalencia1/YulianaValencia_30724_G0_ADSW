package servicio;

import modelo.IComponenteAcademico;

import java.util.List;

public class ProxyProxyEstudiante implements IServicioEstudiante {
    private EstudianteEstudianteReal servicioReal;

    public ProxyProxyEstudiante(EstudianteEstudianteReal servicioReal) {
        this.servicioReal = servicioReal;
    }

    private boolean verificarAcceso() {
        System.out.println("[PROXY LOG] Verificando permisos de acceso... OK.");
        return true;
    }

    private void registrarLog(String accion) {
        System.out.println("[PROXY LOG] Acción ejecutada: " + accion);
    }

    @Override
    public boolean guardar(IComponenteAcademico comp) {
        if (verificarAcceso()) {
            boolean resultado = servicioReal.guardar(comp);
            registrarLog("Guardar componente ID: " + comp.getId() + " - Exito: " + resultado);
            return resultado;
        }
        return false;
    }

    @Override
    public boolean modificar(IComponenteAcademico comp) {
        if (verificarAcceso()) {
            boolean resultado = servicioReal.modificar(comp);
            registrarLog("Modificar componente ID: " + comp.getId());
            return resultado;
        }
        return false;
    }

    @Override
    public boolean borrar(String id) {
        if (verificarAcceso()) {
            boolean resultado = servicioReal.borrar(id);
            registrarLog("Borrar componente ID: " + id);
            return resultado;
        }
        return false;
    }

    @Override
    public List<IComponenteAcademico> listar() {
        registrarLog("Listar todos los componentes");
        return servicioReal.listar();
    }
}