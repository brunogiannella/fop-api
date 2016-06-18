var mongoose = require('mongoose'),
Usuario = mongoose.model('Usuario');

var crypto = require("crypto");
var filaEmail = require("./filaEmail");

var constantesEmail = require("./../constantes/email_constantes");

exports.listarUsuarios = function(req, res){
  Usuario.find({},function(err, results) {

    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    return res.status(200).send(results);
 });
};

exports.consultarDadosCadastrais = function(req, res){
  var idUsuario = req.params.hashIdentificador;

  Usuario.findOne({'hashIdentificador':idUsuario},function(err, result) {

    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    result.senha = "*********";
    return res.status(200).send(result);
  });
};

exports.alterarSenha = function(req, res) {
  var ultimaSenha = crypto.createHash("md5").update(req.body.usuario.ultima_senha).digest("hex");
  var novaSenha = req.body.usuario.nova_senha;
  var idUsuario = req.params.hashIdentificador;

  Usuario.findOne({'hashIdentificador':idUsuario},function(err, result) {
    
    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    var usuario = result;

    if (!usuario) {
      res.status(400).send({ success: false, message: 'Usuário não encontrado.' });
    } else if(usuario.senha != ultimaSenha) {
      res.status(401).send({ success: false, message: 'Senha incorreta.' });
    } else {
      usuario.senha = crypto.createHash("md5").update(novaSenha).digest("hex");
      usuario.save(function(err) {
          if(err) {
              console.log(err);
              res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
          }
          else {
              return res.status(200).send({ success: true, message: 'Senha alterada com sucesso.' });
          }
      });
    }
    
  });
}

exports.alterarDadosCadastrais = function(req, res) {
  var updates = req.body.usuario;
  var idUsuario = req.params.hashIdentificador;

  Usuario.update({'hashIdentificador':idUsuario}, updates, function (err, numberAffected, raw) {
    
    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };  

    console.log('Updated %d users', numberAffected);
    return res.send(raw);
  });
}

exports.cadastrarUsuario = function(req, res) {

  console.log("Iniciando cadastro do usuário " + req.body.usuario.id);

  req.body.usuario.hashIdentificador = crypto.createHash("md5").update(req.body.usuario.id + "_" + req.body.usuario.senha).digest("hex");

  if(req.body.usuario.senha != undefined) {
    req.body.usuario.senha = crypto.createHash("md5").update(req.body.usuario.senha).digest("hex");
  }

  Usuario.create(req.body.usuario, function (err, user) {
    
    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    var variaveisEmail = { nome: user.nome, hashUsuario: user.hashIdentificador };

    filaEmail.enviarEmailParaFila(user.email, constantesEmail.ASSUNTO_EMAIL_CONFIRMACAO_CADASTRO, variaveisEmail, constantesEmail.TIPO_EMAIL_CONFIRMACAO_CADASTRO);
    console.log("Cadastro do usuário " + user.id + " realizado com sucesso.");
    return res.status(201).send({ success: true, message: 'Usuario cadastrado com sucesso.' });
  });
}

exports.confirmarCadastro = function(req, res) {
  console.log("Iniciando confirmação de cadastro do usuário com hash " + req.body.usuario.hashIdentificador);

  Usuario.findOne({'hashIdentificador':req.body.usuario.hashIdentificador}, function(err, usuario) {

    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    if (!usuario) {
      res.status(400).send({ success: false, message: 'Usuário não encontrado.' });
    } else if(usuario.cadastro_confirmado) {
      res.status(200).send({ success: false, message: 'Usuário já encontra-se confirmado.' });
    } else {

      usuario.cadastro_confirmado = true; 

      usuario.save(function(err) {
          if(err) {
              console.log(err);
              res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
          }
          else {
              return res.status(200).send({ success: true, message: 'Confirmação do cadastro do usuário realizado com sucesso.' });
          }
      });
    }

  });

  console.log("confirmação de cadastro do usuário com hash " + req.body.usuario.hashIdentificador + " realizada.");
}

exports.removerUsuario = function(req, res){
  var id = req.params.hashIdentificador;
  Usuario.remove({'hashIdentificador':id},function(err, result) {

    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    return res.status(200).send({ success: true, message: 'Usuario removido com sucesso.' });
  });
};

exports.enviarEmailRecuperarSenha = function(req, res){
  var id = req.body.recuperarSenha.email_usuario;

  Usuario.findOne({'id':id},function(err, usuario) {

    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    var variaveisEmail = { nome: usuario.nome, urlConfirmacaoCadastro: "http://127.0.0.1/faleopreco-web/usuario/cadastro/recuperarSenha?hash="+usuario.hashIdentificador };

    filaEmail.enviarEmailParaFila(usuario.id, constantesEmail.ASSUNTO_EMAIL_RECUPERACAO_SENHA, variaveisEmail, constantesEmail.TIPO_EMAIL_RECUPERACAO_SENHA);
    return res.status(200).send({ success: true, message: 'Email de recuperação de senha enviado com sucesso.' });
  });
};

function converteData(strData){
  var parts = strData.split("/");
  return new Date(parts[2], parts[1] - 1, parts[0]);
} 