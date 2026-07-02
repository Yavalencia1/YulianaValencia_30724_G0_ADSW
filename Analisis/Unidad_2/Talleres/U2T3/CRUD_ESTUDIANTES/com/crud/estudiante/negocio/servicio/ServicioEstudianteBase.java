package com.crud.estudiante.negocio.servicio;

import com.crud.estudiante.datos.Estudiante;
import com.crud.estudiante.datos.RepositorioEstudiante;
import com.crud.estudiante.negocio.observer.IObservador;
import com.crud.estudiante.negocio.observer.ISujeto;
import java.util.ArrayList;
import java.util.List;

/**
 * Patrón: Concrete Component (Componente Concreto del patrón Decorator) 
 * y Concrete Subject (Sujeto Concreto del patrón Observer).
 * Implementa el servicio base de estudiantes y delega el almacenamiento en el Repositorio.
 * Mantiene la lista de observadores y los notifica en eventos clave.
 */
public class ServicioEstudianteBase implements IServicioEstudiante, ISujeto {
    private final RepositorioEstudiante repositorio;
    private final List<IObservador> observadores = new ArrayList<>();

    public ServicioEstudianteBase(RepositorioEstudiante repositorio) {
        this.repositorio = repositorio;
    }

    @Override
    public void guardar(Estudiante estudiante) {
        repositorio.guardar(estudiante);
        notificar("GUARDADO", estudiante);
    }

    @Override
    public void actualizar(Estudiante estudiante) {
        repositorio.actualizar(estudiante);
        notificar("ACTUALIZADO", estudiante);
    }

    @Override
    public void eliminar(int id) {
        // Buscar el estudiante para notificar con sus datos
        Estudiante encontrado = null;
        for (Estudiante est : repositorio.listarTodos()) {
            if (est.getId() == id) {
                encontrado = est;
                break;
            }
        }
        
        repositorio.eliminar(id);
        
        if (encontrado != null) {
            notificar("ELIMINADO", encontrado);
        }
    }

    @Override
    public List<Estudiante> listarTodos() {
        return repositorio.listarTodos();
    }

    @Override
    public void agregarObservador(IObservador o) {
        if (!observadores.contains(o)) {
            observadores.add(o);
        }
    }

    @Override
    public void eliminarObservador(IObservador o) {
        observadores.remove(o);
    }

    @Override
    public void notificar(String evento, Estudiante est) {
        for (IObservador observador : observadores) {
            observador.actualizar(evento, est);
        }
    }
}
