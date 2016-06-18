var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UsuariosSchema = new Schema({
	hashIdentificador: String,
  	id : String,
	senha : String,
	data_cadastro : { type: Date, default: Date.now },
	nome : String,
	sobrenome : String,
	rg : String,
	cpf : String,
	data_nascimento : Date,
	sexo : String,
	opcao_manter_informado : { type: Boolean, default: false },
	cadastro_confirmado : { type: Boolean, default: true },
	contatos : [
		{
			ddd : Number,
			celular : String,
			operadora : String
		}
	],
	endereco : {
		estado : String,
		cidade : String,
		bairro : String,
		endereco : String,
		complemento : String,
		cep : String
	},
	rastreabilidade : [
		{
			acao : String,
			parametros: String
		}
	]
});

mongoose.model('Usuario', UsuariosSchema);
