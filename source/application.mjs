import express from 'express';
import path from 'node:path';
import routes from './http/routes.mjs';
import handleError from './http/errors.mjs';

const application = express();
application.disable('x-powered-by');
application.use(express.json({ limit: '16kb' }));

application.use(express.static('src'));

application.get('/', (request, response) => {
  response.sendFile(path.join(process.cwd(), 'src', 'index.html'));
});

application.use('/contacts', routes);
application.use('/api/contacts', routes);
application.use('/api', routes);

application.use((request, response) => response.status(404).json({ success: false, message: 'Endpoint not found' }));
application.use(handleError);

export default application;