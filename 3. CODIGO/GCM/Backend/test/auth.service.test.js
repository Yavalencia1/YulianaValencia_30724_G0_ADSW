const authService = require("../src/services/auth.service");

const usuarioRepository = require("../src/repositories/usuario.repository");
const clienteRepository = require("../src/repositories/cliente.repository");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../src/repositories/usuario.repository");
jest.mock("../src/repositories/cliente.repository");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("AuthService", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

});