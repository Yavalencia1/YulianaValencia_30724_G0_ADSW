/**
 * Utilidades de Validación para el Backend
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

    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || provincia > 24) {
        return false;
    }

    const tercerDigito = parseInt(cedula[2], 10);
    if (tercerDigito < 0 || tercerDigito > 5) {
        return false;
    }

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
        let producto = parseInt(cedula[i], 10) * coeficientes[i];
        if (producto >= 10) {
            producto -= 9;
        }
        suma += producto;
    }

    const digitoVerificadorCalculado = (suma % 10 === 0) ? 0 : 10 - (suma % 10);
    const digitoVerificadorReal = parseInt(cedula[9], 10);

    return digitoVerificadorCalculado === digitoVerificadorReal;
}

/**
 * Valida un número de teléfono celular ecuatoriano (09 seguido de 8 dígitos).
 * @param {string} telefono El teléfono a validar.
 * @returns {boolean} True si es válido, false en caso contrario.
 */
function validarTelefonoEcuatoriano(telefono) {
    if (typeof telefono !== 'string') {
        return false;
    }
    telefono = telefono.trim();
    return /^09\d{8}$/.test(telefono);
}

/**
 * Calcula la edad a partir de la fecha de nacimiento.
 * @param {string|Date} fechaNacimiento La fecha de nacimiento.
 * @returns {number} La edad calculada.
 */
function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const cumpleanos = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - cumpleanos.getFullYear();
    const m = hoy.getMonth() - cumpleanos.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }
    return edad;
}

/**
 * Valida si la edad está en el rango permitido (18 - 100 años).
 * @param {string|Date} fechaNacimiento La fecha de nacimiento.
 * @returns {boolean} True si la edad está permitida, false en caso contrario.
 */
function validarEdadPermitida(fechaNacimiento) {
    const edad = calcularEdad(fechaNacimiento);
    return edad >= 18 && edad <= 100;
}

module.exports = {
    validarCedulaEcuatoriana,
    validarTelefonoEcuatoriano,
    calcularEdad,
    validarEdadPermitida
};
