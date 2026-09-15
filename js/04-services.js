
function addDaysISO(dateString, days) {
  const d = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0,10);
}

function renewalCandidate(service) {
  if (!service?.end || service.status === "Cancelado") return false;
  const today = todayISO();
  if (service.end >= today) return false;
  const newer = state.services.some(other =>
    other.id !== service.id &&
    other.clientId === service.clientId &&
    other.serviceId === service.serviceId &&
    String(other.start || "") > String(service.start || "")
  );
  return !newer;
}

function openRenewalEditor(id) {
  const service = state.services.find(item => item.id === id);
  if (!service) return toast("No se encontró el servicio.");

  const form = $("#serviceForm");
  if (!form) return;
  populateClientSelects();
  populateCatalogSelect();
  form.reset();
  form.elements.serviceId.value = "";
  form.elements.renewalFromId.value = service.id;
  form.elements.clientId.value = service.clientId || "";
  form.elements.serviceCatalog.value = service.serviceId || "";
  form.elements.description.value = service.description || "";
  form.elements.start.value = addDaysISO(service.end, 1);
  const durationDays = Math.max(1, Math.round((new Date(`${service.end}T12:00:00`) - new Date(`${service.start}T12:00:00`)) / 86400000));
  form.elements.end.value = addDaysISO(form.elements.start.value, durationDays);
  form.elements.quantity.value = service.quantity ?? 1;
  form.elements.currency.value = service.currency || "USD";
  form.elements.cost.value = service.cost ?? 0;
  form.elements.price.value = service.price ?? 0;
  form.elements.status.value = "Activo";
  form.elements.notes.value = service.notes || "";
  $("#serviceModalTitle").textContent = "Renovar servicio";
  $("#serviceSubmitLabel").textContent = "Crear nuevo periodo";
  updateProfitPreview();
  openModal("serviceModal");
}

function renderServices() {
  const query = ($("#serviceSearch")?.value || "").trim().toLowerCase();
  const status = $("#serviceStatus")?.value || "all";
  const list = state.services.filter(service => {
    const client = getClient(service.clientId);
    const text = `${service.service} ${service.description} ${client?.name || ""}`.toLowerCase();
    return text.includes(query) && (status === "all" || service.status === status);
  });

  $("#servicesTable").innerHTML = list.length ? list.map(service => {
    const client = getClient(service.clientId);
    const paymentClass = service.payment === "Pendiente" ? "pending" : "done";
    const statusClass = service.status === "Finalizado" ? "done" : service.status === "Pendiente" ? "pending" : "";
    return `<tr>
      <td><div class="table-primary">${escapeHtml(service.service)}</div><div class="table-secondary">${escapeHtml(service.description || "")}</div></td>
      <td>${escapeHtml(client?.name || "—")}</td>
      <td>${formatDate(service.start)} — ${formatDate(service.end)}</td>
      <td>${money(serviceTotal(service), service.currency)}</td>
      <td><span class="status ${statusClass}">${escapeHtml(service.status)}</span></td>
      <td><span class="status ${paymentClass}">${escapeHtml(service.payment)}</span>${service.paymentDate ? `<div class="table-secondary">${formatDate(service.paymentDate)}</div>` : ""}</td>
      <td><div class="table-actions">
        <button class="secondary-button" data-edit-service="${escapeHtml(service.id)}">Editar</button>
        ${renewalCandidate(service) ? `<button class="service-download" data-renew-service="${escapeHtml(service.id)}">Renovar</button>` : ""}
        ${service.payment === "Pagado" ? `<button class="service-download" data-payment-service="${escapeHtml(service.id)}">Pago</button>` : `<button class="service-download" data-payment-service="${escapeHtml(service.id)}">Registrar pago</button>`}
        <button class="service-download" data-billing-client="${escapeHtml(service.clientId)}">${icon("i-download")} Cobro</button>
      </div></td>
    </tr>`;
  }).join("") : `<tr><td colspan="7"><div class="empty-state">No hay servicios que coincidan.</div></td></tr>`;

  $$('[data-edit-service]').forEach(btn => btn.addEventListener("click", () => openServiceEditor(btn.dataset.editService)));
  $$('[data-renew-service]').forEach(btn => btn.addEventListener("click", () => openRenewalEditor(btn.dataset.renewService)));
  $$('[data-payment-service]').forEach(btn => btn.addEventListener("click", () => openPaymentEditor(btn.dataset.paymentService)));
  $$('[data-billing-client]').forEach(btn => btn.addEventListener("click", () => openBillingModal(btn.dataset.billingClient)));
  renderCatalog();
}

function renderCatalog() {
  const tbody = $("#catalogTable");
  if (!tbody) return;
  const list = state.catalog;
  tbody.innerHTML = list.length ? list.map(item => `<tr>
    <td><div class="table-primary">${escapeHtml(item.name)}</div><div class="table-secondary">${escapeHtml(item.provider || "")}</div></td>
    <td>${escapeHtml(item.periodicity || "—")}</td>
    <td>${escapeHtml(item.baseCurrency || "USD")}</td>
    <td><span class="status ${item.active === "Sí" ? "" : "done"}">${escapeHtml(item.active || "Sí")}</span></td>
    <td><button class="secondary-button" data-edit-catalog="${escapeHtml(item.id)}">Editar</button></td>
  </tr>`).join("") : `<tr><td colspan="5"><div class="empty-state">Sin servicios en el catálogo.</div></td></tr>`;
  $$('[data-edit-catalog]').forEach(btn => btn.addEventListener("click", () => openCatalogEditor(btn.dataset.editCatalog)));
}

function populateCatalogSelect() {
  const select = $("#serviceCatalog");
  if (!select) return;
  select.innerHTML = `<option value="">Selecciona un servicio del catálogo</option>` + state.catalog.filter(x => x.active !== "No").map(x => `<option value="${escapeHtml(x.id)}">${escapeHtml(x.name)}${x.provider ? ` · ${escapeHtml(x.provider)}` : ""}</option>`).join("");
}

function openServiceEditor(id) {
  const service = state.services.find(item => item.id === id);
  if (!service) return toast("No se encontró el servicio.");
  const form = $("#serviceForm");
  populateClientSelects(); populateCatalogSelect(); form.reset();
  form.elements.serviceId.value = service.id || "";
  form.elements.clientId.value = service.clientId || "";
  form.elements.serviceCatalog.value = service.serviceId || "";
  form.elements.description.value = service.description || "";
  form.elements.start.value = service.start || "";
  form.elements.end.value = service.end || "";
  form.elements.quantity.value = service.quantity ?? 1;
  form.elements.currency.value = service.currency || "USD";
  form.elements.cost.value = service.cost ?? 0;
  form.elements.price.value = service.price ?? 0;
  form.elements.status.value = service.status || "Activo";
  form.elements.notes.value = service.notes || "";
  $("#serviceModalTitle").textContent = "Editar servicio";
  $("#serviceSubmitLabel").textContent = "Guardar cambios";
  updateProfitPreview(); openModal("serviceModal");
}

function openPaymentEditor(id) {
  const service = state.services.find(s => s.id === id);
  if (!service) return toast("No se encontró el servicio.");
  const form = $("#paymentForm"); form.reset();
  form.elements.serviceId.value = service.id;
  form.elements.payment.value = service.payment || "Pendiente";
  form.elements.paymentDate.value = service.paymentDate || (service.payment === "Pagado" ? todayISO() : todayISO());
  form.elements.paymentMethod.value = service.paymentMethod || "Transferencia";
  form.elements.notes.value = "";
  $("#paymentServiceName").textContent = `${service.service} · ${getClient(service.clientId)?.name || ""}`;
  openModal("paymentModal");
}

function openCatalogEditor(id) {
  const item = state.catalog.find(x => x.id === id);
  if (!item) return;
  const form = $("#catalogForm"); form.reset();
  form.elements.catalogId.value = item.id;
  form.elements.name.value = item.name || "";
  form.elements.provider.value = item.provider || "";
  form.elements.description.value = item.description || "";
  form.elements.periodicity.value = item.periodicity || "Anual";
  form.elements.baseCurrency.value = item.baseCurrency || "USD";
  form.elements.active.value = item.active || "Sí";
  $("#catalogModalTitle").textContent = "Editar servicio del catálogo";
  $("#catalogSubmitLabel").textContent = "Guardar cambios";
  openModal("catalogModal");
}

function updateProfitPreview() {
  const form = $("#serviceForm"); if (!form) return;
  const profit = (Number(form.elements.price.value || 0) - Number(form.elements.cost.value || 0)) * Number(form.elements.quantity.value || 1);
  $("#profitPreview").textContent = money(profit, form.elements.currency.value || "USD");
}


["price","cost","quantity","currency"].forEach(name => {
  $("#serviceForm")?.elements[name]?.addEventListener("input", updateProfitPreview);
  $("#serviceForm")?.elements[name]?.addEventListener("change", updateProfitPreview);
});
