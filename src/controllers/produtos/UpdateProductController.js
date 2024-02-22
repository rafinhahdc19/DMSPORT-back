const prisma = require("../../services/prisma");

const UpdateProductController = async (req, res) => {
    const { titulo, value, desc, slug, fixado } = req.body;

    try {
        if (!slug) {
            return res.status(400).json({ error: 'Parâmetro inválido: slug é obrigatório.' });
        }

        // Verifica se pelo menos uma variável tem algum valor
        if (!titulo && !desc && !value && typeof fixado === 'undefined') {
            return res.status(400).json({ error: 'Pelo menos um dos campos título, descrição, valor ou fixado deve ser fornecido.' });
        }

        // Verifica se 'value' é um número inteiro
        if (value !== undefined && !Number.isInteger(value)) {
            return res.status(400).json({ error: 'O valor deve ser um número inteiro.' });
        }

        if (typeof fixado !== 'undefined' && typeof fixado !== 'boolean') {
            return res.status(400).json({ error: 'O valor fixado deve ser um booleano' });
        }

        // Verifica o comprimento do novo valor do produto
        if (value && (value.toString().length > 5000 || value.toString().length <= 0)) {
            return res.status(400).json({ error: 'O novo valor do produto deve ter no máximo 5000 caracteres e no mínimo 1 caracter.' });
        }

        // Cria um objeto com os dados a serem atualizados
        const updateData = {};

        if (desc !== undefined) {
            updateData.desc = desc.toString();
        }
        if (value !== undefined) {
            updateData.value = value.toString();
        }
        if (titulo !== undefined) {
            updateData.nome = titulo.toString();
        }

        const updatedProduct = await prisma.Produto.update({
            where: {
                slug: slug
            },
            data: updateData,
            include: {
                tipos: true,
                vendido: true
            }
        });

        const vendidoExiste = updatedProduct.vendido.length > 0;
        updatedProduct.fixado = vendidoExiste

        if (vendidoExiste !== fixado && typeof fixado === 'boolean') {
            if (fixado === false) {
                // Se fixado for verdadeiro, exclui o registro em Vendido
                try {
                    await prisma.Vendido.delete({
                        where: {
                            produtoslug: slug
                        }
                    });
                    updatedProduct.fixado = false
                } catch (error) {
                    console.error('Erro ao desfixar o produto:', error);
                    return res.status(500).json({ error: 'Erro ao desfixar o produto.' });
                }
            } else {
                console.log("cavalo")
                try {
                    const countVendidos = await prisma.Vendido.count();
                    if (countVendidos >= 20) {
                        return res.status(400).json({ error: 'Limite de produtos fixados atingido' });
                    }
                    await prisma.Vendido.create({
                        data: {
                            produtoslug: slug
                        }
                    });
                    updatedProduct.fixado = true
                } catch (error) {
                    console.error('Erro ao fixar o produto:', error);
                    return res.status(500).json({ error: 'Erro ao fixar o produto.' });
                }
            }
        }

        const { vendido, ...updatedProductWithoutVendido } = updatedProduct;

        return res.status(200).json(updatedProductWithoutVendido);

    } catch (err) {
        console.error('Erro ao atualizar produto:', err);
        return res.status(500).json({ error: 'Ocorreu um erro ao atualizar o produto.' });
    }
}

module.exports = UpdateProductController;
