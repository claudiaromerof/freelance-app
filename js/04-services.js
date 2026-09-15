function renderServices() {

  const query =
    ($("#serviceSearch")?.value || "")
      .trim()
      .toLowerCase();


  const status =
    $("#serviceStatus")?.value ||
    "all";


  const list =
    state.services.filter(service => {

      const client =
        getClient(service.clientId);


      const text =
        `${service.service}
         ${service.description}
         ${client?.name || ""}`
          .toLowerCase();


      const matchesText =
        text.includes(query);


      const matchesStatus =
        status === "all" ||
        service.status === status;


      return (
        matchesText &&
        matchesStatus
      );
    });


  $("#servicesTable").innerHTML =
    list.length

      ? list.map(service => {

          const client =
            getClient(service.clientId);


          const total =
            serviceTotal(service);


          const statusClass =
            service.status === "Pendiente"
              ? "pending"
              : service.status === "Finalizado"
                ? "done"
                : "";


          return `
            <tr>

              <td>

                <div class="table-primary">
                  ${escapeHtml(
                    service.service
                  )}
                </div>

                <div class="table-secondary">
                  ${escapeHtml(
                    service.description || ""
                  )}
                </div>

              </td>


              <td>
                ${escapeHtml(
                  client?.name || "—"
                )}
              </td>


              <td>
                ${formatDate(service.start)}
                —
                ${formatDate(service.end)}
              </td>


              <td>
                ${money(
                  total,
                  service.currency
                )}
              </td>


              <td>

                <span class="status ${statusClass}">
                  ${escapeHtml(
                    service.status
                  )}
                </span>

              </td>


              <td>

                <span class="status ${
                  service.payment === "Pendiente"
                    ? "pending"
                    : ""
                }">

                  ${escapeHtml(
                    service.payment
                  )}

                </span>

              </td>


              <td>

                <button
                  class="service-download"
                  data-billing-client="${service.clientId}"
                  title="Generar cobro del cliente"
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

          <td colspan="7">

            <div class="empty-state">
              No hay servicios que coincidan.
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
   COTIZACIONES
   ========================================================= */

