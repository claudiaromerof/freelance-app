/* API — Google Apps Script */

function apiConfigured() {
  return API_CONFIG.URL && !API_CONFIG.URL.includes("PEGAR_AQUI_URL_WEB_APP");
}

async function apiGet() {
  if (!apiConfigured()) throw new Error("API no configurada");
  const url = `${API_CONFIG.URL}?token=${encodeURIComponent(API_CONFIG.TOKEN)}&action=getState`;
  const response = await fetch(url, { method: "GET", credentials: "omit", cache: "no-store" });
  if (!response.ok) throw new Error(`API ${response.status}`);
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || "Error de API");
  return data.state;
}

async function apiSave(nextState) {
  if (!apiConfigured()) throw new Error("API no configurada");
  const body = new URLSearchParams();
  body.set("token", API_CONFIG.TOKEN);
  body.set("action", "saveState");
  body.set("payload", JSON.stringify(nextState));
  const response = await fetch(API_CONFIG.URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: body.toString(),
    credentials: "omit"
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  const data = await response.json();
  if (!data.ok) throw new Error(data.error || "Error de API");
  return data;
}
