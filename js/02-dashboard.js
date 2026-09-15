function renderDashboard() {

  const todayLabel = $("#todayLabel");

  if (todayLabel) {

    todayLabel.textContent =
      new Intl.DateTimeFormat("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      })
        .format(new Date())
        .replace(/^\w/, character =>
          character.toUpperCase()
        );
  }


  $("#metricClients").textContent =
    state.clients.length;

  $("#metricClientsSub").textContent =
    state.clients.length === 1
      ? "cliente registrado"
      : "clientes registrados";


  $("#metricQuotes").textContent =
    state.quotes.length;

  $("#metricQuotesSub").textContent =
    state.quotes.length
      ? "documentos creados"
      : "sin cotizaciones";


  const currentMonth =
    new Date().getMonth();

  const currentYear =
    new Date().getFullYear();


  const income =
    state.services

      .filter(service =>
        service.payment === "Pagado"
      )

      .filter(service => {

        const date =
          new Date(`${service.start}T12:00:00`);

        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        );
      })

      .reduce(
        (sum, service) =>
          sum + serviceTotal(service),
        0
      );


  $("#metricIncome").textContent =
    shortMoney(income, "USD");

  $("#metricIncomeSub").textContent =
    "pagos registrados este mes";


  const activeServices =
    state.services.filter(
      service =>
        service.status === "Activo"
    ).length;


  $("#metricActive").textContent =
    activeServices;

  $("#metricActiveSub").textContent =
    "servicios activos";


  renderIncomeChart();
  renderUpcoming();
  renderRecentClients();
}


function renderIncomeChart() {

  const container = $("#incomeChart");

  if (!container) {
    return;
  }

  const now = new Date();

  const months = [];


  for (let i = 5; i >= 0; i--) {

    const date =
      new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

    months.push({
      label:
        date
          .toLocaleDateString(
            "es-PE",
            { month: "short" }
          )
          .replace(".", ""),

      month: date.getMonth(),

      year: date.getFullYear()
    });
  }


  const values =
    months.map(month => {

      return state.services

        .filter(service =>
          service.payment === "Pagado"
        )

        .filter(service => {

          const date =
            new Date(
              `${service.start}T12:00:00`
            );

          return (
            date.getMonth() === month.month &&
            date.getFullYear() === month.year
          );
        })

        .reduce(
          (sum, service) =>
            sum + serviceTotal(service),
          0
        );
    });


  const max =
    Math.max(...values, 1);


  container.innerHTML = `
    <div class="chart">

      ${values.map((value, index) => `

        <div class="bar-group">

          <div
            class="bar ${index === values.length - 1 ? "current" : ""}"
            style="height:${Math.max(
              (value / max) * 78,
              4
            )}%"
          ></div>

          <span class="bar-label">
            ${months[index].label}
          </span>

        </div>

      `).join("")}

    </div>
  `;
}


function renderUpcoming() {

  const container =
    $("#upcomingActivities");

  if (!container) {
    return;
  }


  const list =
    [...state.services]

      .filter(service =>
        service.status !== "Finalizado"
      )

      .sort(
        (a, b) =>
          new Date(`${a.end}T12:00:00`) -
          new Date(`${b.end}T12:00:00`)
      )

      .slice(0, 4);


  if (!list.length) {

    container.innerHTML =
      `<div class="empty-state">
        No hay actividades próximas.
      </div>`;

    return;
  }


  container.innerHTML =
    list.map(service => {

      const date =
        new Date(
          `${service.end}T12:00:00`
        );

      const client =
        getClient(service.clientId);


      return `
        <div class="activity">

          <div class="activity-date">
            <strong>
              ${String(date.getDate()).padStart(2, "0")}
            </strong>

            <small>
              ${date
                .toLocaleDateString(
                  "es-PE",
                  { month: "short" }
                )
                .replace(".", "")
                .toUpperCase()}
            </small>
          </div>

          <div class="activity-main">

            <strong>
              Vence ${escapeHtml(service.service)}
            </strong>

            <span>
              ${escapeHtml(
                client?.name || "Cliente"
              )}
            </span>

          </div>

          ${icon("i-arrow")}

        </div>
      `;

    }).join("");
}


function renderRecentClients() {

  const container =
    $("#recentClients");

  if (!container) {
    return;
  }


  const list =
    [...state.clients]

      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )

      .slice(0, 4);


  if (!list.length) {

    container.innerHTML =
      `<div class="empty-state">
        Todavía no hay clientes.
      </div>`;

    return;
  }


  container.innerHTML =
    list.map(client => {

      const latest =
        [...state.services]
          .filter(
            service =>
              service.clientId === client.id
          )
          .sort(
            (a, b) =>
              new Date(b.start) -
              new Date(a.start)
          )[0];


      return `
        <div class="recent-item">

          <div class="client-avatar">
            ${escapeHtml(
              initials(client.name)
            )}
          </div>

          <div>

            <strong>
              ${escapeHtml(client.name)}
            </strong>

            <span>
              ${escapeHtml(
                latest?.service ||
                "Sin servicios"
              )}
            </span>

          </div>

          <time>
            ${formatDate(client.createdAt)}
          </time>

        </div>
      `;

    }).join("");
}


/* =========================================================
   CLIENTES
   ========================================================= */

