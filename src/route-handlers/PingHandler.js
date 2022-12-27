module.exports = function PingHandler(_req, res) {
    return res.status(200).send("pong");
}