/* =========================================
   A LITTLE PHOTO JOURNAL · V9
   Supabase Admin Login + Countdown
========================================= */

const SUPABASE_URL =
  'https://roynzxilxumfzzuezelg.supabase.co';

const ADMIN_API =
  `${SUPABASE_URL}/functions/v1/admin-api`;


/* =========================================
   SECRET ADMIN LOGIN
========================================= */

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
  closeBtn.onclick = () => {
    modal.classList.add('hidden');
  };
}


/* 點背景關閉 */
if (modal) {
  modal.addEventListener('click', event => {
    if (event.target === modal) {
      modal.classList.add('hidden');
    }
  });
}


/* =========================================
   LOGIN
========================================= */

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

    const response = await fetch(ADMIN_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'login',
        password: password
      })
    });

    let result = null;

    try {
      result = await response.json();
    } catch {
      result = null;
    }

    console.log('Admin API:', response.status, result);

    /* 真正的密碼錯誤 */
    if (response.status === 401 &&
        result?.error === 'invalid_password') {

      err.textContent = '密碼不正確，再試一次。';
      pw.select();
      return;
    }

    /* 沒輸入密碼 */
    if (result?.error === 'missing_password') {
      err.textContent = '請輸入密碼。';
      return;
    }

    /* Session 建立失敗 */
    if (result?.error === 'session_error') {
      err.textContent = '登入成功，但無法建立登入狀態。';
      console.error('Session creation failed:', result);
      return;
    }

    /* Edge Function 本身錯誤 */
    if (result?.error === 'server_error') {
      err.textContent = '伺服器發生錯誤，請稍後再試。';
      console.error('Server error:', result);
      return;
    }

    /* 其他 HTTP 錯誤 */
    if (!response.ok) {
      err.textContent =
        `登入失敗（${result?.error || response.status}）`;
      console.error('Login failed:', result);
      return;
    }

    /* 登入成功 */
    if (result?.ok === true && result?.token) {

      sessionStorage.setItem(
        'admin_token',
        result.token
      );

      sessionStorage.setItem(
        'admin_expires_at',
        result.expires_at || ''
      );

      window.location.href = 'admin.html';
      return;
    }

    err.textContent = '登入回應格式不正確。';
    console.error('Unexpected login response:', result);

  } catch (error) {

    console.error('Network error:', error);

    err.textContent =
      '連線失敗，請確認網路或稍後再試。';

  } finally {

    enter.disabled = false;
    enter.textContent = 'Enter';

  }
}


if (enter) {
  enter.onclick = login;
}


if (pw) {
  pw.onkeydown = event => {

    if (event.key === 'Enter') {
      event.preventDefault();
      login();
    }

  };
}


/* =========================================
   COUNTDOWN
========================================= */

const target =
  new Date('2026-12-31T23:59:59');

function tick() {

  const elementD = document.getElementById('d');
  const elementH = document.getElementById('h');
  const elementM = document.getElementById('m');
  const elementS = document.getElementById('s');

  if (!elementD) return;

  const remaining =
    Math.max(0, target.getTime() - Date.now());

  const days =
    Math.floor(remaining / 86400000);

  const hours =
    Math.floor(remaining / 3600000) % 24;

  const minutes =
    Math.floor(remaining / 60000) % 60;

  const seconds =
    Math.floor(remaining / 1000) % 60;

  elementD.textContent = days;
  elementH.textContent = String(hours).padStart(2, '0');
  elementM.textContent = String(minutes).padStart(2, '0');
  elementS.textContent = String(seconds).padStart(2, '0');
}

tick();
setInterval(tick, 1000);