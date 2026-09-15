function updateProfitPreview() {

  const form =
    $("#serviceForm");

  if (!form) {
    return;
  }


  const price =
    Number(
      form.elements.price.value || 0
    );


  const cost =
    Number(
      form.elements.cost.value || 0
    );


  const quantity =
    Number(
      form.elements.quantity.value || 1
    );


  const currency =
    form.elements.currency.value ||
    "USD";


  $("#profitPreview").textContent =
    money(
      (price - cost) * quantity,
      currency
    );
}


["price", "cost", "quantity", "currency"]
  .forEach(name => {

    $("#serviceForm")
      ?.elements[name]
      ?.addEventListener(
        "input",
        updateProfitPreview
      );


    $("#serviceForm")
      ?.elements[name]
      ?.addEventListener(
        "change",
        updateProfitPreview
      );

  });


/* =========================================================
   DOCUMENTOS
   ========================================================= */

function printDocument(html, title) {

  const win =
    window.open("", "_blank");


  if (!win) {

    toast(
      "El navegador bloqueó la ventana. Permite ventanas emergentes."
    );

    return;
  }


  win.document.write(html);

  win.document.close();

  win.document.title = title;
}


/* =========================================================
   ESTILOS DE DOCUMENTOS
   ========================================================= */

function documentStyles() {

  return `

    <style>

      :root {

        --ink:#171b19;
        --muted:#626a65;
        --line:#d9ddd8;
        --green:#405a4f;
        --green-soft:#e9eeea;
        --paper:#fcfbf8;

      }


      * {
        box-sizing:border-box;
      }


      body {

        margin:0;

        background:#ecece8;

        color:var(--ink);

        font-family:
          "DM Sans",
          Arial,
          sans-serif;

        -webkit-print-color-adjust:exact;
        print-color-adjust:exact;

      }


      .page {

        width:210mm;

        min-height:297mm;

        margin:16px auto;

        background:var(--paper);

        padding:
          18mm
          18mm
          15mm;

        position:relative;

        box-shadow:
          0 14px 45px
          rgba(0,0,0,.10);

      }


      .header {

        display:flex;

        justify-content:space-between;

        align-items:flex-start;

        gap:35px;

        padding-bottom:18px;

        border-bottom:
          1px solid
          var(--green);

      }


      .identity-mark {

        font-family:
          "Playfair Display",
          Georgia,
          serif;

        font-size:63px;

        line-height:.72;

        letter-spacing:-9px;

        color:var(--ink);

        margin-left:-5px;

      }


      .descriptor {

        margin-top:16px;

        font-size:8.5px;

        letter-spacing:2.1px;

        font-weight:600;

        white-space:nowrap;

      }


      .meta {

        text-align:left;

        min-width:155px;

        padding-top:2px;

      }


      .meta .label {

        font-size:9px;

        letter-spacing:2.1px;

        font-weight:700;

        margin-bottom:9px;

      }


      .meta div:not(.label) {

        font-size:10.5px;

        line-height:1.75;

        color:#3e4541;

      }


      .client-row {

        display:grid;

        grid-template-columns:
          1fr
          1px
          1fr;

        gap:28px;

        margin-top:27px;

        min-height:75px;

      }


      .client-block strong {

        display:block;

        font-size:11px;

        margin-bottom:5px;

      }


      .client-name {

        font-family:
          "Playfair Display",
          Georgia,
          serif;

        font-size:18px;

        margin-bottom:5px;

      }


      .client-block div:not(.client-name) {

        font-size:10.5px;

        line-height:1.6;

        color:var(--muted);

      }


      .vertical-rule {

        background:var(--green);

        opacity:.7;

      }


      .label-section {

        margin-top:31px;

        font-size:8.5px;

        letter-spacing:2px;

        color:#69716c;

        font-weight:600;

      }


      h1 {

        font-family:
          "Playfair Display",
          Georgia,
          serif;

        font-size:37px;

        line-height:1.08;

        letter-spacing:-.8px;

        font-weight:500;

        margin:
          11px 0 8px;

      }


      .intro {

        max-width:650px;

        color:#4f5752;

        font-family:
          "Playfair Display",
          Georgia,
          serif;

        font-size:14px;

        line-height:1.55;

      }


      table.items {

        margin-top:29px;

        width:100%;

        border-collapse:collapse;

      }


      .items th {

        background:var(--green-soft);

        padding:10px 12px;

        text-align:left;

        font-size:8.5px;

        letter-spacing:1.4px;

        font-weight:700;

      }


      .items th:nth-child(n+2),
      .items td:nth-child(n+2) {

        text-align:right;

      }


      .items td {

        padding:12px;

        border-bottom:
          1px solid
          var(--line);

        font-size:10.5px;

        vertical-align:top;

      }


      .item-title {

        font-weight:700;

        font-size:11px;

        margin-bottom:3px;

      }


      .item-sub {

        color:var(--muted);

        font-size:9.5px;

      }


      .totals {

        width:46%;

        margin:
          15px
          0
          0
          auto;

        border-collapse:collapse;

      }


      .totals td {

        padding:5px 8px;

        font-size:10px;

        text-align:right;

      }


      .totals td:first-child {

        text-align:left;

        color:#59615c;

      }


      .totals .grand td {

        background:var(--green-soft);

        padding:10px 8px;

        font-size:12px;

        font-weight:700;

        color:var(--ink);

      }


      .lower {

        display:grid;

        grid-template-columns:
          1fr
          1fr;

        gap:45px;

        margin-top:38px;

        align-items:end;

      }


      .notes h3 {

        font-size:11px;

        margin:
          0
          0
          8px;

      }


      .notes ul {

        margin:0;

        padding-left:15px;

        color:#525a55;

        font-size:9.5px;

        line-height:1.75;

      }


      .signature {

        text-align:right;

      }


      .signature-name {
        font-family:
          "Playfair Display",
          Georgia,
          serif;
        font-size:12px;
        font-weight:600;
        margin-bottom:5px;
      }


      .signature-line {

        height:1px;

        background:#c8ccc8;

        margin-bottom:9px;

      }


      .signature-role {

        font-size:9.5px;

        line-height:1.55;

        color:#59615c;

      }


      .footer {

        position:absolute;

        left:18mm;

        right:18mm;

        bottom:15mm;

        border-top:
          1px solid
          var(--green);

        padding-top:14px;

        display:flex;

        justify-content:space-between;

        align-items:flex-end;

        gap:25px;

      }


      .footer-brand {

        font-family:
          "Playfair Display",
          Georgia,
          serif;

        font-size:18px;

      }


      .footer-brand small {

        display:block;

        font-family:
          "DM Sans",
          Arial,
          sans-serif;

        font-size:7px;

        letter-spacing:1.3px;

        margin-top:5px;

      }


      .footer-contact {

        text-align:right;

        font-size:8.5px;

        line-height:1.7;

        color:#59615c;

      }


      .billing-period {

        margin-top:26px;

        padding:
          14px
          16px;

        background:#f0f3ef;

        border-left:
          2px solid
          var(--green);

      }


      .billing-period .small {

        font-size:8px;

        letter-spacing:1.6px;

        text-transform:uppercase;

        font-weight:700;

        color:#68716b;

      }


      .billing-period strong {

        display:block;

        font-family:
          "Playfair Display",
          Georgia,
          serif;

        font-size:18px;

        font-weight:500;

        margin-top:5px;

      }


      .payment-box {

        margin-top:20px;

        border:
          1px solid
          var(--line);

        padding:
          13px
          15px;

        font-size:9.5px;

        line-height:1.65;

      }


      @media print {

        body {
          background:#fff;
        }

        .page {
          margin:0;
          box-shadow:none;
        }

        @page {
          size:A4;
          margin:0;
        }

      }


      @media(max-width:800px) {

        .page {

          width:100%;

          min-height:auto;

          margin:0;

          padding:
            30px
            25px
            150px;

        }


        .header {
          gap:15px;
        }


        .identity-mark {
          font-size:48px;
        }


        .descriptor {

          white-space:normal;

          max-width:300px;

        }


        .client-row {

          grid-template-columns:1fr;

          gap:15px;

        }


        .vertical-rule {
          display:none;
        }


        .lower {

          grid-template-columns:1fr;

          gap:30px;

        }


        .totals {
          width:100%;
        }


        .footer {

          position:absolute;

          left:25px;

          right:25px;

        }

      }

    </style>

  `;
}


/* =========================================================
   COTIZACIÓN PDF
   ========================================================= */

function downloadQuote(id) {

  const quote =
    state.quotes.find(
      item => item.id === id
    );


  if (!quote) {
    return;
  }


  const client =
    getClient(quote.clientId);


  const safeClient =
    escapeHtml(
      client?.name || "Cliente"
    );


  const safeEmail =
    escapeHtml(
      client?.email || ""
    );


  const safeTitle =
    escapeHtml(
      quote.title
    );


  const safeDescription =
    escapeHtml(
      quote.description ||
      "Servicio profesional de comunicación, desarrollo web y estrategia digital."
    );


  const amount =
    money(
      quote.price,
      quote.currency
    );


  const number =
    escapeHtml(quote.id);


  const date =
    formatDate(quote.date);


  const validity =
    escapeHtml(
      quote.validity ||
      "15 días"
    );


  printDocument(

    `

      <!doctype html>

      <html lang="es">

      <head>

        <meta charset="utf-8">

        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        >

        <title>
          Cotización ${number}
          — Claudia Romero Fonseca
        </title>


        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        >

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin
        >


        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600&display=swap"
          rel="stylesheet"
        >


        ${documentStyles()}

      </head>


      <body>

        <main class="page">


          <header class="header">

            <div>

              <div class="identity-mark">
                CRF
              </div>

              <div class="descriptor">
                COMUNICACIÓN · DESARROLLO WEB · ESTRATEGIA DIGITAL
              </div>

            </div>


            <div class="meta">

              <div class="label">
                COTIZACIÓN
              </div>

              <div>
                N.º ${number}
              </div>

              <div>
                ${date}
              </div>

              <div>
                Válida por ${validity}
              </div>

            </div>

          </header>


          <section class="client-row">


            <div class="client-block">

              <strong>
                Cliente
              </strong>

              <div class="client-name">
                ${safeClient}
              </div>

              ${
                safeEmail
                  ? `<div>${safeEmail}</div>`
                  : ""
              }

            </div>


            <div class="vertical-rule"></div>


            <div class="client-block">

              <strong>
                Servicio
              </strong>

              <div>
                Propuesta profesional personalizada
              </div>

              <div>
                Comunicación · Web · Estrategia digital
              </div>

            </div>


          </section>


          <div class="label-section">
            PROPUESTA
          </div>


          <h1>
            ${safeTitle}
          </h1>


          <div class="intro">
            ${safeDescription}
          </div>


          <table class="items">

            <thead>

              <tr>

                <th>
                  DESCRIPCIÓN
                </th>

                <th>
                  CANT.
                </th>

                <th>
                  PRECIO UNIT.
                </th>

                <th>
                  TOTAL
                </th>

              </tr>

            </thead>


            <tbody>

              <tr>

                <td>

                  <div class="item-title">
                    ${safeTitle}
                  </div>

                  <div class="item-sub">
                    ${safeDescription}
                  </div>

                </td>

                <td>
                  1
                </td>

                <td>
                  ${amount}
                </td>

                <td>
                  ${amount}
                </td>

              </tr>

            </tbody>

          </table>


          <table class="totals">

            <tr>

              <td>
                Subtotal
              </td>

              <td>
                ${amount}
              </td>

            </tr>


            <tr>

              <td>
                IGV
              </td>

              <td>
                —
              </td>

            </tr>


            <tr class="grand">

              <td>
                Total
              </td>

              <td>
                ${amount}
              </td>

            </tr>

          </table>


          <section class="lower">


            <div class="notes">

              <h3>
                Notas
              </h3>

              <ul>

                <li>
                  Esta cotización tiene una
                  validez de ${validity}.
                </li>

                <li>
                  El inicio del proyecto se
                  coordina con la confirmación
                  del servicio.
                </li>

                <li>
                  Cualquier alcance adicional
                  se cotizará por separado.
                </li>

              </ul>

            </div>


            <div class="signature">

              <div class="signature-line"></div>

              <div class="signature-name">
                Claudia Romero Fonseca
              </div>

              <div class="signature-role">

                Comunicadora · Desarrolladora Web

                <br>

                Estratega en Transformación Digital

              </div>

            </div>


          </section>


          <footer class="footer">

            <div class="footer-brand">

              Claudia R.

              <small>
                COMUNICACIÓN · DESARROLLO WEB · ESTRATEGIA DIGITAL
              </small>

            </div>


            <div class="footer-contact">

              Documento comercial ·
              Información de contacto configurable

            </div>

          </footer>


        </main>


        <script>

          window.onload = () => {

            setTimeout(
              () => window.print(),
              450
            );

          };

        <\/script>


      </body>

      </html>

    `,

    `Cotización ${number} — Claudia Romero Fonseca`

  );
}


/* =========================================================
   COBRO POR CLIENTE
   ========================================================= */

function downloadClientBilling(clientId) {

  const client =
    getClient(clientId);


  if (!client) {

    toast(
      "No se encontró el cliente."
    );

    return;
  }


  /*
    IMPORTANTE:

    Para el documento de cobro se toman
    los servicios ACTIVO y PENDIENTE.

    Los FINALIZADOS quedan en historial
    y no vuelven a cobrarse.
  */

  const services =
    state.services

      .filter(service =>
        service.clientId === clientId &&
        service.status !== "Finalizado"
      )

      .sort(
        (a, b) =>
          new Date(a.start) -
          new Date(b.start)
      );


  if (!services.length) {

    toast(
      "Este cliente no tiene servicios activos o pendientes para cobrar."
    );

    return;
  }


  /*
    Todos los servicios del mismo documento
    deben estar en la misma moneda.
  */

  const currency =
    services[0].currency || "USD";


  const mixedCurrency =
    services.some(
      service =>
        (service.currency || "USD") !== currency
    );


  if (mixedCurrency) {

    toast(
      "El cliente tiene servicios en monedas distintas. Revísalos antes de cobrar."
    );

    return;
  }


  const total =
    services.reduce(
      (sum, service) =>
        sum + serviceTotal(service),
      0
    );


  /*
    Periodo general:

    desde la fecha inicial más antigua
    hasta la fecha final más lejana.

    Cada servicio conserva además
    su propio periodo en la tabla.
  */

  const startDates =
    services
      .map(
        service =>
          new Date(
            `${service.start}T12:00:00`
          )
      )
      .sort(
        (a, b) => a - b
      );


  const endDates =
    services
      .map(
        service =>
          new Date(
            `${service.end}T12:00:00`
          )
      )
      .sort(
        (a, b) => b - a
      );


  const periodStart =
    startDates[0];


  const periodEnd =
    endDates[0];


  const samePeriod = services.every(service =>
    service.start === services[0].start && service.end === services[0].end
  );

  const periodText = samePeriod
    ? `${periodStart.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })} — ${periodEnd.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" })}`
    : "Periodos según cada servicio";


  const billingNumber =
    `COB-${String(
      Date.now()
    ).slice(-6)}`;


  const rows =
    services.map(service => {

      const quantity =
        Number(
          service.quantity || 1
        );


      const lineTotal =
        serviceTotal(service);


      return `

        <tr>

          <td>

            <div class="item-title">
              ${escapeHtml(
                service.service
              )}
            </div>

            <div class="item-sub">
              ${escapeHtml(
                service.description ||
                "Servicio contratado"
              )}
            </div>

          </td>


          <td>

            ${formatDate(
              service.start
            )}

            —

            ${formatDate(
              service.end
            )}

          </td>


          <td>
            ${quantity}
          </td>


          <td>

            ${money(
              Number(service.price || 0),
              service.currency
            )}

          </td>


          <td>

            ${money(
              lineTotal,
              service.currency
            )}

          </td>

        </tr>

      `;

    }).join("");


  const safeClient =
    escapeHtml(client.name);


  const safeEmail =
    escapeHtml(
      client.email || ""
    );


  const safeDocument =
    escapeHtml(
      client.document || ""
    );


  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  printDocument(

    `

      <!doctype html>

      <html lang="es">

      <head>

        <meta charset="utf-8">

        <meta
          name="viewport"
          content="width=device-width,initial-scale=1"
        >

        <title>
          Resumen de cobro
          ${billingNumber}
        </title>


        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        >

        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin
        >


        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600&display=swap"
          rel="stylesheet"
        >


        ${documentStyles()}

      </head>


      <body>


        <main class="page">


          <header class="header">


            <div>

              <div class="identity-mark">
                CRF
              </div>

              <div class="descriptor">
                COMUNICACIÓN · DESARROLLO WEB · ESTRATEGIA DIGITAL
              </div>

            </div>


            <div class="meta">

              <div class="label">
                RESUMEN DE COBRO
              </div>

              <div>
                N.º ${billingNumber}
              </div>

              <div>
                ${formatDate(today)}
              </div>

              <div>
                Pago pendiente
              </div>

            </div>


          </header>


          <section class="client-row">


            <div class="client-block">

              <strong>
                Cliente
              </strong>


              <div class="client-name">
                ${safeClient}
              </div>


              ${
                safeEmail
                  ? `<div>${safeEmail}</div>`
                  : ""
              }


              ${
                safeDocument
                  ? `<div>${safeDocument}</div>`
                  : ""
              }

            </div>


            <div class="vertical-rule"></div>


            <div class="client-block">

              <strong>
                Concepto
              </strong>


              <div>
                Servicios contratados
              </div>


              <div>
                ${services.length}
                ${
                  services.length === 1
                    ? "servicio"
                    : "servicios"
                }
                incluidos
              </div>

            </div>


          </section>


          <div class="label-section">
            PERIODO DE COBRO
          </div>

          <h1>
            Servicios incluidos en este cobro
          </h1>

          <div class="billing-period">
            <div class="small">
              ${samePeriod ? "Periodo comprendido" : "Periodo de cada servicio"}
            </div>
            <strong>
              ${periodText}
            </strong>
          </div>


          <table class="items">


            <thead>

              <tr>

                <th>
                  SERVICIO
                </th>

                <th>
                  PERIODO
                </th>

                <th>
                  CANT.
                </th>

                <th>
                  PRECIO UNIT.
                </th>

                <th>
                  TOTAL
                </th>

              </tr>

            </thead>


            <tbody>

              ${rows}

            </tbody>


          </table>


          <table class="totals">


            <tr>

              <td>
                Subtotal
              </td>

              <td>
                ${money(
                  total,
                  currency
                )}
              </td>

            </tr>


            <tr>

              <td>
                IGV
              </td>

              <td>
                —
              </td>

            </tr>


            <tr class="grand">

              <td>
                Total a pagar
              </td>

              <td>
                ${money(
                  total,
                  currency
                )}
              </td>

            </tr>


          </table>


          <div class="payment-box">

            <strong>
              Condición de pago
            </strong>

            <br>

            El pago corresponde a los
            servicios detallados y al
            periodo indicado en este
            documento.

          </div>


          <section class="lower">


            <div class="notes">

              <h3>
                Notas
              </h3>


              <ul>

                <li>
                  Este documento resume
                  los servicios contratados
                  con Claudia Romero Fonseca.
                </li>

                <li>
                  Los costos internos de
                  plataformas no forman
                  parte de este documento.
                </li>

                <li>
                  Los datos tributarios se
                  gestionan de manera
                  independiente.
                </li>

              </ul>

            </div>


            <div class="signature">

              <div class="signature-line"></div>

              <div class="signature-name">
                Claudia Romero Fonseca
              </div>

              <div class="signature-role">

                Comunicadora · Desarrolladora Web

                <br>

                Estratega en Transformación Digital

              </div>

            </div>


          </section>


          <footer class="footer">


            <div class="footer-brand">

              Claudia R.

              <small>
                COMUNICACIÓN · DESARROLLO WEB · ESTRATEGIA DIGITAL
              </small>

            </div>


            <div class="footer-contact">

              Resumen comercial de servicios ·
              Documento no tributario

            </div>


          </footer>


        </main>


        <script>

          window.onload = () => {

            setTimeout(
              () => window.print(),
              450
            );

          };

        <\/script>


      </body>

      </html>

    `,

    `Resumen de cobro ${billingNumber} — ${client.name}`

  );
}


/* =========================================================
   BÚSQUEDA GLOBAL
   ========================================================= */

$("#globalSearch")?.addEventListener(
  "input",
  event => {

    const query =
      event.target.value
        .trim()
        .toLowerCase();


    if (!query) {
      return;
    }


    const client =
      state.clients.find(
        item =>
          item.name
            .toLowerCase()
            .includes(query)
      );


    const service =
      state.services.find(service => {

        const client =
          getClient(
            service.clientId
          );


        return (

          service.service
            .toLowerCase()
            .includes(query)

          ||

          client?.name
            .toLowerCase()
            .includes(query)

        );

      });


    if (client) {

      showSection("clients");

      $("#clientSearch").value =
        client.name;

      renderClients();

      return;
    }


    if (service) {

      showSection("services");

      $("#serviceSearch").value =
        query;

      renderServices();

    }

  }
);


/* =========================================================
   FILTROS
   ========================================================= */

$("#clientSearch")?.addEventListener(
  "input",
  renderClients
);


$("#serviceSearch")?.addEventListener(
  "input",
  renderServices
);


$("#serviceStatus")?.addEventListener(
  "change",
  renderServices
);


/* =========================================================
   ACTUALIZAR TODO
   ========================================================= */

