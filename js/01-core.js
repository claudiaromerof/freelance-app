/* CLAUDIA R. — CORE / ESTADO */
const STORAGE_KEY = "claudia-freelance-v1";

const demoState = {
  clients: [],
  catalog: [
    { id:"SRV-001", name:"Wix", provider:"Wix", description:"Plan y servicios asociados a Wix", periodicity:"Anual", baseCurrency:"USD", active:"Sí" },
    { id:"SRV-002", name:"Google Workspace", provider:"Google", description:"Licencias y servicios de Google Workspace", periodicity:"Anual", baseCurrency:"USD", active:"Sí" }
  ],
  services: [],
  quotes: [],
  settings: { documentType:"Recibo por Honorarios", retentionRate:8, noRetentionThreshold:1500 }
};

let state = loadState();
let saveQueue = Promise.resolve();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(demoState);
    const parsed = JSON.parse(saved);
    return normalizeState(parsed);
  } catch (_) {
    return structuredClone(demoState);
  }
}

function normalizeState(parsed) {
  return {
    clients: Array.isArray(parsed?.clients) ? parsed.clients : [],
    catalog: Array.isArray(parsed?.catalog) ? parsed.catalog : structuredClone(demoState.catalog),
    services: Array.isArray(parsed?.services) ? parsed.services : [],
    quotes: Array.isArray(parsed?.quotes) ? parsed.quotes : [],
    settings: { ...demoState.settings, ...(parsed?.settings || {}) }
  };
}

async function loadRealState() {
  if (!apiConfigured()) return false;
  try {
    const remote = await apiGet();
    state = normalizeState(remote);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("No se pudo cargar Google Sheets:", error);
    toast("No se pudo conectar con Google Sheets.");
    return false;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (!apiConfigured()) return Promise.resolve();

  const snapshot = structuredClone(state);
  saveQueue = saveQueue.then(async () => {
    try {
      await apiSave(snapshot);
    } catch (error) {
      console.error("No se pudo guardar en Google Sheets:", error);
      toast("No se pudo guardar el cambio en Google Sheets.");
      throw error;
    }
  });
  return saveQueue;
}

function $(selector) { return document.querySelector(selector); }
function $$(selector) { return [...document.querySelectorAll(selector)]; }
function icon(id) { return `<svg aria-hidden="true"><use href="#${id}"></use></svg>`; }

function money(value, currency = "USD") {
  const number = Number(value) || 0;
  return `${currency === "PEN" ? "S/ " : "$"}${number.toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
}
function shortMoney(value, currency = "USD") {
  const number = Number(value) || 0;
  return `${currency === "PEN" ? "S/ " : "$"}${Math.round(number).toLocaleString("en-US")}`;
}
function formatDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-PE", {day:"2-digit",month:"short",year:"numeric"}).replace(".", "");
}
function formatLongDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-PE", {day:"2-digit",month:"long",year:"numeric"});
}
function initials(name) { return (name || "CRF").trim().split(/\s+/).slice(0,2).map(w => w[0]).join("").toUpperCase(); }
function getClient(id) { return state.clients.find(c => c.id === id); }
function getCatalogItem(id) { return state.catalog.find(s => s.id === id); }
function serviceTotal(service) { return Number(service.price || 0) * Number(service.quantity || 1); }
function serviceCost(service) { return Number(service.cost || 0) * Number(service.quantity || 1); }
function serviceProfit(service) { return serviceTotal(service) - serviceCost(service); }
function serviceMargin(service) { const sales = serviceTotal(service); return sales ? serviceProfit(service) / sales : 0; }
function escapeHtml(value) { return String(value ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
function toast(message) { const el = $("#toast"); if (!el) return; el.textContent = message; el.classList.add("show"); clearTimeout(window.__toastTimer); window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2600); }

function rheRetention(amount, applies = true) {
  const gross = Number(amount) || 0;
  const rate = Number(state.settings?.retentionRate ?? 8) || 0;
  const threshold = Number(state.settings?.noRetentionThreshold ?? 1500) || 0;
  if (!applies || gross <= threshold) return { gross, rate, retained: 0, net: gross };
  const retained = gross * rate / 100;
  return { gross, rate, retained, net: gross - retained };
}

function currentSettings() { return { ...demoState.settings, ...(state.settings || {}) }; }

function todayISO() { return new Date().toISOString().slice(0,10); }
function newId(prefix) { return `${prefix}-${String(Date.now()).slice(-8)}`; }
