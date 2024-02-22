const prisma = require("../../services/prisma")

const SearchProductsController = async (req, res) => {
  const { Search, page } = req.body

  if (isNaN(page)) {
    return res.status(400).json({ error: 'A página deve ser um número.' });
  }

  if (typeof page !== 'undefined' && parseInt(page) <= 0) {
    return res.status(400).json({ error: 'A página deve ser maior que zero.' });
  }

  const itensPerPage = 24;
  let skipCount = 0;

  if (page > 1) {
    skipCount = (page - 1) * itensPerPage;
  }

  if (!Search || Search === "") {
    if (page == 1) {
      try {
        const vendidoIds = await prisma.Vendido.findMany({
          select: {
            produtoslug: true
          }
        });

        // Extrair os IDs de vendidoIds para uma array
        const slugs = vendidoIds.map(vendido => vendido.produtoslug);

        // Obtendo todos os produtos relacionados aos IDs da tabela Vendido
        const produtosRelacionados = await prisma.Produto.findMany({
          where: {
            slug: {
              in: slugs
            }
          }
        });
        const products = await prisma.Produto.findMany({
          skip: skipCount,
          take: itensPerPage,
        });
        const response = {
          vendido: produtosRelacionados.reverse(),
          products: products
        };
        return res.status(200).json(response);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return res.status(500).json({ error: 'Ocorreu um erro ao buscar produtos.' });
      }
    } else {
      try {
        const products = await prisma.Produto.findMany({
          skip: skipCount,
          take: itensPerPage,
        });

        return res.status(200).json({ products: products });
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return res.status(500).json({ error: 'Ocorreu um erro ao buscar produtos.' });
      }
    }

  }

  try {
    const products = await prisma.Produto.findMany({
      skip: skipCount,
      take: itensPerPage,
      where: {
        OR: [
          {
            nome: {
              contains: Search,
              mode: 'insensitive'
            }
          },
          {
            desc: {
              contains: Search,
              mode: 'insensitive'
            }
          }
        ]
      },
    });

    return res.status(200).json({ products: products });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({ error: 'Ocorreu um erro ao buscar produtos.' });
  }
}

module.exports = SearchProductsController