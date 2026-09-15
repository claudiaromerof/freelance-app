function ss_() {
  const cfg = getConfig_();
  if (!cfg.spreadsheetId || cfg.spreadsheetId.includes('PON_AQUI')) {
    throw new Error('Config.gs: coloca el ID de tu Google Sheet.');
  }
  return SpreadsheetApp.openById(cfg.spreadsheetId);
}

function sheet_(name) {
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('No existe la hoja: ' + name);
  return sh;
}

function rows_(name) {
  const sh = sheet_(name);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1)
    .filter(row => row.some(v => String(v ?? '').trim() !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i] instanceof Date
        ? Utilities.formatDate(row[i], Session.getScriptTimeZone(), 'yyyy-MM-dd')
        : row[i]);
      return obj;
    });
}

function findById_(name, idField, id) {
  return rows_(name).find(r => String(r[idField]) === String(id)) || null;
}

function nextId_(prefix, name, idField) {
  const items = rows_(name);
  let max = 0;
  items.forEach(x => {
    const m = String(x[idField] || '').match(new RegExp('^' + prefix + '-(\\d+)$'));
    if (m) max = Math.max(max, Number(m[1]));
  });
  return prefix + '-' + String(max + 1).padStart(3, '0');
}

function appendRow_(name, obj) {
  const sh = sheet_(name);
  const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
  sh.appendRow(headers.map(h => obj[h] ?? ''));
}

function updateRow_(name, idField, id, obj) {
  const sh = sheet_(name);
  const data = sh.getDataRange().getValues();
  const headers = data[0].map(String);
  const idx = headers.indexOf(idField);
  if (idx < 0) throw new Error('Campo ID no encontrado: ' + idField);
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][idx]) === String(id)) {
      const merged = headers.map((h, c) => obj[h] !== undefined ? obj[h] : data[r][c]);
      sh.getRange(r + 1, 1, 1, headers.length).setValues([merged]);
      return true;
    }
  }
  throw new Error('No se encontró ' + idField + ': ' + id);
}

function safeJson_(value) {
  return JSON.parse(JSON.stringify(value));
}
