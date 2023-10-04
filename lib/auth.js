// lets verify the token 

const jwt = require('jsonwebtoken');

const verifyToken = (token, secretKey) => {
    try {
        const decoded = jwt.verify(token, secretKey);
        return decoded.userId;
    } catch (error) {
        return null;
    }
}


module.exports = {
    verifyToken
}
