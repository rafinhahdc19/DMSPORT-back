const prisma = require("../../services/prisma");

const NewVendidoController = async (req, res) => {
    const { slug } = req.body;
    if (!slug) {
        return res.status(400).json({ error: 'Parâmetros inválidos' });
    }

    try {
        // Verificar se o produto existe
        const produto = await prisma.Produto.findUnique({
            where: {
                slug: slug
            }
        });

        if (!produto) {
            return res.status(400).json({ error: 'O produto não existe' });
        }

        // Contar o número de produtos fixados
        const countVendidos = await prisma.Vendido.count();

        // Verificar se o número de produtos fixados atingiu o limite de 20
        if (countVendidos >= 20) {
            return res.status(400).json({ error: 'Limite de produtos fixados atingido' });
        }

        // Verificar se o produto já está fixado
        const vendidoExistente = await prisma.Vendido.findUnique({
            where: {
                produtoslug: slug
            }
        });

        if (vendidoExistente) {
            return res.status(400).json({ error: 'O produto já está fixado' });
        }

        // Criar um novo produto fixado
        const vendido = await prisma.Vendido.create({
            data: {
                produtoslug: slug
            }
        });

        return res.status(201).json({ vendido });
    } catch (err) {
        console.error('Erro ao fixar o produto:', err);
        return res.status(500).json({ error: 'Ocorreu um erro ao fixar o produto' });
    }
};

module.exports = NewVendidoController