var mongoose = require('mongoose'),
FilaEmail = mongoose.model('FilaEmail');

exports.enviarEmailParaFila = function(para, assunto, html, tipo){
  var emailFila = new FilaEmail({
    destinatario : para,
    assunto : assunto,
    mensagem : html,
    tipo : tipo  
  });

  emailFila.save(function(err) {
      if(err) {
          console.log(err);
          return false;
      }
      else {
          return true;
      }
    });
};
