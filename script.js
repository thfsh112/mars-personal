/* =========================================
   A LITTLE PHOTO JOURNAL · V9
   Supabase Admin Login + Countdown
========================================= */

const SUPABASE_URL = 'https://roynzxilxumfzzuezelg.supabase.co';
const ADMIN_API = `${SUPABASE_URL}/functions/v1/admin-api`;

const modal = document.getElementById('modal');
const pw = document.getElementById('pw');
const err = document.getElementById('err');
const enter = document.getElementById('enter');
const secretBtn = document.getElementById('secretBtn');
const closeBtn = document.getElementById('close');

if (secretBtn) {
  secretBtn.onclick = () => {
    modal.classList.remove('hidden');
    pw.value = '';
    err.textContent = '';
    setTimeout(() => pw.focus(), 50);
  };
}

if (closeBtn) {
  closeBtn.onclick = () => modal.classList.add('hidden');
}

if (modal) {
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.classList.add('hidden');
  });
}

async function login() {
  const password = pw.value.trim();
  if (!password) {
    err.textContent = '請輸入密碼。';
    return;
  }

  enter.disabled = true;
  enter.textContent = 'Checking...';
  err.textContent = '';

  try {
    const response = await fetch(`${ADMIN_API}?v=9.1`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ action: 'login', password })
    });

    const text = await response.text();
    let result = null;
    try { result = text ? JSON.parse(text) : null; } catch (_) {}

    console.log('Admin API:', response.status, result);

    if (response.status === 401 && result?.error === 'invalid_password') {
      err.textContent = '密碼不正確，再試一次。';
      pw.select();
      return;
    }

    if (!response.ok) {
      err.textContent = `登入失敗：${result?.error || `HTTP ${response.status}`}`;
      console.error('Login failed:', response.status, result, text);
      return;
    }

    if (result?.ok === true && result?.token) {
      sessionStorage.setItem('admin_token', result.token);
      sessionStorage.setItem('admin_expires_at', result.expires_at || '');
      window.location.replace(`admin.html?v=${Date.now()}`);
      return;
    }

    err.textContent = '登入回應不正確，請再試一次。';
    console.error('Unexpected login response:', result, text);
  } catch (error) {
    console.error('Network error:', error);
    err.textContent = '連線失敗，請確認網路後再試。';
  } finally {
    enter.disabled = false;
    enter.textContent = 'Enter';
  }
}

if (enter) enter.onclick = login;
if (pw) {
  pw.onkeydown = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      login();
    }
  };
}

const target = new Date('2026-12-31T23:59:59');
function tick() {
  const elementD = document.getElementById('d');
  const elementH = document.getElementById('h');
  const elementM = document.getElementById('m');
  const elementS = document.getElementById('s');
  if (!elementD) return;

  const remaining = Math.max(0, target.getTime() - Date.now());
  elementD.textContent = Math.floor(remaining / 86400000);
  elementH.textContent = String(Math.floor(remaining / 3600000) % 24).padStart(2, '0');
  elementM.textContent = String(Math.floor(remaining / 60000) % 60).padStart(2, '0');
  elementS.textContent = String(Math.floor(remaining / 1000) % 60).padStart(2, '0');
}
tick();
setInterval(tick, 1000);