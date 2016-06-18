var mongoose = require('mongoose'),
Hotel = mongoose.model('Hotel');

var crypto = require("crypto");

exports.listarHoteis = function(req, res){
  Hotel.find({},function(err, results) {

    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    return res.status(200).send(results);
 });
};

exports.listarHoteisRegiao = function(req, res){
  // Espera request  { "regioes" : ["Jurere - Sul", "Rio de Janeiro", "Salvador"], "classificacao" : "4", "preco" : "500,80"}
  var request = req.body.requestHoteisRegiao;  
  var preco_minimo = request.preco.replace(",", ".");
  
  Hotel.find({
      'endereco.regiao' : {$in : request.regioes}, 
      'classificacao' :   {$gte: request.classificacao}, 
      'preco_minimo' :    {$lte: preco_minimo}},
      {_id:0, hashIdentificador:1, nome:1, classificacao:1, servicos:1, imagens:1, contatos:1, endereco:1}, function(err, results) {  
    
    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    return res.status(200).send({hoteis: results});
 });
};

exports.consultarHotel = function(req, res){
  var hashIdentificador = req.params.hashIdentificador;

  Hotel.findOne({'hashIdentificador':hashIdentificador}, {_id:0, senha:0},function(err, result) {

    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    return res.status(200).send(result);
  });
};

exports.atualizarHotel = function(req, res) {
  var id = req.params.id;
  var updates = req.body;

  Hotel.update({'id':id}, updates, function (err, numberAffected, raw) {
    
    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    console.log('Updated %d users', numberAffected);
    return res.status(200).send(aw);
  });
}

exports.cadastrarHotel = function(req, res) {

  req.body.hashIdentificador = crypto.createHash("md5").update(req.body.nome + "_" + req.body.usuario + "_" +req.body.senha).digest("hex");

  if(req.body.senha != undefined) {
    req.body.senha = crypto.createHash("md5").update(req.body.senha).digest("hex");
  }

  Hotel.create(req.body, function (err, hotel) {
    
    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    hotel.senha = "********";

    return res.status(201).send({ success: true, hotel: hotel });
  });
}

exports.removerHotel = function(req, res){
  var hashIdentificador = req.params.hashIdentificador;
  Hotel.remove({'hashIdentificador':hashIdentificador},function(err, result) {

    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    return res.status(200).send(result);
  });
};

exports.destinosHoteis = function(req, res) {

	Hotel.aggregate([
		{$project:{"cidade_estado":{$concat:["$endereco.cidade"," - ","$endereco.estado"]}}},
		{$group : { _id : "$cidade_estado" }}], function (err, result){
			
			return res.status(200).send({ success: true, destinos: result});
			
	});

	
}

exports.regioes = function(req, res){
	
	var cidadeEstado = req.params.cidade.split("-");
	var cidade = cidadeEstado[0].trim();
	var estado = cidadeEstado[1].trim();

	Hotel.distinct("endereco.regiao", {"endereco.cidade": cidade, "endereco.estado": estado},function(err, result) {
		if (err) {
		  console.log(err);
		  res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
		};

		return res.status(200).send({regioes:result});
	});
}
