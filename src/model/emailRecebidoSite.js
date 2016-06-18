var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var EmailsRecebidosSiteSchema = new Schema({
  	email : String,
    nome : String,
    assunto : String,
    mensagem : String,
    data : Date
});

mongoose.model('EmailRecebidoSite', EmailsRecebidosSiteSchema);
