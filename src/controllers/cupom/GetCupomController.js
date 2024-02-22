const prisma = require("../../services/prisma");

const GetCupomController = async (req, res) => {
    const { page } = req.body;

    const itemsPerPage = 30; // Número de itens por página
    const currentPage = parseInt(page) || 1; // Página atual, padrão é 1

    try {
        // Consulta paginada ao banco de dados para obter os cupons
        const cupons = await prisma.Cupom.findMany({
            skip: (currentPage - 1) * itemsPerPage, // Ignora os cupons das páginas anteriores
            take: itemsPerPage // Número de cupons por página
        });

        return res.status(200).json(cupons);
    } catch (error) {
        console.error('Erro ao obter os cupons:', error);
        return res.status(500).json({ error: 'Erro ao obter os cupons' });
    }
};

module.exports = GetCupomController;

