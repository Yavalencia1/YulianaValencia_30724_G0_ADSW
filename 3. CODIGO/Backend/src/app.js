const express = require("express");
const cors = require("cors");

const testRoutes = require("./routes/test.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", testRoutes);

app.get("/", (req,res)=>{

    res.json({

        mensaje:"API funcionando"

    });

});

module.exports = app;