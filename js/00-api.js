/* API — Google Apps Script V2
   JSONP transport: avoids browser CORS/preflight problems with Apps Script Web Apps.
*/

function apiConfigured(){ return !!(API_CONFIG?.URL && API_CONFIG.URL.includes('/exec')); }
function getApiPin(){ return sessionStorage.getItem('CRF_API_PIN') || ''; }
function setApiPin(pin){ pin ? sessionStorage.setItem('CRF_API_PIN', String(pin).trim()) : sessionStorage.removeItem('CRF_API_PIN'); }
function clearApiPin(){ sessionStorage.removeItem('CRF_API_PIN'); }

function jsonpRequest(action, params={}) {
  return new Promise((resolve, reject) => {
    const callback = `crf_jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const q = new URLSearchParams({
      action,
      pin: getApiPin(),
      callback
    });
    Object.entries(params || {}).forEach(([k,v]) => {
      if (v !== undefined && v !== null) q.set(k, typeof v === 'string' ? v : JSON.stringify(v));
    });

    let settled = false;
    const cleanup = () => {
      settled = true;
      delete window[callback];
      script.remove();
    };
    const timer = setTimeout(() => {
      if (settled) return;
      cleanup();
      reject(new Error('No se pudo conectar con el servidor. Verifica la implementación de Apps Script.'));
    }, 15000);

    window[callback] = (data) => {
      clearTimeout(timer);
      if (settled) return;
      cleanup();
      if (!data?.ok) reject(new Error(data?.error || 'Error de API'));
      else resolve(data.data ?? data);
    };

    script.onerror = () => {
      clearTimeout(timer);
      if (settled) return;
      cleanup();
      reject(new Error('Failed to fetch: no se pudo cargar la API de Google Apps Script.'));
    };

    script.src = `${API_CONFIG.URL}?${q.toString()}`;
    document.head.appendChild(script);
  });
}

async function apiRequest(action, method='GET', payload={}) {
  if (!apiConfigured()) throw new Error('API no configurada');
  if (!getApiPin()) throw new Error('Falta el PIN de acceso.');

  // Apps Script Web Apps no manejan bien CORS/preflight desde GitHub Pages.
  // Todas las operaciones V1/V2 viajan por GET/JSONP para evitar OPTIONS.
  if (method === 'POST') {
    return await jsonpRequest(action, { payload: JSON.stringify(payload || {}) });
  }
  return await jsonpRequest(action, payload);
}

function mapClient(r){return {id:r.ID_CLIENTE||'',name:r.NOMBRE_CLIENTE||'',documentType:r.TIPO_DOCUMENTO||'RUC',document:r.NUMERO_DOCUMENTO||'',contact:r.CONTACTO||'',email:r.EMAIL||'',phone:r.TELEFONO||'',country:r.PAIS||'Perú',currency:r.MONEDA||'USD',address:r.DIRECCION||'',notes:r.NOTAS||''};}
function mapCatalog(r){return {id:r.ID_SERVICIO||'',name:r.NOMBRE_SERVICIO||'',provider:r.PROVEEDOR||'',description:r.DESCRIPCION||'',periodicity:r.PERIODICIDAD||'',baseCurrency:r.MONEDA_BASE||'USD',active:r.ACTIVO||'Sí'};}
function mapQuote(r){return {id:r.ID_COTIZACION||'',clientId:r.ID_CLIENTE||'',date:r.FECHA||'',title:r.TITULO||'',description:r.DESCRIPCION||'',currency:r.MONEDA||'USD',price:Number(r.TOTAL||0),validity:r.VALIDEZ||'15 días',status:r.ESTADO||'Borrador',notes:r.NOTAS||''};}
function mapContract(r){return {id:r.ID_CONTRATACION||'',clientId:r.ID_CLIENTE||'',serviceId:r.ID_SERVICIO||'',service:r.NOMBRE_SERVICIO||r.SERVICIO||'',provider:r.PROVEEDOR||r.PROVEEDOR_SERVICIO||'',description:r.DESCRIPCION||'',start:r.FECHA_INICIO||'',end:r.FECHA_FIN||'',quantity:Number(r.CANTIDAD||1),cost:Number(r.COSTO_REAL||0),price:Number(r.PRECIO_CLIENTE||0),currency:r.MONEDA||'USD',profit:Number(r.GANANCIA||0),margin:Number(r.MARGEN||0),status:r.ESTADO_SERVICIO||'Activo',payment:r.ESTADO_PAGO||'Pendiente',paymentDate:r.FECHA_PAGO||'',notes:r.NOTAS||'',automaticRenewal:r.RENOVACION_AUTOMATICA||'No'};}

async function apiGet(){
  const raw=await apiRequest('state');
  return {clients:(raw.clients||[]).map(mapClient),catalog:(raw.serviceCatalog||[]).map(mapCatalog),services:(raw.contracts||[]).map(mapContract),quotes:(raw.quotes||[]).map(mapQuote),billing:raw.billing||[],settings:{documentType:'Recibo por Honorarios',retentionRate:8,noRetentionThreshold:1500,paymentHolder:'Claudia Romero Fonseca'}};
}
async function apiGetClientes(){return (await apiRequest('clientes')).map(mapClient);}
async function apiGetServicios(){return (await apiRequest('servicios')).map(mapCatalog);}
async function apiGetContrataciones(){const r=await apiRequest('contrataciones');return (r.contrataciones||[]).map(mapContract);}
async function apiGetPendientesCobro(idCliente){return (await apiRequest('pendientesCobro','GET',{idCliente})).map(mapContract);}
async function apiGetCobros(){return await apiRequest('cobros');}
async function apiGetCotizaciones(){return (await apiRequest('cotizaciones')).map(mapQuote);}

async function apiSaveClient(c){return await apiRequest('guardarCliente','POST',{ID_CLIENTE:c.id,NOMBRE_CLIENTE:c.name,TIPO_DOCUMENTO:c.documentType,NUMERO_DOCUMENTO:c.document,CONTACTO:c.contact,EMAIL:c.email,TELEFONO:c.phone,PAIS:c.country,MONEDA:c.currency,DIRECCION:c.address,NOTAS:c.notes});}
async function apiSaveCatalog(s){return await apiRequest('guardarServicio','POST',{ID_SERVICIO:s.id,NOMBRE_SERVICIO:s.name,PROVEEDOR:s.provider,DESCRIPCION:s.description,PERIODICIDAD:s.periodicity,MONEDA_BASE:s.baseCurrency,ACTIVO:s.active});}
async function apiSaveContract(s){return await apiRequest('guardarContratacion','POST',{ID_CONTRATACION:s.id,ID_CLIENTE:s.clientId,ID_SERVICIO:s.serviceId,DESCRIPCION:s.description,FECHA_INICIO:s.start,FECHA_FIN:s.end,CANTIDAD:s.quantity,COSTO_REAL:s.cost,PRECIO_CLIENTE:s.price,MONEDA:s.currency,ESTADO_SERVICIO:s.status,ESTADO_PAGO:s.payment||'Pendiente',FECHA_PAGO:s.paymentDate||'',NOTAS:s.notes||'',RENOVACION_AUTOMATICA:s.automaticRenewal||'No'});}
async function apiRenewContract(s){return await apiRequest('renovarContratacion','POST',{ID_CONTRATACION:s.id,ID_CLIENTE:s.clientId,ID_SERVICIO:s.serviceId,DESCRIPCION:s.description,FECHA_INICIO:s.start,FECHA_FIN:s.end,CANTIDAD:s.quantity,COSTO_REAL:s.cost,PRECIO_CLIENTE:s.price,MONEDA:s.currency,ESTADO_SERVICIO:s.status,NOTAS:s.notes||'',RENOVACION_AUTOMATICA:s.automaticRenewal||'No'});}
async function apiCreateBilling(p){return await apiRequest('crearCobro','POST',p);}
async function apiRegisterPayment(p){return await apiRequest('registrarPago','POST',p);}
async function apiSaveQuote(q){return await apiRequest('guardarCotizacion','POST',{ID_COTIZACION:q.id,ID_CLIENTE:q.clientId,FECHA:q.date,TITULO:q.title,DESCRIPCION:q.description,MONEDA:q.currency,TOTAL:q.price,ESTADO:q.status,NOTAS:q.notes||''});}
async function apiSave(){ return true; }
