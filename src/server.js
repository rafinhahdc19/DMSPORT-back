const express = require('express')
const routes = require('./routes')
const cors = require('cors')
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express()
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const PORT = 3001


// Configurar o middleware bodyParser para aumentar o limite de tamanho de carga útil
//app.use(bodyParser.json({ limit: '50mb' }));
//app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

const limiter = rateLimit({
    windowMs: 3000,
    max: 30,
    message: 'Muitas requisições, seja mais devagar.',
  });
app.use(limiter);
app.use(cors({
    origin: process.env.FRONTEND,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));
app.use(helmet());
app.use(cookieParser());
app.use(express.json())
app.use(routes)


app.listen(PORT, () => {
    console.log("listening on port 3001")
})