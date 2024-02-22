const prisma = require("../../services/prisma");

const VerifyCupomController = async (req, res) => {
    const { codigo } = req.body;

    if (!codigo) {
        return res.status(401).json({ msg: "Parâmetros inválidos" });
    }

    const cupom = await prisma.Cupom.findUnique({
        where: {
            codigo: codigo
        }
    });

    if (cupom) {
        return res.status(200).json({ msg: "O código do cupom existe", desconto:cupom.desconto });
    }else{
        return res.status(403).json({ msg: "O código do cupom não existe" });
    }
}

module.exports = VerifyCupomController;
