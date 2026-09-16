function populateClientSelects(selectedClientId = "") {
  const options = state.clients.length
    ? `<option value="">Selecciona un cliente</option>` + state.clients.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join("")
    : `<option value="">Primero crea un cliente</option>`;
  if ($("#serviceClient")) { $("#serviceClient").innerHTML = options; if (selectedClientId) $("#serviceClient").value = selectedClientId; }
  if ($("#quoteClient")) { $("#quoteClient").innerHTML = options; if (selectedClientId) $("#quoteClient").value = selectedClientId; }
}

function openModal(id) {
  populateClientSelects();
  if (typeof populateCatalogSelect === "function") populateCatalogSelect();
  const modal = $(`#${id}`);
  if (!modal) return;
  modal.classList.add("open");
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => modal.querySelector("input:not([type=hidden]),select,textarea")?.focus());
}
function closeModal(id) {
  const modal = $(`#${id}`);
  if (!modal) return;
  modal.classList.remove("open");
  if (!document.querySelector(".modal-backdrop.open")) document.body.classList.remove("modal-open");
}

$$("[data-close]").forEach(btn => btn.addEventListener("click", () => closeModal(btn.dataset.close)));
$$('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(backdrop.id); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal-backdrop.open').forEach(m => closeModal(m.id)); });

function setFormSaving(form, saving, label = "Guardando…") {
  if (!form) return;
  const submit = form.querySelector('button[type="submit"]');
  if (!submit) return;
  if (saving) {
    submit.dataset.originalHtml = submit.innerHTML;
    submit.disabled = true;
    submit.classList.add("is-saving");
    submit.innerHTML = `<span class="button-spinner" aria-hidden="true"></span>${label}`;
  } else {
    submit.disabled = false;
    submit.classList.remove("is-saving");
    if (submit.dataset.originalHtml) submit.innerHTML = submit.dataset.originalHtml;
  }
}

function resetClientForm() {
  const form = $("#clientForm"); if (!form) return;
  form.reset(); form.elements.clientId.value = "";
  form.elements.documentType.value = "RUC"; form.elements.country.value = "Perú"; form.elements.currency.value = "USD";
  $("#clientModalTitle").textContent = "Nuevo cliente"; $("#clientSubmitLabel").textContent = "Guardar cliente";
}
function resetServiceForm() {
  const form = $("#serviceForm"); if (!form) return;
  form.reset(); form.elements.serviceId.value = ""; form.elements.quantity.value = 1; form.elements.status.value = "Activo"; form.elements.currency.value = "USD";
  populateCatalogSelect(); $("#serviceModalTitle").textContent = "Nuevo servicio"; $("#serviceSubmitLabel").textContent = "Guardar servicio"; updateProfitPreview();
}
function resetQuoteForm() {
  const form = $("#quoteForm"); if (!form) return;
  form.reset(); form.elements.quoteId.value = ""; form.elements.date.value = todayISO(); form.elements.currency.value = "USD";
  form.elements.validity.value = "15 días"; form.elements.documentType.value = currentSettings().documentType; form.elements.status.value = "Borrador";
  $("#quoteModalTitle").textContent = "Nueva cotización"; $("#quoteSubmitLabel").textContent = "Generar documento"; updateQuotePreview();
}

$$('[data-action]').forEach(button => button.addEventListener('click', () => {
  const action = button.dataset.action;
  if (action === 'new-client') { resetClientForm(); openModal('clientModal'); return; }
  if (action === 'new-service') {
    if (!state.clients.length) { toast('Primero crea un cliente.'); resetClientForm(); openModal('clientModal'); return; }
    resetServiceForm(); openModal('serviceModal'); return;
  }
  if (action === 'new-catalog') {
    const form = $("#catalogForm");
    if (form) { form.reset(); form.elements.catalogId.value=""; form.elements.baseCurrency.value="USD"; form.elements.active.value="Sí"; $("#catalogModalTitle").textContent="Nuevo servicio del catálogo"; $("#catalogSubmitLabel").textContent="Guardar servicio"; }
    openModal('catalogModal'); return;
  }
  if (action === 'new-quote') {
    if (!state.clients.length) { toast('Primero crea un cliente.'); resetClientForm(); openModal('clientModal'); return; }
    resetQuoteForm(); openModal('quoteModal');
  }
}));

async function saveDirect(apiFn, payload, form, successMessage) {
  setFormSaving(form, true);
  try {
    await apiFn(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    refreshAll();
    return true;
  } catch (error) {
    console.error(error);
    toast(error?.message || "No se pudo guardar el cambio.");
    return false;
  } finally { setFormSaving(form, false); }
}

// CLIENTES
$("#clientForm")?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.name?.trim()) return toast('Escribe el nombre del cliente.');
  const id = data.clientId?.trim();
  const existing = id ? state.clients.find(c => c.id === id) : null;
  if (id && !existing) return toast('No se encontró el cliente.');
  const payload = { id:id || newId('CLI'), name:data.name.trim(), documentType:data.documentType || 'RUC', document:data.document.trim(), contact:data.contact.trim(), email:data.email.trim(), phone:data.phone.trim(), country:data.country.trim(), currency:data.currency || 'USD', address:data.address.trim(), notes:data.notes.trim(), createdAt: existing?.createdAt || todayISO() };
  const old = structuredClone(state);
  if (id) state.clients[state.clients.findIndex(c=>c.id===id)] = payload; else state.clients.unshift(payload);
  if (!(await saveDirect(apiSaveClient, payload, form))) { state = old; refreshAll(); return; }
  closeModal('clientModal'); showSection('clients'); toast(id ? 'Cliente actualizado correctamente.' : 'Cliente guardado correctamente.');
});

// SERVICIOS / CONTRATACIONES
$("#serviceForm")?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.clientId || !data.serviceCatalog) return toast('Completa cliente y servicio.');
  if (!data.start || !data.end || data.end < data.start) return toast('Revisa el periodo del servicio.');
  const id = data.serviceId?.trim();
  const existing = id ? state.services.find(s=>s.id===id) : null;
  if (id && !existing) return toast('No se encontró el servicio.');
  const catalog = getCatalogItem(data.serviceCatalog);
  const payload = { id:id||newId('CNT'), clientId:data.clientId, serviceId:catalog?.id || existing?.serviceId || data.serviceCatalog, service:catalog?.name || existing?.service || 'Servicio', provider:catalog?.provider || existing?.provider || '', description:data.description.trim() || catalog?.description || '', start:data.start, end:data.end, quantity:Number(data.quantity||1), cost:Number(data.cost||0), price:Number(data.price||0), currency:data.currency||'USD', documentType:existing?.documentType || currentSettings().documentType, retentionApplies:existing?.retentionApplies || 'Según corresponda', retentionRate:existing?.retentionRate || Number(currentSettings().retentionRate||8), retentionAmount:existing?.retentionAmount || 0, netReceived:existing?.netReceived || 0, status:data.status||'Activo', payment:existing?.payment||'Pendiente', paymentDate:existing?.paymentDate||'', paymentMethod:existing?.paymentMethod||'', rheEmitted:existing?.rheEmitted||'No', rheNumber:existing?.rheNumber||'', rheDate:existing?.rheDate||'', notes:data.notes.trim(), automaticRenewal:existing?.automaticRenewal||'No' };
  const old = structuredClone(state);
  if (id) state.services[state.services.findIndex(s=>s.id===id)] = payload; else state.services.unshift(payload);
  if (!(await saveDirect(apiSaveContract, payload, form))) { state=old; refreshAll(); return; }
  closeModal('serviceModal'); showSection('services'); toast(id ? 'Servicio actualizado correctamente.' : 'Servicio guardado correctamente.');
});

// PAGOS: actualiza solo el contrato, no toda la base.
$("#paymentForm")?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const service = state.services.find(s=>s.id===data.serviceId);
  if (!service) return toast('No se encontró el servicio.');
  const old = structuredClone(state);
  service.payment = data.payment;
  service.paymentDate = data.payment==='Pagado' ? (data.paymentDate||todayISO()) : '';
  service.paymentMethod = data.payment==='Pagado' ? (data.paymentMethod||'') : '';
  if (data.notes?.trim()) service.notes = data.notes.trim();
  setFormSaving(form, true);
  try {
    await apiRegisterPayment({contractIds:[service.id], fechaPago:service.paymentDate, medioPago:service.paymentMethod});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); refreshAll(); closeModal('paymentModal'); showSection('services'); toast(data.payment==='Pagado'?'Pago registrado correctamente.':'Pago actualizado correctamente.');
  } catch(error) { state=old; refreshAll(); toast(error?.message || 'No se pudo registrar el pago.'); }
  finally { setFormSaving(form, false); }
});

// CATÁLOGO: su estado describe si lo ofreces, no el estado de ningún cliente.
$("#catalogForm")?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.name?.trim()) return toast('Escribe el nombre del servicio.');
  const id=data.catalogId?.trim();
  const payload={id:id||newId('SRV'),name:data.name.trim(),provider:data.provider.trim(),description:data.description.trim(),periodicity:data.periodicity,baseCurrency:data.baseCurrency,active:data.active};
  const old=structuredClone(state);
  if(id){const i=state.catalog.findIndex(x=>x.id===id);if(i<0)return toast('No se encontró el servicio del catálogo.');state.catalog[i]=payload;} else state.catalog.push(payload);
  if (!(await saveDirect(apiSaveCatalog, payload, form))) { state=old; refreshAll(); return; }
  closeModal('catalogModal'); showSection('services'); toast(id?'Servicio del catálogo actualizado.':'Servicio del catálogo creado.');
});

// COTIZACIONES
$("#quoteForm")?.addEventListener('submit', async event => {
  event.preventDefault();
  const form=event.currentTarget; const data=Object.fromEntries(new FormData(form).entries());
  if(!data.clientId||!data.title?.trim())return toast('Completa cliente y propuesta.');
  const id=data.quoteId?.trim(); const payload={id:id||newId('COT'),clientId:data.clientId,date:data.date,title:data.title.trim(),description:data.description.trim(),price:Number(data.price||0),currency:data.currency||'USD',validity:data.validity.trim()||'15 días',status:data.status||'Borrador',notes:data.notes.trim()};
  const old=structuredClone(state);
  if(id){const i=state.quotes.findIndex(q=>q.id===id);if(i<0)return toast('No se encontró la cotización.');state.quotes[i]=payload;}else state.quotes.unshift(payload);
  if (!(await saveDirect(apiSaveQuote,payload,form))) { state=old; refreshAll(); return; }
  closeModal('quoteModal'); showSection('quotes'); toast(id?'Cotización actualizada correctamente.':'Cotización creada correctamente.');
});

function updateQuotePreview(){
  const form=$("#quoteForm"); if(!form||!$("#quoteTaxPreview"))return; const amount=Number(form.elements.price.value||0); $("#quoteTaxPreview").innerHTML=`Honorarios <strong>${money(amount,form.elements.currency.value)}</strong><span> · Comprobante: ${escapeHtml(currentSettings().documentType)}</span>`;
}
["price","currency"].forEach(n=>{$("#quoteForm")?.elements[n]?.addEventListener('input',updateQuotePreview);$("#quoteForm")?.elements[n]?.addEventListener('change',updateQuotePreview);});

// RENOVACIÓN: crea un nuevo periodo sin tocar el precio histórico.
function parseISODate(value) { const d=new Date(`${value}T12:00:00`); return Number.isNaN(d.getTime())?null:d; }
function isoDate(d) { return d ? d.toISOString().slice(0,10) : ""; }
function addPeriod(dateString, periodicity, amount=1) {
  const d=parseISODate(dateString); if(!d)return "";
  if(periodicity==='Mensual') d.setMonth(d.getMonth()+amount);
  else if(periodicity==='Trimestral') d.setMonth(d.getMonth()+3*amount);
  else if(periodicity==='Semestral') d.setMonth(d.getMonth()+6*amount);
  else if(periodicity==='Anual') d.setFullYear(d.getFullYear()+amount);
  else return "";
  return isoDate(d);
}
function openRenewalModal(id) {
  const service=state.services.find(s=>s.id===id); if(!service)return toast('No se encontró el servicio.');
  const catalog=getCatalogItem(service.serviceId); const periodicity=catalog?.periodicity||'Anual';
  if(!['Mensual','Trimestral','Semestral','Anual'].includes(periodicity)) return toast('Este servicio no tiene una periodicidad renovable.');
  const form=$("#renewalForm"); if(!form)return;
  form.reset(); form.elements.serviceId.value=service.id; form.elements.newStart.value=addPeriod(service.start,periodicity); form.elements.newEnd.value=addPeriod(service.end,periodicity); form.elements.cost.value=service.cost??0; form.elements.price.value=service.price??0; form.elements.quantity.value=service.quantity??1; form.elements.currency.value=service.currency||catalog?.baseCurrency||'USD'; form.elements.notes.value=service.notes||'';
  $("#renewalServiceName").textContent=`${service.service} · ${getClient(service.clientId)?.name||''}`;
  $("#renewalCurrentPeriod").textContent=`${formatLongDate(service.start)} — ${formatLongDate(service.end)}`;
  $("#renewalNewPeriodHint").textContent=`Periodo propuesto · ${periodicity}`;
  updateRenewalPreview(); openModal('renewalModal');
}

$("#renewalForm")?.addEventListener('input', updateRenewalPreview);
$("#renewalForm")?.addEventListener('change', updateRenewalPreview);
function updateRenewalPreview(){
  const f=$("#renewalForm"); if(!f)return; const total=Number(f.elements.price.value||0)*Number(f.elements.quantity.value||1); const cost=Number(f.elements.cost.value||0)*Number(f.elements.quantity.value||1); $("#renewalProfitPreview").textContent=money(total-cost,f.elements.currency.value||'USD');
}
$("#renewalForm")?.addEventListener('submit', async event=>{
  event.preventDefault(); const form=event.currentTarget; const data=Object.fromEntries(new FormData(form).entries()); const oldService=state.services.find(s=>s.id===data.serviceId); if(!oldService)return toast('No se encontró el servicio.');
  if(!data.newStart||!data.newEnd||data.newEnd<data.newStart)return toast('Revisa el nuevo periodo.');
  const newService={...structuredClone(oldService),id:newId('CNT'),start:data.newStart,end:data.newEnd,cost:Number(data.cost||0),price:Number(data.price||0),quantity:Number(data.quantity||1),currency:data.currency||oldService.currency,status:'Activo',payment:'Pendiente',paymentDate:'',paymentMethod:'',notes:data.notes?.trim()||'',renewedFrom:oldService.id};
  const previousStatus=oldService.status; oldService.status='Finalizado';
  setFormSaving(form,true);
  try {
    await apiRenewContract({...newService, previousId:oldService.id});
    state.services = state.services.map(item => item.id === oldService.id ? oldService : item);
    state.services.unshift(newService); localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); refreshAll(); closeModal('renewalModal'); showSection('services'); toast('Renovación creada. El periodo anterior quedó en historial.');
  } catch(error) { oldService.status=previousStatus; refreshAll(); toast(error?.message||'No se pudo crear la renovación.'); }
  finally { setFormSaving(form,false); }
});

// ELIMINACIÓN SEGURA
async function deleteClient(id){
  const client=getClient(id); if(!client)return;
  const contracts=state.services.filter(s=>s.clientId===id); const quotes=state.quotes.filter(q=>q.clientId===id);
  if(contracts.length) return toast('No puedes eliminar este cliente mientras tenga servicios. Primero finaliza o elimina sus servicios.');
  const extra=quotes.length?` También se eliminarán ${quotes.length} cotización(es).`:'';
  if(!confirm(`¿Eliminar a ${client.name}?${extra} Esta acción no se puede deshacer.`))return;
  try { for(const q of quotes) await apiDeleteQuote(q.id); await apiDeleteClient(id); state.clients=state.clients.filter(c=>c.id!==id); state.quotes=state.quotes.filter(q=>q.clientId!==id); localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); refreshAll(); toast('Cliente eliminado.'); }
  catch(error){toast(error?.message||'No se pudo eliminar el cliente.');}
}
async function deleteCatalog(id){
  const item=state.catalog.find(x=>x.id===id); if(!item)return;
  const used=state.services.some(s=>s.serviceId===id); if(used)return toast('Este servicio del catálogo ya está usado por clientes. Puedes editarlo o marcarlo como No disponible, pero no conviene eliminarlo.');
  if(!confirm(`¿Eliminar “${item.name}” del catálogo? Esta acción no se puede deshacer.`))return;
  try { await apiDeleteCatalog(id); state.catalog=state.catalog.filter(x=>x.id!==id); localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); refreshAll(); toast('Servicio eliminado del catálogo.'); } catch(error){toast(error?.message||'No se pudo eliminar.');}
}
async function deleteContract(id){
  const service=state.services.find(s=>s.id===id); if(!service)return;
  if(!confirm(`¿Eliminar “${service.service}” de ${getClient(service.clientId)?.name||'este cliente'}?\n\nSe eliminará también del historial. Usa esta opción solo para corregir un registro creado por error.`))return;
  try { await apiDeleteContract(id); state.services=state.services.filter(s=>s.id!==id); localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); refreshAll(); toast('Servicio eliminado.'); } catch(error){toast(error?.message||'No se pudo eliminar.');}
}

/* =========================================================
   COBRO AGRUPADO + RETENCIÓN RHE
   ========================================================= */
function openBillingModal(clientId) {
  const client = getClient(clientId);
  if (!client) return toast("No se encontró el cliente.");
  const services = state.services.filter(s => s.clientId === clientId && s.status !== "Finalizado" && s.payment !== "Pagado");
  if (!services.length) return toast("Este cliente no tiene servicios activos o pendientes para cobrar.");
  const currencies = [...new Set(services.map(s => s.currency || "USD"))];
  if (currencies.length > 1) return toast("El cliente tiene servicios en monedas distintas. Revísalos antes de cobrar.");
  const form = $("#billingForm");
  if (!form) return toast("No se encontró el formulario de cobro.");
  form.reset();
  form.elements.clientId.value = clientId;
  form.elements.retention.checked = true;
  form.elements.mode.value = "net";
  form.elements.amount.value = "";
  $("#billingClientName").textContent = client.name || "Cliente";
  $("#billingRateLabel").textContent = `${Number(currentSettings().retentionRate || 8)}%`;
  updateBillingPreview();
  openModal("billingModal");
}

function getBillingServices(clientId) {
  return state.services.filter(s => s.clientId === clientId && s.status !== "Finalizado" && s.payment !== "Pagado").sort((a,b)=>String(a.start||"").localeCompare(String(b.start||"")));
}

function billingCalculation(clientId) {
  const form = $("#billingForm");
  const services = getBillingServices(clientId);
  const currency = services[0]?.currency || "USD";
  const baseTotal = services.reduce((sum,s)=>sum + serviceTotal(s),0);
  const apply = Boolean(form?.elements.retention?.checked);
  const rate = Number(currentSettings().retentionRate || 8);
  const mode = form?.elements.mode.value || "gross";
  const entered = Number(form?.elements.amount.value || 0);
  let gross = baseTotal;
  let retained = 0;
  let net = baseTotal;
  if (apply) {
    if (mode === "net") {
      net = entered || baseTotal;
      gross = rate >= 100 ? net : net / (1 - rate / 100);
      retained = gross - net;
    } else {
      gross = baseTotal;
      retained = gross * rate / 100;
      net = gross - retained;
    }
  } else {
    gross = baseTotal;
    net = baseTotal;
  }
  return {services,currency,baseTotal,apply,rate,mode,entered,gross,retained,net};
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

// CONFIGURACIÓN TRIBUTARIA / DOCUMENTARIA
$("#settingsForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget).entries());
  const old = structuredClone(state);
  state.settings = {
    documentType: "Recibo por Honorarios",
    retentionRate: Number(data.retentionRate || 8),
    noRetentionThreshold: Number(data.noRetentionThreshold || 1500),
    paymentHolder: data.paymentHolder?.trim() || "Claudia Romero Fonseca",
    bankUSD: data.bankUSD?.trim() || "", accountUSD: data.accountUSD?.trim() || "", cciUSD: data.cciUSD?.trim() || "",
    bankPEN: data.bankPEN?.trim() || "", accountPEN: data.accountPEN?.trim() || "", cciPEN: data.cciPEN?.trim() || "",
    mobilePayment: data.mobilePayment?.trim() || ""
  };
  setFormSaving(event.currentTarget, true);
  try {
    await apiSaveSettings(state.settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    refreshAll();
    updateQuotePreview();
    toast("Configuración actualizada.");
  } catch (error) {
    state = old; refreshAll(); toast(error?.message || "No se pudo guardar la configuración.");
  } finally { setFormSaving(event.currentTarget, false); }
});

function populateSettingsForm() {
  const form = $("#settingsForm"); if (!form) return;
  const cfg = currentSettings();
  form.elements.documentType.value = "Recibo por Honorarios";
  form.elements.retentionRate.value = cfg.retentionRate ?? 8;
  form.elements.noRetentionThreshold.value = cfg.noRetentionThreshold ?? 1500;
  form.elements.paymentHolder.value = cfg.paymentHolder || "Claudia Romero Fonseca";
  form.elements.bankUSD.value = cfg.bankUSD || ""; form.elements.accountUSD.value = cfg.accountUSD || ""; form.elements.cciUSD.value = cfg.cciUSD || "";
  form.elements.bankPEN.value = cfg.bankPEN || ""; form.elements.accountPEN.value = cfg.accountPEN || ""; form.elements.cciPEN.value = cfg.cciPEN || "";
  form.elements.mobilePayment.value = cfg.mobilePayment || "";
}
