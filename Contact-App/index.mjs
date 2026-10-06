import 'dotenv/config';
import mongoose from 'mongoose';
import application from './source/application.mjs';
import Contact from './source/entities/contact.mjs';

try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Configure .env using .env.example.');
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'contact_management', serverSelectionTimeoutMS: 10000 });
  await Contact.init();
  const server = application.listen(port, () => console.log('AddressBook API listening on port ' + port));
  server.on('error', async error => { console.error('Server error:', error.code); await mongoose.disconnect(); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
    const deadline = setTimeout(() => process.exit(1), 10000); deadline.unref();
    server.close(async () => { await mongoose.disconnect(); clearTimeout(deadline); });
  });
} catch (error) {
  console.error('Startup failed:', error.name === 'MongooseServerSelectionError' ? 'MongoDB could not be reached. Check your URI and database service.' : error.message);
  await mongoose.disconnect(); process.exitCode = 1;
}
