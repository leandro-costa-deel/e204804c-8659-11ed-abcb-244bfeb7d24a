const { Profile } = require('../model');
const BasicRouteHandler = require('./BasicRouteHandler');

class BestClientsHandler  extends BasicRouteHandler {
    async handleRequest(req,res){
        const {Job, Contract } = req.app.get('models');
        const sequelize = req.app.get('sequelize');
        const start = new Date(req.query.start);
        const end = new Date(req.query.end);
        const limit = req.query.limit ? Number.parseInt(req.query.limit) : 2;

        if(isNaN(start.getTime())) return res.status(400).send("Invalid Start Date");
        if(isNaN(end.getTime())) return res.status(400).send("Invalid End Date");
        if(start.getTime() > end.getTime()) return res.status(400).send("Invalid Date Range");
        if(isNaN(limit)) return res.status(400).send("Invalid Limit");
        if(limit <=0) return res.status(400).send("Invalid Limit");

        const resp = await Job.findAll({
            attributes: [
              [sequelize.fn('sum', sequelize.col('price')), 'paid'],
            ],
            where: {
              paid: true
            },
            limit,
            include: [{
                // Necessary for Sequelize to assemble the object tree: job.Contract.Contractor
                attributes:['id'], 
                model: Contract,
                required: true,
                include: {
                    attributes:['id','firstName', 'lastName'],
                    model: Profile,
                    as: "Contractor",
                    required: true,
              }
            }],
            group: [sequelize.col('profession')],
            order: [[sequelize.col('paid'),'desc']]
        });

        const bestClients = resp.map( job => {
          return {
            "id": job.Contract.Contractor.id,
            "fullName": job.Contract.Contractor.fullName,
            "paid" : job.dataValues.paid
          }
        });
        return res.status(200).send(bestClients);
    }
}

// Singleton
const bestClientsHandler = new BestClientsHandler();
module.exports = bestClientsHandler;