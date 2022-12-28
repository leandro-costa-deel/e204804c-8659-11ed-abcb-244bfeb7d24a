// In a typescript project, I would use a abstract class.
class BasicRouteHandler {
    constructor(){
        this.handler = this.handler.bind(this);
    }

    async handler(req, res) {
        try {
            await this.handleRequest(req, res);
        } catch(error) {
            console.error('error:', error);
            return res.status(500).send(''+error);
        }
    }

    async handleRequest(_req, _res) {
        throw new Error("Subclass must Implement handleRequest");
    }
}

module.exports = BasicRouteHandler;