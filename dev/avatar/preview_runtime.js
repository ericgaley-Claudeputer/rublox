/* Shop try-on preview — live view, Buy + Cancel, no save or spend until Buy. */
let avPrev = null, avPrev3 = null;
function avPrevIsOpen(){ return !!(avPrev && avPrev.open); }
function avPrevState(){
  const ownedList = (typeof owned !== 'undefined' && owned && owned.size != null) ? [...owned] : (typeof owned !== 'undefined' && Array.isArray(owned) ? owned.slice() : []);
  return {avatar: typeof avatar !== 'undefined' ? avatar : {}, draft: typeof draft !== 'undefined' ? draft : null, coins: typeof coins !== 'undefined' ? coins : 0, owned: ownedList, byId: typeof byId === 'function' ? byId : null};
}
function avPrevOpen(it){
  if (typeof PreviewRules === 'undefined' || !PreviewRules.previewWearable(it)) return false;
  const ses = PreviewRules.previewBegin(avPrevState(), it);
  if (!ses.ok) return false;
  avPrev = ses;
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
  avPrevPaint();
  return true;
}
function avPrevPaint(){
  if (!avPrev || !avPrev.look) return;
  const c2 = document.getElementById('avPrev2');
  if (c2 && typeof drawAvatar === 'function'){
    try { drawAvatar(c2.getContext('2d'), avPrev.look); } catch (e){}
  }
  if (c2) c2.style.display = '';
  if (typeof avMountPreview3D === 'function'){
    const host = document.getElementById('avPrev3');
    let ok = false;
    try { ok = !!avMountPreview3D(host, avPrev.look); } catch (e){ ok = false; }
    if (host) host.style.display = 'none';
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
  const buy = document.getElementById('avPrevBuyBtn');
  const cancel = document.getElementById('avPrevCancelBtn');
  const modal = document.getElementById('avPrevModal');
  if (buy) buy.onclick = () => avPrevBuy();
  if (cancel) cancel.onclick = () => avPrevCancel();
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) avPrevCancel(); });
  document.addEventListener('keydown', e => {
    if (!avPrevIsOpen()) return;
    if (e.code === 'Escape' || e.key === 'Escape'){ avPrevCancel(); e.preventDefault(); e.stopPropagation(); }
  }, true);
}
if (typeof document !== 'undefined'){
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avPrevBind);
  else avPrevBind();
}
