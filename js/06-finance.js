/* =========================================================
   CRF — FINANZAS V1.3
   La vista financiera nunca mezcla monedas para calcular porcentajes.
   El ejercicio se deriva del periodo de cada contratación.
   ========================================================= */

function currencyTotals(list, valueFn) {
  return list.reduce((acc, item) => {
    const currency = item.currency || "USD";
    acc[currency] = (acc[currency] || 0) + Number(valueFn(item) || 0);
    return acc;
  }, {});
}

function financeText(totals) {
  const keys = Object.keys(totals);
  if (!keys.length) return "—";
  return keys.map(currency => money(totals[currency], currency)).join(" · ");
}

function financePercentageByCurrency(list, numeratorFn, denominatorFn) {
  const grouped = {};
  list.forEach(item => {
    const currency = item.currency || "USD";
    if (!grouped[currency]) grouped[currency] = { numerator: 0, denominator: 0 };
    grouped[currency].numerator += Number(numeratorFn(item) || 0);
    grouped[currency].denominator += Number(denominatorFn(item) || 0);
  });
  const keys = Object.keys(grouped);
  if (!keys.length) return "0%";
  return keys.map(currency => {
    const row = grouped[currency];
    const pct = row.denominator ? (row.numerator / row.denominator) * 100 : 0;
    return `${pct.toFixed(1)}%${keys.length > 1 ? ` ${currency}` : ""}`;
  }).join(" · ");
}

function servicePeriodKey(service) {
  const start = String(service.start || "").slice(0, 4);
  const end = String(service.end || "").slice(0, 4);
  if (!start && !end) return "Sin periodo";
  if (start && end && start !== end) return `${start}-${end}`;
  return start || end;
}

function getFinancePeriods() {
  return [...new Set(state.services.map(servicePeriodKey).filter(Boolean))]
    .filter(key => key !== "Sin periodo")
    .sort((a, b) => b.localeCompare(a, "es", { numeric: true }));
}

function populateFinancePeriods() {
  const select = $("#financePeriod");
  if (!select) return;
  const previous = select.value;
  const periods = getFinancePeriods();
  select.innerHTML = `<option value="all">Todos los periodos</option>` +
    periods.map(period => `<option value="${escapeHtml(period)}">${escapeHtml(period)}</option>`).join("");
  if (previous && (previous === "all" || periods.includes(previous))) {
    select.value = previous;
  } else if (periods.length) {
    // Por defecto mostramos el ejercicio más reciente.
    select.value = periods[0];
  } else {
    select.value = "all";
  }
}

function getFinanceServices() {
  const selected = $("#financePeriod")?.value || "all";
  return state.services.filter(service => selected === "all" || servicePeriodKey(service) === selected);
}

function marginLevel(margin) {
  const pct = Number(margin || 0) * 100;
  if (pct < 0) return { key: "negative", label: "Margen negativo" };
  if (pct < 10) return { key: "danger", label: "Margen crítico" };
  if (pct < 20) return { key: "low", label: "Margen bajo" };
  if (pct < 30) return { key: "review", label: "Revisar margen" };
  return { key: "healthy", label: "Margen saludable" };
}

function financeReviewServices(list) {
  const minimum = Number(currentSettings().marginMinimum ?? 20) / 100;
  return list
    .filter(service => service.status !== "Cancelado" && service.status !== "Finalizado")
    .map(service => ({
      service,
      margin: serviceMargin(service),
      profit: serviceProfit(service),
      total: serviceTotal(service),
      cost: serviceCost(service),
      minimumPrice: serviceCost(service) / Math.max(0.01, 1 - minimum),
      level: marginLevel(serviceMargin(service))
    }))
    .filter(row => row.margin < minimum)
    .sort((a, b) => a.margin - b.margin || b.cost - a.cost);
}

function renderFinanceReview(list) {
  const container = $("#financeReviewList");
  if (!container) return;
  const rows = financeReviewServices(list).slice(0, 8);
  const target = Number(currentSettings().marginTarget ?? 25) / 100;

  if (!rows.length) {
    container.innerHTML = `
      <div class="finance-empty-review">
        <span class="finance-check">✓</span>
        <div><strong>No hay servicios por debajo de tu margen mínimo.</strong><small>Tu mínimo configurado es ${(Number(currentSettings().marginMinimum ?? 20)).toFixed(0)}%.</small></div>
      </div>`;
    return;
  }

  container.innerHTML = rows.map(({ service, margin, profit, minimumPrice, level }) => {
    const client = getClient(service.clientId);
    const marginPct = (margin * 100).toFixed(1);
    const targetPrice = serviceCost(service) / Math.max(0.01, 1 - target);
    const levelClass = level.key === "negative" ? "negative" : level.key;
    return `
      <div class="finance-review-item">
        <div class="finance-review-main">
          <div class="finance-review-title">
            <strong>${escapeHtml(service.service)}</strong>
            <span class="finance-margin-badge ${levelClass}">${marginPct}%</span>
          </div>
          <small>${escapeHtml(client?.name || "Sin cliente")} · ${escapeHtml(servicePeriodKey(service))}</small>
        </div>
        <div class="finance-review-values">
          <span>Precio ${money(serviceTotal(service), service.currency)}</span>
          <span>Mín. ${money(minimumPrice, service.currency)}</span>
          <span>Objetivo ${money(targetPrice, service.currency)}</span>
          <b class="${profit < 0 ? "negative-text" : ""}">${profit < 0 ? "−" : ""}${money(Math.abs(profit), service.currency)} ganancia</b>
        </div>
        <button type="button" class="text-button finance-edit-service" data-finance-edit="${escapeHtml(service.id)}">Revisar</button>
      </div>`;
  }).join("");

  $$('[data-finance-edit]').forEach(button => {
    button.addEventListener("click", () => {
      if (typeof openServiceEditor === "function") openServiceEditor(button.dataset.financeEdit);
    });
  });
}

function renderFinance() {
  populateFinancePeriods();
  const list = getFinanceServices();
  const sales = currencyTotals(list, serviceTotal);
  const costs = currencyTotals(list, serviceCost);
  const collectedList = list.filter(service => service.payment === "Pagado");
  const pendingList = list.filter(service => service.payment !== "Pagado");
  const collected = currencyTotals(collectedList, serviceTotal);
  const pending = currencyTotals(pendingList, serviceTotal);
  const profit = currencyTotals(list, serviceProfit);

  $("#financeSales").textContent = financeText(sales);
  $("#financeCosts").textContent = financeText(costs);
  $("#financeProfit").textContent = financeText(profit);
  $("#financeCollected").textContent = financeText(collected);
  $("#financePending").textContent = financeText(pending);

  const margin = financePercentageByCurrency(list, serviceProfit, serviceTotal);
  const costRatio = financePercentageByCurrency(list, serviceCost, serviceTotal);
  const collectionRate = financePercentageByCurrency(list, serviceTotal, serviceTotal);
  const paidRatio = financePercentageByCurrency(collectedList, serviceTotal, serviceTotal);

  $("#financeMargin").textContent = margin;
  $("#financeCostRatio").textContent = costRatio;
  $("#financeCollectionRate").textContent = paidRatio;

  const recurring = list.filter(service => {
    const catalog = getCatalogItem(service.serviceId);
    return catalog?.periodicity === "Anual" && service.status !== "Finalizado" && service.status !== "Cancelado";
  });
  $("#financeRecurringProfit").textContent = financeText(currencyTotals(recurring, serviceProfit));

  $("#financeSalesSub").textContent = `${list.length} contratación${list.length !== 1 ? "es" : ""} en el ejercicio`;
  $("#financeCollectionSub").textContent = `${paidRatio} de los ingresos del periodo`;
  $("#financePendingSub").textContent = `${pendingList.length} servicio${pendingList.length !== 1 ? "s" : ""} pendiente${pendingList.length !== 1 ? "s" : ""}`;
  $("#financeProfitSub").textContent = `Resultado comercial antes de retención RHE`;

  const minimum = Number(currentSettings().marginMinimum ?? 20);
  const target = Number(currentSettings().marginTarget ?? 25);
  $("#financeHealthyLabel") && ($("#financeHealthyLabel").textContent = `${target + 5}%+`);
  $("#financeReviewLabel") && ($("#financeReviewLabel").textContent = `${minimum}–${Math.max(minimum, target + 4)}%`);
  $("#financeLowLabel") && ($("#financeLowLabel").textContent = `10–${Math.max(10, minimum - 1)}%`);
  $("#financeDangerLabel") && ($("#financeDangerLabel").textContent = "<10% o negativo");

  renderFinanceReview(list);
}

$("#financePeriod")?.addEventListener("change", renderFinance);

function renderHistory() {
  const list = [...state.services].sort((a,b) => String(b.start).localeCompare(String(a.start)));
  $("#historyTable").innerHTML = list.length ? list.map(service => {
    const client = getClient(service.clientId);
    return `<tr><td>${escapeHtml(client?.name || "—")}</td><td>${escapeHtml(service.service)}</td><td>${formatDate(service.start)} — ${formatDate(service.end)}</td><td>${money(serviceTotal(service),service.currency)}</td><td><span class="status ${service.status==='Pendiente'?'pending':service.status==='Finalizado'?'done':''}">${escapeHtml(service.status)}</span></td></tr>`;
  }).join("") : `<tr><td colspan="5"><div class="empty-state">Sin historial.</div></td></tr>`;
}

function updateBillingPreview() {
  const form = $("#billingForm");
  if (!form) return;
  const clientId = form.elements.clientId.value;
  const calc = billingCalculation(clientId);
  const currency = calc.currency;
  const mode = calc.apply ? (calc.mode === "net" ? "Neto deseado" : "Honorario bruto") : "Sin retención";
  $("#billingBaseTotal").textContent = money(calc.baseTotal, currency);
  $("#billingGross").textContent = money(calc.gross, currency);
  $("#billingRetention").textContent = calc.apply ? `− ${money(calc.retained, currency)}` : money(0, currency);
  $("#billingNet").textContent = money(calc.net, currency);
  $("#billingModeLabel").textContent = mode;
  const amount = $("#billingAmountField");
  if (amount) amount.style.display = calc.apply && calc.mode === "net" ? "block" : "none";
  if (calc.apply && calc.mode === "net" && amount && form.elements.amount && !form.elements.amount.value) {
    form.elements.amount.value = calc.baseTotal.toFixed(2);
  }
  const note = $("#billingHint");
  if (note) note.textContent = calc.apply ? `Retención RHE ${calc.rate}% aplicada solo en este cobro. El cálculo no modifica los precios guardados de los servicios.` : "Sin retención: el total del cobro es igual a la suma de los servicios.";
}

$("#billingForm")?.addEventListener("input", updateBillingPreview);
$("#billingForm")?.addEventListener("change", updateBillingPreview);
$("#billingForm")?.addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  const calc = billingCalculation(form.elements.clientId.value);
  if (!calc.services.length) return toast("No quedan servicios pendientes para cobrar a este cliente.");
  closeModal("billingModal");
  downloadClientBilling(form.elements.clientId.value, { applyRetention: calc.apply, rate: calc.rate, gross: calc.gross, retained: calc.retained, net: calc.net, mode: calc.mode });
});
