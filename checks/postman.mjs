import newman from 'newman';
import mongoose from 'mongoose';
import { readFile } from 'node:fs/promises';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../source/application.mjs';
import Contact from '../source/entities/contact.mjs';
let database, server;
try {
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri(), { dbName: 'contact_management' }); await Contact.init();
  server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const collection = JSON.parse(await readFile(new URL('../postman/addressbook.json', import.meta.url), 'utf8'));
  await new Promise((resolve, reject) => newman.run({ collection, envVar: [{ key: 'baseUrl', value: 'http://127.0.0.1:' + server.address().port }], reporters: ['cli'] }, (error, result) => error || result.run.failures.length ? reject(error || new Error('Postman checks failed')) : resolve()));
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { if (server) await new Promise(resolve => server.close(resolve)); await mongoose.disconnect(); if (database) await database.stop(); }
