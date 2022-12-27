const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model');
const {getProfile} = require('./middleware/getProfile');
const PingHandler = require("./route-handlers/PingHandler");
const GetNonTerminatedContractsHandler = require("./route-handlers/GetNonTerminatedContractsHandler");
const ContractByIdHandler = require("./route-handlers/ContractByIdHandler");

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

// So external tools can monitore if the backend is alive.
app.get("/ping", PingHandler);
app.get("/contracts", getProfile, GetNonTerminatedContractsHandler);
app.get('/contracts/:id', getProfile, ContractByIdHandler);

module.exports = app;
