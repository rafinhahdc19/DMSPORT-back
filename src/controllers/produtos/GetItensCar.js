const prisma = require("../../services/prisma");

const GetItensCar = async (req, res) => {
    try {
        const { slugs } = req.body;

        function hasDuplicates(array) {
            const set = new Set();
            for (const item of array) {
                if (set.has(JSON.stringify(item))) {
                    return true; // Se o item já estiver no conjunto, significa que é duplicado
                }
                set.add(JSON.stringify(item));
            }
            return false; // Se nenhum item duplicado for encontrado, retorna false
        }
        
        if (hasDuplicates(slugs)) {
            return res.status(400).json({ error: 'Itens duplicados encontrados na matriz slugs.' });
        }

        if (!slugs) {
            res.status(400).json({ error: "Parâmentros invalidos." })
        }



        const addIdentifiers = (slugs) => {
            const identifiersMap = new Map();
            return slugs.map((item) => {
                const { slug } = item;
                if (!identifiersMap.has(slug)) {
                    identifiersMap.set(slug, 1);
                } else {
                    identifiersMap.set(slug, identifiersMap.get(slug) + 1);
                }
                const newItem = { ...item, ident: identifiersMap.get(slug) };
                return newItem;
            });
        };
        const newSlugs = addIdentifiers(slugs.reverse());
        const slugValues = slugs.map((item) => item.slug);
        const tiposValues = slugs.map((item) => item.tipo !== undefined ? item.tipo : null);
        const duplicados = tiposValues.filter((item, index) => tiposValues.indexOf(item) !== index);

        if (duplicados.length > 0) {
            return res.status(400).json({ error: "Existem tipos duplicados." })
        }

        const slugCounts = slugValues.reduce((acc, slug) => {
            acc[slug] = (acc[slug] || 0) + 1;
            return acc;
        }, {});

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
        let num = 1;
        const itensComQuantidade2 = itensFromDB.flatMap((itemDB) => {
            const count = slugCounts[itemDB.slug] || 1;
            return Array(count).fill(itemDB);
        });
        const itensComQuantidade = itensComQuantidade2.flatMap((itemDB) => {
            const { slug } = itemDB;
            const index = newSlugs.findIndex((item) => item.slug === slug);
        
            if (index !== -1) {
                const filteredItem = newSlugs[index];
                newSlugs.splice(index, 1); // Remove o item encontrado de newSlugs
        
                const { quantity, tipo } = filteredItem;
                return [{
                    ...itemDB,
                    quantity,
                    tipo,
                    ident: num++
                }];
            }
        
            return [];
        });

        res.json({ itens: itensComQuantidade });
    } catch (error) {
        console.error('Erro ao buscar itens:', error);
        res.status(500).json({ error: 'Erro ao buscar itens' });
    }
}

module.exports = GetItensCar;
