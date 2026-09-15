const SUPABASE_URL = 'https://roynzxilxumfzzuezelg.supabase.co';
const ADMIN_API = `${SUPABASE_URL}/functions/v1/admin-api-v7`;

const $ = id => document.getElementById(id);
const modal = $('modal'), pw = $('pw'), err = $('err'), enter = $('enter');
const secretBtn = $('secretBtn'), closeBtn = $('close');

if (secretBtn) secretBtn.onclick = () => {
  modal.classList.remove('hidden'); pw.value=''; err.textContent=''; setTimeout(()=>pw.focus(),50);
};
if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
if (modal) modal.addEventListener('click', e => { if(e.target===modal) modal.classList.add('hidden'); });

async function login(){
  const password=pw.value.trim();
  if(!password){err.textContent='請輸入密碼。';return;}
  enter.disabled=true; enter.textContent='Checking...'; err.textContent='';
  try{
    const response=await fetch(ADMIN_API,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({action:'login',password})});
    const text=await response.text(); let result=null; try{result=text?JSON.parse(text):null}catch(_){ }
    if(response.status===401&&result?.error==='invalid_password'){err.textContent='密碼不正確，再試一次。';pw.select();return;}
    if(!response.ok){err.textContent=`登入失敗：${result?.error||`HTTP ${response.status}`}`;return;}
    if(result?.ok===true&&result?.token){sessionStorage.setItem('admin_token',result.token);sessionStorage.setItem('admin_expires_at',result.expires_at||'');window.location.replace(`admin.html?v=${Date.now()}`);return;}
    err.textContent='登入回應不正確，請再試一次。';
  }catch(e){console.error(e);err.textContent='連線失敗，請確認網路後再試。';}
  finally{enter.disabled=false;enter.textContent='Enter';}
}
if(enter) enter.onclick=login;
if(pw) pw.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();login();}};

// ---------- Public site: load the same content that the private editor saves ----------
async function loadSiteContent(){
  try{
    const response=await fetch(ADMIN_API,{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({action:'public'})});
    const result=await response.json();
    if(!response.ok||result?.ok!==true) throw new Error(result?.error||`HTTP ${response.status}`);
    const c=result.content||{};

    setText('name',c.name||'Mars');
    setText('introText',c.intro||'喜歡用鏡頭記錄生活裡的溫柔與不經意，\n在平凡的日子裡，尋找不平凡的風景。\n希望透過照片，讓大家也能看見我眼中的世界。');
    setLink('instagramLink',c.instagram_url||'https://www.instagram.com/_oso7.m4r5/');
    setLink('emailLink',c.email?`mailto:${c.email}`:'mailto:marsmars1000507@gmail.com');
    setText('quoteText',c.quote||'有些日子沒有特別發生什麼，但回頭看，才發現它們也很值得被記住。');
    setText('quoteAuthor',c.quote_author||'— a note to myself');
    setText('musicTitle',c.music_title||'My little soundtrack');
    setText('musicDescription',c.music_description||'最近正在播放的歌。');
    if($('spotifyLink')) $('spotifyLink').href=c.spotify_url||'#';
    setText('countdownDateLabel',formatDateLabel(c.countdown_date||'2026-12-31'));
    setText('noteTitle',c.note_title||'想說的話');
    setText('noteText',c.note_text||'這裡可以寫給未來自己的話，也可以放一段最近很喜歡的文字。');
    setText('noteSmall',c.note_small||'');

    if(c.hero_image) renderHero(c.hero_image);
    renderPhotos(result.photos||[]);
    startCountdown(c.countdown_date||'2026-12-31T23:59:59');
  }catch(e){
    console.error('Public content load failed:',e);
    // Keep the designed fallback content visible if the API is temporarily unavailable.
    startCountdown('2026-12-31T23:59:59');
  }
}
function setText(id,value){const e=$(id);if(e)e.textContent=String(value).replace(/\\n/g,'\n');}
function setLink(id,value){const e=$(id);if(e)e.href=value;}
function formatDateLabel(value){if(!value)return'';return String(value).slice(0,10);}
function renderHero(url){
  const e=$('heroPhoto'); if(!e)return;
  e.style.backgroundImage=`linear-gradient(180deg,rgba(255,240,225,.05),rgba(86,64,55,.22)),url("${safeUrl(url)}")`;
  e.style.backgroundSize='cover';e.style.backgroundPosition='center';
  e.innerHTML='<div><small>MAIN VISUAL</small></div>';
}
function renderPhotos(list){
  const grid=$('photoGrid'); if(!grid||!Array.isArray(list)||!list.length)return;
  grid.innerHTML=list.map((p,i)=>{
    const meta=[p.camera,p.lens,p.focal_length,p.aperture,p.iso,p.shutter_speed,p.taken_at].filter(Boolean).join(' · ');
    const cls=i===0?'photo tall':i===3?'photo wide':i===5?'photo tall':'photo';
    return `<div class="${cls}"><img src="${safeUrl(p.image_url)}" alt="${esc(p.title||'PHOTO')}" loading="lazy" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0"><div style="position:relative;z-index:2;padding:12px;background:rgba(255,253,251,.82);max-width:88%;color:#665650;letter-spacing:1px;font-size:10px">${esc(p.title||`PHOTO ${String(i+1).padStart(2,'0')}`)}${meta?`<small style="display:block;margin-top:6px;font-size:8px;letter-spacing:.3px">${esc(meta)}</small>`:''}</div></div>`;
  }).join('');
}
function safeUrl(url){return String(url||'').replace(/\\/g,'').replace(/"/g,'%22');}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

let countdownTimer;
function startCountdown(value){
  clearInterval(countdownTimer);
  const target=new Date(value&&String(value).length<=10?`${value}T23:59:59`:value).getTime();
  if(Number.isNaN(target))return;
  const tick=()=>{const d=$('d'),h=$('h'),m=$('m'),s=$('s');if(!d)return;const r=Math.max(0,target-Date.now());d.textContent=Math.floor(r/86400000);h.textContent=String(Math.floor(r/3600000)%24).padStart(2,'0');m.textContent=String(Math.floor(r/60000)%60).padStart(2,'0');s.textContent=String(Math.floor(r/1000)%60).padStart(2,'0');};
  tick();countdownTimer=setInterval(tick,1000);
}

loadSiteContent();
