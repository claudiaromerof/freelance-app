/* =========================================================
   FREELANCE APP — APP.JS V1
   Interfaz + datos temporales de demostración

   IMPORTANTE:
   - NO contiene datos reales de clientes.
   - NO contiene contraseñas ni tokens.
   - La conexión con Google Sheets se agregará después.
   ========================================================= */


/* =========================================================
   DATOS DE DEMOSTRACIÓN
   ========================================================= */

const demoData = {

  clientes: [
    {
      ID_CLIENTE: "DEMO-001",
      NOMBRE: "Cliente de demostración",
      CONTACTO: "Contacto",
      EMAIL: "demo@example.com",
      TELEFONO: "",
      PAIS: "Perú",
      NOTAS: ""
    }
  ],

  servicios: [
    {
      ID_CONTRATACION: "DEMO-CNT-001",
      ID_CLIENTE: "DEMO-001",
      ID_SERVICIO: "DEMO-SRV-001",
      DESCRIPCION: "Servicio de demostración",
      FECHA_INICIO: "2026-09-01",
      FECHA_FIN: "2027-08-31",
      CANTIDAD: 1,
      COSTO_REAL: 100,
      PRECIO_CLIENTE: 200,
      MONEDA: "USD",
      GANANCIA: 100,
      MARGEN: 0.5,
      ESTADO_SERVICIO: "Activo",
      ESTADO_PAGO: "Pendiente",
      FECHA_PAGO: "",
      NOTAS: "Datos temporales de demostración."
    }
  ],

  catalogo: [
    {
      ID_SERVICIO: "DEMO-SRV-001",
      NOMBRE: "Servicio de demostración"
    }
  ]

};


/* =========================================================
   ESTADO DE LA APLICACIÓN
   ========================================================= */

const state = {

  currentView: "dashboard",

  clientes: [...demoData.clientes],

  servicios: [...demoData.servicios],

  catalogo: [...demoData.catalogo],

  filteredClientes: [...demoData.clientes],

  filteredServicios: [...demoData.servicios]

};


/* =========================================================
   INICIO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  inicializarEventos();

  renderDashboard();

  cargarClientes();

  cargarContrataciones();

  renderFinanzas();

  renderHistorial();

});


/* =========================================================
   EVENTOS
   ========================================================= */

function inicializarEventos() {

  const costInput = document.getElementById("serviceCost");
  const priceInput = document.getElementById("servicePrice");

  if (costInput) {
    costInput.addEventListener("input", actualizarGananciaPreview);
  }

  if (priceInput) {
    priceInput.addEventListener("input", actualizarGananciaPreview);
  }


  document.addEventListener("click", (event) => {

    const modal = event.target;

    if (modal.classList.contains("modal-overlay")) {
      modal.classList.add("hidden");
    }

  });


  document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

      document
        .querySelectorAll(".modal-overlay")
        .forEach(modal => modal.classList.add("hidden"));

    }

  });

}


/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function showView(view) {

  const views = document.querySelectorAll(".view");

  views.forEach(section => {
    section.classList.remove("active");
  });


  const selectedView = document.getElementById(`view-${view}`);

  if (selectedView) {
    selectedView.classList.add("active");
  }


  const navItems = document.querySelectorAll(".nav-item[data-view]");

  navItems.forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.view === view
    );

  });


  state.currentView = view;


  const titles = {

    dashboard: "Inicio",

    clientes: "Clientes",

    servicios: "Servicios",

    finanzas: "Finanzas",

    historial: "Historial",

    configuracion: "Configuración"

  };


  const pageTitle = document.getElementById("pageTitle");

  if (pageTitle) {
    pageTitle.textContent = titles[view] || "Freelance";
  }


  if (view === "dashboard") {
    renderDashboard();
  }

  if (view === "clientes") {
    cargarClientes();
  }

  if (view === "servicios") {
    cargarContrataciones();
  }

  if (view === "finanzas") {
    renderFinanzas();
  }

  if (view === "historial") {
    renderHistorial();
  }

}


/* =========================================================
   CLIENTES
   ========================================================= */

function cargarClientes() {

  state.filteredClientes = [...state.clientes];

  renderClientes();

  actualizarEstadisticas();

}


function renderClientes() {

  const container = document.getElementById("clientsList");

  if (!container) {
    return;
  }


  const clientes = state.filteredClientes;


  if (!clientes.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          ♙
        </div>

        <strong>
          No hay clientes
        </strong>

        <span>
          Todavía no tienes clientes registrados.
        </span>

      </div>

    `;

    return;
  }


  container.innerHTML = clientes.map(cliente => {

    const nombre = cliente.NOMBRE || "Sin nombre";

    const inicial = obtenerInicial(nombre);

    const serviciosCliente =
      state.servicios.filter(
        servicio =>
          String(servicio.ID_CLIENTE) ===
          String(cliente.ID_CLIENTE)
      );


    return `

      <div class="client-row">

        <div class="client-left">

          <div class="client-avatar">
            ${escapeHtml(inicial)}
          </div>

          <div class="client-details">

            <strong>
              ${escapeHtml(nombre)}
            </strong>

            <span>
              ${escapeHtml(
                cliente.EMAIL ||
                cliente.CONTACTO ||
                "Sin información de contacto"
              )}
            </span>

          </div>

        </div>


        <div class="client-right">

          <span class="client-services-count">
            ${serviciosCliente.length}
            ${serviciosCliente.length === 1 ? "servicio" : "servicios"}
          </span>

          <span class="status-badge status-active">
            Activo
          </span>

        </div>

      </div>

    `;

  }).join("");

}


/* =========================================================
   BUSCAR CLIENTES
   ========================================================= */

function filterClients() {

  const input = document.getElementById("clientSearch");

  const query = input
    ? input.value.trim().toLowerCase()
    : "";


  state.filteredClientes = state.clientes.filter(cliente => {

    const values = [

      cliente.NOMBRE,

      cliente.CONTACTO,

      cliente.EMAIL,

      cliente.TELEFONO,

      cliente.PAIS

    ];


    return values.some(value =>
      String(value || "")
        .toLowerCase()
        .includes(query)
    );

  });


  renderClientes();

}


/* =========================================================
   SERVICIOS
   ========================================================= */

function cargarContrataciones() {

  state.filteredServicios = [...state.servicios];

  renderServicios();

  actualizarEstadisticas();

}


/* =========================================================
   RENDER SERVICIOS
   ========================================================= */

function renderServicios() {

  const container = document.getElementById("servicesList");

  if (!container) {
    return;
  }


  let servicios = state.filteredServicios;


  if (!servicios.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          ▣
        </div>

        <strong>
          No hay servicios
        </strong>

        <span>
          Todavía no tienes servicios registrados.
        </span>

      </div>

    `;

    return;
  }


  container.innerHTML = servicios.map(servicio => {

    const cliente = obtenerCliente(servicio.ID_CLIENTE);

    const nombreCliente =
      cliente?.NOMBRE || "Cliente sin nombre";


    const nombreServicio =
      obtenerNombreServicio(servicio.ID_SERVICIO);


    const fechaInicio =
      formatearFecha(servicio.FECHA_INICIO);

    const fechaFin =
      formatearFecha(servicio.FECHA_FIN);


    const estadoServicio =
      servicio.ESTADO_SERVICIO || "Activo";


    const estadoPago =
      servicio.ESTADO_PAGO || "Pendiente";


    const precio =
      Number(servicio.PRECIO_CLIENTE || 0);


    return `

      <div class="service-row">

        <div class="service-main">

          <span class="service-name">
            ${escapeHtml(
              servicio.DESCRIPCION ||
              nombreServicio
            )}
          </span>

          <span class="service-client">
            ${escapeHtml(nombreCliente)}
          </span>

        </div>


        <div class="service-meta">

          <span class="service-meta-label">
            Periodo
          </span>

          <span class="service-meta-value">
            ${escapeHtml(fechaInicio)}
            —
            ${escapeHtml(fechaFin)}
          </span>

        </div>


        <div class="service-meta">

          <span class="service-meta-label">
            Servicio
          </span>

          <span class="service-meta-value">
            ${escapeHtml(nombreServicio)}
          </span>

        </div>


        <div>

          <span class="status-badge ${
            estadoServicio === "Activo"
              ? "status-active"
              : "status-finished"
          }">

            ${escapeHtml(estadoServicio)}

          </span>

          <span
            class="status-badge ${
              estadoPago === "Pagado"
                ? "status-paid"
                : "status-pending"
            }"
            style="margin-left: 4px;"
          >

            ${escapeHtml(estadoPago)}

          </span>

        </div>


        <div class="service-price">

          ${formatearMoneda(
            precio,
            servicio.MONEDA
          )}

        </div>

      </div>

    `;

  }).join("");

}


/* =========================================================
   FILTROS DE SERVICIOS
   ========================================================= */

function filterServices() {

  const searchInput =
    document.getElementById("serviceSearch");

  const statusInput =
    document.getElementById("serviceStatusFilter");

  const paymentInput =
    document.getElementById("paymentStatusFilter");


  const query =
    searchInput?.value
      ?.trim()
      .toLowerCase() || "";


  const status =
    statusInput?.value || "";


  const payment =
    paymentInput?.value || "";


  state.filteredServicios =
    state.servicios.filter(servicio => {

      const cliente =
        obtenerCliente(servicio.ID_CLIENTE);


      const nombreServicio =
        obtenerNombreServicio(
          servicio.ID_SERVICIO
        );


      const texto = [

        servicio.DESCRIPCION,

        cliente?.NOMBRE,

        nombreServicio,

        servicio.ID_CONTRATACION

      ]
        .join(" ")
        .toLowerCase();


      const matchesSearch =
        !query ||
        texto.includes(query);


      const matchesStatus =
        !status ||
        String(servicio.ESTADO_SERVICIO) ===
        String(status);


      const matchesPayment =
        !payment ||
        String(servicio.ESTADO_PAGO) ===
        String(payment);


      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );

    });


  renderServicios();

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

  actualizarEstadisticas();

  renderDashboardServices();

  renderUpcomingServices();

}


function renderDashboardServices() {

  const container =
    document.getElementById(
      "dashboardServices"
    );


  if (!container) {
    return;
  }


  const servicios =
    [...state.servicios]
      .sort(
        (a, b) =>
          new Date(b.FECHA_INICIO) -
          new Date(a.FECHA_INICIO)
      )
      .slice(0, 5);


  if (!servicios.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          ▣
        </div>

        <strong>
          No hay servicios todavía
        </strong>

        <span>
          Cuando registres un servicio aparecerá aquí.
        </span>

      </div>

    `;

    return;
  }


  container.innerHTML = servicios.map(servicio => {

    const cliente =
      obtenerCliente(servicio.ID_CLIENTE);


    const nombreCliente =
      cliente?.NOMBRE ||
      "Cliente sin nombre";


    const nombreServicio =
      servicio.DESCRIPCION ||
      obtenerNombreServicio(
        servicio.ID_SERVICIO
      );


    return `

      <div class="service-row">

        <div class="service-main">

          <span class="service-name">
            ${escapeHtml(nombreServicio)}
          </span>

          <span class="service-client">
            ${escapeHtml(nombreCliente)}
          </span>

        </div>


        <div class="service-meta">

          <span class="service-meta-label">
            Inicio
          </span>

          <span class="service-meta-value">
            ${formatearFecha(
              servicio.FECHA_INICIO
            )}
          </span>

        </div>


        <div class="service-meta">

          <span class="service-meta-label">
            Fin
          </span>

          <span class="service-meta-value">
            ${formatearFecha(
              servicio.FECHA_FIN
            )}
          </span>

        </div>


        <div>

          <span class="status-badge ${
            servicio.ESTADO_SERVICIO === "Activo"
              ? "status-active"
              : "status-finished"
          }">

            ${escapeHtml(
              servicio.ESTADO_SERVICIO ||
              "Activo"
            )}

          </span>

        </div>


        <div class="service-price">

          ${formatearMoneda(
            Number(
              servicio.PRECIO_CLIENTE || 0
            ),
            servicio.MONEDA
          )}

        </div>

      </div>

    `;

  }).join("");

}


function renderUpcomingServices() {

  const container =
    document.getElementById(
      "upcomingServices"
    );


  if (!container) {
    return;
  }


  const now = new Date();


  const upcoming =
    state.servicios

      .filter(servicio => {

        if (
          servicio.ESTADO_SERVICIO !==
          "Activo"
        ) {
          return false;
        }


        const end =
          parseDate(
            servicio.FECHA_FIN
          );


        if (!end) {
          return false;
        }


        const days =
          Math.ceil(
            (
              end.getTime() -
              now.getTime()
            ) /
            86400000
          );


        return days >= 0 && days <= 60;

      })

      .sort(
        (a, b) =>
          parseDate(a.FECHA_FIN) -
          parseDate(b.FECHA_FIN)
      )

      .slice(0, 5);


  if (!upcoming.length) {

    container.innerHTML = `

      <div class="empty-state compact">

        <div class="empty-icon">
          ◷
        </div>

        <strong>
          Sin vencimientos próximos
        </strong>

        <span>
          Aquí aparecerán los servicios próximos a finalizar.
        </span>

      </div>

    `;

    return;
  }


  container.innerHTML = upcoming.map(servicio => {

    const cliente =
      obtenerCliente(
        servicio.ID_CLIENTE
      );


    const nombreCliente =
      cliente?.NOMBRE ||
      "Cliente";


    const nombreServicio =
      servicio.DESCRIPCION ||
      obtenerNombreServicio(
        servicio.ID_SERVICIO
      );


    return `

      <div class="upcoming-item">

        <div class="upcoming-info">

          <strong>
            ${escapeHtml(nombreServicio)}
          </strong>

          <span>
            ${escapeHtml(nombreCliente)}
          </span>

        </div>


        <div class="upcoming-date">

          ${formatearFecha(
            servicio.FECHA_FIN
          )}

        </div>

      </div>

    `;

  }).join("");

}


/* =========================================================
   ESTADÍSTICAS
   ========================================================= */

function actualizarEstadisticas() {

  const clientes =
    state.clientes.length;


  const serviciosActivos =
    state.servicios.filter(
      servicio =>
        servicio.ESTADO_SERVICIO ===
        "Activo"
    ).length;


  const ventas =
    state.servicios.reduce(
      (total, servicio) =>
        total +
        Number(
          servicio.PRECIO_CLIENTE || 0
        ),
      0
    );


  const ganancia =
    state.servicios.reduce(
      (total, servicio) =>
        total +
        Number(
          servicio.GANANCIA || 0
        ),
      0
    );


  setText(
    "statClients",
    clientes
  );


  setText(
    "statServices",
    serviciosActivos
  );


  setText(
    "statSales",
    formatearMoneda(
      ventas,
      "USD"
    )
  );


  setText(
    "statProfit",
    formatearMoneda(
      ganancia,
      "USD"
    )
  );

}


/* =========================================================
   FINANZAS
   ========================================================= */

function renderFinanzas() {

  const ventas =
    state.servicios.reduce(
      (total, servicio) =>
        total +
        Number(
          servicio.PRECIO_CLIENTE || 0
        ),
      0
    );


  const costos =
    state.servicios.reduce(
      (total, servicio) =>
        total +
        Number(
          servicio.COSTO_REAL || 0
        ),
      0
    );


  const ganancia =
    state.servicios.reduce(
      (total, servicio) =>
        total +
        Number(
          servicio.GANANCIA || 0
        ),
      0
    );


  const margen =
    ventas > 0
      ? ganancia / ventas
      : 0;


  setText(
    "financeSales",
    formatearMoneda(
      ventas,
      "USD"
    )
  );


  setText(
    "financeCosts",
    formatearMoneda(
      costos,
      "USD"
    )
  );


  setText(
    "financeProfit",
    formatearMoneda(
      ganancia,
      "USD"
    )
  );


  setText(
    "financeMargin",
    `${Math.round(
      margen * 100
    )}%`
  );


  renderFinanceTable();

}


function renderFinanceTable() {

  const container =
    document.getElementById(
      "financeTable"
    );


  if (!container) {
    return;
  }


  if (!state.servicios.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          $
        </div>

        <strong>
          No hay información financiera
        </strong>

        <span>
          Registra servicios para comenzar a ver tus resultados.
        </span>

      </div>

    `;

    return;
  }


  container.innerHTML = state.servicios.map(servicio => {

    const cliente =
      obtenerCliente(
        servicio.ID_CLIENTE
      );


    const nombreServicio =
      servicio.DESCRIPCION ||
      obtenerNombreServicio(
        servicio.ID_SERVICIO
      );


    const costo =
      Number(
        servicio.COSTO_REAL || 0
      );


    const precio =
      Number(
        servicio.PRECIO_CLIENTE || 0
      );


    const ganancia =
      Number(
        servicio.GANANCIA ||
        precio - costo
      );


    const margen =
      precio > 0
        ? ganancia / precio
        : 0;


    return `

      <div class="finance-row">

        <div>

          <div class="finance-name">
            ${escapeHtml(nombreServicio)}
          </div>

          <span class="history-main span">
            ${escapeHtml(
              cliente?.NOMBRE ||
              "Cliente"
            )}
          </span>

        </div>


        <div class="finance-value">

          ${formatearMoneda(
            costo,
            servicio.MONEDA
          )}

        </div>


        <div class="finance-value">

          ${formatearMoneda(
            precio,
            servicio.MONEDA
          )}

        </div>


        <div class="finance-value finance-profit">

          ${formatearMoneda(
            ganancia,
            servicio.MONEDA
          )}

        </div>


        <div class="finance-value">

          ${Math.round(
            margen * 100
          )}%

        </div>

      </div>

    `;

  }).join("");

}


/* =========================================================
   HISTORIAL
   ========================================================= */

function renderHistorial() {

  const container =
    document.getElementById(
      "historyList"
    );


  if (!container) {
    return;
  }


  const servicios =
    [...state.servicios]
      .sort(
        (a, b) =>
          new Date(b.FECHA_INICIO) -
          new Date(a.FECHA_INICIO)
      );


  if (!servicios.length) {

    container.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">
          ◷
        </div>

        <strong>
          No hay historial
        </strong>

        <span>
          Los servicios anteriores aparecerán aquí.
        </span>

      </div>

    `;

    return;
  }


  container.innerHTML = servicios.map(servicio => {

    const cliente =
      obtenerCliente(
        servicio.ID_CLIENTE
      );


    const nombreServicio =
      servicio.DESCRIPCION ||
      obtenerNombreServicio(
        servicio.ID_SERVICIO
      );


    return `

      <div class="history-row">

        <div class="history-main">

          <strong>
            ${escapeHtml(nombreServicio)}
          </strong>

          <span>
            ${escapeHtml(
              cliente?.NOMBRE ||
              "Cliente"
            )}
          </span>

        </div>


        <div class="history-value">

          ${formatearFecha(
            servicio.FECHA_INICIO
          )}

          —

          ${formatearFecha(
            servicio.FECHA_FIN
          )}

        </div>


        <div class="history-value">

          ${formatearMoneda(
            Number(
              servicio.PRECIO_CLIENTE || 0
            ),
            servicio.MONEDA
          )}

        </div>


        <div class="history-value">

          ${escapeHtml(
            servicio.ESTADO_PAGO ||
            "Pendiente"
          )}

        </div>


        <div class="history-value">

          ${escapeHtml(
            servicio.MONEDA ||
            "USD"
          )}

        </div>

      </div>

    `;

  }).join("");

}


/* =========================================================
   NUEVO CLIENTE
   ========================================================= */

function openNewClient() {

  const modal =
    document.getElementById(
      "clientModal"
    );


  if (!modal) {
    return;
  }


  const form =
    document.getElementById(
      "clientForm"
    );


  if (form) {
    form.reset();
  }


  modal.classList.remove("hidden");


  setTimeout(() => {

    document
      .getElementById("clientName")
      ?.focus();

  }, 100);

}


/* =========================================================
   GUARDAR CLIENTE
   ========================================================= */

function saveClient(event) {

  event.preventDefault();


  const name =
    getValue("clientName");


  if (!name) {

    showToast(
      "Ingresa el nombre del cliente."
    );

    return;
  }


  const newClient = {

    ID_CLIENTE:
      generarId(
        "CLI"
      ),

    NOMBRE:
      name,

    CONTACTO:
      getValue(
        "clientContact"
      ),

    EMAIL:
      getValue(
        "clientEmail"
      ),

    TELEFONO:
      getValue(
        "clientPhone"
      ),

    PAIS:
      getValue(
        "clientCountry"
      ),

    NOTAS:
      getValue(
        "clientNotes"
      )

  };


  state.clientes.push(
    newClient
  );


  closeModal(
    "clientModal"
  );


  cargarClientes();

  actualizarSelectClientes();

  renderDashboard();


  showToast(
    "Cliente guardado correctamente."
  );

}


/* =========================================================
   NUEVO SERVICIO
   ========================================================= */

function openNewService() {

  const modal =
    document.getElementById(
      "serviceModal"
    );


  if (!modal) {
    return;
  }


  const form =
    document.getElementById(
      "serviceForm"
    );


  if (form) {
    form.reset();
  }


  actualizarSelectClientes();

  actualizarSelectServicios();


  const quantity =
    document.getElementById(
      "serviceQuantity"
    );


  if (quantity) {
    quantity.value = "1";
  }


  const status =
    document.getElementById(
      "serviceStatus"
    );


  if (status) {
    status.value = "Activo";
  }


  const payment =
    document.getElementById(
      "servicePayment"
    );


  if (payment) {
    payment.value = "Pendiente";
  }


  const currency =
    document.getElementById(
      "serviceCurrency"
    );


  if (currency) {
    currency.value = "USD";
  }


  actualizarGananciaPreview();


  modal.classList.remove(
    "hidden"
  );


  setTimeout(() => {

    document
      .getElementById(
        "serviceClient"
      )
      ?.focus();

  }, 100);

}


/* =========================================================
   SELECT CLIENTES
   ========================================================= */

function actualizarSelectClientes() {

  const select =
    document.getElementById(
      "serviceClient"
    );


  if (!select) {
    return;
  }


  select.innerHTML = `

    <option value="">
      Seleccionar cliente
    </option>

    ${
      state.clientes.map(cliente => `

        <option value="${escapeAttribute(
          cliente.ID_CLIENTE
        )}">

          ${escapeHtml(
            cliente.NOMBRE ||
            "Sin nombre"
          )}

        </option>

      `).join("")
    }

  `;

}


/* =========================================================
   SELECT SERVICIOS
   ========================================================= */

function actualizarSelectServicios() {

  const select =
    document.getElementById(
      "serviceType"
    );


  if (!select) {
    return;
  }


  select.innerHTML = `

    <option value="">
      Seleccionar servicio
    </option>

    ${
      state.catalogo.map(servicio => `

        <option value="${escapeAttribute(
          servicio.ID_SERVICIO
        )}">

          ${escapeHtml(
            servicio.NOMBRE ||
            servicio.ID_SERVICIO
          )}

        </option>

      `).join("")
    }

  `;

}


/* =========================================================
   GUARDAR SERVICIO
   ========================================================= */

function saveService(event) {

  event.preventDefault();


  const cliente =
    getValue(
      "serviceClient"
    );


  const servicio =
    getValue(
      "serviceType"
    );


  const start =
    getValue(
      "serviceStart"
    );


  const end =
    getValue(
      "serviceEnd"
    );


  const price =
    Number(
      getValue(
        "servicePrice"
      ) || 0
    );


  if (
    !cliente ||
    !servicio ||
    !start ||
    !end ||
    price <= 0
  ) {

    showToast(
      "Completa los campos obligatorios."
    );

    return;
  }


  const cost =
    Number(
      getValue(
        "serviceCost"
      ) || 0
    );


  const quantity =
    Number(
      getValue(
        "serviceQuantity"
      ) || 1
    );


  const currency =
    getValue(
      "serviceCurrency"
    ) || "USD";


  const profit =
    price - cost;


  const margin =
    price > 0
      ? profit / price
      : 0;


  const newService = {

    ID_CONTRATACION:
      generarId(
        "CNT"
      ),

    ID_CLIENTE:
      cliente,

    ID_SERVICIO:
      servicio,

    DESCRIPCION:
      getValue(
        "serviceDescription"
      ) ||
      obtenerNombreServicio(
        servicio
      ),

    FECHA_INICIO:
      start,

    FECHA_FIN:
      end,

    CANTIDAD:
      quantity,

    COSTO_REAL:
      cost,

    PRECIO_CLIENTE:
      price,

    MONEDA:
      currency,

    GANANCIA:
      profit,

    MARGEN:
      margin,

    ESTADO_SERVICIO:
      getValue(
        "serviceStatus"
      ) || "Activo",

    ESTADO_PAGO:
      getValue(
        "servicePayment"
      ) || "Pendiente",

    FECHA_PAGO:
      "",

    NOTAS:
      getValue(
        "serviceNotes"
      )

  };


  state.servicios.push(
    newService
  );


  closeModal(
    "serviceModal"
  );


  cargarContrataciones();

  renderDashboard();

  renderFinanzas();

  renderHistorial();


  showToast(
    "Servicio guardado correctamente."
  );

}


/* =========================================================
   PREVISUALIZACIÓN GANANCIA
   ========================================================= */

function actualizarGananciaPreview() {

  const cost =
    Number(
      getValue(
        "serviceCost"
      ) || 0
    );


  const price =
    Number(
      getValue(
        "servicePrice"
      ) || 0
    );


  const profit =
    price - cost;


  const margin =
    price > 0
      ? profit / price
      : 0;


  const currency =
    getValue(
      "serviceCurrency"
    ) || "USD";


  setText(
    "previewProfit",
    formatearMoneda(
      profit,
      currency
    )
  );


  setText(
    "previewMargin",
    `${Math.round(
      margin * 100
    )}%`
  );

}


/* =========================================================
   MODALES
   ========================================================= */

function closeModal(id) {

  const modal =
    document.getElementById(
      id
    );


  if (modal) {
    modal.classList.add(
      "hidden"
    );
  }

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;


function showToast(message) {

  const toast =
    document.getElementById(
      "toast"
    );


  const text =
    document.getElementById(
      "toastMessage"
    );


  if (!toast || !text) {
    return;
  }


  text.textContent =
    message;


  toast.classList.remove(
    "hidden"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(() => {

      toast.classList.add(
        "hidden"
      );

    }, 3000);

}


/* =========================================================
   UTILIDADES
   ========================================================= */

function obtenerCliente(id) {

  return state.clientes.find(
    cliente =>
      String(
        cliente.ID_CLIENTE
      ) ===
      String(id)
  );

}


function obtenerNombreServicio(id) {

  const servicio =
    state.catalogo.find(
      item =>
        String(
          item.ID_SERVICIO
        ) ===
        String(id)
    );


  return (
    servicio?.NOMBRE ||
    id ||
    "Servicio"
  );

}


function obtenerInicial(nombre) {

  const texto =
    String(
      nombre || "?"
    ).trim();


  return texto
    ? texto.charAt(0).toUpperCase()
    : "?";

}


function generarId(prefix) {

  const random =
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();


  return `${prefix}-${random}`;

}


function getValue(id) {

  const element =
    document.getElementById(id);


  return element
    ? element.value.trim()
    : "";

}


function setText(id, value) {

  const element =
    document.getElementById(id);


  if (element) {
    element.textContent =
      value;
  }

}


function parseDate(value) {

  if (!value) {
    return null;
  }


  if (
    value instanceof Date &&
    !isNaN(value)
  ) {
    return value;
  }


  const date =
    new Date(value);


  if (isNaN(date)) {
    return null;
  }


  return date;

}


function formatearFecha(value) {

  const date =
    parseDate(value);


  if (!date) {
    return "—";
  }


  return new Intl.DateTimeFormat(
    "es-PE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  ).format(date);

}


function formatearMoneda(
  value,
  currency = "USD"
) {

  const number =
    Number(value || 0);


  const currencyCode =
    currency === "PEN"
      ? "PEN"
      : "USD";


  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(number);

}


function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


function escapeAttribute(value) {

  return escapeHtml(
    value
  );

}


/* =========================================================
   EXPOSICIÓN GLOBAL
   Permite que los onclick del HTML encuentren las funciones.
   ========================================================= */

window.showView =
  showView;

window.openNewClient =
  openNewClient;

window.saveClient =
  saveClient;

window.openNewService =
  openNewService;

window.saveService =
  saveService;

window.closeModal =
  closeModal;

window.filterClients =
  filterClients;

window.filterServices =
  filterServices;

window.showToast =
  showToast;