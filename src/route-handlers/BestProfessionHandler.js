const { Profile } = require('../model');
const BasicRouteHandler = require('./BasicRouteHandler');

class BestProfessionHandler  extends BasicRouteHandler {
    async handleRequest(req,res){
        const {Job, Contract } = req.app.get('models');
        const sequelize = req.app.get('sequelize');
        const start = new Date(req.query.start);
        const end = new Date(req.query.end);

        if(isNaN(start.getTime())) return res.status(400).send("Invalid Start Date");
        if(isNaN(end.getTime())) return res.status(400).send("Invalid End Date");
        if(start.getTime() > end.getTime()) return res.status(400).send("Invalid Date Range");

        const resp = await Job.findOne({
            attributes: [
              [sequelize.fn('sum', sequelize.col('price')), 'total_amount'],
            ],
            where: {
              paid: true
            },
            include: [{
                // Necessary for Sequelize to assemble the object tree: job.Contract.Contractor
                attributes:['id'], 
                model: Contract,
                required: true,
                include: {
                    attributes:['profession'],
                    model: Profile,
                    as: "Contractor",
                    required: true,
              }
            }],
            group: [sequelize.col('profession')],
            order: [[sequelize.col('total_amount'),'desc']]
        });

        return res.status(200).send({
            profession: resp.Contract.Contractor.profession
        });
    }
}

// Singleton
const bestProfessionHandler = new BestProfessionHandler();
module.exports = bestProfessionHandler;