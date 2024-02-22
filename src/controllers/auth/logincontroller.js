const validator = require("../../models/validator")
const prisma = require("../../services/prisma")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const secret = process.env.SECRET

const loginController = async (req,res) => {
    let user
    let email, password;
    try {
        ({ email, password } = await validator(req));
    } catch(err) {
        return res.status(400).json({message: err.message})
    }
    //verificar existencia do usuario
    try {
        const verifyUser = await prisma.users.findUnique({
            where: {
                email: email
            }
        });
    
        if (!verifyUser) {
            return res.status(409).json({ message: "Email ou senha estão incorretos" });
        }
    
        user = verifyUser;
    
        if (user.status == 0) {
            const criaçãoDaConta = verifyUser.data;
            const agora = new Date();
            const diferençaEmMilissegundos = agora - criaçãoDaConta;
            const diferençaEmMinutos = diferençaEmMilissegundos / (1000 * 60);
    
            if (diferençaEmMinutos > 20) {
                await prisma.users.deleteMany({
                    where: {
                        email: email
                    }
                });
    
                return res.status(409).json({ message: "Email ou senha estão incorretos" });
            } else {
                return res.status(409).json({ message: "Essa conta não foi verificada, espere um administrador" });
            }
        } else {

        }
    } catch (err) {
        return res.status(500).json({ message: "Erro ao verificar existencia de usuario"});
    }
    //fazendo o login
    try{
        //receber dados do usuario "user"
        //verificar senha
        let jwtAuth
        async function verifyUser(user) {
            const checkPwdDB = await bcrypt.compare(password, user.senha)
            if(checkPwdDB){
                return true
            }else{
                return false
            }
        }
        if(await verifyUser(user)){
            //gerar jwt
            jwtAuth = jwt.sign({
                id: user.id,
                data: new Date().toISOString()
            }, secret);
        }else{
            return res.status(409).json({ message: "Email ou senha estão incorretos" })
        }
        return res.status(200).json({message:'Login efetuado com sucesso', token:jwtAuth})
    }catch(err){
        return res.status(500).json({ message: "Erro a fazer o login, volte mais tarde"})
    }
}

module.exports = loginController