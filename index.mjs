import 'dotenv/config';
import mongoose from 'mongoose';
import application from './source/application.mjs';
import Contact from './source/entities/contact.mjs';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://kabileshwaranjaganathan_db_user:FZ792de67EWdrfM3@cluster0.syvvxet.mongodb.net/contact_management?retryWrites=true&w=majority&appName=Cluster0";
const port = Number(process.env.PORT || 3000);

try {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be between 1 and 65535');
  }

  console.log('Connecting to MongoDB database...');
  await mongoose.connect(MONGODB_URI, { 
    dbName: 'contact_management', 
    serverSelectionTimeoutMS: 15000 
  });
  console.log('MongoDB connected successfully!');

  await Contact.init();

  // Listen on 0.0.0.0 so Docker and external proxies (Cloudflare/ByteXL) can access the app
  const server = application.listen(port, '0.0.0.0', () => {
    console.log(`AddressBook API listening on 0.0.0.0:${port}`);
  });

  server.on('error', async error => { 
    console.error('Server error:', error.code); 
    await mongoose.disconnect(); 
    process.exitCode = 1; 
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      const deadline = setTimeout(() => process.exit(1), 10000); 
      deadline.unref();
      server.close(async () => { 
        await mongoose.disconnect(); 
        clearTimeout(deadline); 
      });
    });
  }
} catch (error) {
  console.error('Startup failed:', error.name === 'MongooseServerSelectionError' ? 'MongoDB could not be reached. Check your URI and network settings.' : error.message);
  await mongoose.disconnect(); 
  process.exitCode = 1;
}