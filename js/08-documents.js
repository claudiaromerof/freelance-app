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
  return `<div class="payment-details"><div class="payment-title">Datos para el pago</div><div class="payment-grid">${rows.join("")}</div></div>`;
}

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
  const quote = state.quotes.find(q => q.id === id);
  if (!quote) return toast("No se encontró la cotización.");
  const client = getClient(quote.clientId) || {};
  const total = Number(quote.price || 0);
  const number = escapeHtml(quote.id);
  const title = escapeHtml(quote.title);
  const description = escapeHtml(quote.description || "Servicio profesional.");
  const date = formatDate(quote.date);
  const validity = escapeHtml(quote.validity || "15 días");
  const clientName = escapeHtml(client.name || "Cliente");
  const currency = quote.currency || "USD";

  printDocument(`
    <!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cotización ${number} — Claudia Romero Fonseca</title>
    <style>${documentStyles()}
      .quote-hero{padding:30px 0 20px;border-bottom:1px solid #ddd}.quote-hero h1{font-size:34px;margin:0 0 8px}.meta{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:26px 0}.meta-card{padding:16px;border:1px solid #e4e1db;border-radius:10px}.meta-card span{display:block;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#777;margin-bottom:7px}.description{line-height:1.7;margin:28px 0}.total-box{margin-top:30px;margin-left:auto;max-width:320px;border-top:2px solid #1d5f50;padding-top:14px}.total-row{display:flex;justify-content:space-between;padding:7px 0}.total-row.grand{font-size:20px;font-weight:700}.tax-note{font-size:11px;color:#777;margin-top:12px}.payment-details{margin-top:30px;padding:16px 18px;border:1px solid #dfe2dd;border-radius:10px;background:#f7f7f3}.payment-title{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#626a65;margin-bottom:10px;font-weight:700}.payment-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 20px}.payment-grid span{display:block;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#777;margin-bottom:3px}.payment-grid strong{font-size:12px}.signature{margin-top:60px}.signature-line{width:220px;border-top:1px solid #333;margin-bottom:10px}.signature-name{font-weight:600}.signature-role{font-size:11px;color:#555;line-height:1.6;margin-top:3px}
      @media print{body{background:#fff}.document{box-shadow:none}}
    </style></head><body><div class="document">
      <header class="doc-header"><div class="brand-mark">CRF</div><div><strong>Claudia Romero Fonseca</strong><div>Comunicación · Desarrollo Web · Estrategia Digital</div></div><div class="doc-label">COTIZACIÓN</div></header>
      <div class="quote-hero"><div class="eyebrow">PROPUESTA COMERCIAL</div><h1>${title}</h1><div>${number} · ${date}</div></div>
      <div class="meta"><div class="meta-card"><span>Cliente</span><strong>${clientName}</strong>${client.document ? `<div>${escapeHtml(client.document)}</div>` : ""}</div><div class="meta-card"><span>Comprobante</span><strong>Recibo por Honorarios</strong><div>Validez: ${validity}</div></div></div>
      <section class="description"><h3>Alcance</h3><p>${description}</p></section>
      <div class="total-box"><div class="total-row"><span>Honorarios profesionales</span><strong>${money(total,currency)}</strong></div><div class="total-row grand"><span>Total</span><strong>${money(total,currency)}</strong></div><div class="tax-note">El tratamiento de la retención, cuando corresponda, se realiza al momento de emitir y pagar el Recibo por Honorarios. No modifica el monto comercial de esta cotización.</div></div>
      <section class="notes"><h3>Notas</h3><ul><li>Esta cotización tiene una validez de ${validity}.</li><li>El inicio del servicio se coordina con la confirmación.</li><li>Cualquier alcance adicional se cotizará por separado.</li></ul></section>
      <div class="signature"><div class="signature-line"></div><div class="signature-name">Claudia Romero Fonseca</div><div class="signature-role">Comunicadora · Desarrolladora Web<br>Estratega en Transformación Digital</div></div>
      <footer class="doc-footer">Claudia Romero Fonseca · Comunicación · Desarrollo Web · Estrategia Digital</footer>
    </div></body></html>`, `Cotización ${number} — Claudia Romero Fonseca`);
}

function downloadClientBilling(clientId, billingOptions = {}) {
  const client = getClient(clientId);
  if (!client) return toast("No se encontró el cliente.");
  const services = state.services.filter(s => s.clientId === clientId && s.status !== "Finalizado" && s.payment !== "Pagado").sort((a,b)=>new Date(a.start)-new Date(b.start));
  if (!services.length) return toast("Este cliente no tiene servicios activos o pendientes para cobrar.");
  const currency = services[0].currency || "USD";
  if (services.some(s => (s.currency || "USD") !== currency)) return toast("El cliente tiene servicios en monedas distintas. Revísalos antes de cobrar.");
  const baseTotal = services.reduce((sum,s)=>sum+serviceTotal(s),0);
  const applyRetention = billingOptions.applyRetention === true;
  const rate = Number(billingOptions.rate ?? currentSettings().retentionRate ?? 8);
  const gross = Number.isFinite(Number(billingOptions.gross)) && Number(billingOptions.gross) > 0 ? Number(billingOptions.gross) : baseTotal;
  const retained = applyRetention ? (Number.isFinite(Number(billingOptions.retained)) ? Number(billingOptions.retained) : gross * rate / 100) : 0;
  const net = applyRetention ? (Number.isFinite(Number(billingOptions.net)) ? Number(billingOptions.net) : gross - retained) : gross;
  const periods = services.map(s=>`${s.start}|${s.end}`);
  const samePeriod = periods.every(p=>p===periods[0]);
  const periodText = samePeriod ? `${formatDate(services[0].start)} – ${formatDate(services[0].end)}` : "Periodos según cada servicio";
  const billingId = `COB-${todayISO().replaceAll("-","")}-${String(Date.now()).slice(-4)}`;
  const rows = services.map(s=>`<tr><td><strong>${escapeHtml(s.service)}</strong><div class="muted">${escapeHtml(s.description||"")}</div></td><td>${formatDate(s.start)} – ${formatDate(s.end)}</td><td>${s.quantity||1}</td><td>${money(s.price,s.currency)}</td><td>${money(serviceTotal(s),s.currency)}</td></tr>`).join("");
  printDocument(`
    <!doctype html><html lang="es"><head><meta charset="utf-8"><title>${billingId} — ${escapeHtml(client.name)}</title><style>${documentStyles()}
      .billing-hero{padding:28px 0;border-bottom:1px solid #ddd}.billing-hero h1{font-size:30px;margin:5px 0}.meta{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:24px 0}.meta-card{border:1px solid #e4e1db;border-radius:10px;padding:15px}.meta-card span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#777;margin-bottom:6px}table{width:100%;border-collapse:collapse;margin-top:25px}th,td{text-align:left;padding:12px 8px;border-bottom:1px solid #e5e2dc;font-size:12px}th{font-size:10px;letter-spacing:1.2px;color:#777}.muted{font-size:10px;color:#777;margin-top:3px}.total-box{margin:26px 0 0 auto;max-width:320px;border-top:2px solid #1d5f50;padding-top:12px}.total-row{display:flex;justify-content:space-between;padding:7px 0}.total-row.grand{font-size:20px;font-weight:700}.note{margin-top:25px;padding:15px;background:#f5f3ef;border-radius:8px;font-size:11px;line-height:1.6}.payment-details{margin-top:28px;padding:16px 18px;border:1px solid #dfe2dd;border-radius:10px;background:#f7f7f3}.payment-title{font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#626a65;margin-bottom:10px;font-weight:700}.payment-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 20px}.payment-grid span{display:block;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#777;margin-bottom:3px}.payment-grid strong{font-size:12px}.signature{margin-top:55px}.signature-line{width:220px;border-top:1px solid #333;margin-bottom:10px}.signature-name{font-weight:600}.signature-role{font-size:11px;color:#555;line-height:1.6}
    </style></head><body><div class="document">
      <header class="doc-header"><div class="brand-mark">CRF</div><div><strong>Claudia Romero Fonseca</strong><div>Comunicación · Desarrollo Web · Estrategia Digital</div></div><div class="doc-label">RESUMEN DE COBRO</div></header>
      <div class="billing-hero"><div class="eyebrow">SERVICIOS CONTRATADOS</div><h1>${escapeHtml(client.name||"Cliente")}</h1><div>${billingId}</div></div>
      <div class="meta"><div class="meta-card"><span>Periodo</span><strong>${periodText}</strong><div>Los servicios conservan sus fechas individuales.</div></div><div class="meta-card"><span>Comprobante</span><strong>Recibo por Honorarios</strong><div>La retención, cuando corresponda, se gestiona al emitir/pagar el RHE.</div></div></div>
      <table><thead><tr><th>SERVICIO</th><th>PERIODO</th><th>CANT.</th><th>PRECIO</th><th>TOTAL</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="total-box">
        <div class="total-row"><span>Honorarios</span><strong>${money(gross,currency)}</strong></div>
        ${applyRetention ? `<div class="total-row"><span>Retención RHE (${rate}%)</span><strong>− ${money(retained,currency)}</strong></div>` : ""}
        <div class="total-row grand"><span>${applyRetention ? "Neto a pagar" : "Total a pagar"}</span><strong>${money(net,currency)}</strong></div>
      </div>
      <div class="note"><strong>Condición de pago</strong><br>El pago corresponde a los servicios detallados y a los periodos indicados.${applyRetention ? ` Se considera una retención de Recibo por Honorarios del ${rate}%, por lo que el neto a pagar indicado es ${money(net,currency)}.` : ""}</div>
      ${paymentDetailsHtml(currency)}
      <div class="signature"><div class="signature-line"></div><div class="signature-name">Claudia Romero Fonseca</div><div class="signature-role">Comunicadora · Desarrolladora Web<br>Estratega en Transformación Digital</div></div>
      <footer class="doc-footer">Claudia Romero Fonseca · Comunicación · Desarrollo Web · Estrategia Digital</footer>
    </div></body></html>`, `${billingId} — ${client.name}`);
}
