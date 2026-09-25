/* =========================================================
   DOCUMENTOS — CRF
   Diseño editorial A4 / versión comercial minimalista
   ========================================================= */

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

  if (cfg.paymentHolder) rows.push(`<div><span>Titular</span><strong>${escapeHtml(cfg.paymentHolder)}</strong></div>`);
  if (bank) rows.push(`<div><span>Banco / plataforma</span><strong>${escapeHtml(bank)}</strong></div>`);
  if (account) rows.push(`<div><span>Cuenta ${isUSD ? "USD" : "PEN"}</span><strong>${escapeHtml(account)}</strong></div>`);
  if (cci) rows.push(`<div><span>CCI</span><strong>${escapeHtml(cci)}</strong></div>`);
  if (cfg.mobilePayment) rows.push(`<div><span>Yape / Plin</span><strong>${escapeHtml(cfg.mobilePayment)}</strong></div>`);

  if (!rows.length) return "";

  return `
    <section class="payment-details">
      <div class="section-kicker">DATOS PARA EL PAGO</div>
      <div class="payment-grid">${rows.join("")}</div>
    </section>
  `;
}

/* =========================================================
   IMPRESIÓN
   ========================================================= */

function printDocument(html, title) {
  const win = window.open("", "_blank");

  if (!win) {
    toast("El navegador bloqueó la ventana. Permite ventanas emergentes.");
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
  }, 500);
}

/*
 * Genera el PDF directamente como una sola hoja A4.
 * Se usa html2canvas para capturar todo el documento y jsPDF para
 * colocarlo dentro de una única página A4, evitando la paginación
 * automática del diálogo de impresión del navegador.
 */
function downloadPdfFromHtml(html, title, filename) {
  const win = window.open("", "_blank");

  if (!win) {
    toast("El navegador bloqueó la ventana. Permite ventanas emergentes.");
    return;
  }

  const libraries = `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  `;

  const pdfHtml = html.replace("</head>", `${libraries}</head>`);

  const generate = async () => {
    try {
      if (!win.html2canvas || !win.jspdf || !win.jspdf.jsPDF) {
        throw new Error("No se pudieron cargar las librerías para PDF.");
      }

      await new Promise(resolve => {
        if (win.document.fonts && win.document.fonts.ready) {
          win.document.fonts.ready.then(() => setTimeout(resolve, 150));
        } else {
          setTimeout(resolve, 300);
        }
      });

      const page = win.document.querySelector(".page");
      if (!page) throw new Error("No se encontró el documento A4.");

      /*
       * Para la descarga directa no forzamos height:297mm.
       * Capturamos el contenido completo y luego lo reducimos proporcionalmente
       * si fuese necesario para que todo quepa en una sola hoja A4.
       */
      page.style.height = "auto";
      page.style.minHeight = "0";
      page.style.overflow = "visible";
      page.style.margin = "0";
      page.style.boxShadow = "none";

      const canvas = await win.html2canvas(page, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#fffefa",
        logging: false,
        windowWidth: Math.max(win.document.documentElement.clientWidth, page.scrollWidth)
      });

      const pageWidthPx = page.getBoundingClientRect().width;
      const pxPerMm = pageWidthPx / 210;
      const imageWidthMm = canvas.width / pxPerMm / 2;
      const imageHeightMm = canvas.height / pxPerMm / 2;

      const fitScale = Math.min(1, 210 / imageWidthMm, 297 / imageHeightMm);
      const pdfWidth = imageWidthMm * fitScale;
      const pdfHeight = imageHeightMm * fitScale;
      const x = (210 - pdfWidth) / 2;
      const y = (297 - pdfHeight) / 2;

      const { jsPDF } = win.jspdf;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const image = canvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(image, "JPEG", x, y, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save(filename);

      setTimeout(() => win.close(), 300);
    } catch (error) {
      console.error("Error generando PDF:", error);
      try { win.close(); } catch (_) {}
      toast("No se pudo generar el PDF. Intenta nuevamente.");
    }
  };

  win.addEventListener("load", generate, { once: true });
  win.document.open();
  win.document.write(pdfHtml);
  win.document.close();
  win.document.title = title;
}

/* =========================================================
   ESTILO EDITORIAL A4
   ========================================================= */

function documentStyles() {
  return `
    <style>
      @page {
        size: A4;
        margin: 0;
      }

      :root {
        --ink: #171717;
        --soft-ink: #41413e;
        --muted: #777570;
        --hairline: #d9d6cf;
        --paper: #fffefa;
        --warm: #f7f5f0;
        --accent: #9b9488;
      }

      * { box-sizing: border-box; }

      html, body {
        margin: 0;
        padding: 0;
        background: #e9e7e2;
        color: var(--ink);
        font-family: Arial, Helvetica, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      body {
        min-width: 210mm;
      }

      .page {
        position: relative;
        width: 210mm;
        height: 297mm;
        min-height: 297mm;
        margin: 16px auto;
        padding: 17mm 18mm 19mm;
        background: var(--paper);
        box-shadow: 0 16px 50px rgba(0,0,0,.10);
        overflow: hidden;
      }

      .top-rule {
        width: 100%;
        height: 2px;
        background: var(--ink);
        margin-bottom: 18mm;
      }

      .brand-header {
        display: grid;
        grid-template-columns: 58px 1fr;
        gap: 16px;
        align-items: center;
        padding-bottom: 13px;
        border-bottom: 1px solid var(--hairline);
      }

      .monogram {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 28px;
        line-height: 1;
        font-weight: 700;
        letter-spacing: -2.2px;
        color: var(--ink);
        padding-top: 1px;
      }

      .brand-role-only {
        color: var(--soft-ink);
        font-size: 8px;
        line-height: 1.45;
        letter-spacing: 1.35px;
        text-transform: uppercase;
        padding-top: 2px;
      }


      .document-head {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        align-items: flex-end;
        padding: 17mm 0 11mm;
      }

      .document-type {
        font-size: 7.5px;
        line-height: 1.4;
        letter-spacing: 2.2px;
        text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 9px;
      }

      .document-title {
        margin: 0;
        max-width: 135mm;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 31px;
        line-height: 1.08;
        font-weight: 400;
        letter-spacing: -.65px;
      }

      .document-code {
        min-width: 40mm;
        text-align: right;
        color: var(--muted);
        font-size: 8px;
        line-height: 1.55;
      }

      .document-code strong {
        display: block;
        color: var(--ink);
        font-size: 9px;
        letter-spacing: .8px;
      }

      .client-grid {
        display: grid;
        grid-template-columns: 1.15fr .85fr;
        border-top: 1px solid var(--hairline);
        border-bottom: 1px solid var(--hairline);
      }

      .client-cell {
        padding: 11px 0;
      }

      .client-cell + .client-cell {
        padding-left: 22px;
        border-left: 1px solid var(--hairline);
      }

      .section-kicker {
        color: var(--muted);
        font-size: 7px;
        line-height: 1.4;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        margin-bottom: 6px;
      }

      .client-name {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 15px;
        line-height: 1.25;
      }

      .client-detail {
        margin-top: 3px;
        color: var(--soft-ink);
        font-size: 8.5px;
        line-height: 1.55;
      }

      .intro {
        margin: 12mm 0 0;
        max-width: 155mm;
        color: var(--soft-ink);
        font-family: Georgia, "Times New Roman", serif;
        font-size: 11px;
        line-height: 1.65;
      }

      .items {
        width: 100%;
        margin-top: 10mm;
        border-collapse: collapse;
      }

      .items thead th {
        padding: 8px 7px;
        border-top: 1px solid var(--ink);
        border-bottom: 1px solid var(--hairline);
        color: var(--muted);
        font-size: 7px;
        line-height: 1.3;
        letter-spacing: 1.3px;
        text-transform: uppercase;
        text-align: left;
      }

      .items tbody td {
        padding: 11px 7px;
        border-bottom: 1px solid var(--hairline);
        color: var(--soft-ink);
        font-size: 8.5px;
        line-height: 1.45;
        vertical-align: top;
      }

      .items th:not(:first-child),
      .items td:not(:first-child) {
        text-align: right;
      }

      .item-title {
        color: var(--ink);
        font-weight: 700;
        font-size: 9px;
      }

      .item-sub {
        margin-top: 3px;
        color: var(--muted);
        font-size: 7.5px;
      }

      .total-area {
        display: flex;
        justify-content: flex-end;
        margin-top: 10mm;
      }

      .total-box {
        width: 76mm;
        border-top: 1.5px solid var(--ink);
        padding-top: 6px;
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        padding: 4px 0;
        color: var(--soft-ink);
        font-size: 8.5px;
      }

      .total-row strong {
        color: var(--ink);
        font-weight: 600;
      }

      .total-row.gross {
        padding: 3px 0 9px;
        color: var(--ink);
        font-size: 10px;
      }

      .total-row.gross strong {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 19px;
        font-weight: 500;
      }

      .total-row.retention {
        padding: 8px 0;
        border-top: 1px solid var(--hairline);
        color: var(--muted);
      }

      .total-row.net {
        margin-top: 2px;
        padding-top: 9px;
        border-top: 1px solid var(--hairline);
        color: var(--ink);
        font-size: 9px;
        font-weight: 700;
      }

      .total-row.net strong {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 15px;
        font-weight: 600;
      }

      .tax-note {
        margin-top: 7px;
        color: var(--muted);
        font-size: 7px;
        line-height: 1.55;
      }

      .information-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 9mm;
        margin-top: 12mm;
      }

      .information-block {
        padding-top: 9px;
        border-top: 1px solid var(--hairline);
      }

      .information-block p,
      .information-block ul {
        margin: 0;
        color: var(--soft-ink);
        font-size: 8px;
        line-height: 1.65;
      }

      .information-block ul { padding-left: 14px; }

      .payment-details {
        margin-top: 9mm;
        padding: 10px 12px;
        background: var(--warm);
        border: 1px solid var(--hairline);
      }

      .payment-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0,1fr));
        gap: 8px 18px;
      }

      .payment-grid span {
        display: block;
        color: var(--muted);
        font-size: 6.5px;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 2px;
      }

      .payment-grid strong {
        color: var(--ink);
        font-size: 8px;
        font-weight: 600;
      }


      .footer {
        position: static;
        margin: 14mm 0 0;
        padding-top: 8px;
        border-top: 1px solid var(--hairline);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
      }

      .footer-crf {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: -0.4px;
      }

      .footer-descriptor {
        color: var(--muted);
        font-size: 6.8px;
        letter-spacing: 1px;
        text-transform: uppercase;
        text-align: right;
      }


      .billing-period {
        margin-top: 10mm;
        padding: 10px 12px;
        border-left: 2px solid var(--ink);
        background: var(--warm);
      }

      .billing-period strong {
        display: block;
        margin-top: 3px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 13px;
        font-weight: 400;
      }

      .billing-period .small-note {
        margin-top: 4px;
        color: var(--muted);
        font-size: 7px;
      }

      .note {
        margin-top: 8mm;
        padding-top: 8px;
        border-top: 1px solid var(--hairline);
        color: var(--soft-ink);
        font-size: 7.5px;
        line-height: 1.6;
      }

      /* Documento A4: el PDF directo ajusta el contenido completo a una sola hoja. */
      .quote-page {
        min-height: 297mm;
      }

      .quote-content {
        transform-origin: top left;
        width: 100%;
      }

      .quote-page .document-head,
      .quote-page .client-grid,
      .quote-page .intro,
      .quote-page .total-area,
      .quote-page .information-grid,
      .quote-page .information-block {
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .quote-page .document-title {
        max-width: 125mm;
        line-height: 1.04;
      }

      .quote-page .intro {
        max-height: 34mm;
        overflow: hidden;
      }

      .quote-page .information-grid {
        margin-top: 9mm;
      }

      .quote-page .information-block {
        max-height: 42mm;
        overflow: hidden;
      }

      @media print {
        html, body { background: #fff; }
        body { min-width: 0; }
        .page {
          margin: 0;
          width: 210mm;
          height: 297mm;
          min-height: 297mm;
          box-shadow: none;
        }
      }

      @media screen and (max-width: 800px) {
        body { min-width: 0; }
        .page {
          width: 100%;
          min-height: auto;
          margin: 0;
          padding: 28px;
        }
        .brand-header { grid-template-columns: 48px 1fr; }
        .document-head { display: block; }
        .document-code { margin-top: 15px; text-align: left; }
        .client-grid, .information-grid { grid-template-columns: 1fr; }
        .client-cell + .client-cell { padding-left: 0; border-left: 0; border-top: 1px solid var(--hairline); }
        .total-box { width: 100%; }
        .footer { position: static; margin-top: 50px; }
      }
    </style>
  `;
}

/* =========================================================
   COTIZACIÓN
   ========================================================= */

function downloadQuote(id) {
  const quote = state.quotes.find(q => q.id === id);
  if (!quote) return toast("No se encontró la cotización.");

  const client = getClient(quote.clientId) || {};
  const total = Number(quote.price ?? quote.total ?? 0);
  const number = escapeHtml(quote.id || "");
  const title = escapeHtml(quote.title || "Propuesta comercial");
  const description = escapeHtml(quote.description || "Servicio profesional.");
  const date = formatDate(quote.date);
  const validity = escapeHtml(quote.validity || "15 días");
  const clientName = escapeHtml(client.name || "Cliente");
  const currency = quote.currency || "USD";

  const html = `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Cotización ${number} — Claudia R.</title>
        ${documentStyles()}
      </head>
      <body>
        <main class="page quote-page">
          <div class="quote-content">
          <div class="top-rule"></div>

          <header class="brand-header">
            <div class="monogram">CRF</div>
            <div class="brand-role-only">Comunicación · Desarrollo Web · Estrategia Digital</div>
          </header>

          <section class="document-head">
            <div>
              <div class="document-type">Propuesta comercial</div>
              <h1 class="document-title">${title}</h1>
            </div>
            <div class="document-code">
              <strong>${number}</strong>
              ${date}
            </div>
          </section>

          <section class="client-grid">
            <div class="client-cell">
              <div class="section-kicker">Cliente</div>
              <div class="client-name">${clientName}</div>
              ${client.document ? `<div class="client-detail">${escapeHtml(client.document)}</div>` : ""}
            </div>
            <div class="client-cell">
              <div class="section-kicker">Validez</div>
              <div class="client-name" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;">${validity}</div>
            </div>
          </section>

          <p class="intro">${description}</p>

          <div class="total-area">
            <div class="total-box">
              <div class="total-row gross">
                <span>TOTAL DE LA PROPUESTA</span>
                <strong>${money(total, currency)}</strong>
              </div>
              <div class="tax-note">El importe corresponde al valor comercial de la propuesta. Los aspectos tributarios se determinan, cuando corresponda, al momento de emitir el comprobante respectivo.</div>
            </div>
          </div>

          <section class="information-grid">
            <div class="information-block">
              <div class="section-kicker">Notas</div>
              <ul>
                <li>Esta cotización tiene una validez de ${validity}.</li>
                <li>El inicio del servicio se coordina con la confirmación.</li>
                <li>Cualquier alcance adicional se cotizará por separado.</li>
              </ul>
            </div>
            <div class="information-block">
              <div class="section-kicker">Concepto</div>
              <p>Servicios profesionales de comunicación, desarrollo web y estrategia digital, según el alcance indicado en esta propuesta.</p>
            </div>
          </section>

          </div>

          <footer class="footer">
            <div class="footer-crf">CRF</div>
            <div class="footer-descriptor">Comunicación · Desarrollo Web · Estrategia Digital</div>
          </footer>
        </main>
          <script>
            (function fitQuoteToA4() {
              const page = document.querySelector('.quote-page');
              const content = document.querySelector('.quote-content');
              if (!page || !content) return;

              const fit = () => {
                content.style.zoom = '1';
                const pageHeight = page.clientHeight;
                const footer = page.querySelector('.footer');
                const footerHeight = footer ? footer.getBoundingClientRect().height + 28 : 60;
                const available = Math.max(300, pageHeight - footerHeight);
                const needed = content.scrollHeight;

                if (needed > available) {
                  const ratio = Math.max(0.68, Math.min(1, available / needed));
                  content.style.zoom = ratio.toFixed(4);
                }
              };

              if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => requestAnimationFrame(fit));
              } else {
                requestAnimationFrame(fit);
              }
              window.addEventListener('beforeprint', fit);
            })();
          </script>
      </body>
    </html>
  `;

  downloadPdfFromHtml(
    html,
    `Cotización ${number} — Claudia R.`,
    `Cotizacion-${String(quote.id || "CRF").replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`
  );
}

/* =========================================================
   RESUMEN DE COBRO
   ========================================================= */

function downloadClientBilling(clientId, billingOptions = {}) {
  const client = getClient(clientId);
  if (!client) return toast("No se encontró el cliente.");

  const services = state.services
    .filter(s => s.clientId === clientId && s.status !== "Finalizado" && s.payment !== "Pagado")
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  if (!services.length) {
    return toast("Este cliente no tiene servicios activos o pendientes para cobrar.");
  }

  const currency = services[0].currency || "USD";

  if (services.some(s => (s.currency || "USD") !== currency)) {
    return toast("El cliente tiene servicios en monedas distintas. Revísalos antes de cobrar.");
  }

  const baseTotal = services.reduce((sum, s) => sum + serviceTotal(s), 0);
  const applyRetention = billingOptions.applyRetention === true;
  const rate = Number(billingOptions.rate ?? currentSettings().retentionRate ?? 8);
  const gross = Number.isFinite(Number(billingOptions.gross)) && Number(billingOptions.gross) > 0
    ? Number(billingOptions.gross)
    : baseTotal;
  const retained = applyRetention
    ? (Number.isFinite(Number(billingOptions.retained)) ? Number(billingOptions.retained) : gross * rate / 100)
    : 0;
  const net = applyRetention
    ? (Number.isFinite(Number(billingOptions.net)) ? Number(billingOptions.net) : gross - retained)
    : gross;

  const periods = services.map(s => `${s.start}|${s.end}`);
  const samePeriod = periods.every(p => p === periods[0]);
  const periodText = samePeriod
    ? `${formatDate(services[0].start)} – ${formatDate(services[0].end)}`
    : "Periodos según cada servicio";

  const billingId = `COB-${todayISO().replaceAll("-", "")}-${String(Date.now()).slice(-4)}`;

  const rows = services.map(s => `
    <tr>
      <td>
        <div class="item-title">${escapeHtml(s.service || "Servicio")}</div>
        ${s.description ? `<div class="item-sub">${escapeHtml(s.description)}</div>` : ""}
      </td>
      <td>${formatDate(s.start)} – ${formatDate(s.end)}</td>
      <td>${s.quantity || 1}</td>
      <td>${money(s.price, s.currency)}</td>
      <td>${money(serviceTotal(s), s.currency)}</td>
    </tr>
  `).join("");

  const html = `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>${billingId} — ${escapeHtml(client.name)}</title>
        ${documentStyles()}
      </head>
      <body>
        <main class="page">
          <div class="top-rule"></div>

          <header class="brand-header">
            <div class="monogram">CRF</div>
            <div class="brand-role-only">Comunicación · Desarrollo Web · Estrategia Digital</div>
          </header>

          <section class="document-head">
            <div>
              <div class="document-type">Servicios contratados</div>
              <h1 class="document-title">Resumen de cobro</h1>
            </div>
            <div class="document-code">
              <strong>${billingId}</strong>
              ${formatDate(todayISO())}
            </div>
          </section>

          <section class="client-grid" style="grid-template-columns:1fr;">
            <div class="client-cell">
              <div class="section-kicker">Cliente</div>
              <div class="client-name">${escapeHtml(client.name || "Cliente")}</div>
              ${client.document ? `<div class="client-detail">${escapeHtml(client.document)}</div>` : ""}
            </div>
          </section>

          <section class="billing-period">
            <div class="section-kicker">Periodo de servicio</div>
            <strong>${periodText}</strong>
            <div class="small-note">Cada servicio conserva sus fechas individuales.</div>
          </section>

          <table class="items">
            <thead>
              <tr>
                <th>SERVICIO</th>
                <th>PERIODO</th>
                <th>CANT.</th>
                <th>PRECIO</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="total-area">
            <div class="total-box">
              <div class="total-row gross">
                <span>${applyRetention ? "TOTAL POR HONORARIOS" : "TOTAL A PAGAR"}</span>
                <strong>${money(gross, currency)}</strong>
              </div>
              ${applyRetention ? `
                <div class="total-row retention">
                  <span>Retención (${rate} %) IR</span>
                  <strong>${money(retained, currency)}</strong>
                </div>
                <div class="total-row net">
                  <span>TOTAL NETO RECIBIDO</span>
                  <strong>${money(net, currency)}</strong>
                </div>
                <div class="tax-note">La retención corresponde al ${rate}% del importe total de los honorarios cuando corresponde. No constituye un descuento comercial.</div>
              ` : `
                <div class="tax-note">Importe total correspondiente a los servicios detallados.</div>
              `}
            </div>
          </div>

          <div class="note">
            <strong>Condición de pago.</strong>
            El pago corresponde a los servicios detallados y a los periodos indicados.
            ${applyRetention
              ? ` El Recibo por Honorarios considera una retención de ${rate}% del Impuesto a la Renta.`
              : ""}
          </div>

          ${paymentDetailsHtml(currency)}

          <footer class="footer">
            <div class="footer-crf">CRF</div>
            <div class="footer-descriptor">Comunicación · Desarrollo Web · Estrategia Digital</div>
          </footer>
        </main>
      </body>
    </html>
  `;

  downloadPdfFromHtml(
    html,
    `${billingId} — ${client.name}`,
    `Resumen-Cobro-${String(billingId).replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`
  );
}
