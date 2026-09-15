function getClientes() {
  return rows_('CLIENTES');
}

function guardarCliente(data) {
  const id = data.ID_CLIENTE || nextId_('CLI', 'CLIENTES', 'ID_CLIENTE');
  const obj = Object.assign({}, data, {ID_CLIENTE:id});
  if (!obj.NOMBRE_CLIENTE) throw new Error('El nombre del cliente es obligatorio.');

  const exists = findById_('CLIENTES', 'ID_CLIENTE', id);
  if (exists) updateRow_('CLIENTES', 'ID_CLIENTE', id, obj);
  else appendRow_('CLIENTES', obj);

  return findById_('CLIENTES', 'ID_CLIENTE', id);
}
