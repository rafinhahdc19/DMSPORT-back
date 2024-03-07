const prisma = require("../../services/prisma")
const uuid = require('uuid');
const axios = require("axios")
const { deleteImage } = require("../../services/firebase")

const CreateProductControllerUrl = async (req, res) => {
    const { nome, desc, value, tipo, imgUrl } = req.body;

    console.log(req)

    if (!imgUrl) {
        return res.status(400).json({ error: 'Parâmetros inválidos.' });
    }

    try {
        // Fazer uma solicitação HEAD para a URL da imagem
        const response = await axios.head(imgUrl);

        // Verificar o tamanho da imagem
        const contentLength = parseInt(response.headers['content-length']);
        const maxSize = 4 * 1024;
        console.log("aq:"+contentLength+" max:"+maxSize)

        if (contentLength > maxSize) {
            return res.status(400).json({ error: 'O tamanho da imagem excede 5 MB.' });
        }
        
    } catch (error) {
        console.error('Erro ao criar o produto:', error);
        return res.status(500).json({ error: 'Ocorreu um erro ao criar o produto.'+error});
    }

    let tipoArray;
    try {
        tipoArray = JSON.parse(tipo);
    } catch (error) {
        return res.status(400).json({ error: 'O campo tipo deve ser uma string JSON válida.' });
    }

    if (nome.length > 500 || nome.length <= 0 || !nome) {
        return res.status(400).json({ error: 'O nome do produto deve ter no máximo 500 caracteres e no minimo 1 caracter.' });
    }

    // Verificar se o campo desc está dentro do limite de 5000 caracteres
    if (desc.length > 5000 || nome.length <= 0 || !desc) {
        return res.status(400).json({ error: 'A descrição do produto deve ter no máximo 5000 caracteres e no minimo 1 caracter.' });
    }

    if (value.length > 5000 || value.length <= 0 || !value) {
        return res.status(400).json({ error: 'O valor do produto deve ter no máximo 5000 caracteres e no minimo 1 caracter.' });
    }

    if (!/^\d+$/.test(value)) {
        return res.status(400).json({ error: 'O valor do produto deve conter apenas caracteres numéricos.' });
    }

    if (!Array.isArray(tipoArray) || tipoArray.some(item => typeof item !== 'string')) {
        return res.status(400).json({ error: 'O campo tipo deve ser um array de strings.' });
    }

    // Verificar se o número de tipos não excede o limite de 30
    if (tipoArray.length > 30) {
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
        console.error('Erro ao criar o produto:', error);
        res.status(500).json({ error: 'Ocorreu um erro ao criar o produto.'});
    }

}

module.exports = CreateProductControllerUrl