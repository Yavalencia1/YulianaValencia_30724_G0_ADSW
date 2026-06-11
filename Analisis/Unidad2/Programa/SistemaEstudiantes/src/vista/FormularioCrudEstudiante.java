package vista;

import controlador.ControlEstudiante;
import modelo.IComponenteAcademico;
import persistencia.IImplementadorMemoria;
import persistencia.ImplementadorListaMemoria;
import servicio.IServicioEstudiante;
import servicio.ProxyProxyEstudiante;
import servicio.EstudianteEstudianteReal;

import javax.swing.*;
import java.awt.*;
import java.util.List;

public class FormularioCrudEstudiante extends JFrame {
    private JTextField txtId, txtNombre, txtEdad;
    private JTextArea areaResultados;
    private ControlEstudiante control;

    public FormularioCrudEstudiante(ControlEstudiante control) {
        this.control = control;
        configurarVentana();
        inicializarComponentes();
    }

    private void configurarVentana() {
        setTitle("CRUD Estudiantes");
        setSize(700, 400);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout());
    }

    private void inicializarComponentes() {

        JPanel panelFormulario = new JPanel(new GridLayout(6, 2, 10, 10));
        panelFormulario.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));

        panelFormulario.add(new JLabel("ID:"));
        txtId = new JTextField();
        panelFormulario.add(txtId);

        panelFormulario.add(new JLabel("Nombre (o Nombre Grupo):"));
        txtNombre = new JTextField();
        panelFormulario.add(txtNombre);

        panelFormulario.add(new JLabel("Edad (Solo estudiante):"));
        txtEdad = new JTextField();
        panelFormulario.add(txtEdad);

        JButton btnAgregar = new JButton("Agregar Estudiante");
        btnAgregar.addActionListener(e -> clickAgregar());
        panelFormulario.add(btnAgregar);

        JButton btnCrearGrupo = new JButton("Crear Grupo");
        btnCrearGrupo.addActionListener(e -> clickCrearGrupo());
        panelFormulario.add(btnCrearGrupo);

        JButton btnEliminar = new JButton("Eliminar por ID");
        btnEliminar.addActionListener(e -> clickEliminar());
        panelFormulario.add(btnEliminar);

        JButton btnMostrar = new JButton("Mostrar Todo");
        btnMostrar.addActionListener(e -> clickMostrarTodo());
        panelFormulario.add(btnMostrar);


        areaResultados = new JTextArea();
        areaResultados.setEditable(false);
        JScrollPane scrollPane = new JScrollPane(areaResultados);
        scrollPane.setBorder(BorderFactory.createTitledBorder("Datos Almacenados"));

        add(panelFormulario, BorderLayout.WEST);
        add(scrollPane, BorderLayout.CENTER);
    }

    private void clickAgregar() {
        try {
            String id = txtId.getText();
            String nombre = txtNombre.getText();
            int edad = Integer.parseInt(txtEdad.getText());

            if (control.agregarComponente(id, nombre, edad)) {
                mostrarMensaje("Estudiante agregado exitosamente.");
                clickMostrarTodo();
            } else {
                mostrarMensaje("Error: El ID ya existe.");
            }
        } catch (NumberFormatException ex) {
            mostrarMensaje("Por favor, ingrese una edad válida.");
        }
    }

    private void clickCrearGrupo() {
        String id = txtId.getText();
        String nombre = txtNombre.getText();

        if (id.isEmpty() || nombre.isEmpty()) {
            mostrarMensaje("El ID y Nombre son obligatorios para crear un grupo.");
            return;
        }

        if (control.crearGrupo(id, nombre)) {
            mostrarMensaje("Grupo creado exitosamente.");
            clickMostrarTodo();
        } else {
            mostrarMensaje("Error: El ID ya existe.");
        }
    }

    private void clickEliminar() {
        String id = txtId.getText();
        if (control.eliminarComponente(id)) {
            mostrarMensaje("Componente eliminado exitosamente.");
            clickMostrarTodo();
        } else {
            mostrarMensaje("Error: No se encontró el ID.");
        }
    }

    private void clickMostrarTodo() {
        List<IComponenteAcademico> lista = control.mostrarTodos();
        areaResultados.setText("");
        if (lista.isEmpty()) {
            areaResultados.setText("No hay datos registrados.");
        } else {
            for (IComponenteAcademico comp : lista) {
                areaResultados.append(comp.mostrarDatos() + "\n");
            }
        }
    }

    private void mostrarMensaje(String mensaje) {
        JOptionPane.showMessageDialog(this, mensaje);
    }

    // --- MAIN DE EJECUCIÓN ---
    public static void main(String[] args) {
        // 1. Instanciamos el implementador (Bridge - Memoria)
        IImplementadorMemoria memoria = new ImplementadorListaMemoria();

        // 2. Instanciamos el Servicio Real (Real Subject / Refined Abstraction)
        EstudianteEstudianteReal servicioReal = new EstudianteEstudianteReal(memoria);

        // 3. Instanciamos el Proxy pasándole el Servicio Real
        IServicioEstudiante proxy = new ProxyProxyEstudiante(servicioReal);

        // 4. Inyectamos el Proxy al Controlador
        ControlEstudiante controlador = new ControlEstudiante(proxy);

        // 5. Lanzamos la interfaz gráfica
        SwingUtilities.invokeLater(() -> {
            FormularioCrudEstudiante form = new FormularioCrudEstudiante(controlador);
            form.setVisible(true);
        });
    }
}