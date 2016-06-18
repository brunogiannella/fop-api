var mongoose = require('mongoose'),
Oferta = mongoose.model('Oferta');
Hotel = mongoose.model('Hotel');
Counter = mongoose.model('Counter');

var crypto = require("crypto");
var filaEmail = require("./filaEmail");
var statusOfertasConstantes = require("./../constantes/status_oferta_constantes");
var emailsConstantes = require("./../constantes/email_constantes");

/**
  	Exemplo de entrada
  	{
  	    "oferta":{
	  		"quantidade_quartos": 1,
	  		"quantidade_adultos": 1,
	  		"quantidade_criancas": 1,
	  		"valor": "400,80",
	  		"data_inicio": "17/12/2016",
	  		"data_fim": "30/12/2016",
	  		"hoteis" : [{"hashIdentificador" : "0000000001"}, {"hashIdentificador" : "0000000002"}, {"hashIdentificador" : "0000000003"}],
	  		"dados_pessoais_usuario":{
	  			"email": "chiquinho@gmail.com",
	  			"telefone": "(11) 911111-1111",
	  			"nome": "Bruno",
	  			"sobrenome": "Bruno",
	  			"data_nascimento": "19/12/1991"
	  		},
	  		"informacoes_pagamento":{
	  			"bandeira": "VISA",
	  			"portador": "BRUNO G DE MELO",
	  			"codigo_cartao": "1234 1234 1234 1234",
	  			"codigo_seguranca": "123",
	  			"mes_validade": "02",
	  			"ano_validade": "2026"
	  		}
	  	}
  	}
  **/
exports.enviarOferta = function(req, res) {

	Counter.findByIdAndUpdate({_id: 'ofertaId'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error) {
            return next(error);
        }

        var reqOferta = req.body.oferta;
        var proximoIdOferta = counter.seq;

		var novaOferta = new Oferta({
		  	hashIdentificador: (crypto.createHash("md5").update(proximoIdOferta + "_" + reqOferta.dados_pessoais_usuario.email + "_" + reqOferta.valor.replace(",", ".")).digest("hex")),
		    id : proximoIdOferta,
		  	id_usuario : reqOferta.dados_pessoais_usuario.email,
		    observacao : reqOferta.observacao,
		    quantidade_quartos : reqOferta.quantidade_quartos,
		    quantidade_adultos : reqOferta.quantidade_adultos,
		    quantidade_criancas : reqOferta.quantidade_criancas,
		    valor : reqOferta.valor.replace(",", "."),
		    status : "AGUARDANDO RESPOSTA",
		    data_inicio : converteData(reqOferta.data_inicio),
		    data_fim : converteData(reqOferta.data_fim),
		    hoteis : reqOferta.hoteis,
		    informacoes_pessoais : [
		        {
		            telefone : reqOferta.dados_pessoais_usuario.telefone,
		            nome : reqOferta.dados_pessoais_usuario.nome,
		            sobrenome : reqOferta.dados_pessoais_usuario.sobrenome,
		            data_nascimento : reqOferta.dados_pessoais_usuario.data_nascimento
		        }
		    ],
		    informacoes_financeiras : [
		        {
		            bandeira : reqOferta.informacoes_pagamento.bandeira,
		            token_cartao : ""
		        }
		    ]
		});

		novaOferta.save(function(err) {
          if(err) {
              console.log(err);
              res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
          }
          else {
          	  filaEmail.enviarEmailParaFila(reqOferta.dados_pessoais_usuario.email, emailsConstantes.ASSUNTO_EMAIL_CONFIRMACAO_ENVIO_OFERTA, novaOferta, emailsConstantes.TIPO_EMAIL_CONFIRMACAO_ENVIO_OFERTA);
              return res.status(200).send({ success: true, message: 'Oferta enviada com sucesso.', id_oferta : proximoIdOferta, hashIdentificador : novaOferta.hashIdentificador });
          }
      	});

    });
}

exports.destinosOferta = function(req, res) {

	function getDestinos(callback){

		Hotel.distinct("nome",function gotHoteis(err, resultHoteis) {
	  		if (err) {
    			console.log(err);
      			res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    		};

    		Hotel.distinct("endereco.cidade", function gotCidades(err, resultCidades) {
    			if (err) {
	    			console.log(err);
    	  			res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço (1).' });
    			};

    			Hotel.distinct("endereco.regiao", function gotRegiao(err, resultRegiao) {
    				if (err) {
		    			console.log(err);
    	  				res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço (2).' });
    				};

    				var result = resultHoteis.concat(resultCidades).concat(resultRegiao);
		   			callback(result);	
		   		});
    		});
    	});
    }

    getDestinos(function retornaDestinos(destinos){
		return res.status(200).send({ success: true, destinos: destinos});
    });
}

exports.consultarOferta = function(req, res) {
  var hashIdentificadorOferta = req.params.hashIdentificador;

  Oferta.findOne({'hashIdentificador':hashIdentificadorOferta}, {_id:0, informacoes_financeiras:0},function(err, result) {

    if (err) {
      console.log(err);
      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
    };

    return res.status(200).send(result);
  });
}

exports.aprovarOferta = function(req, res) {
	var hashIdentificadorOferta = req.params.hashIdentificador;
	var hashIdentificadorHotel = req.params.hashIdentificadorHotel;

	Oferta.findOne({'hashIdentificador':idUsuario},function(err, oferta) {

	    if (err) {
	      console.log(err);
	      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
	    };

	    if(!oferta) {
	    	res.status(400).send({ success: false, message: 'Oferta não encontrada.' });
	    } else {

	    	if(oferta.status == statusOfertasConstantes.STATUS_APROVADA) {
	    		return res.status(200).send({ success: false, message: 'A oferta já foi aprovada por outro hotel.' });
	    	} else if(oferta.status == statusOfertasConstantes.STATUS_CANCELADA) {
	    		return res.status(200).send({ success: false, message: 'A oferta foi cancelada pelo usuário.' });
	    	} else {
	    		oferta.status = statusOfertasConstantes.STATUS_APROVADA;

	    		oferta.hoteis.forEach (function (hotel){
				    if(hotel.hashIdentificador == hashIdentificadorHotel) {
				    	hotel.status_operacao = statusOfertasConstantes.STATUS_APROVADA;
				    }
				});

		    	oferta.save(function(err) {
		          if(err) {
		              console.log(err);
		              res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
		          }
		          else {
		          	  filaEmail.enviarEmailParaFila(oferta.id_usuario, emailsConstantes.ASSUNTO_EMAIL_APROVACAO_OFERTA_USUARIO, oferta, emailsConstantes.TIPO_EMAIL_APROVACAO_OFERTA_USUARIO);
		              return res.status(200).send({ success: true, idOferta: oferta.id, message: 'Oferta aprovada com sucesso.' });
		          }
		      	});
	    	}

	    }    
	});
}

exports.rejeitarOferta = function(req, res) {
	var hashIdentificadorOferta = req.params.hashIdentificador;
	var hashIdentificadorHotel = req.params.hashHotel;

	Oferta.findOne({'hashIdentificador':idUsuario},function(err, result) {

	    if (err) {
	      console.log(err);
	      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
	    };

	    var oferta = result;

	    if(!oferta) {
	    	res.status(400).send({ success: false, message: 'Oferta não encontrada.' });
	    } else {

			if(oferta.status == statusOfertasConstantes.STATUS_APROVADA) {
	    		return res.status(200).send({ success: false, message: 'A oferta já foi aprovada por um dos hoteis.' });
	    	} else if(oferta.status == statusOfertasConstantes.STATUS_CANCELADA) {
	    		return res.status(200).send({ success: false, message: 'A oferta foi cancelada pelo usuário.' });
	    	} else if(oferta.status == statusOfertasConstantes.STATUS_REJEITADA) {
	    		return res.status(200).send({ success: false, message: 'A oferta já encontra-se rejeitada.' });
	    	} else {

	    		var isRejeitada = true;
	    		oferta.hoteis.forEach (function (hotel){
				    if(hotel.hashIdentificador == hashIdentificadorHotel) {
				    	hotel.status_operacao = statusOfertasConstantes.STATUS_REJEITADA;
				    }

				    if(hotel.status_operacao != statusOfertasConstantes.STATUS_REJEITADA) {
				    	isRejeitada = false;
				    }
				});

	    		if(isRejeitada) {
	    			oferta.status = statusOfertasConstantes.STATUS_REJEITADA;
	    		}

		    	oferta.save(function(err) {
		          if(err) {
		              console.log(err);
		              res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
		          }
		          else {

		          	  if(isRejeitada) {
		          	  	filaEmail.enviarEmailParaFila(oferta.id_usuario, emailsConstantes.ASSUNTO_EMAIL_REJEICAO_OFERTA_USUARIO, oferta, emailsConstantes.TIPO_EMAIL_REJEICAO_OFERTA_USUARIO);
		          	  }

		              return res.status(200).send({ success: true, idOferta: oferta.id, message: 'Oferta rejeitada com sucesso.' });
		          }
		      	});
	    	}

	    }    
	});
}

exports.cancelarOferta = function(req, res) {
	var hashIdentificadorOferta = req.params.hashIdentificador;

	Oferta.findOne({'hashIdentificador':idUsuario},function(err, result) {

	    if (err) {
	      console.log(err);
	      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
	    };

	    var oferta = result;

	    if(!oferta) {
	    	res.status(400).send({ success: false, message: 'Oferta não encontrada.' });
	    } else {

			if(oferta.status == statusOfertasConstantes.STATUS_APROVADA) {
	    		return res.status(200).send({ success: false, message: 'Não é possivel cancelar a oferta. O status encontra-se como aprovada.' });
	    	} else if(oferta.status == statusOfertasConstantes.STATUS_REJEITADA) {
	    		return res.status(200).send({ success: false, message: 'Não é possivel cancelar a oferta. O status encontra-se como rejeitada.' });
	    	} else {
	    		oferta.status = statusOfertasConstantes.STATUS_CANCELADA;

		    	oferta.save(function(err) {
		          if(err) {
		              console.log(err);
		              res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
		          }
		          else {
		              return res.status(200).send({ success: true, idOferta: oferta.id, message: 'Oferta cancelada com sucesso.' });
		          }
		      	});
	    	}
	    }    
	});
}

exports.getOfertasByUser = function(req, res) {
	var idUsuario = req.body.consulta_ofertas.id_usuario;

	Oferta.find({'id_usuario':idUsuario}, {_id:0}, function(err, ofertas) {
		if (err) {
	      console.log(err);
	      res.status(500).send({ success: false, message: 'Ocorreu algum problema na chamada do serviço.' });
	    };

	    return res.status(200).send(ofertas);
	});
}

function converteData(strData){
	var parts = strData.split("/");
	return new Date(parts[2], parts[1] - 1, parts[0]);
} 