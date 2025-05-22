const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.AUDIENCE);

async function verifyToken(req, res, next) {
    try{
        const token = req.headers.authorization.split(' ')[1];
        if(!token || token === undefined){
            return res.status(401).json({error:'Invalid token'});
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.AUDIENCE,  
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        const timestamp = payload.exp;
        const expirationDate = new Date(timestamp*1000);
        const now = new Date();

        if(expirationDate < now){
            return res.status(401).json({error:'Token expirado'});
        }

        req.user = payload;
        next();
    }catch(error){
        return res.status(401).json({error:'Erro na verificação do Token'});

    }
}

module.exports = verifyToken