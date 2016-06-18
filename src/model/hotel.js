var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var HoteisSchema = new Schema({
  	hashIdentificador : String,
  	usuario : String,
  	senha : String,
	nome: String,
	descricao : String,
	classificacao: Number,
	preco_minimo : Number,
	email : String,
	site : String,
	endereco : {
		estado : String,
		cidade : String,
		bairro : String,
		endereco : String,
		complemento : String,
		regiao : String,
		cep : String
	},
	contatos : [
		{
			ddd : Number,
			telefone : String
		}
	],
	imagens : [
		{
			descricao : String,
			url : String
		}
	],
	servicos : [
		{
			descricao : String
		}
	],
	comentarios : [
		{
			id_usuario : String,
			data : Date,
			descricao : String
		}
	],
	rastreabilidade : [
		{
			acao : String,
			parametros: String
		}
	]
});

mongoose.model('Hotel', HoteisSchema);
