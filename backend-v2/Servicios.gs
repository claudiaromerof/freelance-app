function getServicios() {
  return rows_('SERVICIOS');
}

function getServicio(id) {
  return findById_('SERVICIOS', 'ID_SERVICIO', id);
}

function getContrataciones() {
  return rows_('CONTRATACIONES');
}

function getContratacionesUI() {
  return {
    contrataciones: getContrataciones(),
    clientes: getClientes(),
    servicios: getServicios()
  };
}

function getContratacionesCliente(idCliente) {
  return getContrataciones().filter(x => String(x.ID_CLIENTE) === String(idCliente));
}

function getHistorialServicioCliente(idCliente, idServicio) {
  return getContrataciones()
    .filter(x => String(x.ID_CLIENTE) === String(idCliente) && String(x.ID_SERVICIO) === String(idServicio))
    .sort((a,b) => new Date(a.FECHA_INICIO) - new Date(b.FECHA_INICIO));
}

function guardarServicio(data) {
  const id = data.ID_SERVICIO || nextId_('SRV', 'SERVICIOS', 'ID_SERVICIO');
  const obj = Object.assign({
    ACTIVO: 'Sí',
    PERIODICIDAD: 'Anual',
    MONEDA_BASE: 'PEN'
  }, data, {ID_SERVICIO:id});
  if (!obj.NOMBRE_SERVICIO) throw new Error('El nombre del servicio es obligatorio.');

  const exists = findById_('SERVICIOS', 'ID_SERVICIO', id);
  if (exists) updateRow_('SERVICIOS', 'ID_SERVICIO', id, obj);
  else appendRow_('SERVICIOS', obj);

  return findById_('SERVICIOS', 'ID_SERVICIO', id);
}

function normalizarContratacion_(data) {
  const costo = Number(data.COSTO_REAL || 0);
  const precio = Number(data.PRECIO_CLIENTE || 0);
  const cantidad = Number(data.CANTIDAD || 1);
  const totalCosto = costo * cantidad;
  const totalPrecio = precio * cantidad;
  const ganancia = totalPrecio - totalCosto;
  const margen = totalPrecio ? ganancia / totalPrecio : 0;

  return Object.assign({}, data, {
    CANTIDAD: cantidad,
    GANANCIA: ganancia,
    MARGEN: margen,
    ESTADO_SERVICIO: data.ESTADO_SERVICIO || 'Activo',
    ESTADO_PAGO: data.ESTADO_PAGO || 'Pendiente',
    RENOVACION_AUTOMATICA: data.RENOVACION_AUTOMATICA || 'No'
  });
}

function guardarContratacion(data) {
  if (!data.ID_CLIENTE) throw new Error('Falta ID_CLIENTE.');
  if (!data.ID_SERVICIO) throw new Error('Falta ID_SERVICIO.');
  if (!data.FECHA_INICIO || !data.FECHA_FIN) throw new Error('Faltan fechas.');
  if (Number(data.PRECIO_CLIENTE || 0) < 0 || Number(data.COSTO_REAL || 0) < 0) throw new Error('Costo/precio inválido.');

  const id = data.ID_CONTRATACION || nextId_('CNT', 'CONTRATACIONES', 'ID_CONTRATACION');
  const obj = normalizarContratacion_(Object.assign({}, data, {ID_CONTRATACION:id}));

  const exists = findById_('CONTRATACIONES', 'ID_CONTRATACION', id);
  if (exists) updateRow_('CONTRATACIONES', 'ID_CONTRATACION', id, obj);
  else appendRow_('CONTRATACIONES', obj);

  return findById_('CONTRATACIONES', 'ID_CONTRATACION', id);
}

function renovarContratacion(data) {
  const original = findById_('CONTRATACIONES', 'ID_CONTRATACION', data.ID_CONTRATACION);
  if (!original) throw new Error('No existe la contratación a renovar.');

  const nueva = Object.assign({}, original);
  delete nueva.ID_CONTRATACION;

  Object.keys(data).forEach(k => {
    if (k !== 'ID_CONTRATACION') nueva[k] = data[k];
  });

  nueva.ID_CONTRATACION = nextId_('CNT', 'CONTRATACIONES', 'ID_CONTRATACION');
  nueva.ESTADO_PAGO = 'Pendiente';
  nueva.FECHA_PAGO = '';
  return guardarContratacion(nueva);
}
