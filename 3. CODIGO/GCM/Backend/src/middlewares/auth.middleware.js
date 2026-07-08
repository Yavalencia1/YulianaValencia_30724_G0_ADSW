const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            ok: false,
            error: "Acceso no autorizado. Token no proporcionado."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            ok: false,
            error: "Acceso no autorizado. Token inválido o expirado."
        });
    }
};

// Opcional: Middleware para restringir por roles si se implementa control a nivel de API.
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // En una app real, el token JWT contendría el rol, o se consultaría en base de datos.
        // Asumiendo que req.user puede contener el rol en un futuro, de lo contrario pasamos.
        if (!req.user) {
            return res.status(401).json({ ok: false, error: "No autenticado." });
        }
        
        // Si el rol no está en la lista de roles permitidos
        if (roles.length && !roles.includes(req.user.rol)) {
            return res.status(403).json({
                ok: false,
                error: `Acceso prohibido. Requiere uno de los siguientes roles: ${roles.join(", ")}`
            });
        }
        next();
    };
};

module.exports = {
    authMiddleware,
    authorizeRoles
};
