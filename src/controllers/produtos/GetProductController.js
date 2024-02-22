const prisma = require("../../services/prisma");

const GetProductController = async (req, res) => {
  const { slug } = req.body;

  if (!slug) {
    return res.status(401).json({ error: 'parâmetro inválido' });
  }

  try {
    const products = await prisma.Produto.findFirst({
      where: {
        slug: slug
      },
      include: {
        tipos: true,
      },
    });
    if (!products) {
      console.error('O produto não existe');
      return res.status(500).json({ error: 'O produto não existe' });
    } else {
      const vendido = await prisma.Vendido.findFirst({
        where: {
          produtoslug: products.slug
        }
      })
      const vendidoExiste = vendido !== null;
      products.fixado = vendidoExiste
      return res.status(200).json(products);
    }

  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return res.status(500).json({ error: 'Ocorreu um erro ao buscar produto.' });
  }
};

module.exports = GetProductController