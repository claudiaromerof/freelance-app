function renderClients() {

  const query =
    ($("#clientSearch")?.value || "")
      .trim()
      .toLowerCase();


  const list =
    state.clients.filter(client => {

      const text =
        `${client.name}
         ${client.email}
         ${client.phone}`.toLowerCase();

      return text.includes(query);
    });


  $("#clientCount").textContent =
    `${list.length} ${
      list.length === 1
        ? "cliente"
        : "clientes"
    }`;


  $("#clientsTable").innerHTML =
    list.length

      ? list.map(client => {

          const services =
            state.services.filter(
              service =>
                service.clientId === client.id
            );


          const latest =
            [...services].sort(
              (a, b) =>
                new Date(b.start) -
                new Date(a.start)
            )[0];


          return `
            <tr>

              <td>

                <div class="table-primary">
                  ${escapeHtml(client.name)}
                </div>

                <div class="table-secondary">
                  ${escapeHtml(
                    client.document ||
                    "Sin documento"
                  )}
                </div>

              </td>


              <td>

                <div>
                  ${escapeHtml(
                    client.email || "—"
                  )}
                </div>

                <div class="table-secondary">
                  ${escapeHtml(
                    client.phone || ""
                  )}
                </div>

              </td>


              <td>
                ${services.length}
              </td>


              <td>
                ${
                  latest
                    ? formatDate(latest.start)
                    : "—"
                }
              </td>


              <td>

                <button
                  class="service-download"
                  data-billing-client="${client.id}"
                  title="Generar resumen de cobro"
                >

                  ${icon("i-download")}

                  Cobro

                </button>

              </td>

            </tr>
          `;

        }).join("")

      : `
        <tr>

          <td colspan="5">

            <div class="empty-state">
              No se encontraron clientes.
            </div>

          </td>

        </tr>
      `;


  $$("[data-billing-client]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          downloadClientBilling(
            button.dataset.billingClient
          )
      );

    });
}


/* =========================================================
   SERVICIOS
   ========================================================= */

