const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    console.log(req.cookies);
    try {
        const token = req.body.token || req.query.token || req.params.token || req.cookies.token;

        if (!token) {
            throw new Error('Token not found.');
        }
        const verifiedToken = await jwt.verify(token, 'yourSecretKey');
        req.userId = verifiedToken._id
        next();
    } catch (error) {
        res.status(401).send('Authentication failed: ' + error.message);
    }
};

module.exports = verifyToken;
