var mongoose = require('mongoose'),
EmailRecebidoSite = mongoose.model('EmailRecebidoSite');

exports.enviarEmail = function(req, res) {
  EmailRecebidoSite.create(req.body.contato_site, function (err, user) {
    if (err) {
    	console.log(err);
		res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    }

    return res.status(200).send({sucess: true, message: "Mensagem enviada com sucesso."});
  });
}
