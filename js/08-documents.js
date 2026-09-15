/* =========================================================
   DOCUMENTOS — CLAUDIA R.
   Sistema editorial A4
   Identidad: CRF / Claudia R.
   ========================================================= */


/* =========================================================
   UTILIDADES
   ========================================================= */

function updateProfitPreview() {
  const form = $("#serviceForm");
  if (!form) return;

  const price = Number(form.elements.price?.value || 0);
  const cost = Number(form.elements.cost?.value || 0);
  const quantity = Number(form.elements.quantity?.value || 1);
  const currency = form.elements.currency?.value || "USD";

  if ($("#profitPreview")) {
    $("#profitPreview").textContent =
      money((price - cost) * quantity, currency);
  }
}


["price", "cost", "quantity", "currency"].forEach(name => {
  $("#serviceForm")?.elements[name]?.addEventListener(
    "input",
    updateProfitPreview
  );

  $("#serviceForm")?.elements[name]?.addEventListener(
    "change",
    updateProfitPreview
  );
});


/* =========================================================
   DATOS PARA EL PAGO
   ========================================================= */

function paymentDetailsHtml(currency) {
  const cfg = currentSettings();

  const isUSD = currency === "USD";

  const bank = isUSD ? cfg.bankUSD : cfg.bankPEN;
  const account = isUSD ? cfg.accountUSD : cfg.accountPEN;
  const cci = isUSD ? cfg.cciUSD : cfg.cciPEN;

  const rows = [];

  if (cfg.paymentHolder) {
    rows.push(`
      <div class="payment-item">
        <span>Titular</span>
        <strong>${escapeHtml(cfg.paymentHolder)}</strong>
      </div>
    `);
  }

  if (bank) {
    rows.push(`
      <div class="payment-item">
        <span>Banco / plataforma</span>
        <strong>${escapeHtml(bank)}</strong>
      </div>
    `);
  }

  if (account) {
    rows.push(`
      <div class="payment-item">
        <span>Cuenta ${isUSD ? "USD" : "PEN"}</span>
        <strong>${escapeHtml(account)}</strong>
      </div>
    `);
  }

  if (cci) {
    rows.push(`
      <div class="payment-item">
        <span>CCI</span>
        <strong>${escapeHtml(cci)}</strong>
      </div>
    `);
  }

  if (cfg.mobilePayment) {
    rows.push(`
      <div class="payment-item">
        <span>Yape / Plin</span>
        <strong>${escapeHtml(cfg.mobilePayment)}</strong>
      </div>
    `);
  }

  if (!rows.length) return "";

  return `
    <section class="payment-details">
      <div class="section-kicker">Datos para el pago</div>
      <div class="payment-grid">
        ${rows.join("")}
      </div>
    </section>
  `;
}


/* =========================================================
   IMPRESIÓN
   ========================================================= */

function printDocument(html, title) {
  const win = window.open("", "_blank");

  if (!win) {
    toast(
      "El navegador bloqueó la ventana. Permite ventanas emergentes para generar el PDF."
    );
    return;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();

  win.document.title = title;

  setTimeout(() => {
    try {
      win.focus();
      win.print();
    } catch (_) {}
  }, 450);
}


/* =========================================================
   ESTILOS DEL DOCUMENTO
   ========================================================= */

function documentStyles() {
  return `
    <style>

      /* -----------------------------------------------------
         CONFIGURACIÓN GENERAL
         ----------------------------------------------------- */

      @page {
        size: A4;
        margin: 0;
      }

      :root {
        --ink: #171717;
        --text: #343330;
        --muted: #77736c;
        --line: #d8d4cc;
        --line-dark: #252525;
        --paper: #fffefa;
        --soft: #f5f3ee;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: #e8e6e1;
        color: var(--ink);
        font-family:
          Arial,
          Helvetica,
          sans-serif;

        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      body {
        min-width: 210mm;
      }


      /* -----------------------------------------------------
         HOJA A4
         ----------------------------------------------------- */

      .page {
        position: relative;

        width: 210mm;
        min-height: 297mm;

        margin: 16px auto;
        padding: 18mm 18mm 22mm;

        background: var(--paper);

        box-shadow:
          0 18px 55px rgba(0, 0, 0, .10);

        overflow: hidden;
      }


      /* -----------------------------------------------------
         MARCA
         ----------------------------------------------------- */

      .brand-header {
        display: grid;

        grid-template-columns:
          48px
          minmax(0, 1fr)
          auto;

        align-items: center;

        gap: 15px;

        padding-bottom: 12px;

        border-bottom:
          1px solid var(--line);
      }

      .monogram {
        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 24px;

        line-height: 1;

        font-weight: 700;

        letter-spacing: -2px;

        color: var(--ink);
      }

      .brand-name {
        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 18px;

        line-height: 1;

        font-weight: 500;

        letter-spacing: -.35px;
      }

      .brand-role {
        margin-top: 5px;

        color: var(--muted);

        font-size: 6.8px;

        line-height: 1.5;

        letter-spacing: 1.25px;

        text-transform: uppercase;
      }

      .brand-label {
        color: var(--muted);

        font-size: 6.5px;

        line-height: 1.4;

        letter-spacing: 1.7px;

        text-transform: uppercase;

        text-align: right;

        white-space: nowrap;
      }


      /* -----------------------------------------------------
         CABECERA DEL DOCUMENTO
         ----------------------------------------------------- */

      .document-head {
        display: flex;

        justify-content: space-between;

        align-items: flex-end;

        gap: 25px;

        padding:
          15mm
          0
          10mm;
      }

      .document-type {
        margin-bottom: 7px;

        color: var(--muted);

        font-size: 6.8px;

        line-height: 1.4;

        letter-spacing: 2px;

        text-transform: uppercase;
      }

      .document-title {
        margin: 0;

        max-width: 140mm;

        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 30px;

        line-height: 1.05;

        font-weight: 400;

        letter-spacing: -.8px;
      }

      .document-code {
        min-width: 42mm;

        color: var(--muted);

        font-size: 6.8px;

        line-height: 1.5;

        text-align: right;
      }

      .document-code strong {
        display: block;

        margin-bottom: 2px;

        color: var(--ink);

        font-size: 7.5px;

        letter-spacing: 1px;
      }


      /* -----------------------------------------------------
         DATOS CLIENTE
         ----------------------------------------------------- */

      .client-grid {
        display: grid;

        grid-template-columns:
          1.2fr
          .8fr;

        border-top:
          1px solid var(--line);

        border-bottom:
          1px solid var(--line);
      }

      .client-cell {
        min-height: 20mm;

        padding:
          9px
          0;
      }

      .client-cell + .client-cell {
        padding-left: 22px;

        border-left:
          1px solid var(--line);
      }

      .section-kicker {
        margin-bottom: 5px;

        color: var(--muted);

        font-size: 6.3px;

        line-height: 1.4;

        letter-spacing: 1.7px;

        text-transform: uppercase;
      }

      .client-name {
        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 14px;

        line-height: 1.25;
      }

      .client-detail {
        margin-top: 3px;

        color: var(--text);

        font-size: 7.5px;

        line-height: 1.5;
      }


      /* -----------------------------------------------------
         INTRODUCCIÓN
         ----------------------------------------------------- */

      .intro {
        max-width: 150mm;

        margin:
          10mm
          0
          0;

        color: var(--text);

        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 10px;

        line-height: 1.65;
      }


      /* -----------------------------------------------------
         PERIODO
         ----------------------------------------------------- */

      .billing-period {
        margin-top: 9mm;

        padding:
          9px
          12px;

        border-left:
          2px solid var(--ink);

        background:
          var(--soft);
      }

      .billing-period strong {
        display: block;

        margin-top: 3px;

        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 12px;

        line-height: 1.3;

        font-weight: 400;
      }

      .billing-period .small-note {
        margin-top: 3px;

        color: var(--muted);

        font-size: 6.5px;

        line-height: 1.4;
      }


      /* -----------------------------------------------------
         TABLA
         ----------------------------------------------------- */

      .items {
        width: 100%;

        margin-top: 9mm;

        border-collapse:
          collapse;
      }

      .items thead th {
        padding:
          7px
          6px;

        border-top:
          1px solid var(--line-dark);

        border-bottom:
          1px solid var(--line);

        color: var(--muted);

        font-size: 6.3px;

        line-height: 1.3;

        letter-spacing: 1.2px;

        text-transform: uppercase;

        text-align: left;
      }

      .items tbody td {
        padding:
          9px
          6px;

        border-bottom:
          1px solid var(--line);

        color: var(--text);

        font-size: 7.5px;

        line-height: 1.45;

        vertical-align: top;
      }

      .items th:not(:first-child),
      .items td:not(:first-child) {
        text-align: right;
      }

      .item-title {
        color: var(--ink);

        font-size: 8px;

        font-weight: 600;
      }

      .item-sub {
        margin-top: 2px;

        color: var(--muted);

        font-size: 6.5px;
      }


      /* -----------------------------------------------------
         TOTALES
         ----------------------------------------------------- */

      .total-area {
        display: flex;

        justify-content: flex-end;

        margin-top: 9mm;
      }

      .total-box {
        width: 73mm;

        border-top:
          1.5px solid var(--ink);

        padding-top: 5px;
      }

      .total-row {
        display: flex;

        justify-content: space-between;

        align-items: baseline;

        gap: 20px;

        padding:
          3.5px
          0;

        color: var(--text);

        font-size: 7.5px;
      }

      .total-row strong {
        color: var(--ink);

        font-weight: 600;
      }

      .total-row.grand {
        margin-top: 3px;

        padding-top: 7px;

        border-top:
          1px solid var(--line);

        color: var(--ink);

        font-size: 11px;
      }

      .total-row.grand strong {
        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 15px;

        font-weight: 500;
      }

      .tax-note {
        margin-top: 6px;

        color: var(--muted);

        font-size: 6.3px;

        line-height: 1.5;
      }


      /* -----------------------------------------------------
         NOTA
         ----------------------------------------------------- */

      .note {
        margin-top: 7mm;

        padding-top: 7px;

        border-top:
          1px solid var(--line);

        color: var(--text);

        font-size: 6.8px;

        line-height: 1.6;
      }

      .note strong {
        color: var(--ink);

        font-weight: 700;
      }


      /* -----------------------------------------------------
         DATOS DE PAGO
         ----------------------------------------------------- */

      .payment-details {
        margin-top: 8mm;

        padding:
          9px
          11px;

        border:
          1px solid var(--line);

        background:
          var(--soft);
      }

      .payment-grid {
        display: grid;

        grid-template-columns:
          repeat(2, minmax(0, 1fr));

        gap:
          8px
          20px;
      }

      .payment-item span {
        display: block;

        margin-bottom: 2px;

        color: var(--muted);

        font-size: 6px;

        line-height: 1.3;

        letter-spacing: 1px;

        text-transform: uppercase;
      }

      .payment-item strong {
        color: var(--ink);

        font-size: 7.2px;

        line-height: 1.4;

        font-weight: 600;
      }


      /* -----------------------------------------------------
         FIRMA
         ----------------------------------------------------- */

      .signature {
        margin-top: 14mm;

        width: 62mm;
      }

      .signature-line {
        width: 48mm;

        margin-bottom: 6px;

        border-top:
          1px solid var(--ink);
      }

      .signature-name {
        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 9px;

        line-height: 1.3;
      }

      .signature-role {
        margin-top: 2px;

        color: var(--muted);

        font-size: 6.2px;

        line-height: 1.5;
      }


      /* -----------------------------------------------------
         PIE DE DOCUMENTO
         ----------------------------------------------------- */

      .footer {
        position: absolute;

        left: 18mm;
        right: 18mm;
        bottom: 9mm;

        padding-top: 6px;

        border-top:
          1px solid var(--line);

        display: flex;

        justify-content: space-between;

        align-items: center;
      }

      .footer-left {
        color: var(--muted);

        font-size: 6px;

        line-height: 1.4;

        letter-spacing: 1px;

        text-transform: uppercase;
      }

      .footer-right {
        color: var(--muted);

        font-size: 6px;

        line-height: 1.4;

        text-align: right;
      }

      .footer-monogram {
        color: var(--ink);

        font-family:
          Georgia,
          "Times New Roman",
          serif;

        font-size: 8px;

        font-weight: 700;

        letter-spacing: -.5px;
      }


      /* -----------------------------------------------------
         IMPRESIÓN
         ----------------------------------------------------- */

      @media print {

        html,
        body {
          background: #fff;
        }

        body {
          min-width: 0;
        }

        .page {
          width: 210mm;
          min-height: 297mm;

          margin: 0;

          box-shadow: none;
        }
      }


      /* -----------------------------------------------------
         PANTALLA
         ----------------------------------------------------- */

      @media screen and (max-width: 800px) {

        body {
          min-width: 0;
        }

        .page {
          width: 100%;

          min-height: auto;

          margin: 0;

          padding: 28px;
        }

        .brand-header {
          grid-template-columns:
            42px
            1fr;
        }

        .brand-label {
          grid-column: 2;

          text-align: left;
        }

        .document-head {
          display: block;
        }

        .document-code {
          margin-top: 15px;

          text-align: left;
        }

        .client-grid {
          grid-template-columns: 1fr;
        }

        .client-cell + .client-cell {
          padding-left: 0;

          border-left: 0;

          border-top:
            1px solid var(--line);
        }

        .payment-grid {
          grid-template-columns: 1fr;
        }

        .total-area {
          justify-content: stretch;
        }

        .total-box {
          width: 100%;
        }

        .footer {
          position: static;

          margin-top: 45px;
        }
      }

    </style>
  `;
}


/* =========================================================
   COTIZACIÓN
   ========================================================= */

function downloadQuote(id) {

  const quote = state.quotes.find(q => q.id === id);

  if (!quote) {
    return toast("No se encontró la cotización.");
  }

  const client =
    getClient(quote.clientId) || {};

  const total =
    Number(quote.price ?? quote.total ?? 0);

  const number =
    escapeHtml(quote.id || "");

  const title =
    escapeHtml(
      quote.title ||
      "Propuesta comercial"
    );

  const description =
    escapeHtml(
      quote.description ||
      "Servicio profesional."
    );

  const date =
    formatDate(quote.date);

  const validity =
    escapeHtml(
      quote.validity ||
      "15 días"
    );

  const clientName =
    escapeHtml(
      client.name ||
      "Cliente"
    );

  const currency =
    quote.currency ||
    "USD";


  const html = `
    <!doctype html>

    <html lang="es">

      <head>

        <meta charset="utf-8">

        <title>
          ${title} — Claudia R.
        </title>

        ${documentStyles()}

      </head>


      <body>

        <main class="page">


          <!-- MARCA -->

          <header class="brand-header">

            <div class="monogram">
              CRF
            </div>

            <div>

              <div class="brand-name">
                Claudia R.
              </div>

              <div class="brand-role">
                Comunicación · Desarrollo Web · Estrategia Digital
              </div>

            </div>

            <div class="brand-label">
              Marca personal
            </div>

          </header>


          <!-- CABECERA -->

          <section class="document-head">

            <div>

              <div class="document-type">
                Propuesta comercial
              </div>

              <h1 class="document-title">
                ${title}
              </h1>

            </div>


            <div class="document-code">

              <strong>
                ${number}
              </strong>

              ${date}

            </div>

          </section>


          <!-- CLIENTE -->

          <section class="client-grid">

            <div class="client-cell">

              <div class="section-kicker">
                Cliente
              </div>

              <div class="client-name">
                ${clientName}
              </div>

              ${
                client.document
                  ? `
                    <div class="client-detail">
                      ${escapeHtml(client.document)}
                    </div>
                  `
                  : ""
              }

            </div>


            <div class="client-cell">

              <div class="section-kicker">
                Condición
              </div>

              <div
                class="client-name"
                style="
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:9px;
                "
              >
                Recibo por Honorarios
              </div>

              <div class="client-detail">
                Validez de la propuesta:
                ${validity}
              </div>

            </div>

          </section>


          <!-- DESCRIPCIÓN -->

          <p class="intro">
            ${description}
          </p>


          <!-- TOTAL -->

          <div class="total-area">

            <div class="total-box">

              <div class="total-row">

                <span>
                  Honorarios profesionales
                </span>

                <strong>
                  ${money(total, currency)}
                </strong>

              </div>


              <div class="total-row grand">

                <span>
                  Total
                </span>

                <strong>
                  ${money(total, currency)}
                </strong>

              </div>


              <div class="tax-note">

                La retención, cuando corresponda,
                se gestiona al momento de emitir
                y pagar el Recibo por Honorarios.
                No modifica el monto comercial
                de esta propuesta.

              </div>

            </div>

          </div>


          <!-- INFORMACIÓN -->

          <section class="information-grid">

            <div class="information-block">

              <div class="section-kicker">
                Consideraciones
              </div>

              <ul>

                <li>
                  Esta cotización tiene una
                  validez de ${validity}.
                </li>

                <li>
                  El inicio del servicio se
                  coordina con la confirmación.
                </li>

                <li>
                  Cualquier alcance adicional
                  se cotizará por separado.
                </li>

              </ul>

            </div>

          </section>


          <!-- FIRMA -->

          <div class="signature">

            <div class="signature-line"></div>

            <div class="signature-name">
              Claudia Romero Fonseca
            </div>

            <div class="signature-role">
              Comunicadora · Desarrolladora Web<br>
              Estratega en Transformación Digital
            </div>

          </div>


          <!-- PIE -->

          <footer class="footer">

            <div class="footer-left">

              <span class="footer-monogram">
                CRF
              </span>

              &nbsp; · &nbsp;

              Claudia R.

            </div>


            <div class="footer-right">

              Comunicación · Desarrollo Web ·
              Estrategia Digital

            </div>

          </footer>


        </main>

      </body>

    </html>
  `;


  printDocument(
    html,
    `Cotización ${number} — Claudia R.`
  );
}


/* =========================================================
   RESUMEN DE COBRO
   ========================================================= */

function downloadClientBilling(
  clientId,
  billingOptions = {}
) {

  const client =
    getClient(clientId);

  if (!client) {
    return toast(
      "No se encontró el cliente."
    );
  }


  const services =
    state.services

      .filter(s =>
        s.clientId === clientId &&
        s.status !== "Finalizado" &&
        s.payment !== "Pagado"
      )

      .sort(
        (a, b) =>
          new Date(a.start) -
          new Date(b.start)
      );


  if (!services.length) {

    return toast(
      "Este cliente no tiene servicios activos o pendientes para cobrar."
    );

  }


  const currency =
    services[0].currency ||
    "USD";


  if (
    services.some(
      s =>
        (s.currency || "USD") !==
        currency
    )
  ) {

    return toast(
      "El cliente tiene servicios en monedas distintas. Revísalos antes de cobrar."
    );

  }


  const baseTotal =
    services.reduce(
      (sum, s) =>
        sum + serviceTotal(s),
      0
    );


  const applyRetention =
    billingOptions.applyRetention === true;


  const rate =
    Number(
      billingOptions.rate ??
      currentSettings().retentionRate ??
      8
    );


  const gross =
    Number.isFinite(
      Number(billingOptions.gross)
    ) &&
    Number(billingOptions.gross) > 0

      ? Number(billingOptions.gross)

      : baseTotal;


  const retained =
    applyRetention

      ? (
          Number.isFinite(
            Number(billingOptions.retained)
          )

            ? Number(
                billingOptions.retained
              )

            : gross * rate / 100
        )

      : 0;


  const net =
    applyRetention

      ? (
          Number.isFinite(
            Number(billingOptions.net)
          )

            ? Number(
                billingOptions.net
              )

            : gross - retained
        )

      : gross;


  const periods =
    services.map(
      s => `${s.start}|${s.end}`
    );


  const samePeriod =
    periods.every(
      p => p === periods[0]
    );


  const periodText =
    samePeriod

      ? `
        ${formatDate(services[0].start)}
        – 
        ${formatDate(services[0].end)}
      `

      : "Periodos según cada servicio";


  const billingId =
    `COB-${todayISO().replaceAll("-", "")}-${String(Date.now()).slice(-4)}`;


  const rows =
    services.map(s => `

      <tr>

        <td>

          <div class="item-title">
            ${escapeHtml(
              s.service ||
              "Servicio"
            )}
          </div>

          ${
            s.description
              ? `
                <div class="item-sub">
                  ${escapeHtml(
                    s.description
                  )}
                </div>
              `
              : ""
          }

        </td>


        <td>
          ${formatDate(s.start)}
          –
          ${formatDate(s.end)}
        </td>


        <td>
          ${s.quantity || 1}
        </td>


        <td>
          ${money(
            s.price,
            s.currency
          )}
        </td>


        <td>
          ${money(
            serviceTotal(s),
            s.currency
          )}
        </td>

      </tr>

    `).join("");


  const html = `

    <!doctype html>

    <html lang="es">

      <head>

        <meta charset="utf-8">

        <title>
          ${billingId} — Claudia R.
        </title>

        ${documentStyles()}

      </head>


      <body>

        <main class="page">


          <!-- MARCA -->

          <header class="brand-header">

            <div class="monogram">
              CRF
            </div>


            <div>

              <div class="brand-name">
                Claudia R.
              </div>

              <div class="brand-role">
                Comunicación · Desarrollo Web · Estrategia Digital
              </div>

            </div>


            <div class="brand-label">
              Marca personal
            </div>

          </header>


          <!-- CABECERA -->

          <section class="document-head">

            <div>

              <div class="document-type">
                Servicios contratados
              </div>

              <h1 class="document-title">
                Resumen de cobro
              </h1>

            </div>


            <div class="document-code">

              <strong>
                ${billingId}
              </strong>

              ${formatDate(todayISO())}

            </div>

          </section>


          <!-- CLIENTE -->

          <section class="client-grid">

            <div class="client-cell">

              <div class="section-kicker">
                Cliente
              </div>

              <div class="client-name">
                ${escapeHtml(
                  client.name ||
                  "Cliente"
                )}
              </div>


              ${
                client.document
                  ? `
                    <div class="client-detail">
                      ${escapeHtml(
                        client.document
                      )}
                    </div>
                  `
                  : ""
              }

            </div>


            <div class="client-cell">

              <div class="section-kicker">
                Comprobante
              </div>

              <div
                class="client-name"
                style="
                  font-family:Arial,Helvetica,sans-serif;
                  font-size:9px;
                "
              >
                Recibo por Honorarios
              </div>

              <div class="client-detail">

                ${
                  applyRetention
                    ? `Retención aplicada: ${rate}%`
                    : "Sin retención aplicada"
                }

              </div>

            </div>

          </section>


          <!-- PERIODO -->

          <section class="billing-period">

            <div class="section-kicker">
              Periodo de servicio
            </div>

            <strong>
              ${periodText}
            </strong>

            <div class="small-note">

              Cada servicio conserva
              sus fechas individuales.

            </div>

          </section>


          <!-- SERVICIOS -->

          <table class="items">

            <thead>

              <tr>

                <th>
                  Servicio
                </th>

                <th>
                  Periodo
                </th>

                <th>
                  Cant.
                </th>

                <th>
                  Precio
                </th>

                <th>
                  Total
                </th>

              </tr>

            </thead>


            <tbody>

              ${rows}

            </tbody>

          </table>


          <!-- TOTALES -->

          <div class="total-area">

            <div class="total-box">


              <div class="total-row">

                <span>
                  Honorarios
                </span>

                <strong>
                  ${money(
                    gross,
                    currency
                  )}
                </strong>

              </div>


              ${
                applyRetention

                  ? `

                    <div class="total-row">

                      <span>
                        Retención RHE (${rate}%)
                      </span>

                      <strong>
                        − ${money(
                          retained,
                          currency
                        )}
                      </strong>

                    </div>

                  `

                  : ""
              }


              <div class="total-row grand">

                <span>

                  ${
                    applyRetention
                      ? "Neto a pagar"
                      : "Total a pagar"
                  }

                </span>

                <strong>

                  ${money(
                    net,
                    currency
                  )}

                </strong>

              </div>

            </div>

          </div>


          <!-- CONDICIÓN -->

          <div class="note">

            <strong>
              Condición de pago.
            </strong>

            El pago corresponde a los
            servicios detallados y a los
            periodos indicados.

            ${
              applyRetention

                ? `
                  Se considera una retención
                  de Recibo por Honorarios
                  del ${rate}%, por lo que el
                  neto a pagar indicado es
                  ${money(
                    net,
                    currency
                  )}.
                `

                : ""
            }

          </div>


          <!-- DATOS DE PAGO -->

          ${paymentDetailsHtml(currency)}


          <!-- FIRMA -->

          <div class="signature">

            <div class="signature-line"></div>

            <div class="signature-name">
              Claudia Romero Fonseca
            </div>

            <div class="signature-role">
              Comunicadora · Desarrolladora Web<br>
              Estratega en Transformación Digital
            </div>

          </div>


          <!-- PIE -->

          <footer class="footer">

            <div class="footer-left">

              <span class="footer-monogram">
                CRF
              </span>

              &nbsp; · &nbsp;

              Claudia R.

            </div>


            <div class="footer-right">

              Comunicación · Desarrollo Web ·
              Estrategia Digital

            </div>

          </footer>


        </main>

      </body>

    </html>

  `;


  printDocument(
    html,
    `${billingId} — Claudia R.`
  );
}