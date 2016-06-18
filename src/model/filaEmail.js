var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var FilaEmailSchema = new Schema({
  	destinatario : String,
    assunto : String,
    mensagem : Object,
    tipo : String,
    status : { type: String, default: "PENDENTE" },
    dataCadastro : { type: Date, default: Date.now },
    dataEnvio : Date
});

mongoose.model('FilaEmail', FilaEmailSchema);
