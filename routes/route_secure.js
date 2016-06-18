var config = require('./../config');
var usuariosController = require('./../src/controller/usuarios');
var ofertasController = require('./../src/controller/ofertas');

module.exports = function(app, jwt){
	
	app.use(function(req, res, next) {

		// check header or url parameters or post parameters for token
		var token = req.body.token || req.query.token || req.headers['x-access-token'];

		// decode token
		if (token) {

			// verifies secret and checks exp
			jwt.verify(token, config.secret, function(err, decoded) {			
				if (err) {
					console.log(err)
					return res.json({ success: false, message: 'Falha ao autenticar o token.' });		
				} else {
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;	
					next();
				}
			});

		} else {

			// if there is no token
			// return an error
			return res.status(403).send({ 
				success: false, 
				message: 'Nenhum token foi informado.'
			});
			
		}
		
	});


	//APIs Usuario
	app.get('/usuarios/:hashIdentificador', usuariosController.consultarDadosCadastrais); 
	app.put('/usuarios/:hashIdentificador/alterarSenha', usuariosController.alterarSenha);
	app.put('/usuarios/:hashIdentificador/alterarDadosCadastrais', usuariosController.alterarDadosCadastrais);
	app.post('/ofertas/listarOfertas', ofertasController.getOfertasByUser);
	app.get('/ofertas/:hashIdentificador', ofertasController.consultarOferta);
	app.put('/ofertas/:hashIdentificador/cancelarOferta', ofertasController.cancelarOferta);

};
