function getState() {
  return {
    clients: getClientes(),
    serviceCatalog: getServicios(),
    contracts: getContrataciones(),
    billing: getCobros()
  };
}
