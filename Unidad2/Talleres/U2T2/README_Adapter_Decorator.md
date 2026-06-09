# Adapter y Decorator en CRUD de Estudiantes

Este proyecto aplica dos patrones estructurales sobre el CRUD del estudiante:

## Adapter

- Clase adaptada: `datos.FuenteExternaEstudiantes`
- Adaptador: `datos.AdaptadorEstudianteExterno`
- Contrato objetivo: `datos.ILectorDatos`

La fuente externa entrega registros con los campos `codigo`, `nombreCompleto` y `anios`. El adaptador convierte esos datos al modelo interno `datos.Estudiante` con `id`, `nombre` y `edad`.

## Decorator

- Componente: `logica_de_negocio.IServicioEstudiante`
- Componente base: `logica_de_negocio.ServicioEstudianteBase`
- Decorador: `logica_de_negocio.ServicioEstudianteDecorator`
- Decorador concreto: `logica_de_negocio.AuditoriaDecorator`

El decorador agrega auditoría al momento de guardar un estudiante sin modificar la clase base del servicio.

## Evidencia funcional

- Al registrar un estudiante desde la interfaz, el decorador escribe una línea de auditoría en consola.
- Al usar el botón `Cargar externos`, el adaptador convierte tres registros de ejemplo al formato interno y los incorpora al CRUD.

## Justificación técnica

- Adapter reduce el acoplamiento con formatos externos y permite incorporar nuevas fuentes sin tocar el modelo interno.
- Decorator permite extender el comportamiento del servicio con auditoría manteniendo la responsabilidad original intacta.
- Ambos patrones respetan la separación por capas y mejoran mantenibilidad y extensibilidad.