/**
 * CLAUDIA RF — GOOGLE SHEETS API PRO
 * Base de datos privada en Google Sheets.
 *
 * Publicación:
 * - Ejecutar como: tú
 * - Quién tiene acceso: cualquiera
 *
 * La app usa un token de API. No guardar este token en documentos públicos.
 */

const SPREADSHEET_ID = "14DVZqIzUH6m8V-0l8WBrSbiVf1h3lb8O50E74ofp3jE";
const API_TOKEN = "CM39nAfl8dCkEZhYUJ9JImhKnIz_Ma_TYqaSlRSFUyQ";

const DEFAULT_SETTINGS = {
  documentType: "Recibo por Honorarios",
  retentionRate: 8,
  noRetentionThreshold: 1500
};

const HEADERS = {
  CLIENTES: [
    "ID_CLIENTE","NOMBRE_CLIENTE","TIPO_DOCUMENTO","NUMERO_DOCUMENTO",
    "CONTACTO","EMAIL","TELEFONO","PAIS","MONEDA","DIRECCION","NOTAS"
  ],
  SERVICIOS: [
    "ID_SERVICIO","NOMBRE_SERVICIO","PROVEEDOR","DESCRIPCION",
    "PERIODICIDAD","MONEDA_BASE","ACTIVO"
  ],
  CONTRATACIONES: [
    "ID_CONTRATACION","ID_CLIENTE","ID_SERVICIO","DESCRIPCION",
    "FECHA_INICIO","FECHA_FIN","CANTIDAD","COSTO_REAL","PRECIO_CLIENTE",
    "MONEDA","TIPO_IGV","TASA_IGV","GANANCIA","MARGEN","ESTADO_SERVICIO",
    "ESTADO_PAGO","FECHA_PAGO","MEDIO_PAGO","NOTAS",
    "TIPO_COMPROBANTE","RETENCION_APLICA","TASA_RETENCION","MONTO_RETENIDO",
    "NETO_RECIBIDO","RHE_EMITIDO","RHE_NUMERO","RHE_FECHA"
  ],
  COTIZACIONES: [
    "ID_COTIZACION","ID_CLIENTE","FECHA","TITULO","DESCRIPCION",
    "PRECIO","MONEDA","VALIDEZ","TIPO_IGV","TASA_IGV","ESTADO","NOTAS",
    "TIPO_COMPROBANTE"
  ],
  CONFIGURACION: ["CLAVE","VALOR"]
};

function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    auth_(params.token || "");
    switch (params.action || "") {
      case "getState": return json_({ ok: true, state: readState_() });
      case "health": return json_({ ok: true, service: "Claudia RF API", version: "3.0" });
      default: return json_({ ok: true, service: "Claudia RF API", version: "3.0" });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    auth_(params.token || "");
    if ((params.action || "") !== "saveState") throw new Error("Acción no válida");
    if (!params.payload) throw new Error("Falta payload");
    const state = JSON.parse(params.payload);
    validateState_(state);
    writeState_(state);
    return json_({ ok: true, savedAt: new Date().toISOString() });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function auth_(token) {
  if (!token || token !== API_TOKEN) throw new Error("No autorizado");
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function validateState_(state) {
  if (!state || typeof state !== "object") throw new Error("Estado inválido");
  ["clients","catalog","services","quotes"].forEach(key => {
    if (!Array.isArray(state[key])) throw new Error(`Falta colección: ${key}`);
  });
}

function readState_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const catalogRows = readSheet_(ss, "SERVICIOS", HEADERS.SERVICIOS);
  const catalog = catalogRows.map(catalogRow_).filter(x => x.id);
  const catalogMap = {};
  catalog.forEach(item => catalogMap[item.id] = item);
  return {
    clients: readSheet_(ss, "CLIENTES", HEADERS.CLIENTES).map(clientRow_).filter(x => x.id),
    catalog,
    services: readSheet_(ss, "CONTRATACIONES", HEADERS.CONTRATACIONES).map(r => serviceRow_(r, catalogMap)).filter(x => x.id),
    quotes: readSheet_(ss, "COTIZACIONES", HEADERS.COTIZACIONES).map(quoteRow_).filter(x => x.id),
    settings: readSettings_(ss)
  };
}

function readSheet_(ss, name, headers) {
  const sh = ss.getSheetByName(name);
  if (!sh) return [];
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return [];
  const actual = values[0].map(v => String(v).trim());
  return values.slice(1)
    .filter(row => row.some(v => String(v).trim() !== ""))
    .map(row => {
      const obj = {};
      headers.forEach(h => {
        const index = actual.indexOf(h);
        obj[h] = index >= 0 ? row[index] : "";
      });
      return obj;
    });
}

function readSettings_(ss) {
  const defaults = Object.assign({}, DEFAULT_SETTINGS);
  const rows = readSheet_(ss, "CONFIGURACION", HEADERS.CONFIGURACION);
  rows.forEach(r => {
    const key = String(r.CLAVE || "").trim();
    if (key) defaults[key] = r.VALOR;
  });
  defaults.documentType = String(defaults.documentType || DEFAULT_SETTINGS.documentType);
  defaults.retentionRate = Number(defaults.retentionRate || DEFAULT_SETTINGS.retentionRate);
  defaults.noRetentionThreshold = Number(defaults.noRetentionThreshold || DEFAULT_SETTINGS.noRetentionThreshold);
  return defaults;
}

function clientRow_(r) {
  return {
    id: String(r.ID_CLIENTE || ""), name: String(r.NOMBRE_CLIENTE || ""),
    documentType: String(r.TIPO_DOCUMENTO || ""), document: String(r.NUMERO_DOCUMENTO || ""),
    contact: String(r.CONTACTO || ""), email: String(r.EMAIL || ""), phone: String(r.TELEFONO || ""),
    country: String(r.PAIS || ""), currency: String(r.MONEDA || "USD"), address: String(r.DIRECCION || ""),
    notes: String(r.NOTAS || ""), createdAt: ""
  };
}

function catalogRow_(r) {
  return { id:String(r.ID_SERVICIO||""), name:String(r.NOMBRE_SERVICIO||""), provider:String(r.PROVEEDOR||""), description:String(r.DESCRIPCION||""), periodicity:String(r.PERIODICIDAD||""), baseCurrency:String(r.MONEDA_BASE||"USD"), active:String(r.ACTIVO||"Sí") };
}

function serviceRow_(r, catalogMap) {
  const serviceId = String(r.ID_SERVICIO || "");
  const catalog = catalogMap[serviceId] || {};
  return {
    id:String(r.ID_CONTRATACION||""), clientId:String(r.ID_CLIENTE||""), serviceId,
    service:catalog.name || serviceId, provider:catalog.provider || "",
    description:String(r.DESCRIPCION || catalog.description || ""), start:dateOut_(r.FECHA_INICIO), end:dateOut_(r.FECHA_FIN),
    quantity:Number(r.CANTIDAD||1), cost:Number(r.COSTO_REAL||0), price:Number(r.PRECIO_CLIENTE||0),
    currency:String(r.MONEDA || catalog.baseCurrency || "USD"), status:String(r.ESTADO_SERVICIO||"Activo"),
    payment:String(r.ESTADO_PAGO||"Pendiente"), paymentDate:dateOut_(r.FECHA_PAGO), paymentMethod:String(r.MEDIO_PAGO||""),
    notes:String(r.NOTAS||""), documentType:String(r.TIPO_COMPROBANTE||"Recibo por Honorarios"),
    retentionApplies:String(r.RETENCION_APLICA||"Según corresponda"), retentionRate:Number(r.TASA_RETENCION||8),
    retentionAmount:Number(r.MONTO_RETENIDO||0), netReceived:Number(r.NETO_RECIBIDO||0),
    rheEmitted:String(r.RHE_EMITIDO||"No"), rheNumber:String(r.RHE_NUMERO||""), rheDate:dateOut_(r.RHE_FECHA)
  };
}

function quoteRow_(r) {
  return {
    id:String(r.ID_COTIZACION||""), clientId:String(r.ID_CLIENTE||""), date:dateOut_(r.FECHA),
    title:String(r.TITULO||""), description:String(r.DESCRIPCION||""), price:Number(r.PRECIO||0),
    currency:String(r.MONEDA||"USD"), validity:String(r.VALIDEZ||"15 días"), status:String(r.ESTADO||"Borrador"),
    notes:String(r.NOTAS||""), documentType:String(r.TIPO_COMPROBANTE||"Recibo por Honorarios")
  };
}

function dateOut_(value) {
  if (!value) return "";
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value)) return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  const text = String(value).trim(); if (!text) return "";
  const dmy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${String(dmy[2]).padStart(2,"0")}-${String(dmy[1]).padStart(2,"0")}`;
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${String(iso[2]).padStart(2,"0")}-${String(iso[3]).padStart(2,"0")}`;
  const date = new Date(text); return isNaN(date) ? text : Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function writeState_(state) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  writeSheet_(ss,"CLIENTES",HEADERS.CLIENTES,state.clients.map(clientWrite_));
  writeSheet_(ss,"SERVICIOS",HEADERS.SERVICIOS,state.catalog.map(catalogWrite_));
  writeSheet_(ss,"CONTRATACIONES",HEADERS.CONTRATACIONES,state.services.map(serviceWrite_));
  writeSheet_(ss,"COTIZACIONES",HEADERS.COTIZACIONES,state.quotes.map(quoteWrite_));
  writeSettings_(ss,state.settings || DEFAULT_SETTINGS);
}

function ensureSheet_(ss,name,headers) {
  let sh=ss.getSheetByName(name); if(!sh) sh=ss.insertSheet(name);
  if(sh.getLastRow()===0) sh.getRange(1,1,1,headers.length).setValues([headers]);
  return sh;
}

function writeSheet_(ss,name,headers,rows) {
  const sh=ensureSheet_(ss,name,headers), oldLastRow=sh.getLastRow(), clearCols=Math.max(sh.getLastColumn(),headers.length);
  if(oldLastRow>1) sh.getRange(2,1,oldLastRow-1,clearCols).clearContent();
  sh.getRange(1,1,1,headers.length).setValues([headers]);
  if(rows.length) sh.getRange(2,1,rows.length,headers.length).setValues(rows);
}

function writeSettings_(ss,settings) {
  const rows = [
    ["documentType", settings.documentType || DEFAULT_SETTINGS.documentType],
    ["retentionRate", Number(settings.retentionRate || DEFAULT_SETTINGS.retentionRate)],
    ["noRetentionThreshold", Number(settings.noRetentionThreshold || DEFAULT_SETTINGS.noRetentionThreshold)]
  ];
  writeSheet_(ss,"CONFIGURACION",HEADERS.CONFIGURACION,rows);
}

function clientWrite_(c){return [c.id||"",c.name||"",c.documentType||"",c.document||"",c.contact||"",c.email||"",c.phone||"",c.country||"",c.currency||"USD",c.address||"",c.notes||""];}
function catalogWrite_(c){return [c.id||"",c.name||"",c.provider||"",c.description||"",c.periodicity||"",c.baseCurrency||"USD",c.active||"Sí"];}

function serviceWrite_(s){
  const qty=Number(s.quantity||1), total=Number(s.price||0)*qty, cost=Number(s.cost||0)*qty, profit=total-cost, margin=total?profit/total:0;
  const rate=Number(s.retentionRate||8), applies=String(s.retentionApplies||"Según corresponda");
  const shouldRetain=applies==="Sí" || (applies==="Según corresponda" && total>1500);
  const retained=shouldRetain ? total*rate/100 : 0;
  const net=total-retained;
  return [s.id||"",s.clientId||"",s.serviceId||"",s.description||"",s.start||"",s.end||"",qty,Number(s.cost||0),Number(s.price||0),s.currency||"USD","","",profit,margin,s.status||"Activo",s.payment||"Pendiente",s.paymentDate||"",s.paymentMethod||"",s.notes||"",s.documentType||"Recibo por Honorarios",applies,rate,retained,net,s.rheEmitted||"No",s.rheNumber||"",s.rheDate||""];
}

function quoteWrite_(q){return [q.id||"",q.clientId||"",q.date||"",q.title||"",q.description||"",Number(q.price||0),q.currency||"USD",q.validity||"15 días","","",q.status||"Borrador",q.notes||"",q.documentType||"Recibo por Honorarios"];}
