export function checkInput(request, response, next) {
  const input = request.body;
  const issues = [];
  if (!input || Array.isArray(input) || typeof input !== 'object' || !Object.keys(input).length) {
    return response.status(400).json({ success: false, message: 'Send a non-empty JSON object' });
  }
  for (const [field, value] of Object.entries(input)) {
    if (!['contactId', 'name', 'phone', 'email'].includes(field)) issues.push({ field, reason: 'Unknown field' });
    else if (typeof value !== 'string' || !value.trim()) issues.push({ field, reason: 'A non-empty string is required' });
  }
  if (request.method === 'PUT' && input.contactId !== undefined && input.contactId !== request.params.id) issues.push({ field: 'contactId', reason: 'Cannot change an existing ID' });
  if (issues.length) return response.status(400).json({ success: false, message: 'Invalid contact details', issues });
  next();
}
