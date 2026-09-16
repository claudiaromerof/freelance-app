function renderServices() {
  const query = ($("#serviceSearch")?.value || "").trim().toLowerCase();
  const status = $("#serviceStatus")?.value || "all";
  const sort = $("#serviceSort")?.value || "client";
  const showHistory = Boolean($("#serviceHistoryToggle")?.checked);

  let list = state.services.filter(service => {
    const client = getClient(service.clientId);
    const text = `${service.service} ${service.description} ${client?.name || ""}`.toLowerCase();
    const matchesSearch = text.includes(query);
    const matchesStatus = status === "all" || service.status === status;
    const isHistory = service.status === "Finalizado" || service.status === "Cancelado";
    const matchesHistory = showHistory || status !== "all" || !isHistory;
    return matchesSearch && matchesStatus && matchesHistory;
  });

  const activeCount = state.services.filter(s => s.status !== "Finalizado" && s.status !== "Cancelado").length;
  const historyCount = state.services.filter(s => s.status === "Finalizado" || s.status === "Cancelado").length;
  const pendingCount = state.services.filter(s => s.payment !== "Pagado" && s.status !== "Finalizado" && s.status !== "Cancelado").length;
  const overdueOrUpcoming = state.services.filter(s => s.status !== "Finalizado" && s.status !== "Cancelado").length;

  if ($("#servicesSummary")) {
    $("#servicesSummary").innerHTML = `
      <span><strong>${activeCount}</strong> activos</span>
      <span><strong>${pendingCount}</strong> por cobrar</span>
      <span><strong>${historyCount}</strong> históricos</span>
      ${historyCount && !showHistory && status === "all" ? `<button type="button" class="text-button" id="showServiceHistory">Ver historial</button>` : ""}
    `;
    $("#showServiceHistory")?.addEventListener("click", () => {
      const checkbox = $("#serviceHistoryToggle");
      if (checkbox) { checkbox.checked = true; renderServices(); }
    });
  }

  const dateValue = s => String(s.end || s.start || "9999-12-31");
  list.sort((a,b) => {
    if (sort === "client") {
      const ac = (getClient(a.clientId)?.name || "").toLowerCase();
      const bc = (getClient(b.clientId)?.name || "").toLowerCase();
      return ac.localeCompare(bc, "es") || dateValue(a).localeCompare(dateValue(b));
    }
    if (sort === "start") return String(b.start || "").localeCompare(String(a.start || ""));
    if (sort === "recent") return String(b.end || b.start || "").localeCompare(String(a.end || a.start || ""));
    return dateValue(a).localeCompare(dateValue(b));
  });

  const groups = [];
  const byClient = new Map();
  list.forEach(service => {
    const key = service.clientId || "__sin_cliente__";
    if (!byClient.has(key)) {
      const group = { key, client: getClient(service.clientId), services: [] };
      byClient.set(key, group); groups.push(group);
    }
    byClient.get(key).services.push(service);
  });

  if (sort !== "client") {
    groups.sort((a,b) => {
      const ad = dateValue(a.services[0]); const bd = dateValue(b.services[0]);
      return sort === "end" ? ad.localeCompare(bd) : bd.localeCompare(ad);
    });
  }

  const container = $("#servicesTable");
  if (!container) return;
  if (!list.length) {
    container.innerHTML = `<div class="empty-state service-empty">No hay servicios que coincidan con estos filtros.</div>`;
    return;
  }

  container.innerHTML = groups.map((group, index) => {
    const clientName = group.client?.name || "Sin cliente";
    const current = group.services.filter(s => s.status !== "Finalizado" && s.status !== "Cancelado").length;
    const pending = group.services.filter(s => s.payment !== "Pagado").length;
    return `
      <details class="service-client-group" ${index === 0 ? "open" : ""}>
        <summary>
          <div class="service-client-title"><span class="client-avatar">${escapeHtml(initials(clientName))}</span><div><strong>${escapeHtml(clientName)}</strong><small>${group.services.length} servicio${group.services.length !== 1 ? "s" : ""}${current ? ` · ${current} activo${current !== 1 ? "s" : ""}` : ""}</small></div></div>
          <div class="service-client-meta">${pending ? `<span>${pending} por cobrar</span>` : `<span>Al día</span>`}<span class="group-chevron">⌄</span></div>
        </summary>
        <div class="table-panel grouped-table"><table><thead><tr><th>Servicio</th><th>Periodo</th><th>Precio</th><th>Estado</th><th>Pago</th><th></th></tr></thead><tbody>
          ${group.services.map(service => serviceRow(service)).join("")}
        </tbody></table></div>
      </details>
    `;
  }).join("");

  $$('[data-edit-service]').forEach(btn => btn.addEventListener("click", () => openServiceEditor(btn.dataset.editService)));
  $$('[data-renew-service]').forEach(btn => btn.addEventListener("click", () => openRenewalModal(btn.dataset.renewService)));
  $$('[data-payment-service]').forEach(btn => btn.addEventListener("click", () => openPaymentEditor(btn.dataset.paymentService)));
  $$('[data-delete-service]').forEach(btn => btn.addEventListener("click", () => deleteContract(btn.dataset.deleteService)));
  $$('[data-billing-client]').forEach(btn => btn.addEventListener("click", () => openBillingModal(btn.dataset.billingClient)));
  renderCatalog();
}

function serviceRow(service) {
  const paymentClass = service.payment === "Pagado" ? "done" : "pending";
  const statusClass = service.status === "Finalizado" || service.status === "Cancelado" ? "done" : service.status === "Pendiente" ? "pending" : "";
  const periodicity = getCatalogItem(service.serviceId)?.periodicity;
  const canRenew = ['Mensual','Trimestral','Semestral','Anual'].includes(periodicity) && service.status !== "Cancelado";
  const paymentLabel = service.payment === "Pagado" ? "Pago" : "Registrar pago";
  return `<tr>
    <td><div class="table-primary">${escapeHtml(service.service)}</div><div class="table-secondary">${escapeHtml(service.description || "")}</div></td>
    <td>${formatDate(service.start)} — ${formatDate(service.end)}</td>
    <td>${money(serviceTotal(service), service.currency)}</td>
    <td><span class="status ${statusClass}">${escapeHtml(service.status)}</span></td>
    <td><span class="status ${paymentClass}">${escapeHtml(service.payment)}</span>${service.paymentDate ? `<div class="table-secondary">${formatDate(service.paymentDate)}</div>` : ""}</td>
    <td><div class="table-actions">
      <button class="secondary-button" data-edit-service="${escapeHtml(service.id)}">Editar</button>
      ${canRenew ? `<button class="service-download" data-renew-service="${escapeHtml(service.id)}">Renovar</button>` : ''}
      <button class="service-download" data-payment-service="${escapeHtml(service.id)}">${paymentLabel}</button>
      ${service.status !== "Finalizado" && service.status !== "Cancelado" ? `<button class="service-download" data-billing-client="${escapeHtml(service.clientId)}">${icon("i-download")} Cobro</button>` : ''}
      <button class="service-download danger-button" data-delete-service="${escapeHtml(service.id)}">Eliminar</button>
    </div></td>
  </tr>`;
}

function renderCatalog() {
  const tbody = $("#catalogTable");
  if (!tbody) return;
  const list = state.catalog;
  tbody.innerHTML = list.length ? list.map(item => `<tr>
    <td><div class="table-primary">${escapeHtml(item.name)}</div><div class="table-secondary">${escapeHtml(item.provider || "")}</div></td>
    <td>${escapeHtml(item.periodicity || "—")}</td>
    <td>${escapeHtml(item.baseCurrency || "USD")}</td>
    <td><span class="status ${item.active === "Sí" ? "" : "done"}">${item.active === "Sí" ? "Disponible" : "No disponible"}</span></td>
    <td><div class="table-actions"><button class="secondary-button" data-edit-catalog="${escapeHtml(item.id)}">Editar</button><button class="service-download danger-button" data-delete-catalog="${escapeHtml(item.id)}">Eliminar</button></div></td>
  </tr>`).join("") : `<tr><td colspan="5"><div class="empty-state">Sin servicios en el catálogo.</div></td></tr>`;
  $$('[data-edit-catalog]').forEach(btn => btn.addEventListener("click", () => openCatalogEditor(btn.dataset.editCatalog)));
  $$('[data-delete-catalog]').forEach(btn => btn.addEventListener("click", () => deleteCatalog(btn.dataset.deleteCatalog)));
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
  form.elements.paymentDate.value = service.paymentDate || todayISO();
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

["serviceSearch","serviceStatus","serviceSort","serviceHistoryToggle"].forEach(id => {
  $("#" + id)?.addEventListener(id === "serviceSearch" ? "input" : "change", renderServices);
});
