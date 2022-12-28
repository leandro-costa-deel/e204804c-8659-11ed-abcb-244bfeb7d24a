const express = require('express');
const bodyParser = require('body-parser');
const {sequelize, Op} = require('./model');
const {getProfile} = require('./middleware/getProfile');
const PingHandler = require("./route-handlers/PingHandler");
const getNonTerminatedContractsHandler = require("./route-handlers/GetNonTerminatedContractsHandler");
const GetUnpaidJobsForActiveContractsHandler = require('./route-handlers/GetUnpaidJobsForActiveContractsHandler');
const contractByIdHandler = require("./route-handlers/ContractByIdHandler");

const app = express();
app.use(bodyParser.json());
app.set('Op', Op);
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

console.log("contractByIdHandler:", contractByIdHandler);

// So external tools can monitore if the backend is alive.
app.get("/ping", PingHandler);
app.get("/contracts", getProfile, getNonTerminatedContractsHandler.handler);
app.get('/contracts/:id', getProfile, contractByIdHandler.handler);
app.get('/jobs/unpaid', getProfile, GetUnpaidJobsForActiveContractsHandler);

module.exports = app;
