function getCobros() {
  return rows_('COBROS');
}

function getCobro(id) {
  return findById_('COBROS', 'ID_COBRO', id);
}

function getPendientesCobro(idCliente) {
  let items = getContrataciones().filter(x =>
    String(x.ESTADO_SERVICIO) === 'Activo' &&
    String(x.ESTADO_PAGO) === 'Pendiente'
  );

  if (idCliente) items = items.filter(x => String(x.ID_CLIENTE) === String(idCliente));
  return items;
}

function calcularRHE_(total, aplica, tasa, modo, montoDeseado) {
  const t = aplica ? Number(tasa || 0.08) : 0;
  if (!aplica) return {
    montoBase: total, bruto: total, retencion: 0, neto: total, tasa: 0
  };

  if (modo === 'NETO') {
    const neto = Number(montoDeseado || total);
    const bruto = neto / (1 - t);
    return {montoBase:total, bruto:bruto, retencion:bruto*t, neto:neto, tasa:t};
  }

  const bruto = Number(montoDeseado || total);
  return {montoBase:total, bruto:bruto, retencion:bruto*t, neto:bruto*(1-t), tasa:t};
}

function crearCobro(data) {
  const ids = Array.isArray(data.ID_CONTRATACIONES) ? data.ID_CONTRATACIONES.map(String) : [];
  if (!data.ID_CLIENTE || !ids.length) throw new Error('Selecciona al menos un servicio.');

  const contrataciones = getContrataciones().filter(x =>
    ids.includes(String(x.ID_CONTRATACION)) &&
    String(x.ID_CLIENTE) === String(data.ID_CLIENTE) &&
    String(x.ESTADO_SERVICIO) === 'Activo' &&
    String(x.ESTADO_PAGO) === 'Pendiente'
  );

  if (contrataciones.length !== ids.length) {
    throw new Error('Una o más contrataciones ya no están disponibles para cobrar.');
  }

  const currencies = [...new Set(contrataciones.map(x => String(x.MONEDA || 'PEN')))];
  if (currencies.length > 1) throw new Error('No se puede mezclar PEN y USD en un mismo cobro.');

  const moneda = currencies[0];
  const total = contrataciones.reduce((s,x) =>
    s + Number(x.PRECIO_CLIENTE || 0) * Number(x.CANTIDAD || 1), 0);

  const rhe = calcularRHE_(
    total,
    String(data.APLICA_RETENCION_RHE) === 'Sí',
    Number(data.TASA_RHE || 0.08),
    String(data.MODO_RHE || 'BRUTO'),
    Number(data.MONTO_DESEADO || total)
  );

  const idCobro = nextId_('COB', 'COBROS', 'ID_COBRO');
  const cobro = {
    ID_COBRO:idCobro,
    ID_CLIENTE:data.ID_CLIENTE,
    FECHA_COBRO:data.FECHA_COBRO || new Date(),
    MONEDA:moneda,
    TOTAL_SERVICIOS:total,
    APLICA_RETENCION_RHE:data.APLICA_RETENCION_RHE || 'No',
    TASA_RHE:rhe.tasa,
    MODO_RHE:data.MODO_RHE || 'BRUTO',
    MONTO_BASE:rhe.montoBase,
    HONORARIO_BRUTO:rhe.bruto,
    RETENCION_RHE:rhe.retencion,
    NETO_A_RECIBIR:rhe.neto,
    ESTADO_COBRO:'Generado',
    FECHA_PAGO:'',
    MEDIO_PAGO:'',
    NUMERO_RHE:'',
    FECHA_RHE:'',
    NOTAS:data.NOTAS || ''
  };

  appendRow_('COBROS', cobro);

  contrataciones.forEach(x => {
    appendRow_('COBRO_DETALLE', {
      ID_COBRO:idCobro,
      ID_CONTRATACION:x.ID_CONTRATACION,
      CANTIDAD:Number(x.CANTIDAD || 1),
      PRECIO_UNITARIO:Number(x.PRECIO_CLIENTE || 0),
      TOTAL:Number(x.PRECIO_CLIENTE || 0) * Number(x.CANTIDAD || 1)
    });
  });

  return {cobro:cobro, contrataciones:contrataciones};
}

function registrarPago(data) {
  if (!data.ID_COBRO) throw new Error('Falta ID_COBRO.');
  const cobro = getCobro(data.ID_COBRO);
  if (!cobro) throw new Error('No existe el cobro.');

  const detalles = rows_('COBRO_DETALLE').filter(x => String(x.ID_COBRO) === String(data.ID_COBRO));

  detalles.forEach(d => {
    updateRow_('CONTRATACIONES', 'ID_CONTRATACION', d.ID_CONTRATACION, {
      ESTADO_PAGO:'Pagado',
      FECHA_PAGO:data.FECHA_PAGO || new Date()
    });
  });

  updateRow_('COBROS', 'ID_COBRO', data.ID_COBRO, {
    ESTADO_COBRO:'Pagado',
    FECHA_PAGO:data.FECHA_PAGO || new Date(),
    MEDIO_PAGO:data.MEDIO_PAGO || '',
    NUMERO_RHE:data.NUMERO_RHE || '',
    FECHA_RHE:data.FECHA_RHE || ''
  });

  return getCobro(data.ID_COBRO);
}
