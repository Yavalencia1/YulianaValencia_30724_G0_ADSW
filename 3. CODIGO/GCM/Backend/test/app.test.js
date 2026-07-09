const request = require("supertest");
const app = require("../src/app");

describe("API", () => {

    test("GET / debe responder correctamente", async () => {

        const res = await request(app).get("/");

        expect(res.statusCode).toBe(200);

        expect(res.body).toEqual({
            mensaje: "API del Sistema de Mantenimientos funcionando"
        });

    });

});