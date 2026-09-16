function renderClients() {
  const query = ($("#clientSearch")?.value || "").trim().toLowerCase();
  const list = state.clients.filter(client => `${client.name} ${client.email} ${client.phone} ${client.document}`.toLowerCase().includes(query));
  $("#clientCount").textContent = `${list.length} ${list.length === 1 ? "cliente" : "clientes"}`;
  $("#clientsTable").innerHTML = list.length ? list.map(client => {
    const services = state.services.filter(s => s.clientId === client.id);
    const active = services.filter(s => s.status !== "Finalizado").length;
    const latest = [...services].sort((a,b) => String(b.start).localeCompare(String(a.start)))[0];
    return `<tr>
      <td><div class="table-primary">${escapeHtml(client.name)}</div><div class="table-secondary">${escapeHtml(client.document || "Sin documento")}</div></td>
      <td><div>${escapeHtml(client.email || "—")}</div><div class="table-secondary">${escapeHtml(client.phone || "")}</div></td>
      <td>${services.length}<div class="table-secondary">${active} activos</div></td>
      <td>${latest ? formatDate(latest.start) : "—"}</td>
      <td><div class="table-actions">
        <button class="secondary-button" data-edit-client="${escapeHtml(client.id)}">Editar</button>
        <button class="service-download danger-button" data-delete-client="${escapeHtml(client.id)}">Eliminar</button>
        <button class="service-download" data-billing-client="${escapeHtml(client.id)}">${icon("i-download")} Cobro</button>
      </div></td>
    </tr>`;
  }).join("") : `<tr><td colspan="5"><div class="empty-state">No se encontraron clientes.</div></td></tr>`;

  $$('[data-edit-client]').forEach(btn => btn.addEventListener("click", () => openClientEditor(btn.dataset.editClient)));
  $$('[data-billing-client]').forEach(btn => btn.addEventListener("click", () => openBillingModal(btn.dataset.billingClient)));
  $$('[data-delete-client]').forEach(btn => btn.addEventListener("click", () => deleteClient(btn.dataset.deleteClient)));
}

function openClientEditor(id) {
  const client = state.clients.find(c => c.id === id);
  if (!client) return toast("No se encontró el cliente.");
  const form = $("#clientForm");
  form.reset();
  form.elements.clientId.value = client.id;
  form.elements.name.value = client.name || "";
  form.elements.documentType.value = client.documentType || "RUC";
  form.elements.document.value = client.document || "";
  form.elements.contact.value = client.contact || "";
  form.elements.email.value = client.email || "";
  form.elements.phone.value = client.phone || "";
  form.elements.country.value = client.country || "Perú";
  form.elements.currency.value = client.currency || "USD";
  form.elements.address.value = client.address || "";
  form.elements.notes.value = client.notes || "";
  $("#clientModalTitle").textContent = "Editar cliente";
  $("#clientSubmitLabel").textContent = "Guardar cambios";
  openModal("clientModal");
}
