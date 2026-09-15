function renderFinance() {

  const sales =
    state.services.reduce(
      (sum, service) =>
        sum + serviceTotal(service),
      0
    );


  const costs =
    state.services.reduce(
      (sum, service) =>
        sum + serviceCost(service),
      0
    );


  const profit =
    sales - costs;


  const margin =
    sales
      ? profit / sales
      : 0;


  $("#financeSales").textContent =
    shortMoney(sales, "USD");


  $("#financeCosts").textContent =
    shortMoney(costs, "USD");


  $("#financeProfit").textContent =
    shortMoney(profit, "USD");


  $("#financeMargin").textContent =
    `${(margin * 100).toFixed(1)}%`;
}


/* =========================================================
   HISTORIAL
   ========================================================= */

function renderHistory() {

  const list =
    [...state.services].sort(
      (a, b) =>
        new Date(b.start) -
        new Date(a.start)
    );


  $("#historyTable").innerHTML =
    list.length

      ? list.map(service => {

          const client =
            getClient(service.clientId);


          return `
            <tr>

              <td>
                ${escapeHtml(
                  client?.name || "—"
                )}
              </td>

              <td>
                ${escapeHtml(
                  service.service
                )}
              </td>

              <td>
                ${formatDate(service.start)}
                —
                ${formatDate(service.end)}
              </td>

              <td>
                ${money(
                  serviceTotal(service),
                  service.currency
                )}
              </td>

              <td>

                <span class="status ${
                  service.status === "Pendiente"
                    ? "pending"
                    : service.status === "Finalizado"
                      ? "done"
                      : ""
                }">

                  ${escapeHtml(
                    service.status
                  )}

                </span>

              </td>

            </tr>
          `;

        }).join("")

      : `
        <tr>

          <td colspan="5">

            <div class="empty-state">
              Sin historial.
            </div>

          </td>

        </tr>
      `;
}


/* =========================================================
   SELECTS
   ========================================================= */

