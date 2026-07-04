(function () {
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxI1lyaqoMGTC67F0LfvWsgCk57VNgJuHN9yEI8DORIDTNU2UyqkW3qY3Pzj68Rflvx4w/exec";
  const SESSION_HOURS = 12;
  const STORAGE_KEY = "hod_auth_until";
  const NAME_KEY = "hod_auth_name";

  function isAuthed() {
    const until = localStorage.getItem(STORAGE_KEY);
    return until && Date.now() < parseInt(until, 10);
  }

  function grantAccess(name) {
    const until = Date.now() + SESSION_HOURS * 3600 * 1000;
    localStorage.setItem(STORAGE_KEY, String(until));
    if (name) localStorage.setItem(NAME_KEY, name);
  }

  if (isAuthed()) return;

  document.documentElement.style.visibility = "hidden";

  document.addEventListener("DOMContentLoaded", function () {
    const overlay = document.createElement("div");
    overlay.id = "authGate";
    overlay.style.cssText =
      "position:fixed;inset:0;background:linear-gradient(135deg,#0F4C81,#3E8FC9);" +
      "display:flex;align-items:center;justify-content:center;z-index:99999;" +
      "font-family:'Segoe UI','Noto Sans Thai',sans-serif;";

    overlay.innerHTML =
      '<div style="background:#fff;border-radius:20px;padding:30px 26px;width:280px;' +
      'text-align:center;box-shadow:0 12px 32px rgba(0,0,0,0.3);">' +
      '<div style="font-size:38px;margin-bottom:6px;">🔒</div>' +
      '<h2 style="font-size:15.5px;color:#0F4C81;margin:0 0 4px;">ระบบภายในหอผู้ป่วยหญิง</h2>' +
      '<p style="font-size:12px;color:#6B7A90;margin:0 0 16px;">โรงพยาบาลฮอด · กรุณาเข้าสู่ระบบ</p>' +
      '<input id="authUser" type="text" placeholder="Username" autocomplete="username" ' +
      'style="width:100%;padding:11px 12px;border:1px solid #DCE7F0;border-radius:12px;' +
      'font-size:14px;margin-bottom:8px;box-sizing:border-box;outline:none;">' +
      '<input id="authPass" type="password" placeholder="Password" autocomplete="current-password" ' +
      'style="width:100%;padding:11px 12px;border:1px solid #DCE7F0;border-radius:12px;' +
      'font-size:14px;margin-bottom:10px;box-sizing:border-box;outline:none;">' +
      '<button id="authBtn" style="width:100%;padding:11px;border:none;border-radius:12px;' +
      'background:#0F4C81;color:#fff;font-weight:700;font-size:14px;cursor:pointer;">เข้าสู่ระบบ</button>' +
      '<div id="authErr" style="color:#DC3545;font-size:12px;margin-top:10px;min-height:14px;"></div>' +
      "</div>";

    document.body.appendChild(overlay);
    document.documentElement.style.visibility = "visible";

    const userInput = document.getElementById("authUser");
    const passInput = document.getElementById("authPass");
    const btn = document.getElementById("authBtn");
    const err = document.getElementById("authErr");

    async function tryLogin() {
      const username = userInput.value.trim();
      const password = passInput.value;
      if (!username || !password) {
        err.textContent = "กรุณากรอก Username และ Password";
        return;
      }
      btn.disabled = true;
      btn.textContent = "กำลังเข้าสู่ระบบ...";
      err.textContent = "";
      try {
        const res = await fetch(SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "login", username, password })
        });
        const data = await res.json();
        if (data.success) {
          grantAccess(data.name);
          overlay.remove();
        } else {
          err.textContent = data.message || "เข้าสู่ระบบไม่สำเร็จ";
          passInput.value = "";
          passInput.focus();
        }
      } catch (e) {
        err.textContent = "เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง";
      } finally {
        btn.disabled = false;
        btn.textContent = "เข้าสู่ระบบ";
      }
    }

    btn.addEventListener("click", tryLogin);
    [userInput, passInput].forEach(el =>
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") tryLogin();
      })
    );
    userInput.focus();
  });
})();
