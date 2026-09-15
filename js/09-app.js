function refreshAll() {

  renderDashboard();

  renderClients();

  renderServices();

  renderQuotes();

  renderFinance();

  renderHistory();

  populateClientSelects();

}


/* =========================================================
   INICIO
   ========================================================= */

refreshAll();

(async function initializeRealData() {
  const connected = await loadRealState();
  if (connected) refreshAll();
})();