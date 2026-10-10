import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';

const schema = new mongoose.Schema({
  contactId: { type: String, default: () => 'AB-' + randomBytes(12).toString('hex'), unique: true, required: true,
    match: [/^[A-Za-z0-9_-]{1,80}$/, 'contactId must contain 1–80 letters, digits, underscores or hyphens'] },
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 150 },
  phone: { type: String, required: [true, 'Phone is required'], match: [/^[0-9]{10}$/, 'Phone must have exactly 10 digits'] },
  email: { type: String, trim: true, lowercase: true, maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email format is invalid'] }
}, { versionKey: false, timestamps: true });
schema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
schema.set('toJSON', { transform(document, json) { delete json._id; return json; } });
export default mongoose.model('Contact', schema);
