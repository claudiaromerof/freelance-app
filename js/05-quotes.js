
function openQuoteEditor(id) {
  const quote = state.quotes.find(q => q.id === id);
  if (!quote) {
    toast("No se encontró la cotización.");
    return;
  }

  const form = $("#quoteForm");
  if (!form) return;

  form.reset();
  form.elements.quoteId.value = quote.id;
  form.elements.clientId.value = quote.clientId || "";
  form.elements.date.value = quote.date || "";
  form.elements.title.value = quote.title || "";
  form.elements.description.value = quote.description || "";
  form.elements.price.value = quote.price ?? "";
  form.elements.currency.value = quote.currency || "USD";
  form.elements.validity.value = quote.validity || "";

  $("#quoteModalTitle").textContent = "Editar cotización";
  $("#quoteSubmitLabel").textContent = "Guardar cambios";
  openModal("quoteModal");
}
function renderQuotes() {

  const container =
    $("#quotesList");


  if (!container) {
    return;
  }


  if (!state.quotes.length) {

    container.innerHTML = `
      <div class="panel empty-state">

        ${icon("i-file")}

        <h3>
          Sin cotizaciones todavía
        </h3>

        <p>
          Crea tu primera cotización
          desde el botón superior.
        </p>

      </div>
    `;

    return;
  }


  container.innerHTML =
    state.quotes.map(quote => {

      const client =
        getClient(quote.clientId);


      return `
        <article class="quote-card">

          <div>

            <h3>
              ${escapeHtml(quote.title)}
            </h3>

            <p>
              ${escapeHtml(
                client?.name || "Cliente"
              )}
              ·
              ${formatDate(quote.date)}
            </p>

          </div>


          <div class="quote-actions">

            <strong>
              ${money(
                quote.price,
                quote.currency
              )}
            </strong>


            <div class="quote-actions-inline">
              <button
                class="secondary-button"
                data-edit-quote="${quote.id}"
              >
                Editar
              </button>

              <button
                class="secondary-button"
                data-download-quote="${quote.id}"
              >
                ${icon("i-download")}
                PDF
              </button>
            </div>

          </div>

        </article>
      `;

    }).join("");


  $$("[data-download-quote]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          downloadQuote(
            button.dataset.downloadQuote
          )
      );

    });
}


/* =========================================================
   FINANZAS
   ========================================================= */


  $$("[data-edit-quote]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => openQuoteEditor(button.dataset.editQuote)
      );
    });

