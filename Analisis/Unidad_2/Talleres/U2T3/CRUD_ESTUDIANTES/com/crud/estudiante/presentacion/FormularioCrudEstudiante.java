package com.crud.estudiante.presentacion;

import com.crud.estudiante.negocio.adapter.AdaptadorEstudianteExterno;
import com.crud.estudiante.negocio.adapter.ILectorDatos;
import com.crud.estudiante.negocio.control.ControlEstudiante;
import com.crud.estudiante.negocio.observer.HistorialObservador;
import com.crud.estudiante.negocio.servicio.AuditoriaDecorator;
import com.crud.estudiante.negocio.servicio.IServicioEstudiante;
import com.crud.estudiante.negocio.servicio.ServicioEstudianteBase;
import com.crud.estudiante.negocio.strategy.BusquedaPorId;
import com.crud.estudiante.negocio.strategy.BusquedaPorNombre;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

/**
 * Clase de presentación principal implementada en Java Swing.
 * Representa la ventana "Sistema de Gestión de Estudiantes" y gestiona el CRUD completo.
 * 
 * Cumpliendo la restricción de que la capa de presentación no importe directamente
 * clases de la capa de datos (package com.crud.estudiante.datos), no hay directivas 'import'
 * hacia dicha capa. Cualquier referencia necesaria a las entidades o repositorios de datos
 * se maneja de forma completamente calificada.
 */
public class FormularioCrudEstudiante extends JFrame {

    private final ControlEstudiante controlEstudiante;

    private JTextField txtId;
    private JTextField txtNombre;
    private JTextField txtEdad;
    private JTable tablaEstudiantes;
    private DefaultTableModel modeloTabla;
    private JTextField txtBuscar;
    private JComboBox<String> comboEstrategia;

    public FormularioCrudEstudiante(ControlEstudiante controlEstudiante) {
        this.controlEstudiante = controlEstudiante;
        inicializarUI();
    }

    private void inicializarUI() {
        setTitle("Sistema de Gestión de Estudiantes");
        setSize(650, 500);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        // --- SECCIÓN SUPERIOR: Formulario de entrada de datos y botones principales ---
        JPanel panelSuperior = new JPanel(new BorderLayout(20, 10));
        panelSuperior.setBorder(BorderFactory.createEmptyBorder(15, 15, 10, 15));

        // Panel de entrada (campos y etiquetas)
        JPanel panelCampos = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(5, 5, 5, 5);
        gbc.fill = GridBagConstraints.HORIZONTAL;

        // Fila 0: Etiquetas
        gbc.gridy = 0;
        gbc.weightx = 0.3;
        
        gbc.gridx = 0;
        panelCampos.add(new JLabel("ID"), gbc);
        
        gbc.gridx = 1;
        gbc.weightx = 0.4;
        panelCampos.add(new JLabel("Nombre"), gbc);
        
        gbc.gridx = 2;
        gbc.weightx = 0.3;
        panelCampos.add(new JLabel("Edad"), gbc);

        // Fila 1: Campos de texto
        gbc.gridy = 1;
        
        gbc.gridx = 0;
        txtId = new JTextField(8);
        panelCampos.add(txtId, gbc);
        
        gbc.gridx = 1;
        txtNombre = new JTextField(15);
        panelCampos.add(txtNombre, gbc);
        
        gbc.gridx = 2;
        txtEdad = new JTextField(8);
        panelCampos.add(txtEdad, gbc);

        panelSuperior.add(panelCampos, BorderLayout.CENTER);

        // Panel de botones del CRUD (Agregar, Actualizar, Eliminar, Mostrar Todo)
        JPanel panelBotonesAccion = new JPanel(new GridLayout(4, 1, 0, 5));
        JButton btnAgregar = new JButton("Agregar");
        JButton btnActualizar = new JButton("Actualizar");
        JButton btnEliminar = new JButton("Eliminar");
        JButton btnMostrarTodo = new JButton("Mostrar Todo");
        panelBotonesAccion.add(btnAgregar);
        panelBotonesAccion.add(btnActualizar);
        panelBotonesAccion.add(btnEliminar);
        panelBotonesAccion.add(btnMostrarTodo);

        panelSuperior.add(panelBotonesAccion, BorderLayout.EAST);
        add(panelSuperior, BorderLayout.NORTH);

        // --- SECCIÓN CENTRAL: Búsqueda, Importación y JTable ---
        JPanel panelCentral = new JPanel(new BorderLayout());

        // Fila de búsqueda y botón importar
        JPanel panelBusqueda = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 5));
        panelBusqueda.setBorder(BorderFactory.createEmptyBorder(0, 15, 10, 15));

        comboEstrategia = new JComboBox<>(new String[]{"Nombre", "ID"});
        txtBuscar = new JTextField(18);
        JButton btnBuscar = new JButton("Buscar");
        JButton btnImportar = new JButton("Importar");

        panelBusqueda.add(comboEstrategia);
        panelBusqueda.add(txtBuscar);
        panelBusqueda.add(btnBuscar);
        panelBusqueda.add(btnImportar);
        
        panelCentral.add(panelBusqueda, BorderLayout.NORTH);

        // Tabla de Estudiantes
        String[] columnas = {"ID", "Nombre", "Edad"};
        modeloTabla = new DefaultTableModel(columnas, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        tablaEstudiantes = new JTable(modeloTabla);
        JScrollPane scrollTabla = new JScrollPane(tablaEstudiantes);
        scrollTabla.setBorder(BorderFactory.createEmptyBorder(0, 15, 15, 15));
        panelCentral.add(scrollTabla, BorderLayout.CENTER);

        add(panelCentral, BorderLayout.CENTER);

        // --- ASIGNACIÓN DE EVENTOS DE ACCIÓN ---
        btnAgregar.addActionListener(e -> accionAgregarEstudiante());
        btnActualizar.addActionListener(e -> accionActualizarEstudiante());
        btnEliminar.addActionListener(e -> accionEliminarEstudiante());
        btnMostrarTodo.addActionListener(e -> {
            txtBuscar.setText("");
            refrescarTabla(controlEstudiante.mostrarEstudiantes());
        });
        btnBuscar.addActionListener(e -> accionBuscarEstudiantes());
        btnImportar.addActionListener(e -> accionImportarEstudiantes());

        // Evento al seleccionar una fila de la tabla para llenar campos
        tablaEstudiantes.getSelectionModel().addListSelectionListener(e -> {
            int selectedRow = tablaEstudiantes.getSelectedRow();
            if (selectedRow != -1) {
                txtId.setText(modeloTabla.getValueAt(selectedRow, 0).toString());
                txtNombre.setText(modeloTabla.getValueAt(selectedRow, 1).toString());
                txtEdad.setText(modeloTabla.getValueAt(selectedRow, 2).toString());
            }
        });

        // Cargar datos iniciales
        refrescarTabla(controlEstudiante.mostrarEstudiantes());
    }

    private void refrescarTabla(List<com.crud.estudiante.datos.Estudiante> lista) {
        modeloTabla.setRowCount(0);
        for (com.crud.estudiante.datos.Estudiante est : lista) {
            modeloTabla.addRow(new Object[]{est.getId(), est.getNombre(), est.getEdad()});
        }
    }

    private void limpiarCampos() {
        txtId.setText("");
        txtNombre.setText("");
        txtEdad.setText("");
    }

    private void accionAgregarEstudiante() {
        String strId = txtId.getText().trim();
        String nombre = txtNombre.getText().trim();
        String strEdad = txtEdad.getText().trim();

        if (strId.isEmpty() || nombre.isEmpty() || strEdad.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Todos los campos (ID, Nombre, Edad) son obligatorios.", "Error de Validación", JOptionPane.WARNING_MESSAGE);
            return;
        }

        int id;
        try {
            id = Integer.parseInt(strId);
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "El ID debe ser un número entero válido.", "Error de Validación", JOptionPane.WARNING_MESSAGE);
            return;
        }

        int edad;
        try {
            edad = Integer.parseInt(strEdad);
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "La Edad debe ser un número entero válido.", "Error de Validación", JOptionPane.WARNING_MESSAGE);
            return;
        }

        try {
            controlEstudiante.agregarEstudiante(id, nombre, edad);
            limpiarCampos();
            refrescarTabla(controlEstudiante.mostrarEstudiantes());
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Error al guardar el estudiante: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void accionActualizarEstudiante() {
        String strId = txtId.getText().trim();
        String nombre = txtNombre.getText().trim();
        String strEdad = txtEdad.getText().trim();

        if (strId.isEmpty() || nombre.isEmpty() || strEdad.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Todos los campos son obligatorios para actualizar.", "Error de Validación", JOptionPane.WARNING_MESSAGE);
            return;
        }

        int id, edad;
        try {
            id = Integer.parseInt(strId);
            edad = Integer.parseInt(strEdad);
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "ID y Edad deben ser números enteros válidos.", "Error de Validación", JOptionPane.WARNING_MESSAGE);
            return;
        }

        try {
            controlEstudiante.actualizarEstudiante(id, nombre, edad);
            limpiarCampos();
            refrescarTabla(controlEstudiante.mostrarEstudiantes());
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Error al actualizar estudiante: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void accionEliminarEstudiante() {
        String strId = txtId.getText().trim();
        int id = -1;

        if (!strId.isEmpty()) {
            try {
                id = Integer.parseInt(strId);
            } catch (NumberFormatException e) {
                JOptionPane.showMessageDialog(this, "El ID debe ser un número entero válido.", "Error de Validación", JOptionPane.WARNING_MESSAGE);
                return;
            }
        } else {
            int selectedRow = tablaEstudiantes.getSelectedRow();
            if (selectedRow != -1) {
                id = (Integer) modeloTabla.getValueAt(selectedRow, 0);
            }
        }

        if (id == -1) {
            JOptionPane.showMessageDialog(this, "Debe ingresar un ID o seleccionar un estudiante para eliminar.", "Error de Selección", JOptionPane.WARNING_MESSAGE);
            return;
        }

        try {
            controlEstudiante.eliminarEstudiante(id);
            limpiarCampos();
            refrescarTabla(controlEstudiante.mostrarEstudiantes());
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Error al eliminar estudiante: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void accionBuscarEstudiantes() {
        String seleccion = (String) comboEstrategia.getSelectedItem();
        String criterio = txtBuscar.getText().trim();

        if (criterio.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Ingrese un criterio de búsqueda.", "Criterio Vacío", JOptionPane.WARNING_MESSAGE);
            return;
        }

        // Aplicamos dinámicamente el patrón Strategy según la selección
        if ("ID".equals(seleccion)) {
            controlEstudiante.setEstrategiaBusqueda(new BusquedaPorId());
        } else {
            controlEstudiante.setEstrategiaBusqueda(new BusquedaPorNombre());
        }

        try {
            List<com.crud.estudiante.datos.Estudiante> resultados = controlEstudiante.buscarEstudiantes(criterio);
            refrescarTabla(resultados);
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Error al buscar: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void accionImportarEstudiantes() {
        try {
            controlEstudiante.cargarDatosExternos();
            refrescarTabla(controlEstudiante.mostrarEstudiantes());
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Error al importar datos: " + ex.getMessage(), "Error", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception e) {
                // fall back to default
            }

            // 1. INSTANCIACIÓN DE LA CAPA DE DATOS (Calificados para evitar imports directos)
            com.crud.estudiante.datos.RepositorioEstudiante repositorio = new com.crud.estudiante.datos.RepositorioEstudiante();
            com.crud.estudiante.datos.FuenteExternaEstudiantes fuenteExterna = new com.crud.estudiante.datos.FuenteExternaEstudiantes();

            // 2. ENSAMBLADO DE LA CAPA DE NEGOCIO (Decorator y Observer)
            ServicioEstudianteBase servicioBase = new ServicioEstudianteBase(repositorio);

            // Registro del HistorialObservador (Bitácora de consola)
            servicioBase.agregarObservador(new HistorialObservador());

            // Registro del PanelUIObservador (Observador visual mediante popups)
            servicioBase.agregarObservador(new PanelUIObservador());

            // Decorador con Auditoría
            IServicioEstudiante servicioDecorado = new AuditoriaDecorator(servicioBase);

            // Adaptador para la fuente externa
            ILectorDatos adaptador = new AdaptadorEstudianteExterno(fuenteExterna);

            // 3. CONTROLADOR
            ControlEstudiante controlador = new ControlEstudiante(servicioDecorado, adaptador);

            // 4. CREACIÓN Y CONFIGURACIÓN DEL FORMULARIO Swing
            FormularioCrudEstudiante formulario = new FormularioCrudEstudiante(controlador);

            // Mostrar el formulario
            formulario.setVisible(true);
        });
    }
}
