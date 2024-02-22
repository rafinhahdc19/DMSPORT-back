const jwt = require('jsonwebtoken');
const auth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Token não encontrado. Acesso não autorizado.' });
    }
    const bearer = token.split(" ");
    const bearerToken = bearer[1]

    jwt.verify(bearerToken, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido. Acesso não autorizado.' });
        }
        req.userId = decoded;
        console.log(decoded)
        next();
    });
};

module.exports = auth;