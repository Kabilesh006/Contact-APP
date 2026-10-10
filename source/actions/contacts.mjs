import Contact from '../entities/contact.mjs';
const missing = response => response.status(404).json({ success: false, message: 'Contact does not exist' });

export async function add(request, response) {
  const contact = await Contact.create(request.body);
  response.location('/contacts/' + contact.contactId).status(201).json({ success: true, message: 'Contact created', contact });
}
export async function list(request, response) {
  const contacts = await Contact.find().sort({ name: 1, contactId: 1 });
  response.json({ success: true, count: contacts.length, contacts });
}
export async function get(request, response) {
  const contact = await Contact.findOne({ contactId: request.params.id });
  if (!contact) return missing(response);
  response.json({ success: true, contact });
}
export async function update(request, response) {
  const changes = { ...request.body }; delete changes.contactId;
  const contact = await Contact.findOneAndUpdate({ contactId: request.params.id }, { $set: changes }, { returnDocument: 'after', runValidators: true });
  if (!contact) return missing(response);
  response.json({ success: true, message: 'Contact updated', contact });
}
export async function remove(request, response) {
  const contact = await Contact.findOneAndDelete({ contactId: request.params.id });
  if (!contact) return missing(response);
  response.json({ success: true, message: 'Contact deleted', contactId: contact.contactId });
}
