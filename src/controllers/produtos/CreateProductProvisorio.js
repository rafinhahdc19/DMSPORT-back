const prisma = require("../../services/prisma");

const createProducts = async (req, res) => {
    const { obj } = req.body;

    try {
        console.log('Iniciando:');
        let prod = 1;
        let tip = 1;
        const novosObjetos = [];
        
        for (let i = 0; i < obj.length; i++) {
            const produto = obj[i];
            const { tipos, ...produtoSemTipos } = produto; // Removendo tipos do objeto produto
            const tipoArray = tipos || []; // Verificando se 'tipos' é um array válido

            // Criando o produto
            console.log("produto numero: " + prod);
            prod++;
            const novoProduto = await prisma.Produto.create({
                data: {
                    ...produtoSemTipos,
                }
            });

            console.log(".\n");
            // Criando os tipos para o produto atual
            const tiposCriados = [];
            for (let j = 0; j < tipoArray.length; j++) {
                const nome = tipoArray[j];
                // Criando os objetos Tipo para cada nome no array tipoArray e associando o productId ao tipo
                console.log("tipo numero: " + tip);
                tip++;
                const tipoCriado = await prisma.Tipo.create({
                    data: {
                        nome,
                        produtoid: novoProduto.id // Associando o id do novo produto ao campo produtoId do tipo
                    }
                });
                tiposCriados.push(tipoCriado);
            }
            console.log("..\n");

            // Atualizando o produto com os tipos criados
            novoProduto.tipos = tiposCriados;
            novosObjetos.push(novoProduto);
        }

        return res.status(200).json({ msg: "Objetos criados com sucesso", novosObjetos });
    } catch (error) {
        console.error('Erro ao criar objetos:', error);
        return res.status(400).json({ msg: "Erro ao criar objetos" });
    } finally {
        await prisma.$disconnect();
    }
};

module.exports = createProducts;
