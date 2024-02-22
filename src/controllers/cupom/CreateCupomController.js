const prisma = require("../../services/prisma");

const CreateCupomController = async (req, res) => {
    const { codigo, desconto } = req.body;

    if (!codigo || !Number.isInteger(desconto) || !desconto || desconto > 100 || desconto <= 0) {
        return res.status(401).json({ msg: "Parâmetros inválidos" });
    }

    const cupom = await prisma.Cupom.findUnique({
        where: {
            codigo: codigo
        }
    });

    if (cupom) {
        return res.status(403).json({ msg: "O código do cupom já existe" });
    }

    try {
        const newCupom = await prisma.Cupom.create({
            data: {
                codigo: codigo,
                desconto: desconto
            }
        });

        return res.status(201).json({ msg: "Cupom criado com sucesso" });
    } catch (err) {
        return res.status(401).json({ error: 'Erro ao criar o cupom' });
    }
}

module.exports = CreateCupomController;
