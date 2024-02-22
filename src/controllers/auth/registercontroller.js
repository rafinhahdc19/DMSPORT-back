const validator = require("../../models/validator")
const prisma = require("../../services/prisma")
const bcrypt = require("bcrypt")
const registerController = async (req, res) => {
    let username, email, password;
    try {
        ({ username, email, password } = await validator(req));
    } catch(err) {
        return res.status(400).json({message: err.message})
    }
    //vericar existencia do usuario
    try{
        const verifyUser = await prisma.users.findMany({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });
        if (verifyUser.length > 0) {
            const agora = new Date();
            const diferençaEmMinutos = 20;
          
            if (verifyUser.some(user => user.email === email)) {
                if(verifyUser.some(user => user.status == 0)){
                    if(verifyUser.some(user => (agora - user.data) / (1000 * 60) < diferençaEmMinutos)){
                        return res.status(409).json({ message: "O email já está em uso." });
                    }else{
                        await prisma.users.deleteMany({
                            where: {
                                email: email
                            }
                        });
                    }
                }else{
                    return res.status(409).json({ message: "O email já está em uso." });
                }
              return res.status(409).json({ message: "O email já está em uso." });
            } else if (verifyUser.some(user => user.username === username && (agora - user.data) / (1000 * 60) < diferençaEmMinutos) ) {
                if(verifyUser.some(user => user.status == 0)){
                    if(verifyUser.some(user => (agora - user.data) / (1000 * 60) < diferençaEmMinutos)){
                        return res.status(409).json({ message: "O nome de usuário já está em uso." });
                    }else{
                        await prisma.users.deleteMany({
                            where: {
                                username: username
                            }
                        });
                    }
                }else{
                    return res.status(409).json({ message: "O nome de usuário já está em uso." });
                }
                return res.status(409).json({ message: "O nome de usuário já está em uso." });
              
            }
        } else {

        }
    }catch(err){
        res.status(500).json({ message: "Erro ao verificar existencia de usuario", err });
    }
    //cadastra o usuario
    function makeid(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
          counter += 1;
        }
        return result;
    }
    try{
        const VSlug = (email + "-" + makeid(60)  + "-" + Date.now()).replace(/[^\w\s-]/g, '-')
        const salt = await bcrypt.genSalt(12)
        const senhaCrypt = await bcrypt.hash(password, salt)
        const createNewUser = await prisma.users.createMany({data: {username:username, email:email, senha:senhaCrypt, status: 0, data: new Date().toISOString(), VSlug: VSlug}})
        if(createNewUser){
            try{
                const enviarEmail = true
                if(enviarEmail){
                    return res.status(200).json('Usuário registrado com sucesso, espere um administrador aceitar o usuario')
                }else{
                    await prisma.users.deleteMany({where: {
                        email:email
                    }})
                    return res.status(500).json({ message: "Erro ao criar usuario" });
                }
            }catch(err){
                await prisma.users.deleteMany({where: {
                    email:email
                }})
                return res.status(500).json({ message: "Erro ao criar usuario"});
            }
        }else{
            return res.status(500).json({ message: "Erro ao criar usuario" });
        }
    }catch(err){
        return res.status(500).json({ message: "Erro ao criar usuario"});
    }
};

module.exports = registerController