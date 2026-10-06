import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import routes from './http/routes.mjs';
import handleError from './http/errors.mjs';

const publicDir = fileURLToPath(new URL('../public', import.meta.url));
const application = express();
application.disable('x-powered-by');
application.use(express.json({ limit: '16kb' }));
application.use(express.static(publicDir, { index: false }));

application.get('/', (request, response) => {
  if (request.headers.accept && request.headers.accept.includes('text/html')) {
    return response.sendFile(path.join(publicDir, 'index.html'));
  }
  return response.json({ application: 'AddressBook API', version: '1.0.0', endpoints: ['POST /contacts', 'GET /contacts', 'GET /contacts/:id', 'PUT /contacts/:id', 'DELETE /contacts/:id'] });
});
application.get('/ui', (request, response) => response.sendFile(path.join(publicDir, 'index.html')));
application.use('/contacts', routes);
application.use((request, response) => response.status(404).json({ success: false, message: 'Endpoint not found' }));
application.use(handleError);
export default application;
