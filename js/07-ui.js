function populateClientSelects() {

  const options =
    state.clients.length

      ? state.clients
          .map(client => `
            <option value="${client.id}">
              ${escapeHtml(client.name)}
            </option>
          `)
          .join("")

      : `
        <option value="">
          Primero crea un cliente
        </option>
      `;


  if ($("#serviceClient")) {
    $("#serviceClient").innerHTML =
      options;
  }


  if ($("#quoteClient")) {
    $("#quoteClient").innerHTML =
      options;
  }
}


/* =========================================================
   MODALES
   ========================================================= */

function openModal(id) {

  populateClientSelects();

  $(`#${id}`)?.classList.add("open");
}


function closeModal(id) {

  $(`#${id}`)?.classList.remove("open");
}


$$("[data-close]").forEach(button => {

  button.addEventListener(
    "click",
    () =>
      closeModal(
        button.dataset.close
      )
  );

});


$$(".modal-backdrop").forEach(backdrop => {

  backdrop.addEventListener(
    "click",
    event => {

      if (event.target === backdrop) {
        backdrop.classList.remove("open");
      }

    }
  );

});


document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      $$(".modal-backdrop.open")
        .forEach(modal =>
          modal.classList.remove("open")
        );
    }

  }
);


/* =========================================================
   ACCIONES
   ========================================================= */

$$("[data-action]").forEach(button => {

  button.addEventListener(
    "click",
    () => {

      const action =
        button.dataset.action;


      /* NUEVO CLIENTE */

      if (action === "new-client") {

        $("#clientForm")?.reset();

        openModal("clientModal");

        return;
      }


      /* NUEVO SERVICIO */

      if (action === "new-service") {

        if (!state.clients.length) {

          toast(
            "Primero crea un cliente."
          );

          openModal("clientModal");

          return;
        }


        $("#serviceForm")?.reset();

        $("#serviceForm")
          .elements.quantity.value = 1;

        updateProfitPreview();

        openModal("serviceModal");

        return;
      }


      /* NUEVA COTIZACIÓN */

      if (action === "new-quote") {

        if (!state.clients.length) {

          toast(
            "Primero crea un cliente."
          );

          openModal("clientModal");

          return;
        }


        $("#quoteForm")?.reset();
        if ($("#quoteId")) $("#quoteId").value = "";
        if ($("#quoteModalTitle")) $("#quoteModalTitle").textContent = "Nueva cotización";
        if ($("#quoteSubmitLabel")) $("#quoteSubmitLabel").textContent = "Generar documento";

        $("#quoteForm")
          .elements.date.value =
          new Date()
            .toISOString()
            .slice(0, 10);


        openModal("quoteModal");
      }

    }
  );

});


/* =========================================================
   FORMULARIO CLIENTE
   ========================================================= */

$("#clientForm")?.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const data =
      Object.fromEntries(
        new FormData(
          event.currentTarget
        ).entries()
      );


    const id =
      `CLI-${String(Date.now()).slice(-6)}`;


    state.clients.push({

      id,

      name:
        data.name.trim(),

      email:
        data.email.trim(),

      phone:
        data.phone.trim(),

      document:
        data.document.trim(),

      notes:
        data.notes.trim(),

      createdAt:
        new Date()
          .toISOString()
          .slice(0, 10)

    });


    saveState();

    event.currentTarget.reset();

    closeModal("clientModal");

    refreshAll();

    showSection("clients");

    toast(
      "Cliente guardado correctamente."
    );

  }
);


/* =========================================================
   FORMULARIO SERVICIO
   ========================================================= */

$("#serviceForm")?.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const data =
      Object.fromEntries(
        new FormData(
          event.currentTarget
        ).entries()
      );


    if (!data.clientId) {

      toast(
        "Selecciona un cliente."
      );

      return;
    }


    const id =
      `CNT-${String(Date.now()).slice(-6)}`;


    state.services.push({

      id,

      clientId:
        data.clientId,

      service:
        data.service.trim(),

      description:
        data.description.trim(),

      start:
        data.start,

      end:
        data.end,

      quantity:
        Number(data.quantity || 1),

      cost:
        Number(data.cost || 0),

      price:
        Number(data.price || 0),

      currency:
        data.currency,

      status:
        data.status,

      payment:
        data.payment,

      notes:
        data.notes.trim()

    });


    saveState();

    event.currentTarget.reset();

    closeModal("serviceModal");

    refreshAll();

    showSection("services");

    toast(
      "Servicio guardado correctamente."
    );

  }
);


/* =========================================================
   FORMULARIO COTIZACIÓN
   ========================================================= */

$("#quoteForm")?.addEventListener(
  "submit",
  event => {
    event.preventDefault();

    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries()
    );

    const quoteId = data.quoteId?.trim();
    const payload = {
      id: quoteId || `COT-${String(Date.now()).slice(-6)}`,
      clientId: data.clientId,
      date: data.date,
      title: data.title.trim(),
      description: data.description.trim(),
      price: Number(data.price || 0),
      currency: data.currency,
      validity: data.validity.trim()
    };

    if (quoteId) {
      const index = state.quotes.findIndex(q => q.id === quoteId);
      if (index < 0) {
        toast("No se encontró la cotización para editar.");
        return;
      }
      state.quotes[index] = payload;
      toast("Cotización actualizada correctamente.");
    } else {
      state.quotes.unshift(payload);
      toast("Cotización creada correctamente.");
    }

    saveState();
    event.currentTarget.reset();
    if ($("#quoteId")) $("#quoteId").value = "";
    if ($("#quoteModalTitle")) $("#quoteModalTitle").textContent = "Nueva cotización";
    if ($("#quoteSubmitLabel")) $("#quoteSubmitLabel").textContent = "Generar documento";
    closeModal("quoteModal");
    refreshAll();
    showSection("quotes");
  }
);


/* =========================================================
   GANANCIA
   ========================================================= */

