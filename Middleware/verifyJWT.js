const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next)=> {
    const accessToken = req.headers.authorization? req.headers.authorization.split(' ')[1] : null;
    console.log(accessToken);

    if(!accessToken){
        res.status(401).send({message: 'Access denied. Token missing.'})
    }

    jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded)=>{
        if(err){
            res.status(403).send({message: 'Unauthorized access'})
        }
        req.decoded = decoded
        next()
    })


}

module.exports = verifyToken