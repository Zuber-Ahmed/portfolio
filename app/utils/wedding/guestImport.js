const EXPECTED_HEADERS = ['displayName', 'recipientType', 'nikah', 'walima'];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(value);
      if (row.some(cell => String(cell).trim())) rows.push(row);
      row = [];
      value = '';
    } else value += character;
  }
  row.push(value);
  if (row.some(cell => String(cell).trim())) rows.push(row);
  return rows;
}

function parseBoolean(value) {
  if (value === true || String(value).trim().toLowerCase() === 'true')
    return true;
  if (value === false || String(value).trim().toLowerCase() === 'false')
    return false;
  return null;
}

function validateRows(rows) {
  const headers = (rows[0] || []).map(header =>
    String(header)
      .replace(/^\uFEFF/, '')
      .trim(),
  );
  const missing = EXPECTED_HEADERS.filter(header => !headers.includes(header));
  if (missing.length) throw new Error(`Missing columns: ${missing.join(', ')}`);

  return rows
    .slice(1)
    .filter(row => row.some(cell => String(cell ?? '').trim()))
    .map((row, index) => {
      const source = Object.fromEntries(
        headers.map((header, column) => [header, row[column]]),
      );
      const guest = {
        displayName: String(source.displayName ?? '').trim(),
        recipientType: String(source.recipientType ?? '')
          .trim()
          .toLowerCase(),
        nikah: parseBoolean(source.nikah),
        walima: parseBoolean(source.walima),
      };
      const errors = [];
      if (!guest.displayName) errors.push('Guest name is required');
      if (!['individual', 'family'].includes(guest.recipientType))
        errors.push('Type must be individual or family');
      if (guest.nikah === null) errors.push('Nikah must be true or false');
      if (guest.walima === null) errors.push('Walima must be true or false');
      if (guest.nikah === false && guest.walima === false)
        errors.push('Select at least one event');
      return { rowNumber: index + 2, guest, errors };
    });
}

export async function parseGuestFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let rows;
  if (extension === 'csv') rows = parseCsv(await file.text());
  else if (extension === 'xlsx') {
    const { default: readXlsxFile } = await import('read-excel-file/browser');
    rows = await readXlsxFile(file);
  } else throw new Error('Choose a .csv or .xlsx file.');
  const parsed = validateRows(rows);
  if (parsed.length > 100)
    throw new Error('Import up to 100 guests at a time.');
  if (!parsed.length)
    throw new Error('The file does not contain any guest rows.');
  return parsed;
}

function escapeCsv(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function downloadInvitationLinks(invitations) {
  const rows = [
    ['displayName', 'recipientType', 'nikah', 'walima', 'invitationUrl'],
    ...invitations.map(invitation => [
      invitation.displayName,
      invitation.recipientType,
      invitation.nikah,
      invitation.walima,
      invitation.invitationUrl,
    ]),
  ];
  const blob = new Blob(
    [`${rows.map(row => row.map(escapeCsv).join(',')).join('\n')}\n`],
    {
      type: 'text/csv;charset=utf-8',
    },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'wedding-invitation-links.csv';
  link.click();
  URL.revokeObjectURL(url);
}
