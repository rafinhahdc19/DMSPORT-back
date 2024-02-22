var admin = require("firebase-admin");
const sharp = require("sharp")

const deleteImage = async (firebaseUrl) => {
    try {
      const bucket = admin.storage().bucket();
      
      // Extrair o caminho do arquivo do Firebase URL
      const pathStartIndex = firebaseUrl.indexOf('/produto/');
      const filePath = firebaseUrl.substring(pathStartIndex);
  
      // Excluir o arquivo do Firebase Storage
      await bucket.file(filePath).delete();
  
      console.log('Imagem excluída com sucesso:', firebaseUrl);
    } catch (error) {
      console.error('Erro ao excluir a imagem:', error);
      throw new Error('Erro ao excluir a imagem do Firebase Storage.');
    }
  };

const serviceAccount = {
  "type": process.env.TYPE,
  "project_id": process.env.PROJECT_ID,
  "private_key_id": process.env.PRIVATE_KEY_ID,
  "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.CLIENT_EMAIL,
  "client_id": process.env.CLIENT_ID,
  "auth_uri": process.env.AUTH_URI,
  "token_uri": process.env.TOKEN_URI,
  "auth_provider_x509_cert_url": process.env.AUTH_PROVIDER_X509_CERT_URL,
  "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL,
  "universe_domain": process.env.UNIVERSE_DOMAIN,
};

const Bucket = "dm-sport-ae88a.appspot.com"

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://"+Bucket,
});

const bucket = admin.storage().bucket()

const processImage = async (fileBuffer, res) => {
    try{
        let image = sharp(fileBuffer);
    
        // Diminuir a qualidade do arquivo
        image = await image.jpeg({ quality: 80 }).toBuffer();
    
        // Verificar e redimensionar se necessário
        const metadata = await sharp(fileBuffer).metadata();
        if (metadata.height > 480) {
            const newHeight = 480;
            const newWidth = Math.round((metadata.width / metadata.height) * newHeight);
            image = await sharp(fileBuffer).resize({ width: newWidth, height: newHeight }).toBuffer();
        }
        if (metadata.width > 1920) {
            return res.status(403).json({msg: "erro ao processar imagem"})
        }
    
        return image;
    }catch(err){
        console.error(err);
        return res.status(403).json({msg: "erro ao processar imagem"})
    }
};

const uploadImage = async (req, res, next) => {
    if(!req.file){
        return res.status(400).json({ error: 'a imagem é inválida' });
    }

    const file = req.file

    file.buffer = await processImage(file.buffer, res)

    const nomearquivo = Date.now() + "." + file.originalname.replace(/[^\w.-]/g, '');

    const files = bucket.file("produto/" + nomearquivo);

    const stream = files.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      }
    })

    stream.on("error", (e) => {
      console.error(e);
      try{
        deleteImage("produto/" + nomearquivo)
      }catch(err){

      }
      
      return res.status(403).json({msg: "erro na comunição com o server"})
    })
    stream.on("finish", async () => {
      await files.makePublic()

      req.file.firebaseUrl = `https://storage.googleapis.com/${Bucket}/produto/${nomearquivo}`
      req.file.firebaseUri = "produto/" + nomearquivo
      
      next()
    })

    stream.end(file.buffer)
}

module.exports = {
    uploadImage,
    deleteImage
};