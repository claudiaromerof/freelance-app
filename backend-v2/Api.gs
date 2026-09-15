function authorized_(pin) {
  const expected = getConfig_().pin;
  if (!expected) throw new Error('No hay PIN configurado.');
  if (String(pin || '') !== String(expected)) throw new Error('PIN incorrecto.');
  return true;
}

function doGet(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    authorized_(p.pin || p.token);

    const action = p.action || 'state';
    let result;

    if (action === 'state') result = getState();
    else if (action === 'clientes') result = getClientes();
    else if (action === 'servicios') result = getServicios();
    else if (action === 'contrataciones') result = getContratacionesUI();
    else if (action === 'pendientesCobro') result = getPendientesCobro(p.idCliente);
    else if (action === 'cobros') result = getCobros();
    else if (action === 'cotizaciones') result = getCotizaciones();
    else throw new Error('Acción GET no reconocida: ' + action);

    return ContentService
      .createTextOutput(JSON.stringify({ok:true, version:APP.VERSION, data:safeJson_(result)}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false, error:String(err.message || err)}))
      .setMimeType(ContentService.MimeType.JSON);
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
        body = {
          pin: p.pin || p.token || '',
          action: p.action || '',
          data: p.payload ? JSON.parse(p.payload) : {}
        };
      }
    }
    authorized_(body.pin || body.token);
    const action = body.action;
    let result;

    switch (action) {
      case 'guardarCliente': result = guardarCliente(body.data || {}); break;
      case 'guardarServicio': result = guardarServicio(body.data || {}); break;
      case 'guardarContratacion': result = guardarContratacion(body.data || {}); break;
      case 'renovarContratacion': result = renovarContratacion(body.data || {}); break;
      case 'crearCobro': result = crearCobro(body.data || {}); break;
      case 'registrarPago': result = registrarPago(body.data || {}); break;
      case 'guardarCotizacion': result = guardarCotizacion(body.data || {}); break;
      default: throw new Error('Acción POST no reconocida: ' + action);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ok:true, version:APP.VERSION, data:safeJson_(result)}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false, error:String(err.message || err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
