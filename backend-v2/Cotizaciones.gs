function getCotizaciones() {
  return rows_('COTIZACIONES');
}

function guardarCotizacion(data) {
  const id = data.ID_COTIZACION || nextId_('COT', 'COTIZACIONES', 'ID_COTIZACION');
  const obj = Object.assign({}, data, {ID_COTIZACION: id});
  if (!obj.ID_CLIENTE) throw new Error('Falta ID_CLIENTE.');
  if (!obj.TITULO) throw new Error('El título de la cotización es obligatorio.');
  if (Number(obj.TOTAL || 0) < 0) throw new Error('Total inválido.');
  const exists = findById_('COTIZACIONES', 'ID_COTIZACION', id);
  if (exists) updateRow_('COTIZACIONES', 'ID_COTIZACION', id, obj);
  else appendRow_('COTIZACIONES', obj);
  return findById_('COTIZACIONES', 'ID_COTIZACION', id);
}
