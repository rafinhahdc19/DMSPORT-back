const axios = require('axios');
const { URL } = require('url');

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 20MB

const ImageDown = async (req, res) => {
  const { imageUrl } = req.query;

  try {
    const parsedUrl = new URL(imageUrl);

    if (parsedUrl.hostname === 'photo.yupoo.com' || parsedUrl.hostname === 'storage.googleapis.com') {
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36',
          'Referer': "https://yupoo.com/",
          'Origin': "https://yupoo.com"
        }
      };

      // Se a imagem for menor que o limite, faça a requisição GET e envie a imagem como resposta
      const imageResponse = await axios.get(imageUrl, {
        ...options,
        responseType: 'stream' // Definir responseType como 'stream' para obter a resposta como um stream
      });

      const contentLength = imageResponse.headers['content-length'];
      if (contentLength && parseInt(contentLength) > MAX_IMAGE_SIZE) {
        return res.status(400).send('Tamanho da imagem excede o limite permitido.');
      }
      res.setHeader('Cache-Control', 'public, max-age=86400');

      // Configurar outros cabeçalhos necessários
      res.set({
        'Content-Type': imageResponse.headers['content-type'],
        'Content-Length': imageResponse.headers['content-length']

      });
      res.removeHeader('Cross-Origin-Opener-Policy');
      res.removeHeader('Cross-Origin-Resource-Policy');
      imageResponse.data.pipe(res);
    } else {
      res.redirect(imageUrl);
    }
  } catch (error) {
    console.error('Erro ao baixar a imagem:', error);
    res.status(500).send('Erro ao baixar a imagem');
  }
};

module.exports = ImageDown;
