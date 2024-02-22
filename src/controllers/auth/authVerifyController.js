const prisma = require("../../services/prisma");

const authVerifyController = async (req, res) => {
    const { vslug } = req.body;
    if (!vslug) {
        return res.status(400).json({ message: "O slug de verificação incorreto" });
    }
    try {
        const user = await prisma.users.update({
            where: {
                VSlug: vslug,
                status: 0
            },
            data: {
                status: 1,
            },
        });

        if (user) {
            return res.status(200).json({ message: "Conta verificada" });
        } else {
            return res.status(400).json({ message: "O slug de verificação incorreto ou a conta já foi verificada" });
        }
    } catch (err) {
        return res.status(400).json({ message: "O slug de verificação incorreto ou a conta já foi verificada" });
    }
}

module.exports = authVerifyController;