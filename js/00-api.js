/* =========================================================
   CRF — API FIREBASE
   Capa compatible con los módulos existentes.
   Reemplaza Apps Script + Google Sheets.
   ========================================================= */

function apiConfigured() { return true; }

window.CRF_FIREBASE_READY = import("./firebase.js").then(async (mod) => {

  const {
    auth,
    db,
    loginWithGoogle,
    logoutFirebase,
    watchAuth
  } = mod;

  window.CRF_FIREBASE_MODULE = mod;

  let currentUser = auth.currentUser || null;

  watchAuth((user) => {
    currentUser = user || null;
    window.CRF_CURRENT_USER = currentUser;
    window.dispatchEvent(new CustomEvent("crf-auth-state", { detail: { user: currentUser } }));
  });

  const {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    deleteDoc
  } = await import("https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js");

  function firebaseConfigured() {
    return !!(auth && db);
  }

  function getCurrentUser() {
    return currentUser || auth.currentUser || null;
  }

  function isAuthenticated() {
    return !!getCurrentUser();
  }

  function requireAuth() {
    const user = getCurrentUser();
    if (!user) throw new Error("Debes iniciar sesión con Google.");
    return user;
  }

  function cleanObject(obj) {
    const result = {};
    Object.entries(obj || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) result[key] = value;
    });
    return result;
  }

  function normalizeDate(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (value?.toDate) return value.toDate().toISOString();
    if (value instanceof Date) return value.toISOString();
    return String(value);
  }

  async function readCollection(name) {
    requireAuth();
    const snap = await getDocs(collection(db, name));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async function saveDocument(name, id, data) {
    requireAuth();
    const clean = cleanObject(data);

    if (id) {
      await setDoc(doc(db, name, id), clean, { merge: true });
      return { ok: true, id };
    }

    const ref = await addDoc(collection(db, name), clean);
    return { ok: true, id: ref.id };
  }

  function mapClient(id, r) {
    return {
      id,
      name: r.name ?? r.NOMBRE_CLIENTE ?? "",
      documentType: r.documentType ?? r.TIPO_DOCUMENTO ?? "RUC",
      document: r.document ?? r.NUMERO_DOCUMENTO ?? "",
      contact: r.contact ?? r.CONTACTO ?? "",
      email: r.email ?? r.EMAIL ?? "",
      phone: r.phone ?? r.TELEFONO ?? "",
      country: r.country ?? r.PAIS ?? "Perú",
      currency: r.currency ?? r.MONEDA ?? "USD",
      address: r.address ?? r.DIRECCION ?? "",
      notes: r.notes ?? r.NOTAS ?? ""
    };
  }

  function mapCatalog(id, r) {
    return {
      id,
      name: r.name ?? r.NOMBRE_SERVICIO ?? "",
      provider: r.provider ?? r.PROVEEDOR ?? "",
      description: r.description ?? r.DESCRIPCION ?? "",
      periodicity: r.periodicity ?? r.PERIODICIDAD ?? "",
      baseCurrency: r.baseCurrency ?? r.MONEDA_BASE ?? "USD",
      active: r.active ?? r.ACTIVO ?? "Sí"
    };
  }

  function mapContract(id, r) {
    return {
      id,
      clientId: r.clientId ?? r.ID_CLIENTE ?? "",
      serviceId: r.serviceId ?? r.ID_SERVICIO ?? "",
      service: r.service ?? r.NOMBRE_SERVICIO ?? r.SERVICIO ?? "",
      provider: r.provider ?? r.PROVEEDOR ?? r.PROVEEDOR_SERVICIO ?? "",
      description: r.description ?? r.DESCRIPCION ?? "",
      start: normalizeDate(r.start ?? r.FECHA_INICIO),
      end: normalizeDate(r.end ?? r.FECHA_FIN),
      quantity: Number(r.quantity ?? r.CANTIDAD ?? 1),
      cost: Number(r.cost ?? r.COSTO_REAL ?? 0),
      price: Number(r.price ?? r.PRECIO_CLIENTE ?? 0),
      currency: r.currency ?? r.MONEDA ?? "USD",
      profit: Number(r.profit ?? r.GANANCIA ?? 0),
      margin: Number(r.margin ?? r.MARGEN ?? 0),
      status: r.status ?? r.ESTADO_SERVICIO ?? "Activo",
      payment: r.payment ?? r.ESTADO_PAGO ?? "Pendiente",
      paymentDate: normalizeDate(r.paymentDate ?? r.FECHA_PAGO),
      notes: r.notes ?? r.NOTAS ?? "",
      automaticRenewal: r.automaticRenewal ?? r.RENOVACION_AUTOMATICA ?? "No",
      renewedFrom: r.renewedFrom ?? ""
    };
  }

  function mapQuote(id, r) {
    return {
      id,
      clientId: r.clientId ?? r.ID_CLIENTE ?? "",
      date: normalizeDate(r.date ?? r.FECHA),
      title: r.title ?? r.TITULO ?? "",
      description: r.description ?? r.DESCRIPCION ?? "",
      currency: r.currency ?? r.MONEDA ?? "USD",
      price: Number(r.price ?? r.TOTAL ?? 0),
      validity: r.validity ?? r.VALIDEZ ?? "15 días",
      status: r.status ?? r.ESTADO ?? "Borrador",
      notes: r.notes ?? r.NOTAS ?? ""
    };
  }

  async function apiGetClientes() {
    const rows = await readCollection("clientes");
    return rows.map(r => mapClient(r.id, r));
  }

  async function apiGetServicios() {
    const rows = await readCollection("servicios");
    return rows.map(r => mapCatalog(r.id, r));
  }

  async function apiGetContrataciones() {
    const rows = await readCollection("contrataciones");
    return rows.map(r => mapContract(r.id, r));
  }

  async function apiGetCotizaciones() {
    const rows = await readCollection("cotizaciones");
    return rows.map(r => mapQuote(r.id, r));
  }

  async function apiGetCobros() {
    return await readCollection("cobros");
  }

  async function apiGetPendientesCobro(clientId) {
    const contracts = await apiGetContrataciones();
    return contracts.filter(c =>
      c.clientId === clientId &&
      c.status !== "Finalizado" &&
      c.status !== "Cancelado" &&
      c.payment !== "Pagado"
    );
  }

  async function apiGet() {
    requireAuth();

    const [clients, catalog, services, quotes, billing, configSnap] = await Promise.all([
      apiGetClientes(),
      apiGetServicios(),
      apiGetContrataciones(),
      apiGetCotizaciones(),
      apiGetCobros(),
      getDoc(doc(db, "configuracion", "principal"))
    ]);

    const settings = configSnap.exists()
      ? configSnap.data()
      : {
          documentType: "Recibo por Honorarios",
          retentionRate: 8,
          noRetentionThreshold: 1500,
          paymentHolder: "Claudia Romero Fonseca",
          bankUSD: "", accountUSD: "", cciUSD: "",
          bankPEN: "", accountPEN: "", cciPEN: "",
          mobilePayment: ""
        };

    return { clients, catalog, services, quotes, billing, settings };
  }

  async function apiSaveClient(c) {
    return saveDocument("clientes", c.id, {
      name: c.name,
      documentType: c.documentType,
      document: c.document,
      contact: c.contact,
      email: c.email,
      phone: c.phone,
      country: c.country,
      currency: c.currency,
      address: c.address,
      notes: c.notes
    });
  }

  async function apiSaveCatalog(s) {
    return saveDocument("servicios", s.id, {
      name: s.name,
      provider: s.provider,
      description: s.description,
      periodicity: s.periodicity,
      baseCurrency: s.baseCurrency,
      active: s.active
    });
  }

  async function apiSaveContract(s) {
    const quantity = Number(s.quantity || 1);
    const cost = Number(s.cost || 0);
    const price = Number(s.price || 0);
    const profit = price * quantity - cost * quantity;
    const margin = price * quantity ? profit / (price * quantity) : 0;

    return saveDocument("contrataciones", s.id, {
      clientId: s.clientId,
      serviceId: s.serviceId,
      service: s.service,
      provider: s.provider,
      description: s.description,
      start: s.start,
      end: s.end,
      quantity,
      cost,
      price,
      currency: s.currency,
      profit,
      margin,
      status: s.status || "Activo",
      payment: s.payment || "Pendiente",
      paymentDate: s.paymentDate || "",
      notes: s.notes || "",
      automaticRenewal: s.automaticRenewal || "No"
    });
  }

  async function apiRenewContract(s) {
    const quantity = Number(s.quantity || 1);
    const cost = Number(s.cost || 0);
    const price = Number(s.price || 0);
    const profit = price * quantity - cost * quantity;
    const margin = price * quantity ? profit / (price * quantity) : 0;
    const newId = s.newId || `CNT-${Date.now()}`;

    return saveDocument("contrataciones", newId, {
      clientId: s.clientId,
      serviceId: s.serviceId,
      service: s.service,
      provider: s.provider,
      description: s.description,
      start: s.start,
      end: s.end,
      quantity,
      cost,
      price,
      currency: s.currency,
      profit,
      margin,
      status: s.status || "Activo",
      payment: "Pendiente",
      paymentDate: "",
      notes: s.notes || "",
      automaticRenewal: s.automaticRenewal || "No",
      renewedFrom: s.id || ""
    });
  }

  async function apiSaveQuote(q) {
    return saveDocument("cotizaciones", q.id, {
      clientId: q.clientId,
      date: q.date,
      title: q.title,
      description: q.description,
      currency: q.currency,
      price: Number(q.price || 0),
      validity: q.validity || "15 días",
      status: q.status || "Borrador",
      notes: q.notes || ""
    });
  }

  async function apiCreateBilling(p) {
    const billingId = p.id || `COB-${Date.now()}`;
    const data = { ...p };
    delete data.detalle;
    const result = await saveDocument("cobros", billingId, data);

    for (const detail of (p.detalle || [])) {
      const detailId = `${billingId}-${detail.idContratacion || Date.now()}`;
      await saveDocument("cobro_detalle", detailId, {
        idCobro: billingId,
        idContratacion: detail.idContratacion,
        cantidad: Number(detail.cantidad || 1),
        precioUnitario: Number(detail.precioUnitario || 0),
        total: Number(detail.total || 0)
      });
    }

    return result;
  }

  async function apiRegisterPayment(p) {
    requireAuth();
    const contractIds = p.contractIds || p.ID_CONTRATACIONES || [];

    for (const contractId of contractIds) {
      if (!contractId) continue;
      await setDoc(doc(db, "contrataciones", contractId), {
        payment: "Pagado",
        paymentDate: p.fechaPago || p.FECHA_PAGO || "",
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    const billingId = p.idCobro || p.ID_COBRO || "";
    if (billingId) {
      await setDoc(doc(db, "cobros", billingId), {
        estado: "Pagado",
        fechaPago: p.fechaPago || p.FECHA_PAGO || "",
        medioPago: p.medioPago || p.MEDIO_PAGO || "",
        numeroRhe: p.numeroRhe || p.NUMERO_RHE || "",
        fechaRhe: p.fechaRhe || p.FECHA_RHE || "",
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    return { ok: true };
  }

  async function apiSave(nextState) {
    requireAuth();
    const snapshot = nextState || {};

    for (const c of (snapshot.clients || [])) await apiSaveClient(c);
    for (const s of (snapshot.catalog || [])) await apiSaveCatalog(s);
    for (const c of (snapshot.services || [])) await apiSaveContract(c);
    for (const q of (snapshot.quotes || [])) await apiSaveQuote(q);

    if (snapshot.settings) {
      await setDoc(
        doc(db, "configuracion", "principal"),
        cleanObject(snapshot.settings),
        { merge: true }
      );
    }

    return { ok: true };
  }

  async function apiRequest(action, method = "GET", payload = {}) {
    switch (action) {
      case "state": return apiGet();
      case "clientes": return apiGetClientes();
      case "servicios": return apiGetServicios();
      case "contrataciones": return { contrataciones: await apiGetContrataciones() };
      case "pendientesCobro": return apiGetPendientesCobro(payload.idCliente);
      case "cotizaciones": return apiGetCotizaciones();
      case "cobros": return apiGetCobros();
      default: throw new Error(`Acción no implementada: ${action}`);
    }
  }

  window.CRF_FIREBASE = {
    auth,
    db,
    login: loginWithGoogle,
    logout: logoutFirebase,
    getCurrentUser,
    isAuthenticated,
    watchAuth,
    apiGet,
    apiGetClientes,
    apiGetServicios,
    apiGetContrataciones,
    apiGetPendientesCobro,
    apiGetCotizaciones,
    apiGetCobros,
    apiSaveClient,
    apiSaveCatalog,
    apiSaveContract,
    apiRenewContract,
    apiCreateBilling,
    apiRegisterPayment,
    apiSaveQuote,
    apiSave,
    apiRequest
  };

  window.apiGet = apiGet;
  window.apiGetClientes = apiGetClientes;
  window.apiGetServicios = apiGetServicios;
  window.apiGetContrataciones = apiGetContrataciones;
  window.apiGetPendientesCobro = apiGetPendientesCobro;
  window.apiGetCotizaciones = apiGetCotizaciones;
  window.apiGetCobros = apiGetCobros;
  window.apiSaveClient = apiSaveClient;
  window.apiSaveCatalog = apiSaveCatalog;
  window.apiSaveContract = apiSaveContract;
  window.apiRenewContract = apiRenewContract;
  window.apiCreateBilling = apiCreateBilling;
  window.apiRegisterPayment = apiRegisterPayment;
  window.apiSaveQuote = apiSaveQuote;
  window.apiSave = apiSave;
  window.apiRequest = apiRequest;
  window.apiConfigured = firebaseConfigured;
  window.getApiPin = () => "";
  window.setApiPin = () => true;
  window.clearApiPin = () => true;

  console.log("CRF Firebase API cargada correctamente.");
  return window.CRF_FIREBASE;
});


/* Wrappers: la app puede cargarse mientras Firebase termina de inicializar. */
window.apiGet = async (...args) => (await window.CRF_FIREBASE_READY).apiGet(...args);
window.apiGetClientes = async (...args) => (await window.CRF_FIREBASE_READY).apiGetClientes(...args);
window.apiGetServicios = async (...args) => (await window.CRF_FIREBASE_READY).apiGetServicios(...args);
window.apiGetContrataciones = async (...args) => (await window.CRF_FIREBASE_READY).apiGetContrataciones(...args);
window.apiGetPendientesCobro = async (...args) => (await window.CRF_FIREBASE_READY).apiGetPendientesCobro(...args);
window.apiGetCotizaciones = async (...args) => (await window.CRF_FIREBASE_READY).apiGetCotizaciones(...args);
window.apiGetCobros = async (...args) => (await window.CRF_FIREBASE_READY).apiGetCobros(...args);
window.apiSaveClient = async (...args) => (await window.CRF_FIREBASE_READY).apiSaveClient(...args);
window.apiSaveCatalog = async (...args) => (await window.CRF_FIREBASE_READY).apiSaveCatalog(...args);
window.apiSaveContract = async (...args) => (await window.CRF_FIREBASE_READY).apiSaveContract(...args);
window.apiRenewContract = async (...args) => (await window.CRF_FIREBASE_READY).apiRenewContract(...args);
window.apiCreateBilling = async (...args) => (await window.CRF_FIREBASE_READY).apiCreateBilling(...args);
window.apiRegisterPayment = async (...args) => (await window.CRF_FIREBASE_READY).apiRegisterPayment(...args);
window.apiSaveQuote = async (...args) => (await window.CRF_FIREBASE_READY).apiSaveQuote(...args);
window.apiSave = async (...args) => (await window.CRF_FIREBASE_READY).apiSave(...args);
window.apiRequest = async (...args) => (await window.CRF_FIREBASE_READY).apiRequest(...args);
