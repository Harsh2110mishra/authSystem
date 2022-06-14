const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    // First it will check whether there is a token in cookie or in header

    if (
      req.cookies.authCookie === undefined &&
      req.header("token") === undefined
    ) {
      return res.status(403).send("You are not registered or signed.");
    }
    // If there a token exist in any of the one them
    
    const token =
      req.cookies.authCookie ||
      req.body.token ||
        req.header("token").replace("Bearer", ""); 
    if (!token) {
        return res.status(403).send('token is missing');
    }
    try {
        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        console.log("decode", decode);
        req.user=decode
    } catch (error) {
        console.log(error)
        return res.status(401).send('Invalid Token')
    }
    return next()
}

module.exports = auth;