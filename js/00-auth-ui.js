/* =========================================================
   CRF — LOGIN GOOGLE
   Pantalla de acceso y sesión.
   ========================================================= */

(function () {
  const style = document.createElement("style");
  style.textContent = `
    body.crf-auth-pending .app-shell { visibility:hidden; }
    body.crf-logged-out .app-shell { display:none; }
    #crfAuthScreen {
      position:fixed; inset:0; z-index:99999; display:flex; align-items:center; justify-content:center;
      background:#f7f5f0; color:#171717; font-family:Arial,Helvetica,sans-serif;
    }
    #crfAuthScreen[hidden]{display:none;}
    .crf-auth-card{width:min(420px,calc(100vw - 40px));padding:48px 42px;background:#fffefa;border:1px solid #d9d6cf;text-align:center;box-shadow:0 18px 60px rgba(0,0,0,.08)}
    .crf-auth-mark{font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:700;letter-spacing:-2.5px;margin-bottom:18px}
    .crf-auth-line{height:1px;background:#171717;margin:0 auto 22px;width:48px}
    .crf-auth-title{font-family:Georgia,'Times New Roman',serif;font-size:27px;font-weight:400;margin:0 0 8px}
    .crf-auth-desc{font-size:11px;letter-spacing:1.1px;text-transform:uppercase;color:#777570;line-height:1.6;margin:0 0 30px}
    .crf-google-btn{width:100%;height:46px;border:1px solid #cfcac1;background:#fff;color:#171717;display:flex;align-items:center;justify-content:center;gap:11px;font-size:13px;font-weight:600;cursor:pointer}
    .crf-google-btn:hover{background:#f7f5f0}
    .crf-google-icon{width:18px;height:18px}
    .crf-auth-error{min-height:18px;margin-top:15px;color:#8a4037;font-size:11px;line-height:1.45}
    .crf-user-bar{display:none;align-items:center;gap:10px;margin-left:12px}
    .crf-user-email{font-size:11px;color:#777570;max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .crf-logout{border:0;background:transparent;color:#777570;font-size:11px;cursor:pointer;padding:5px 0;text-decoration:underline;text-underline-offset:3px}
  `;
  document.head.appendChild(style);

  document.body.classList.add("crf-auth-pending");

  const screen = document.createElement("div");
  screen.id = "crfAuthScreen";
  screen.innerHTML = `
    <div class="crf-auth-card">
      <div class="crf-auth-mark">CRF</div>
      <div class="crf-auth-line"></div>
      <h1 class="crf-auth-title">Acceso privado</h1>
      <p class="crf-auth-desc">Comunicación · Desarrollo Web · Estrategia Digital</p>
      <button class="crf-google-btn" id="crfGoogleLogin" type="button">
        <svg class="crf-google-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M21.35 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"/>
          <path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.7Z"/>
          <path fill="#FBBC05" d="M6.53 13.79A5.86 5.86 0 0 1 6.22 12c0-.62.11-1.23.31-1.79V7.68H3.28A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.32l3.25-2.53Z"/>
          <path fill="#EA4335" d="M12 6.18c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.83 3.28 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.72 5.38l3.25 2.53C7.3 7.9 9.46 6.18 12 6.18Z"/>
        </svg>
        Continuar con Google
      </button>
      <div class="crf-auth-error" id="crfAuthError"></div>
    </div>
  `;
  document.body.prepend(screen);

  const loginButton = document.getElementById("crfGoogleLogin");
  const errorBox = document.getElementById("crfAuthError");

  function showApp(user) {
    document.body.classList.remove("crf-auth-pending", "crf-logged-out");
    screen.hidden = true;
    window.CRF_CURRENT_USER = user || null;

    const account = document.querySelector(".account");
    if (account && user) {
      const strong = account.querySelector("strong");
      const small = account.querySelector("small");
      const avatar = account.querySelector(".avatar");
      if (strong) strong.textContent = user.displayName || "Claudia R.";
      if (small) small.textContent = user.email || "Sesión activa";
      if (avatar) avatar.textContent = (user.displayName || "CRF").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
      account.title = "Cerrar sesión";
      account.style.cursor = "pointer";
      account.onclick = async () => {
        try {
          const api = await window.CRF_FIREBASE_READY;
          await api.logout();
          window.location.reload();
        } catch (error) { console.error(error); }
      };
    }

    window.dispatchEvent(new CustomEvent("crf-auth-ready", { detail: { user } }));
  }

  function showLogin(message = "") {
    document.body.classList.remove("crf-auth-pending");
    document.body.classList.add("crf-logged-out");
    screen.hidden = false;
    errorBox.textContent = message;
  }

  async function init() {
    try {
      const api = await window.CRF_FIREBASE_READY;
      api.watchAuth((user) => {
        if (user) {
          showApp(user);
        } else {
          showLogin("");
        }
      });
    } catch (error) {
      showLogin("No se pudo iniciar Firebase. Revisa la configuración del proyecto.");
      console.error(error);
    }
  }

  loginButton.addEventListener("click", async () => {
    loginButton.disabled = true;
    loginButton.textContent = "Conectando con Google…";
    errorBox.textContent = "";
    try {
      const api = await window.CRF_FIREBASE_READY;
      const user = await api.login();
      showApp(user);
    } catch (error) {
      console.error(error);
      errorBox.textContent = error?.code === "auth/popup-closed-by-user"
        ? "La ventana de Google se cerró."
        : (error?.message || "No se pudo iniciar sesión.");
      loginButton.disabled = false;
      loginButton.textContent = "Continuar con Google";
    }
  });

  init();
})();
