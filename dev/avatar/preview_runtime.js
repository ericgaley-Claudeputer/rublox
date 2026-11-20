/* Shop try-on preview — live 2D/3D view, Buy + Cancel, no save or spend until Buy. */
let avPrev = null, avPrev3 = null, avPrevMode = '3d';
function avPrevIsOpen(){ return !!(avPrev && avPrev.open); }
function avPrevState(){
  const ownedList = (typeof owned !== 'undefined' && owned && owned.size != null) ? [...owned] : (typeof owned !== 'undefined' && Array.isArray(owned) ? owned.slice() : []);
  return {avatar: typeof avatar !== 'undefined' ? avatar : {}, draft: typeof draft !== 'undefined' ? draft : null, coins: typeof coins !== 'undefined' ? coins : 0, owned: ownedList, byId: typeof byId === 'function' ? byId : null};
}
function avPrevWebglOk(){
  try {
    if (typeof THREE === 'undefined') return false;
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch (e){ return false; }
}
function avPrevReadStoredMode(){
  let v = '';
  try {
    if (typeof load === 'function') v = load('rubloxPreviewMode', '');
    else if (typeof localStorage !== 'undefined') v = JSON.parse(localStorage.getItem('rubloxPreviewMode'));
  } catch (e){ v = ''; }
  return v;
}
function avPrevWriteStoredMode(mode){
  const m = (typeof PreviewRules !== 'undefined' && PreviewRules.previewModeNormalize) ? PreviewRules.previewModeNormalize(mode) : mode;
  if (m !== '2d' && m !== '3d') return;
  try {
    if (typeof save === 'function') save('rubloxPreviewMode', m);
    else if (typeof localStorage !== 'undefined') localStorage.setItem('rubloxPreviewMode', JSON.stringify(m));
  } catch (e){}
}
function avPrevShownMode(){
  const webgl = avPrevWebglOk();
  if (typeof PreviewRules !== 'undefined' && PreviewRules.previewModePick) return PreviewRules.previewModePick(avPrevMode, webgl);
  return webgl ? (avPrevMode || '3d') : '2d';
}
function avPrevSyncModeBtns(){
  const shown = avPrevShownMode();
  const webgl = avPrevWebglOk();
  const b2 = document.getElementById('avPrev2dBtn');
  const b3 = document.getElementById('avPrev3dBtn');
  const stage = document.getElementById('avPrevStage');
  if (b2){
    const on = shown === '2d';
    b2.classList.toggle('on', on);
    b2.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  if (b3){
    const on = shown === '3d';
    b3.classList.toggle('on', on);
    b3.setAttribute('aria-pressed', on ? 'true' : 'false');
    b3.disabled = !webgl;
    if (!webgl) b3.title = '3D needs WebGL on this device';
    else b3.removeAttribute('title');
  }
  if (stage){
    stage.classList.toggle('avprev-2d', shown === '2d');
    stage.classList.toggle('avprev-3d', shown === '3d');
  }
}
function avPrevSetMode(mode, persist){
  const want = (typeof PreviewRules !== 'undefined' && PreviewRules.previewModeNormalize) ? PreviewRules.previewModeNormalize(mode) : String(mode || '').toLowerCase();
  if (want === '2d' || want === '3d') avPrevMode = want;
  if (persist !== false) avPrevWriteStoredMode(avPrevMode);
  avPrevSyncModeBtns();
  if (avPrevIsOpen()) avPrevPaint();
  return avPrevShownMode();
}
function avPrevToggleMode(){
  const next = (typeof PreviewRules !== 'undefined' && PreviewRules.previewModeToggle)
    ? PreviewRules.previewModeToggle(avPrevShownMode(), avPrevWebglOk())
    : (avPrevShownMode() === '3d' ? '2d' : '3d');
  return avPrevSetMode(next, true);
}
function avPrevStick(rx, ry){
  try { if (window.__avPrev3 && typeof window.__avPrev3.stick === 'function') window.__avPrev3.stick(rx, ry); } catch (e){}
}
function avPrevOpen(it){
  if (typeof PreviewRules === 'undefined' || !PreviewRules.previewWearable(it)) return false;
  const ses = PreviewRules.previewBegin(avPrevState(), it);
  if (!ses.ok) return false;
  avPrev = ses;
  const stored = PreviewRules.previewModeNormalize(avPrevReadStoredMode());
  if (stored) avPrevMode = stored;
  const modal = document.getElementById('avPrevModal');
  const title = document.getElementById('avPrevTitle');
  const sub = document.getElementById('avPrevSub');
  const buy = document.getElementById('avPrevBuyBtn');
  const cancel = document.getElementById('avPrevCancelBtn');
  const own = typeof isOwned === 'function' && isOwned(it);
  if (title) title.textContent = '👀 Try on ' + (it.emoji ? it.emoji + ' ' : '') + (it.name || 'this look');
  if (sub) sub.textContent = 'Just a try-on — your real outfit, coins, and saves stay put until you buy.';
  if (buy){
    buy.style.display = '';
    if (own){
      const on = typeof isOn === 'function' && isOn(it);
      buy.textContent = on ? '✅ Already wearing' : (it.slot === 'anim' ? '🕺 Wear this' : '👕 Wear this');
      buy.className = 'big green';
      buy.disabled = !!on;
    } else {
      buy.textContent = '🛒 Buy' + (it.price ? (' · ' + it.price + ' coins') : ' (free)');
      buy.className = 'big';
      buy.disabled = false;
    }
  }
  if (cancel) cancel.textContent = '↩️ Cancel';
  if (modal){ modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); }
  avPrevSyncModeBtns();
  avPrevPaint();
  return true;
}
function avPrevPaint(){
  if (!avPrev || !avPrev.look) return;
  const shown = avPrevShownMode();
  avPrevSyncModeBtns();
  const c2 = document.getElementById('avPrev2');
  const host = document.getElementById('avPrev3');
  if (c2 && typeof drawAvatar === 'function'){
    try { drawAvatar(c2.getContext('2d'), avPrev.look); } catch (e){}
  }
  if (shown === '3d' && typeof avMountPreview3D === 'function'){
    if (c2) c2.style.display = 'none';
    if (host) host.style.display = 'block';
    let ok = false;
    try { ok = !!avMountPreview3D(host, avPrev.look); } catch (e){ ok = false; }
    if (!ok){
      if (typeof avUnmountPreview3D === 'function') avUnmountPreview3D();
      if (host) host.style.display = 'none';
      if (c2) c2.style.display = 'block';
      const stage = document.getElementById('avPrevStage');
      if (stage){ stage.classList.remove('avprev-3d'); stage.classList.add('avprev-2d'); }
      const b2 = document.getElementById('avPrev2dBtn');
      const b3 = document.getElementById('avPrev3dBtn');
      if (b2){ b2.classList.add('on'); b2.setAttribute('aria-pressed', 'true'); }
      if (b3){ b3.classList.remove('on'); b3.setAttribute('aria-pressed', 'false'); }
    }
  } else {
    if (typeof avUnmountPreview3D === 'function') avUnmountPreview3D();
    if (host) host.style.display = 'none';
    if (c2) c2.style.display = 'block';
  }
}
function avPrevCloseUi(){
  const modal = document.getElementById('avPrevModal');
  if (modal){ modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }
  if (typeof avUnmountPreview3D === 'function') avUnmountPreview3D();
}
function avPrevCancel(){
  if (!avPrev){ avPrevCloseUi(); return false; }
  const out = PreviewRules.previewCancel(avPrev);
  avPrev = null;
  avPrevCloseUi();
  if (typeof refreshLook === 'function') refreshLook();
  else if (typeof drawBig === 'function') drawBig();
  return out;
}
function avPrevBuy(){
  if (!avPrev || !avPrev.item) return false;
  const it = avPrev.item;
  const own = typeof isOwned === 'function' && isOwned(it);
  if (own){
    if (typeof wear === 'function' && !(typeof isOn === 'function' && isOn(it))) wear(it, true);
    avPrev = null;
    avPrevCloseUi();
    return true;
  }
  const before = PreviewRules.previewSnap(avPrevState());
  if (typeof buy === 'function') buy(it);
  const after = PreviewRules.previewSnap(avPrevState());
  const bought = !PreviewRules.previewSameSave(before, after) || (typeof isOwned === 'function' && isOwned(it));
  if (bought){
    avPrev = null;
    avPrevCloseUi();
    if (typeof refreshLook === 'function') refreshLook();
    return true;
  }
  avPrevPaint();
  return false;
}
function avPrevBind(){
  if (window.__avPrevBound) return;
  window.__avPrevBound = true;
  const stored = (typeof PreviewRules !== 'undefined' && PreviewRules.previewModeNormalize) ? PreviewRules.previewModeNormalize(avPrevReadStoredMode()) : '';
  if (stored) avPrevMode = stored;
  const buy = document.getElementById('avPrevBuyBtn');
  const cancel = document.getElementById('avPrevCancelBtn');
  const modal = document.getElementById('avPrevModal');
  const b2 = document.getElementById('avPrev2dBtn');
  const b3 = document.getElementById('avPrev3dBtn');
  if (buy) buy.onclick = () => avPrevBuy();
  if (cancel) cancel.onclick = () => avPrevCancel();
  if (b2) b2.onclick = () => avPrevSetMode('2d', true);
  if (b3) b3.onclick = () => avPrevSetMode('3d', true);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) avPrevCancel(); });
  document.addEventListener('keydown', e => {
    if (!avPrevIsOpen()) return;
    if (e.code === 'Escape' || e.key === 'Escape'){ avPrevCancel(); e.preventDefault(); e.stopPropagation(); }
  }, true);
  avPrevSyncModeBtns();
}
if (typeof document !== 'undefined'){
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avPrevBind);
  else avPrevBind();
}
