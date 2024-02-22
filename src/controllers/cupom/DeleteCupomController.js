const prisma = require("../../services/prisma");

const DeleteCupomController = async (req, res) => {
    const { codigo } = req.body;

    if (!codigo) {
        return res.status(401).json({ msg: "Parâmetros inválidos" });
    }

    const cupom = await prisma.Cupom.findUnique({
        where: {
            codigo: codigo
        }
    });

    if (!cupom) {
        return res.status(403).json({ msg: "O código do cupom não existe" });
    }

    try {
        const newCupom = await prisma.Cupom.delete({
            where:{
                codigo:codigo
            }
        });

        return res.status(200).json({ msg: "Cupom apagado com sucesso" });
    } catch (err) {
        return res.status(401).json({ error: 'Erro ao apagar o cupom' });
    }
}

module.exports = DeleteCupomController;
