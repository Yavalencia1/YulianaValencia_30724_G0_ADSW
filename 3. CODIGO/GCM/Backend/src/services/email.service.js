const nodemailer = require("nodemailer");

class EmailService {
    constructor() {
        this.transporter = null;
    }

    resolveSmtpConfig() {
        const provider = String(process.env.SMTP_PROVIDER || "").trim().toLowerCase();
        const hostByProvider = {
            gmail: "smtp.gmail.com",
            hotmail: "smtp-mail.outlook.com",
            outlook: "smtp-mail.outlook.com"
        };

        const defaultHost = hostByProvider[provider] || process.env.SMTP_HOST;
        const defaultPort = provider === "gmail" ? 587 : 587;
        const defaultSecure = provider === "gmail" ? false : false;

        return {
            provider,
            host: defaultHost,
            port: Number(process.env.SMTP_PORT || defaultPort),
            secure: String(process.env.SMTP_SECURE ?? defaultSecure).toLowerCase() === "true",
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
            from: process.env.SMTP_FROM || process.env.SMTP_USER
        };
    }

    getTransporter() {
        if (this.transporter) {
            return this.transporter;
        }

        const smtpConfig = this.resolveSmtpConfig();
        const { host, port, secure, user, pass } = smtpConfig;

        if (!host || !user || !pass) {
            throw new Error(
                "Falta configurar SMTP_PROVIDER o SMTP_HOST, junto con SMTP_USER y SMTP_PASS, en el archivo .env."
            );
        }

        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass
            }
        });

        return this.transporter;
    }

    async sendCredentialsEmail({ to, nombre, usuario, password, rol }) {
        if (!to) {
            throw new Error("El correo destino es obligatorio.");
        }

        const { from } = this.resolveSmtpConfig();
        if (!from) {
            throw new Error("Falta configurar SMTP_FROM o SMTP_USER para el remitente.");
        }

        const transporter = this.getTransporter();
        const subject = "Credenciales de acceso al sistema";
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
                <h2>Bienvenido${nombre ? `, ${nombre}` : ""}</h2>
                <p>Tu cuenta en el sistema de mantenimientos ha sido creada correctamente.</p>
                <p><strong>Rol:</strong> ${rol || "Usuario"}</p>
                <p><strong>Usuario:</strong> ${usuario}</p>
                <p><strong>Contraseña temporal:</strong> ${password}</p>
                <p>Te recomendamos cambiar la contraseña apenas ingreses al sistema.</p>
            </div>
        `;

        await transporter.sendMail({
            from,
            to,
            subject,
            html
        });

        return true;
    }
}

module.exports = new EmailService();