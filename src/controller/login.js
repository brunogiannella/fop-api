var mongoose = require('mongoose'),
User = mongoose.model('Usuario');

var jwt    = require('jsonwebtoken');
var crypto = require("crypto");
var config = require('./../../config');

exports.realizarLoginUsuario = function(req, res) {

  var emailUsuario = req.body.autenticacao.usuario_email;
  var senhaUsuario = req.body.autenticacao.usuario_senha;

  console.log(senhaUsuario);

  senhaUsuario = crypto.createHash("md5").update(senhaUsuario).digest("hex");
  
  User.findOne({'id':emailUsuario},function(err, usuario) {

    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    }

    if (!usuario) {
      res.status(401).send({ success: false, message: 'Usuário não encontrado.' });
    } else if(usuario.senha != senhaUsuario) {
      res.status(401).send({ success: false, message: 'Senha incorreta.' });
    } else {
      var token = jwt.sign(usuario, config.secret, {
          expiresInMinutes: 60 // expires in 24 hours
        });

        res.status(200).send({
          success: true,
          hashIdentificadorUsuario: usuario.hashIdentificador,
          token: token,
          email: usuario.id,
          nome: usuario.nome,
          sobrenome: usuario.sobrenome
        });

    }

  });
}