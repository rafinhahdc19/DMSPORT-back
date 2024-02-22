const express = require('express')
const routes = express.Router()
const rateLimit = require("express-rate-limit");
const multer = require("multer")
const Multer = multer({
    storage: multer.memoryStorage(),
    limits: 20 * 1024 * 1024,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
          cb(null, true);
        } else {
          cb(new Error('Only JPG and PNG images are allowed'));
        }
      }
})

//middleware
const auth = require("./middleware/auth") //verifica usuario sem consultar no banco de dados e impede a entrada se for inválido
const authNotVerify = require("./middleware/authNotVerify") //verifica sem impedir entrada
//controllers auth
const loginController = require('./controllers/auth/logincontroller')
const registerController = require('./controllers/auth/registercontroller')
const authVerifyController = require("./controllers/auth/authVerifyController")
//controllers products
const CreateProductController = require('./controllers/produtos/CreateProductController');
const { uploadImage } = require('./services/firebase');
const GetProductsController = require('./controllers/produtos/GetProductsController');
const GetProductController = require('./controllers/produtos/GetProductController');
const UpdateProductController = require('./controllers/produtos/UpdateProductController');
const DeleleProductController = require('./controllers/produtos/DeleteProductController');
//const createProducts = require('./controllers/produtos/CreateProductProvisorio');
const ImageDown = require('./controllers/produtos/ImageDown');
const GetItensCar = require('./controllers/produtos/GetItensCar');
const CreateCupomController = require('./controllers/cupom/CreateCupomController');
const GetCupomController = require('./controllers/cupom/GetCupomController');
const VerifyCupomController = require('./controllers/cupom/VerifyCupomController');
const NewVendidoController = require('./controllers/produtos/NewVendidoController');
const DeleteVendidoController = require('./controllers/produtos/DeleteVendidoController');
const DeleteCupomController = require('./controllers/cupom/DeleteCupomController');
const CreateProductControllerUrl = require('./controllers/produtos/CreateProductControllerUrl');
const GetTokenForPay = require('./controllers/produtos/GetTokenForPay');
const GetProductsWithToken = require('./controllers/produtos/GetProductsWithToken');

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: "Limite de solicitações excedido para esta rota. Por favor, tente novamente mais tarde.",
});

routes.post("/auth/register", registerController)
routes.post("/auth/login", loginController)
routes.get("/auth/user", auth, (req,res) => {
  return res.status(200).json({msg:"Usuário existe"})
})
const delayMiddleware = (req, res, next) => {
  setTimeout(next, 600);
};
//produtos
routes.post("/product/create", auth, Multer.single("img"), uploadImage, CreateProductController)
routes.post("/product/create/url", auth, Multer.none(), CreateProductControllerUrl)
routes.post("/products/get", GetProductsController)
routes.post("/product/get", GetProductController)
routes.patch("/product/update", auth, UpdateProductController)
routes.delete("/product/delete", auth, DeleleProductController)
routes.post("/products/car", GetItensCar)
routes.post("/products/tokenforpay", limiter, delayMiddleware, GetTokenForPay);
routes.post("/products/withtoken", GetProductsWithToken)
//fixado
routes.post("/productfixed/create", auth, NewVendidoController)
routes.delete("/productfixed/delete", auth, DeleteVendidoController)

//routes.post("/temporario", auth, createProducts)

routes.get("/image", ImageDown)

//cupom
routes.post("/cupom/create", auth, CreateCupomController)
routes.delete("/cupom/delete", auth, DeleteCupomController)
routes.get("/cupom/get", auth, GetCupomController)
routes.post("/cupom/verify", VerifyCupomController)


module.exports = routes