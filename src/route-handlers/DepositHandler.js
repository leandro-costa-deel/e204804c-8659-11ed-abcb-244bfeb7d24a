const BasicRouteHandler = require('./BasicRouteHandler');

class DepositHandler  extends BasicRouteHandler {
    async handleRequest(req,res){
        const {Profile, Job } = req.app.get('models');
        const {userId} = req.params;
        const ammount  = Number.parseFloat(req.body.ammount);
        const profile = await Profile.findOne({
            attributes: ['id','balance'],
            where: {
                id: userId
            }
        });
        if(!profile) return res.status(404).end();
        if(isNaN(Number.parseFloat(ammount))) return res.status(400).send(`Invalid Ammount`);
        if(ammount <=0) return res.status(400).send(`Invalid Ammount`);

        // We should probably have some check to see who can do deposits.
        // As there's nothing specified on the task, I will leave it open.
        // So anyone logged in can do the deposits. 
        // We would need some sort of admin role, or finance role probably.


        // todo: get sum os all jobs to pay.
        const totalAmmountToPay = await profile.getTotalAmmountToPay();
        if(ammount > totalAmmountToPay*0.25) return res.status(400).send(`Deposit Ammount Over 25% of Total Ammount to Pay`);

        profile.balance += ammount;
        await profile.save();
        res.json(profile);
    }
}

// Singleton
const depositHandler = new DepositHandler();
module.exports = depositHandler;