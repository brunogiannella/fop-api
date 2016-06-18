module.exports = function(app, jwt){
	var usuarios = require('./../src/controller/usuarios');
	var hoteis = require('./../src/controller/hoteis');
	var login = require('./../src/controller/login');
	var atendimento = require('./../src/controller/atendimento');
	var ofertasController = require('./../src/controller/ofertas');
	
	app.post('/authenticate', login.realizarLoginUsuario);
	app.post('/usuarios', usuarios.cadastrarUsuario);
	app.post('/usuarios/recuperarSenha', usuarios.enviarEmailRecuperarSenha);
	app.post('/usuarios/confirmarCadastro', usuarios.confirmarCadastro);
	app.get('/hoteis/destinosHoteis', hoteis.destinosHoteis);
	app.get('/hoteis', hoteis.listarHoteis);
	app.post('/hoteis/regiao', hoteis.listarHoteisRegiao);
	app.get('/hoteis/regioes/:cidade', hoteis.regioes);
	app.post('/hoteis', hoteis.cadastrarHotel); 
	app.get('/hoteis/:hashIdentificador', hoteis.consultarHotel);
	app.post('/ofertas/enviarOferta', ofertasController.enviarOferta);
	app.put('/ofertas/:hashIdentificador/aprovarOferta', ofertasController.aprovarOferta);
	app.put('/ofertas/:hashIdentificador/rejeitarOferta', ofertasController.rejeitarOferta);
	app.post('/atendimento/enviarFormulario', atendimento.enviarEmail);
};
