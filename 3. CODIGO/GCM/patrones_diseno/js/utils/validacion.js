/**
 * Capa de Utilidades: Funciones de Validación
 * Contiene lógica reutilizable para validaciones complejas.
 */

/**
 * Valida una cédula ecuatoriana.
 * @param {string} cedula La cédula a validar.
 * @returns {boolean} True si la cédula es válida, false en caso contrario.
 */
function validarCedulaEcuatoriana(cedula) {
    if (typeof cedula !== 'string' || cedula.length !== 10 || !/^\d+$/.test(cedula)) {
        return false;
    }

    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
        return false;
    }

    const tercerDigito = parseInt(cedula[2]);
    if (tercerDigito < 0 || tercerDigito > 5) {
        return false;
    }

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let producto = parseInt(cedula[i]) * coeficientes[i];
        if (producto >= 10) {
            producto -= 9;
        }
        suma += producto;
    }

    const digitoVerificadorCalculado = (suma % 10 === 0) ? 0 : 10 - (suma % 10);
    const digitoVerificadorReal = parseInt(cedula[9]);

    return digitoVerificadorCalculado === digitoVerificadorReal;
}

/**
 * Valida un número de teléfono celular ecuatoriano.
 * @param {string} telefono El número de teléfono.
 * @returns {boolean} True si es válido, false en caso contrario.
 */
function validarTelefonoEcuatoriano(telefono) {
    if (typeof telefono !== 'string') {
        return false;
    }

    telefono = telefono.trim();

    // Debe tener exactamente 10 dígitos y comenzar con 09
    return /^09\d{8}$/.test(telefono);
}

if (typeof module !== "undefined") {

    module.exports = {

        validarCedulaEcuatoriana,

        validarTelefonoEcuatoriano

    };

}