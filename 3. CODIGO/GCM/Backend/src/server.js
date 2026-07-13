require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("Advertencia: SMTP no está configurado. El registro funcionará, pero no se enviarán credenciales por correo hasta completar las variables SMTP en .env.");
}

app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("Servidor iniciado");
    console.log("Puerto:", PORT);
    console.log("--------------------------------");
});