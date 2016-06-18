var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var OfertasSchema = new Schema({
    hashIdentificador: String,
    id:Number,
  	id_usuario : String,
    data_oferta : { type: Date, default: Date.now },
    observacao : { type: String, default: "" },
    quantidade_quartos : { type: Number, default: 0 },
    quantidade_adultos : { type: Number, default: 0 },
    quantidade_criancas : { type: Number, default: 0 },
    valor : Number,
    status : String,
    data_inicio : Date,
    data_fim : Date,
    hoteis : [
        {
            hashIdentificador : String,
            nome : String,
            status_operacao : { type: String, default: "AGUARDANDO RESPOSTA" },
            data_hora : { type: Date, default: Date.now }
        }
    ],
    informacoes_pessoais : [
        {
            telefone : String,
            nome : String,
            sobrenome : String,
            data_nascimento : String
        }
    ],
    informacoes_financeiras : [
        {
            bandeira : String,
            token_cartao : String
        }
    ]
});

mongoose.model('Oferta', OfertasSchema);
