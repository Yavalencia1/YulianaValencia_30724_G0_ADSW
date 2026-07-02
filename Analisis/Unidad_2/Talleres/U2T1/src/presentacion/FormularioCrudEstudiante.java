package presentacion;

import datos.Estudiante;
import logica_de_negocio.ControlEstudiante;

import javax.swing.BorderFactory;
import javax.swing.Box;
import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextField;
import javax.swing.JTable;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;
import javax.swing.UIManager;
import javax.swing.border.EmptyBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.GridLayout;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;
import java.util.List;

public class FormularioCrudEstudiante extends JFrame {
    private final ControlEstudiante control = new ControlEstudiante();
    private final JTextField txtId = new JTextField(18);
    private final JTextField txtNombre = new JTextField(18);
    private final JTextField txtEdad = new JTextField(18);
    private final DefaultTableModel tableModel = new DefaultTableModel(new Object[]{"ID", "Nombre", "Edad"}, 0) {
        @Override
        public boolean isCellEditable(int row, int column) {
            return false;
        }
    };
    private final JTable tabla = new JTable(tableModel);
    private final JLabel lblMensaje = new JLabel("Listo para registrar estudiantes.", SwingConstants.LEFT);

    public FormularioCrudEstudiante() {
        aplicarLookAndFeel();
        configurarVentana();
        construirInterfaz();
        setVisible(true);
    }

    private void aplicarLookAndFeel() {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception ignored) {
        }
    }

    private void configurarVentana() {
        setTitle("CRUD de Estudiantes");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(900, 560));
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(16, 16));
        getRootPane().setBorder(new EmptyBorder(16, 16, 16, 16));
    }

    private void construirInterfaz() {
        add(crearEncabezado(), BorderLayout.NORTH);
        add(crearContenido(), BorderLayout.CENTER);
        add(crearBarraInferior(), BorderLayout.SOUTH);
    }

    private JPanel crearEncabezado() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setOpaque(false);

        JLabel titulo = new JLabel("Formulario CRUD de Estudiantes");
        titulo.setFont(new Font("SansSerif", Font.BOLD, 24));
        titulo.setForeground(new Color(28, 42, 68));

        JLabel subtitulo = new JLabel("Registrar, actualizar, eliminar y mostrar estudiantes con ID, nombre y edad.");
        subtitulo.setForeground(new Color(85, 96, 112));

        JPanel textos = new JPanel();
        textos.setOpaque(false);
        textos.setLayout(new BoxLayout(textos, BoxLayout.Y_AXIS));
        textos.add(titulo);
        textos.add(Box.createVerticalStrut(4));
        textos.add(subtitulo);

        lblMensaje.setOpaque(true);
        lblMensaje.setBackground(new Color(240, 244, 248));
        lblMensaje.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(214, 220, 228)),
                new EmptyBorder(8, 12, 8, 12)
        ));

        panel.add(textos, BorderLayout.WEST);
        panel.add(lblMensaje, BorderLayout.SOUTH);
        panel.setBorder(new EmptyBorder(0, 0, 12, 0));
        return panel;
    }

    private JPanel crearContenido() {
        JPanel panel = new JPanel(new BorderLayout(16, 16));
        panel.setOpaque(false);
        panel.add(crearFormulario(), BorderLayout.WEST);
        panel.add(crearTabla(), BorderLayout.CENTER);
        return panel;
    }

    private JPanel crearFormulario() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setPreferredSize(new Dimension(320, 0));
        panel.setBackground(new Color(250, 252, 255));
        panel.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(218, 225, 234)),
                new EmptyBorder(18, 18, 18, 18)
        ));

        GridBagConstraints constraints = new GridBagConstraints();
        constraints.insets = new Insets(8, 8, 8, 8);
        constraints.fill = GridBagConstraints.HORIZONTAL;
        constraints.gridx = 0;
        constraints.weightx = 1.0;

        agregarCampo(panel, constraints, 0, "ID", txtId);
        agregarCampo(panel, constraints, 1, "Nombre", txtNombre);
        agregarCampo(panel, constraints, 2, "Edad", txtEdad);
        agregarBotones(panel, constraints, 3);

        return panel;
    }

    private void agregarCampo(JPanel panel, GridBagConstraints constraints, int fila, String etiqueta, JTextField campo) {
        constraints.gridy = fila * 2;
        constraints.gridwidth = 1;
        constraints.weightx = 1.0;

        JLabel label = new JLabel(etiqueta);
        label.setFont(new Font("SansSerif", Font.BOLD, 14));
        label.setForeground(new Color(44, 54, 68));
        panel.add(label, constraints);

        constraints.gridy = fila * 2 + 1;
        campo.setPreferredSize(new Dimension(240, 34));
        campo.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(198, 206, 216)),
                new EmptyBorder(6, 10, 6, 10)
        ));
        panel.add(campo, constraints);
    }

    private void agregarBotones(JPanel panel, GridBagConstraints constraints, int filaBase) {
        JPanel botones = new JPanel(new GridLayout(5, 1, 0, 8));
        botones.setOpaque(false);

        JButton btnRegistrar = crearBoton("Registrar", new Color(33, 150, 243));
        JButton btnActualizar = crearBoton("Actualizar", new Color(46, 125, 50));
        JButton btnEliminar = crearBoton("Eliminar", new Color(198, 40, 40));
        JButton btnMostrar = crearBoton("Mostrar todo", new Color(92, 107, 192));

        Dimension botonSize = new Dimension(240, 36);
        btnRegistrar.setPreferredSize(botonSize);
        btnActualizar.setPreferredSize(botonSize);
        btnEliminar.setPreferredSize(botonSize);
        btnMostrar.setPreferredSize(botonSize);

        btnRegistrar.addActionListener(e -> registrarEstudiante());
        btnActualizar.addActionListener(e -> actualizarEstudiante());
        btnEliminar.addActionListener(e -> eliminarEstudiante());
        btnMostrar.addActionListener(e -> cargarTabla());

        botones.add(btnRegistrar);
        botones.add(btnActualizar);
        botones.add(btnEliminar);
        botones.add(btnMostrar);

        constraints.gridy = filaBase * 2;
        constraints.gridwidth = 1;
        panel.add(new JLabel("Acciones"), constraints);

        constraints.gridy = filaBase * 2 + 1;
        panel.add(botones, constraints);
    }

    private JButton crearBoton(String texto, Color fondo) {
        JButton boton = new JButton(texto);
        boton.setForeground(Color.WHITE);
        boton.setFocusPainted(false);
        boton.setBorder(BorderFactory.createEmptyBorder(8, 14, 8, 14));
        boton.setBackground(fondo);
        boton.setOpaque(true);
        boton.setContentAreaFilled(true);
        boton.setBorderPainted(false);
        return boton;
    }

    private JScrollPane crearTabla() {
        tabla.setRowHeight(28);
        tabla.setSelectionBackground(new Color(210, 230, 255));
        tabla.setSelectionForeground(new Color(20, 28, 40));
        tabla.getTableHeader().setFont(new Font("SansSerif", Font.BOLD, 13));
        tabla.getTableHeader().setBackground(new Color(235, 239, 245));
        tabla.getTableHeader().setForeground(new Color(44, 54, 68));
        tabla.setFont(new Font("SansSerif", Font.PLAIN, 13));
        tabla.setFillsViewportHeight(true);
        tabla.setAutoCreateRowSorter(true);
        tabla.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && tabla.getSelectedRow() >= 0) {
                cargarSeleccionDeTabla();
            }
        });

        JScrollPane scrollPane = new JScrollPane(tabla);
        scrollPane.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createLineBorder(new Color(218, 225, 234)),
                new EmptyBorder(6, 6, 6, 6)
        ));
        return scrollPane;
    }

    private JPanel crearBarraInferior() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setOpaque(false);
        panel.setBorder(new EmptyBorder(12, 0, 0, 0));

        JLabel pie = new JLabel("Selecciona un estudiante de la tabla para cargarlo en el formulario y luego actualizar o eliminar por ID.");
        pie.setForeground(new Color(85, 96, 112));
        panel.add(pie, BorderLayout.WEST);
        return panel;
    }

    private void registrarEstudiante() {
        Integer id = leerId();
        if (id == null) {
            return;
        }
        Integer edad = leerEdad();
        if (edad == null) {
            return;
        }

        String mensaje = control.agregarEstudiante(id, texto(txtNombre), edad);
        mostrarMensaje(mensaje, mensaje.contains("correctamente") ? new Color(46, 125, 50) : new Color(198, 40, 40));
        if (mensaje.contains("correctamente")) {
            cargarTabla();
            limpiarCampos();
        }
    }

    private void actualizarEstudiante() {
        Integer id = leerId();
        if (id == null) {
            return;
        }
        Integer edad = leerEdad();
        if (edad == null) {
            return;
        }

        String mensaje = control.actualizarEstudiante(id, texto(txtNombre), edad);
        mostrarMensaje(mensaje, mensaje.contains("correctamente") ? new Color(46, 125, 50) : new Color(198, 40, 40));
        if (mensaje.contains("correctamente")) {
            cargarTabla();
        }
    }

    private void eliminarEstudiante() {
        Integer id = leerId();
        if (id == null) {
            return;
        }

        int respuesta = JOptionPane.showConfirmDialog(
                this,
                "¿Deseas eliminar el estudiante con ID " + id + "?",
                "Confirmar eliminación",
                JOptionPane.YES_NO_OPTION,
                JOptionPane.WARNING_MESSAGE
        );

        if (respuesta != JOptionPane.YES_OPTION) {
            return;
        }

        String mensaje = control.eliminarEstudiante(id);
        mostrarMensaje(mensaje, mensaje.contains("correctamente") ? new Color(46, 125, 50) : new Color(198, 40, 40));
        if (mensaje.contains("correctamente")) {
            cargarTabla();
            limpiarCampos();
        }
    }

    private void cargarTabla() {
        tableModel.setRowCount(0);
        List<Estudiante> estudiantes = control.mostrarTodos();
        for (Estudiante estudiante : estudiantes) {
            tableModel.addRow(new Object[]{estudiante.getId(), estudiante.getNombre(), estudiante.getEdad()});
        }
        mostrarMensaje("Se cargaron " + estudiantes.size() + " estudiante(s).", new Color(33, 150, 243));
    }

    private void cargarSeleccionDeTabla() {
        int filaVista = tabla.getSelectedRow();
        int filaModelo = tabla.convertRowIndexToModel(filaVista);
        txtId.setText(String.valueOf(tableModel.getValueAt(filaModelo, 0)));
        txtNombre.setText(String.valueOf(tableModel.getValueAt(filaModelo, 1)));
        txtEdad.setText(String.valueOf(tableModel.getValueAt(filaModelo, 2)));
        mostrarMensaje("Estudiante cargado desde la tabla.", new Color(92, 107, 192));
    }

    private Integer leerId() {
        String textoId = texto(txtId);
        if (textoId.isBlank()) {
            mostrarMensaje("El ID es obligatorio.", new Color(198, 40, 40));
            return null;
        }

        try {
            return Integer.parseInt(textoId);
        } catch (NumberFormatException ex) {
            mostrarMensaje("El ID debe ser un número entero.", new Color(198, 40, 40));
            return null;
        }
    }

    private void limpiarCampos() {
        txtId.setText("");
        txtNombre.setText("");
        txtEdad.setText("");
        txtId.requestFocusInWindow();
    }

    private Integer leerEdad() {
        String textoEdad = texto(txtEdad);
        if (textoEdad.isBlank()) {
            mostrarMensaje("La edad es obligatoria.", new Color(198, 40, 40));
            return null;
        }

        try {
            return Integer.parseInt(textoEdad);
        } catch (NumberFormatException ex) {
            mostrarMensaje("La edad debe ser un número entero.", new Color(198, 40, 40));
            return null;
        }
    }

    private String texto(JTextField campo) {
        return campo.getText() == null ? "" : campo.getText().trim();
    }

    private void mostrarMensaje(String mensaje, Color color) {
        lblMensaje.setText(mensaje);
        lblMensaje.setForeground(color);
    }
}