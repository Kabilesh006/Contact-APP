export default function handleError(error, request, response, next) {
  if (error.code === 11000) return response.status(409).json({ success: false, message: 'Duplicate contact', issues: [{ field: Object.keys(error.keyPattern || {})[0] || 'contactId/email', reason: 'Already in use' }] });
  if (error.name === 'ValidationError') return response.status(400).json({ success: false, message: 'Invalid contact details', issues: Object.entries(error.errors).map(([field, item]) => ({ field, reason: item.message })) });
  if (error.type === 'entity.parse.failed') return response.status(400).json({ success: false, message: 'Malformed JSON' });
  if (error.type === 'entity.too.large') return response.status(413).json({ success: false, message: 'JSON body exceeds 16 KB' });
  console.error('API error:', error.name);
  response.status(500).json({ success: false, message: 'Server could not complete this request' });
}
