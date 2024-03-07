const prisma = require("../../services/prisma")
const uuid = require('uuid');
const { deleteImage } = require("../../services/firebase")

const CreateProductController = async (req, res) => {
    const { nome, desc, value, tipo } = req.body;

    const imgUrl = req.file.firebaseUrl
    const imgUri = req.file.firebaseUri
    if (!imgUrl) {
        deleteImage(imgUri)
        return res.status(400).json({ error: 'a imagem é inválida' });
    }
    if (!imgUri) {
        deleteImage(imgUri)
        return res.status(400).json({ error: 'a imagem é inválida' });
    }

    let tipoArray;
    try {
        tipoArray = JSON.parse(tipo);
    } catch (error) {
        deleteImage(imgUri)
        return res.status(400).json({ error: 'O campo tipo deve ser uma string JSON válida.' });
    }

    if (nome.length > 500 || nome.length <= 0 || !nome) {
        deleteImage(imgUri)
        return res.status(400).json({ error: 'O nome do produto deve ter no máximo 500 caracteres e no minimo 1 caracter.' });
    }

    // Verificar se o campo desc está dentro do limite de 5000 caracteres
    if (desc.length > 5000 || nome.length <= 0 || !desc) {
        deleteImage(imgUri)
        return res.status(400).json({ error: 'A descrição do produto deve ter no máximo 5000 caracteres e no minimo 1 caracter.' });
    }

    if (value.length > 5000 || value.length <= 0 || !value) {
        deleteImage(imgUri)
        return res.status(400).json({ error: 'O valor do produto deve ter no máximo 5000 caracteres e no minimo 1 caracter.' });
    }

    if (!/^\d+$/.test(value)) {
        return res.status(400).json({ error: 'O valor do produto deve conter apenas caracteres numéricos.' });
    }

    if (!Array.isArray(tipoArray) || tipoArray.some(item => typeof item !== 'string')) {
        deleteImage(imgUri)
        return res.status(400).json({ error: 'O campo tipo deve ser um array de strings.' });
    }

    // Verificar se o número de tipos não excede o limite de 30
    if (tipoArray.length > 30) {
        deleteImage(imgUri)
        return res.status(400).json({ error: 'O produto deve ter no máximo 30 tipos.' });
    }



    try {
        const uuidValue = uuid.v4();
        const uuidFirstPart = uuidValue.split('-')[0];

        const now = new Date();
        const dateFormatted = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
        const slug = `${nome.replace(/\s+/g, '-').replace(/\//g, '-')}-${uuidFirstPart}-${dateFormatted}`;
        if (tipo) {
            const createdProduct = await prisma.Produto.create({
                data: {
                    nome,
                    desc,
                    imgurl: imgUrl,
                    value,
                    tipos: {
                        create: tipoArray.map(nome => ({ nome }))
                    },
                    data: new Date(),
                    slug: slug
                },
                include: {
                    tipos: true
                }
            });
            res.status(201).json(createdProduct);
        } else {
            const createdProduct = await prisma.Produto.create({
                data: {
                    nome,
                    desc,
                    imgurl: imgUrl,
                    value,
                    data: new Date(),
                    slug: slug
                },
                include: {
                    tipos: true
                }
            });
            res.status(201).json(createdProduct);
        }
        
    } catch (error) {
        deleteImage(imgUri)
        console.error('Erro ao criar o produto:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao criar o produto.'});
    }

}

module.exports = CreateProductController