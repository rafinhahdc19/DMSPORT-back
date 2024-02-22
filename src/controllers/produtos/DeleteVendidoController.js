const prisma = require("../../services/prisma");

const DeleteVendidoController = async (req, res) => {
    const { slug } = req.body
    if(!slug){
        return res.status(400).json({ error: 'Parametros inválidos' });
    }
    try{
        const response = await prisma.Vendido.findUnique({
            where:{
                produtoslug:slug
            }
        })
        if(!response){
            return res.status(400).json({ error: 'O produto não está fixado' });
        }else{
            const vendido = await prisma.Vendido.delete({
                where:{
                    produtoslug:slug
                }
            })
            return res.status(200).json({msg:"O produto foi desfixado"});
        }
    }catch(err){
        console.error('Erro ao desfixar o produto:', err);
        res.status(500).json({ error: 'Ocorreu um erro ao desfixar o produto'});
    }
}

module.exports = DeleteVendidoController