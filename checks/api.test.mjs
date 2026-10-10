import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../source/application.mjs';
import Contact from '../source/entities/contact.mjs';
let database;
before(async () => { database = await MongoMemoryServer.create(); await mongoose.connect(database.getUri(), { dbName: 'contact_management' }); await Contact.init(); }, { timeout: 180000 });
beforeEach(async () => { await Contact.deleteMany({}); });
after(async () => { await mongoose.disconnect(); if (database) await database.stop(); });
const sample = { contactId: 'A100', name: 'Sara Ali', phone: '0123456789', email: 'sara@example.com' };

test('complete CRUD lifecycle and persisted update', async () => {
  const created = await request(app).post('/contacts').send(sample).expect(201);
  assert.equal(created.body.contact.contactId, 'A100');
  assert.equal(created.headers.location, '/contacts/A100');
  const all = await request(app).get('/contacts').expect(200);
  assert.equal(all.body.count, 1);
  await request(app).put('/contacts/A100').send({ name: 'Sara Khan' }).expect(200);
  const read = await request(app).get('/contacts/A100').expect(200);
  assert.equal(read.body.contact.name, 'Sara Khan');
  assert.equal(read.body.contact.phone, '0123456789');
  await request(app).delete('/contacts/A100').expect(200);
  await request(app).get('/contacts/A100').expect(404);
});
test('schema and input validation on create and update', async () => {
  for (const body of [{ name: 'X' }, { phone: '1234567890' }, { ...sample, phone: '123' }, { ...sample, phone: 1234567890 }, { ...sample, email: 'invalid' }, { ...sample, name: ' ' }, { ...sample, name: null }, { ...sample, contactId: 'bad/id' }, { ...sample, extra: true }, {}, []]) await request(app).post('/contacts').send(body).expect(400);
  await request(app).post('/contacts').send(sample).expect(201);
  for (const body of [{ name: '' }, { phone: 'bad' }, { email: 'bad' }, { contactId: 'rename' }, { $set: { name: 'X' } }]) await request(app).put('/contacts/A100').send(body).expect(400);
  assert.equal((await request(app).get('/contacts/A100')).body.contact.name, sample.name);
});
test('database uniqueness covers normalized email and updates', async () => {
  await request(app).post('/contacts').send(sample).expect(201);
  await request(app).post('/contacts').send({ ...sample, email: 'other@example.com' }).expect(409);
  await request(app).post('/contacts').send({ ...sample, contactId: 'B200', email: 'SARA@example.com' }).expect(409);
  await request(app).post('/contacts').send({ ...sample, contactId: 'C300', email: 'third@example.com' }).expect(201);
  await request(app).put('/contacts/C300').send({ email: sample.email }).expect(409);
});
test('generated IDs, optional email, alphabetical listing and empty results', async () => {
  assert.equal((await request(app).get('/contacts')).body.count, 0);
  const a = await request(app).post('/contacts').send({ name: 'Zoya', phone: '1234567890' }).expect(201);
  const b = await request(app).post('/contacts').send({ name: 'Amir', phone: '1234567890' }).expect(201);
  assert.notEqual(a.body.contact.contactId, b.body.contact.contactId);
  assert.deepEqual((await request(app).get('/contacts')).body.contacts.map(c => c.name), ['Amir', 'Zoya']);
});
test('missing records, malformed JSON and size limits', async () => {
  await request(app).get('/contacts/missing').expect(404);
  await request(app).put('/contacts/missing').send({ name: 'X' }).expect(404);
  await request(app).delete('/contacts/missing').expect(404);
  await request(app).post('/contacts').set('Content-Type', 'application/json').send('{').expect(400);
  await request(app).post('/contacts').send({ name: 'x'.repeat(17000) }).expect(413);
  await request(app).get('/unknown').expect(404);
  await request(app).get('/').expect(200);
});
