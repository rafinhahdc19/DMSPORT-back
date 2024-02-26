const prisma = require("../../services/prisma")
const puppeteer = require('puppeteer')

const SearchProductsController = async (req, res) => {
  let { Search, page } = req.body

    const enToPt = [
      {
        "term": "holanda",
        "subs": "netherlands"
      },
      {
        "term": "frança",
        "subs": "france"
      },
      {
        "term": "franca",
        "subs": "france"
      },
      {
        "term": "alemanha",
        "subs": "germany"
      },
      {
        "term": "espanha",
        "subs": "spain"
      },
      {
        "term": "italia",
        "subs": "italy"
      },
      {
        "term": "inglaterra",
        "subs": "england"
      },
      {
        "term": "méxico",
        "subs": "mexico"
      },
      {
        "term": "portugal",
        "subs": "portugal"
      },
      {
        "term": "argentina",
        "subs": "argentina"
      },
      {
        "term": "brasil",
        "subs": "brazil"
      },
      {
        "term": "suécia",
        "subs": "sweden"
      },
      {
        "term": "suecia",
        "subs": "sweden"
      },
      {
        "term": "noruega",
        "subs": "norway"
      },
      {
        "term": "dinamarca",
        "subs": "denmark"
      },
      {
        "term": "suíça",
        "subs": "switzerland"
      },
      {
        "term": "suiça",
        "subs": "switzerland"
      },
      {
        "term": "austrália",
        "subs": "australia"
      },
      {
        "term": "japão",
        "subs": "japan"
      },
      {
        "term": "japao",
        "subs": "japan"
      }
    ];
  
  if (Search) {
    const searchTerm = Search.toLowerCase();
    const matchingSubs = enToPt.find(item => item.term === searchTerm);
  
    if (matchingSubs) {
      Search = matchingSubs.subs;
    }
  }

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