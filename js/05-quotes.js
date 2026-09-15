function openQuoteEditor(id) {
  const quote = state.quotes.find(q => q.id === id);
  if (!quote) return toast("No se encontró la cotización.");
  const form = $("#quoteForm"); if (!form) return;
  populateClientSelects(); form.reset();
  form.elements.quoteId.value=quote.id; form.elements.clientId.value=quote.clientId||""; form.elements.date.value=quote.date||todayISO(); form.elements.title.value=quote.title||""; form.elements.description.value=quote.description||""; form.elements.price.value=quote.price??""; form.elements.currency.value=quote.currency||"USD"; form.elements.validity.value=quote.validity||"15 días"; form.elements.documentType.value=quote.documentType||currentSettings().documentType; form.elements.status.value=quote.status||"Borrador"; form.elements.notes.value=quote.notes||"";
  $("#quoteModalTitle").textContent="Editar cotización"; $("#quoteSubmitLabel").textContent="Guardar cambios"; updateQuotePreview(); openModal("quoteModal");
}

function renderQuotes() {
  const container=$("#quotesList"); if(!container)return;
  if(!state.quotes.length){container.innerHTML=`<div class="panel empty-state">${icon("i-file")}<h3>Sin cotizaciones todavía</h3><p>Crea tu primera cotización desde el botón superior.</p></div>`;return;}
  container.innerHTML=state.quotes.map(quote=>{
    const client=getClient(quote.clientId); const total=Number(quote.price||0);
    return `<article class="quote-card"><div><h3>${escapeHtml(quote.title)}</h3><p>${escapeHtml(client?.name||"Cliente")} · ${formatDate(quote.date)} · <span class="status">${escapeHtml(quote.status||"Borrador")}</span></p><div class="table-secondary">${escapeHtml(quote.documentType||currentSettings().documentType)} · Total ${money(total,quote.currency)}</div></div><div class="quote-actions"><strong>${money(total,quote.currency)}</strong><div class="quote-actions-inline"><button class="secondary-button" data-edit-quote="${escapeHtml(quote.id)}">Editar</button><button class="secondary-button" data-download-quote="${escapeHtml(quote.id)}">${icon("i-download")} PDF</button></div></div></article>`;
  }).join("");
  $$('[data-edit-quote]').forEach(btn=>btn.addEventListener('click',()=>openQuoteEditor(btn.dataset.editQuote)));
  $$('[data-download-quote]').forEach(btn=>btn.addEventListener('click',()=>downloadQuote(btn.dataset.downloadQuote)));
}
