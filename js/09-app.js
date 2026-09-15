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
  const connected = await loadRealState();
  if (connected) { refreshAll(); if (typeof populateSettingsForm === "function") populateSettingsForm(); }
})();
