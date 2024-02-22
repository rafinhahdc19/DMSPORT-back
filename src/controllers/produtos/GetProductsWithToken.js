const prisma = require("../../services/prisma");

const GetProductsWithToken = async (req, res) => {
    const { slug } = req.body
    if(!slug){
        return res.status(401).json({ error: 'Parâmetros inválidos.' });
    }
    try{
        const purchase = await prisma.Link.findUnique({
            where:{
                slug:slug
            }
        })
        if(purchase){
            return res.status(200).json({purchase:purchase.purchase})
        }else{
            return res.status(500).json({ error: 'Token expirado ou inexistente.' });
        }
    }catch(err){
        console.error('Erro ao buscar produtos:', err);
        return res.status(500).json({ error: 'Ocorreu um erro ao buscar produtos.' });
    }
}
module.exports = GetProductsWithToken