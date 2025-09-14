const { Router } = require('express');
const controller = require('../controllers/controller');

const routes = Router();

/**
 * You can adapt the generic paths used in the API to fit the object
 * you are using, e.g., if you use an Animal class, all the paths
 * might start with '/animals'.
 */
routes.get('/persons', controller.getAll);
routes.get('/persons/:id', controller.get);
routes.post('/persons', controller.create);
routes.put('/persons/:id', controller.update);
routes.delete('/persons/:id', controller.delete);

module.exports = routes;