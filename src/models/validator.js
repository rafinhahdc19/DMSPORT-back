const Joi = require('joi');
const schema = Joi.object({
    username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .trim()
    .invalid(null)
    .custom(checkReservedUsernames, 'check if username is reserved')
    .when('$required.username', { is: 'required', then: Joi.required(), otherwise: Joi.optional() })
    .messages({
      'any.required': `"username" é um campo obrigatório.`,
      'string.empty': `"username" não pode estar em branco.`,
      'string.base': `"username" deve ser do tipo String.`,
      'string.alphanum': `"username" deve conter apenas caracteres alfanuméricos.`,
      'string.min': `"username" deve conter no mínimo {#limit} caracteres.`,
      'string.max': `"username" deve conter no máximo {#limit} caracteres.`,
      'any.invalid': `"username" possui o valor inválido "null".`,
      'username.reserved': `Este nome de usuário não está disponível para uso.`,
    }),

    password: Joi.string()
        .min(8)
        .max(72)
        .trim()
        .invalid(null)
        .when('$required.password', { is: 'required', then: Joi.required(), otherwise: Joi.optional() })
        .messages({
          'any.required': `"password" é um campo obrigatório.`,
          'string.empty': `"password" não pode estar em branco.`,
          'string.base': `"password" deve ser do tipo String.`,
          'string.min': `"password" deve conter no mínimo {#limit} caracteres.`,
          'string.max': `"password" deve conter no máximo {#limit} caracteres.`,
          'any.invalid': `"password" possui o valor inválido "null".`,
        }),
    email: Joi.string()
        .email()
        .min(7)
        .max(254)
        .lowercase()
        .trim()
        .invalid(null)
        .when('$required.email', { is: 'required', then: Joi.required(), otherwise: Joi.optional() })
        .messages({
          'any.required': `"email" é um campo obrigatório.`,
          'string.empty': `"email" não pode estar em branco.`,
          'string.base': `"email" deve ser do tipo String.`,
          'string.email': `"email" deve conter um email válido.`,
          'any.invalid': `"email" possui o valor inválido "null".`,
        }),
})
const validator = async (req) => {
    try {
        const validationResult = await schema.validateAsync(req.body);
        return validationResult
    } catch (error) {
        console.error(error);
        throw new Error('Erro ao registrar usuário: ' + error.message);
    }
};


function checkReservedUsernames(username, helpers) {
    if (
      reservedDevUsernames.includes(username.toLowerCase()) ||
      reservedUsernames.includes(username.toLowerCase()) ||
      reservedUsernamesStartingWith.find((reserved) => username.toLowerCase().startsWith(reserved))
    ) {
      return helpers.error('username.reserved');
    }
    return username;
  }
  
const reservedDevUsernames = ['admin', 'user'];
const reservedUsernamesStartingWith = ['favicon', 'manifest'];
const reservedUsernames = [
    'account',
    'administracao',
    'administrador',
    'administradora',
    'administradores',
    'administrator',
    'afiliado',
    'afiliados',
    'ajuda',
    'alerta',
    'alertas',
    'analytics',
    'anonymous',
    'anunciar',
    'anuncie',
    'anuncio',
    'anuncios',
    'api',
    'app',
    'apps',
    'autenticacao',
    'auth',
    'authentication',
    'autorizacao',
    'avatar',
    'backup',
    'banner',
    'banners',
    'beta',
    'blog',
    'cadastrar',
    'cadastro',
    'carrinho',
    'categoria',
    'categorias',
    'categories',
    'category',
    'ceo',
    'cfo',
    'checkout',
    'comentario',
    'comentarios',
    'comunidade',
    'comunidades',
    'config',
    'configuracao',
    'configuracoes',
    'configurar',
    'configure',
    'conta',
    'contas',
    'contato',
    'contatos',
    'contrato',
    'convite',
    'convites',
    'create',
    'criar',
    'css',
    'cto',
    'cultura',
    'curso',
    'cursos',
    'dados',
    'dashboard',
    'desconectar',
    'descricao',
    'description',
    'deslogar',
    'diretrizes',
    'discussao',
    'docs',
    'documentacao',
    'download',
    'downloads',
    'draft',
    'edit',
    'editar',
    'editor',
    'email',
    'estatisticas',
    'eu',
    'faq',
    'features',
    'gerente',
    'grupo',
    'grupos',
    'guest',
    'guidelines',
    'hoje',
    'imagem',
    'imagens',
    'init',
    'interface',
    'licenca',
    'log',
    'login',
    'logout',
    'loja',
    'me',
    'membership',
    'moderacao',
    'moderador',
    'moderadora',
    'moderadoras',
    'moderadores',
    'museu',
    'news',
    'newsletter',
    'newsletters',
    'notificacoes',
    'notification',
    'notifications',
    'ontem',
    'pagina',
    'password',
    'perfil',
    'pesquisa',
    'popular',
    'post',
    'postar',
    'posts',
    'preferencias',
    'public',
    'publicar',
    'publish',
    'rascunho',
    'recentes',
    'register',
    'registration',
    'regras',
    'relatorio',
    'relatorios',
    'replies',
    'reply',
    'resetar-senha',
    'resetar',
    'resposta',
    'respostas',
    'root',
    'rootuser',
    'rss',
    'sair',
    'senha',
    'sobre',
    'status',
    'sudo',
    'superuser',
    'suporte',
    'support',
    'swr',
    'sysadmin',
    'tabnew',
    'tabnews',
    'tag',
    'tags',
    'termos-de-uso',
    'termos',
    'terms',
    'toc',
    'trending',
    'upgrade',
    'username',
    'users',
    'usuario',
    'usuarios',
    'va',
    'vagas',
    'videos',
];

module.exports = validator