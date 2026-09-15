const APP = {
  SPREADSHEET_ID: '1v_7lUV7LShITrS3imXYZueiMESQOUmXHQMTTyCKpHXQ',
  PIN_PROPERTY: 'ACCESS_PIN',
  ACCESS_PIN_DEFAULT: '5378',
  VERSION: '2026-09-15-V2-PIN',
  RHE_RATE_DEFAULT: 0.08
};

function getConfig_() {
  const props = PropertiesService.getScriptProperties();
  return {
    pin: props.getProperty(APP.PIN_PROPERTY) || APP.ACCESS_PIN_DEFAULT,
    spreadsheetId: APP.SPREADSHEET_ID
  };
}

function setAccessPin(pin) {
  if (!pin) throw new Error('Falta el PIN.');
  PropertiesService.getScriptProperties().setProperty(APP.PIN_PROPERTY, String(pin).trim());
  return {ok:true, message:'PIN guardado correctamente.'};
}
