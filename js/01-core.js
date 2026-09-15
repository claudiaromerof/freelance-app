/* =========================================================
   CLAUDIA R. — SISTEMA DE GESTIÓN
   V1 — FRONTEND
   ========================================================= */

const STORAGE_KEY = "claudia-freelance-v1";

const demoState = {
  clients: [
    {
      id: "CLI-001",
      name: "Cliente de ejemplo",
      email: "cliente@ejemplo.com",
      phone: "+51 900 000 000",
      document: "",
      notes: "",
      createdAt: "2026-09-01"
    },
    {
      id: "CLI-002",
      name: "Proyecto de ejemplo",
      email: "contacto@ejemplo.com",
      phone: "",
      document: "",
      notes: "",
      createdAt: "2026-09-05"
    }
  ],

  services: [
    {
      id: "CNT-001",
      clientId: "CLI-001",
      service: "Gestión web",
      description: "Servicio de ejemplo",
      start: "2026-09-01",
      end: "2027-08-31",
      quantity: 1,
      cost: 180,
      price: 220,
      currency: "USD",
      status: "Activo",
      payment: "Pagado",
      notes: ""
    },
    {
      id: "CNT-002",
      clientId: "CLI-002",
      service: "Google Workspace",
      description: "Servicio de ejemplo",
      start: "2026-09-10",
      end: "2027-09-09",
      quantity: 1,
      cost: 120,
      price: 200,
      currency: "USD",
      status: "Activo",
      payment: "Pendiente",
      notes: ""
    }
  ],

  quotes: []
};

let state = loadState();


/* =========================================================
   DATOS
   ========================================================= */

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(demoState);
    const parsed = JSON.parse(saved);
    return {
      clients: Array.isArray(parsed.clients) ? parsed.clients : [],
      services: Array.isArray(parsed.services) ? parsed.services : [],
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : []
    };
  } catch (error) {
    return structuredClone(demoState);
  }
}

async function loadRealState() {
  if (!apiConfigured()) return false;
  try {
    const remote = await apiGet();
    state = {
      clients: Array.isArray(remote.clients) ? remote.clients : [],
      services: Array.isArray(remote.services) ? remote.services : [],
      quotes: Array.isArray(remote.quotes) ? remote.quotes : []
    };
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
  if (apiConfigured()) {
    apiSave(state).catch(error => {
      console.error("No se pudo guardar en Google Sheets:", error);
      toast("El cambio quedó local, pero no se guardó en Sheets.");
    });
  }
}


/* =========================================================
   HELPERS
   ========================================================= */

function $(selector) {
  return document.querySelector(selector);
}


function $$(selector) {
  return [...document.querySelectorAll(selector)];
}


function icon(id) {
  return `
    <svg aria-hidden="true">
      <use href="#${id}"></use>
    </svg>
  `;
}


function money(value, currency = "USD") {
  const number = Number(value) || 0;

  return `${currency === "PEN" ? "S/ " : "$"}${number.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  )}`;
}


function shortMoney(value, currency = "USD") {
  const number = Number(value) || 0;

  return `${currency === "PEN" ? "S/ " : "$"}${Math.round(
    number
  ).toLocaleString("en-US")}`;
}


function formatDate(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(`${dateString}T12:00:00`);

  return date
    .toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
    .replace(".", "");
}


function formatLongDate(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(`${dateString}T12:00:00`);

  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}


function initials(name) {
  return (name || "CRF")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join("")
    .toUpperCase();
}


function getClient(id) {
  return state.clients.find(client => client.id === id);
}


function serviceTotal(service) {
  return (
    Number(service.price || 0) *
    Number(service.quantity || 1)
  );
}


function serviceCost(service) {
  return (
    Number(service.cost || 0) *
    Number(service.quantity || 1)
  );
}


function serviceProfit(service) {
  return (
    serviceTotal(service) -
    serviceCost(service)
  );
}


function serviceMargin(service) {
  const sales = serviceTotal(service);

  return sales
    ? serviceProfit(service) / sales
    : 0;
}


function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function toast(message) {
  const element = $("#toast");

  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    element.classList.remove("show");
  }, 2600);
}


/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function showSection(sectionId) {

  $$(".page-section").forEach(section => {
    section.classList.toggle(
      "active",
      section.id === sectionId
    );
  });

  $$(".nav-item").forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.section === sectionId
    );
  });

  const sidebar = $("#sidebar");

  if (sidebar) {
    sidebar.classList.remove("open");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


$$(".nav-item").forEach(item => {

  item.addEventListener("click", () => {
    showSection(item.dataset.section);
  });

});


$$("[data-section-link]").forEach(button => {

  button.addEventListener("click", () => {
    showSection(button.dataset.sectionLink);
  });

});


$("#mobileMenu")?.addEventListener("click", () => {

  $("#sidebar")?.classList.toggle("open");

});


/* =========================================================
   DASHBOARD
   ========================================================= */

