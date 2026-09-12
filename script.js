const SUPABASE_URL = 'https://roynzxilxumfzzuezelg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nvmHzVjH7bZ8F9cnJYzKCg_PSPlhCXU';

const modal = document.getElementById('modal');
const pw = document.getElementById('pw');
const err = document.getElementById('err');
const enter = document.getElementById('enter');

document.getElementById('secretBtn').onclick = () => {
  modal.classList.remove('hidden');
  pw.value = '';
  err.textContent = '';
  pw.focus();
};

document.getElementById('close').onclick = () => {
  modal.classList.add('hidden');
};

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
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/check_admin_password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({
          input_password: password
        })
      }
    );

    if (!response.ok) {
      throw new Error('request failed');
    }

    const result = await response.json();

    if (result === true) {
      window.location.href = 'admin.html';
    } else {
      err.textContent = '密碼不正確，再試一次。';
      pw.select();
    }

  } catch (error) {
    console.error(error);
    err.textContent = '驗證失敗，請稍後再試。';

  } finally {
    enter.disabled = false;
    enter.textContent = 'Enter';
  }
}

enter.onclick = login;

pw.onkeydown = (event) => {
  if (event.key === 'Enter') {
    login();
  }
};


/* =========================
   COUNTDOWN
========================= */

const target = new Date('2026-12-31T23:59:59');

function tick() {
  const remaining = Math.max(0, target - new Date());

  document.getElementById('d').textContent =
    Math.floor(remaining / 86400000);

  document.getElementById('h').textContent =
    Math.floor(remaining / 3600000) % 24;

  document.getElementById('m').textContent =
    Math.floor(remaining / 60000) % 60;

  document.getElementById('s').textContent =
    Math.floor(remaining / 1000) % 60;
}

tick();
setInterval(tick, 1000);
