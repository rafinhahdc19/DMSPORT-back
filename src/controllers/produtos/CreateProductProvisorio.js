const prisma = require("../../services/prisma");

const createProducts = async (req, res) => {
    const { obj } = req.body;

    try {
        console.log('Iniciando:');
        const novosObjetos = await Promise.all(obj.map(async (produto) => {
            const { tipos, ...produtoSemTipos } = produto; // Removendo tipos do objeto produto
            const tipoArray = tipos || []; // Verificando se 'tipos' é um array válido

            // Criando o produto
            const novoProduto = await prisma.Produto.create({
                data: {
                    ...produtoSemTipos,
                }
            });

            console.log(".\n")
            // Criando os tipos para o produto atual
            const tiposCriados = await Promise.all(tipoArray.map(async (nome) => {
                // Criando os objetos Tipo para cada nome no array tipoArray e associando o productId ao tipo
                return prisma.Tipo.create({
                    data: {
                        nome,
                        produtoid: novoProduto.id // Associando o id do novo produto ao campo produtoId do tipo
                    }
                });
            }));
            console.log("..\n")

            // Atualizando o produto com os tipos criados
            novoProduto.tipos = tiposCriados;

            return novoProduto;
        }));

        return res.status(200).json({ msg: "Objetos criados com sucesso", novosObjetos });
    } catch (error) {
        console.error('Erro ao criar objetos:', error);
        return res.status(400).json({ msg: "Erro ao criar objetos" });
    } finally {
        await prisma.$disconnect();
    }
};

module.exports = createProducts;
