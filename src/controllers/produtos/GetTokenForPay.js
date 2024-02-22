const crypto = require('crypto');
const base64url = require('base64-url');
const uuid = require('uuid');
const prisma = require("../../services/prisma")

const deleteOldLinks = async () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
    try {
      const deletedLinks = await prisma.link.deleteMany({
        where: {
          data: {
            lt: oneMonthAgo,
          },
        },
      });
  
      console.log(`${deletedLinks.count} links foram apagados.`);
    } catch (error) {
      console.error('Erro ao apagar links antigos:', error);
    }
  };

  const GetTokenForPay = async (req, res) => {
    const { purchase } = req.body;

    if (!purchase || !purchase.produtos) {
        console.log(purchase)
        return res.status(401).json({ error: "Parâmetros inválidos." });
    }

    let cupom;
    const { produtos } = purchase;

    if (purchase.cupom && purchase.cupom !== "") {
        cupom = purchase.cupom;
    }

    for (const produto of purchase.produtos) {
        if (
            !produto.slug || 
            typeof produto.slug !== "string" ||
            !produto.hasOwnProperty("quantity") ||
            typeof produto.quantity !== "number" ||
            (produto.tipo && typeof produto.tipo !== "string")
        ) {
            return res.status(401).json({ error: "Estrutura de produtos inválida." });
        }
    }

    try {
        if (cupom) {
            const cupomFromDb = await prisma.Cupom.findUnique({
                where: {
                    codigo: cupom
                }
            });
            if (!cupomFromDb) {
                return res.status(401).json({ error: "Cupom inválido." });
            }
        }
        const slugValues = produtos.map((item) => item.slug);
        const itensFromDB = await prisma.Produto.findMany({
            where: {
                slug: {
                    in: slugValues,
                },
            },
            include: {
                tipos: true
            }
        });
        if(itensFromDB.length <= 0){
            return res.status(401).json({ error: "Produtos inexistentes." });
        }
        const existingLink = await prisma.Link.findFirst({
            where: {
                purchase: {
                    equals: purchase
                }
            }
        });
        if (existingLink) {
            try {
                // Atualiza a data do link existente para a data atual
                await prisma.Link.update({
                    where: {
                        id: existingLink.id
                    },
                    data: {
                        data: new Date()
                    }
                });
                return res.status(200).json({ slug: existingLink.slug });
            } catch (error) {
                console.error('Erro ao atualizar a data do link existente:', error);
            }
        }

        // Caso contrário, cria um novo link
        const uuidValue = uuid.v4();
        const uuidFirstPart = uuidValue.split('-')[0];

        const now = new Date();
        const dateFormatted = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
        const slug = `${uuidFirstPart}-${dateFormatted}`
        const shortenedLink = await prisma.Link.create({
            data:{purchase:purchase, slug:slug, data:new Date()}
        })

        await deleteOldLinks();

        return res.status(200).json({ slug });
    } catch (err) {
        console.error('Erro ao criar token:', err);
        return res.status(500).json({ error: 'Ocorreu um erro ao criar o token.' });
    }
};

module.exports = GetTokenForPay;


module.exports = GetTokenForPay;
