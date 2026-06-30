const express = require("express");

const prisma = require("../config/prisma");

const router = express.Router();

router.get("/db", async (req, res) => {

    try {

        await prisma.$connect();

        res.json({
            ok:true,
            mensaje:"Conectado correctamente"
        });

    } catch(error){

        res.status(500).json(error);

    }

});

module.exports = router;