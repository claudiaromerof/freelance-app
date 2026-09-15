/* =========================================================
   NAVEGACIÓN PRINCIPAL
   ========================================================= */
function showSection(sectionId) {
  const validSections = new Set([
    "dashboard", "clients", "services", "quotes",
    "finance", "history", "documents", "settings"
  ]);
  const target = validSections.has(sectionId) ? sectionId : "dashboard";

  $$(".page-section").forEach(section => {
    section.classList.toggle("active", section.id === target);
  });

  $$(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.section === target);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
  $("#sidebar")?.classList.remove("open");
}

function showView(sectionId) { showSection(sectionId); }

$$('[data-section]').forEach(item => {
  item.addEventListener('click', () => showSection(item.dataset.section));
});

$("#mobileMenu")?.addEventListener("click", () => {
  $("#sidebar")?.classList.toggle("open");
});

$$('[data-section-link]').forEach(item => {
  item.addEventListener('click', () => showSection(item.dataset.sectionLink));
});

function refreshAll() {
  renderDashboard();
  renderClients();
  renderServices();
  renderQuotes();
  renderFinance();
  renderHistory();
  populateClientSelects();
}

async function requireAccess() {
  if (!apiConfigured()) {
    alert("La aplicación no tiene configurada la API.");
    return false;
  }

  clearApiPin();

  for (let attempt = 1; attempt <= 3; attempt++) {
    const pin = window.prompt(`Acceso privado\n\nEscribe tu PIN (${attempt}/3):`);
    if (pin === null) return false;

    setApiPin(pin);

    try {
      await loadRealState();
      return true;
    } catch (error) {
      clearApiPin();
      if (attempt < 3) {
        alert("PIN incorrecto. Inténtalo nuevamente.");
      } else {
        alert("No se pudo acceder. Verifica tu PIN.");
      }
    }
  }

  return false;
}

(async function initializeRealData(){
  const connected = await requireAccess();
  if (!connected) {
    // No mostramos datos demo ni datos guardados localmente si la autenticación falla.
    state = normalizeState({clients:[], catalog:[], services:[], quotes:[], settings:{}});
    refreshAll();
    return;
  }

  refreshAll();
  if (typeof populateSettingsForm === "function") populateSettingsForm();
})();
