const jwt = require('jsonwebtoken');

export async function isAuthenticated(req, res, next) {
    const token = req.headers['authorization'].split(' ')[1];
    if (!token) {
        return res.status(401).json({
            message: 'No token provided',
        });
    }

    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: 'Invalid token',
            });
        } else {
            req.user = decoded;
            next();
        }
    });
}