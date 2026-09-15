function authorized_(pin) {
  const expected = getConfig_().pin;
  if (!expected) throw new Error('No hay PIN configurado.');
  if (String(pin || '') !== String(expected)) throw new Error('PIN incorrecto.');
  return true;
}

function jsonResponse_(payload, callback) {
  const json = JSON.stringify(payload);
  if (callback) {
    const safeCallback = String(callback).replace(/[^a-zA-Z0-9_$.]/g, '');
    return ContentService
      .createTextOutput(`${safeCallback}(${json});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function parsePayload_(p) {
  if (!p) return {};
  if (p.payload) {
    try { return JSON.parse(p.payload); } catch (_) { throw new Error('Payload inválido.'); }
  }
  return {};
}

function executeAction_(action, data) {
  switch (action) {
    case 'state': return getState();
    case 'clientes': return getClientes();
    case 'servicios': return getServicios();
    case 'contrataciones': return getContratacionesUI();
    case 'pendientesCobro': return getPendientesCobro(data.idCliente);
    case 'cobros': return getCobros();
    case 'cotizaciones': return getCotizaciones();
    case 'guardarCliente': return guardarCliente(data || {});
    case 'guardarServicio': return guardarServicio(data || {});
    case 'guardarContratacion': return guardarContratacion(data || {});
    case 'renovarContratacion': return renovarContratacion(data || {});
    case 'crearCobro': return crearCobro(data || {});
    case 'registrarPago': return registrarPago(data || {});
    case 'guardarCotizacion': return guardarCotizacion(data || {});
    default: throw new Error('Acción no reconocida: ' + action);
  }
}

function doGet(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    authorized_(p.pin || p.token);
    const action = p.action || 'state';
    const data = parsePayload_(p);
    if (p.idCliente && !data.idCliente) data.idCliente = p.idCliente;
    const result = executeAction_(action, data);
    return jsonResponse_({ok:true, version:APP.VERSION, data:safeJson_(result)}, p.callback);
  } catch (err) {
    return jsonResponse_({ok:false, error:String(err.message || err)}, e && e.parameter ? e.parameter.callback : '');
  }
}

function doPost(e) {
  try {
    const raw = (e && e.postData && e.postData.contents) || '';
    let body = {};
    if (raw) {
      try {
        body = JSON.parse(raw);
      } catch (_) {
        const p = e && e.parameter ? e.parameter : {};
        body = { pin:p.pin || p.token || '', action:p.action || '', data:p.payload ? JSON.parse(p.payload) : {} };
      }
    }
    authorized_(body.pin || body.token);
    const result = executeAction_(body.action, body.data || {});
    return jsonResponse_({ok:true, version:APP.VERSION, data:safeJson_(result)});
  } catch (err) {
    return jsonResponse_({ok:false, error:String(err.message || err)});
  }
}
