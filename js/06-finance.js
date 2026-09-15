function currencyTotals(list, valueFn) {
  return list.reduce((acc,item)=>{ const c=item.currency||"USD"; acc[c]=(acc[c]||0)+valueFn(item); return acc; },{});
}
function financeText(totals) {
  const keys=Object.keys(totals);
  if(!keys.length)return "—";
  return keys.map(c=>money(totals[c],c)).join(" · ");
}

function renderFinance() {
  const sales = currencyTotals(state.services, serviceTotal);
  const costs = currencyTotals(state.services, serviceCost);
  const collected = currencyTotals(state.services.filter(s=>s.payment==="Pagado"), serviceTotal);
  const pending = currencyTotals(state.services.filter(s=>s.payment!=="Pagado"), serviceTotal);
  const profit = {};
  Object.keys(sales).forEach(c=>profit[c]=(sales[c]||0)-(costs[c]||0));
  const weightedSales=Object.values(sales).reduce((a,b)=>a+b,0);
  const weightedProfit=Object.values(profit).reduce((a,b)=>a+b,0);
  $("#financeSales").textContent=financeText(sales);
  $("#financeCosts").textContent=financeText(costs);
  $("#financeProfit").textContent=financeText(profit);
  $("#financeMargin").textContent=weightedSales?`${((weightedProfit/weightedSales)*100).toFixed(1)}%`:"0%";
  if($("#financeCollected"))$("#financeCollected").textContent=financeText(collected);
  if($("#financePending"))$("#financePending").textContent=financeText(pending);
}

function renderHistory() {
  const list=[...state.services].sort((a,b)=>String(b.start).localeCompare(String(a.start)));
  $("#historyTable").innerHTML=list.length?list.map(service=>{const client=getClient(service.clientId);return `<tr><td>${escapeHtml(client?.name||"—")}</td><td>${escapeHtml(service.service)}</td><td>${formatDate(service.start)} — ${formatDate(service.end)}</td><td>${money(serviceTotal(service),service.currency)}</td><td><span class="status ${service.status==='Pendiente'?'pending':service.status==='Finalizado'?'done':''}">${escapeHtml(service.status)}</span></td></tr>`;}).join(""): `<tr><td colspan="5"><div class="empty-state">Sin historial.</div></td></tr>`;
}
