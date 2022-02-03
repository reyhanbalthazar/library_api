const jwt = require("jsonwebtoken");
const Crypto = require('crypto');

module.exports = {
    hashPassword: (pass) => {
        return Crypto.createHmac("sha256", process.env.TOKEN_KEY).update(pass).digest("hex");
    },
    createToken: (payload) => {
        return jwt.sign(payload, process.env.TOKEN_KEY, {
            expiresIn:"12h"
        })
    },
    readToken: (req, res, next) =>{
        jwt.verify(req.token, process.env.TOKEN_KEY, (err, decode) => {
            if(err) {
                res.status(401).send({
                    message:"User Not Authorization ❌",
                    success: false,
                    error: err
                })
            }

            req.dataUser = decode

            next()
        })
    }
}