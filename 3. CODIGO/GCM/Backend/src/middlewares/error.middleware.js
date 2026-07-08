const errorMiddleware = (err, req, res, next) => {
    console.error("--------------------------------");
    console.error("ERROR DETECTADO POR EL MIDDLEWARE:");
    console.error(err.message || err);
    console.error(err.stack || "");
    console.error("--------------------------------");

    const status = err.status || 500;
    const message = err.message || "Ha ocurrido un error interno en el servidor.";

    res.status(status).json({
        ok: false,
        error: message
    });
};

module.exports = errorMiddleware;
