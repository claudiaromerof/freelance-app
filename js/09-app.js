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

  const sidebar = $("#sidebar");
  if (sidebar) sidebar.classList.remove("open");
}

// Alias de compatibilidad para acciones antiguas.
function showView(sectionId) {
  showSection(sectionId);
}

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

refreshAll();
  if (typeof populateSettingsForm === "function") populateSettingsForm();
(async function initializeRealData(){
  if (!getApiToken()) {
    const token = window.prompt('Acceso privado · pega tu token de Apps Script:');
    if (token) setApiToken(token);
  }
  const connected = await loadRealState();
  if (connected) { refreshAll(); if (typeof populateSettingsForm === "function") populateSettingsForm(); }
})();

