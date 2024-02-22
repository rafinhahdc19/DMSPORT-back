const prisma = require("../../services/prisma");
const { deleteImage } = require("../../services/firebase")

const DeleleProductController = async (req, res) => {
    const { slug } = req.body

    if(!slug){
        return res.status(401).json({ error: 'parâmetro inválido' });
    }

    const product = await prisma.Produto.findFirst({
        where: {
            slug: slug
        },
        select: {
            imgurl: true
        }
    });

    if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    
    const lastSlashIndex = product.imgurl.lastIndexOf('/');
    const imgUri = product.imgurl.substring(lastSlashIndex + 1);

    console.log(imgUri)
    try {
        const product = await prisma.Produto.findUnique({
            where: {
                slug: slug
            },
            include: {
                tipos: true
            }
        });

        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        // Excluir a imagem associada ao produto
        const lastSlashIndex = product.imgurl.lastIndexOf('/');
        const imgUri = product.imgurl.substring(lastSlashIndex + 1);
        // Verificar se o domínio da imagem é storage.googleapis.com
        const isGoogleStorageImage = product.imgurl.startsWith('https://storage.googleapis.com');

        if (isGoogleStorageImage) {
            // Excluir a imagem associada ao produto
            const lastSlashIndex = product.imgurl.lastIndexOf('/');
            const imgUri = product.imgurl.substring(lastSlashIndex + 1);
            try {
                await deleteImage("produto/" + imgUri);
            } catch (error) {
                console.error('Erro ao deletar imagem:', error);
                return res.status(500).json({ error: 'Ocorreu um erro ao deletar a imagem.' });
            }
        } 
        // Excluir os tipos associados ao produto
        await prisma.tipo.deleteMany({
            where: {
                produtoid: product.id
            }
        });
        await prisma.Vendido.deleteMany({
            where: {
                produtoslug: slug
            }
        });
        // Excluir o produto após excluir os tipos associados
        await prisma.Produto.delete({
            where: {
                slug: slug
            }
        });

        return res.status(200).json({ message: 'O produto foi apagado.' });
    } catch (err) {
        console.error('Erro ao deletar produto:', err);
        return res.status(500).json({ error: 'Ocorreu um erro ao deletar o produto.' });
    }
}

module.exports = DeleleProductController