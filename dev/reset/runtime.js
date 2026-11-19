/* Reset a game — Settings wiring (local saves only; never broadcasts in multiplayer). */
(function () {
  const $ = (id) => document.getElementById(id);
  let resetDlg = {id: null, all: false, step: 0, typed: ''};

  function resetRules(){
    return (typeof ResetRules !== 'undefined' && ResetRules) || (typeof window !== 'undefined' ? window.ResetRules : null);
  }
  function resetMpOn(){
    try { if (typeof mp !== 'undefined' && mp && mp.on) return true; } catch (e){}
    return false;
  }
  function resetToast(msg){
    if (typeof toast === 'function') toast(msg);
  }
  function resetClearLocal(keys){
    (keys || []).forEach((k) => { try { localStorage.removeItem(k); } catch (e){} });
  }
  function resetMemory(id){
    try {
      const G = (typeof Obby !== 'undefined') ? Obby : (typeof window !== 'undefined' ? window.Obby : null);
      if (G && G.running && G.mode === id && typeof G.stop === 'function') G.stop();
      if (id === 'pets' && typeof pfSyncUi === 'function') pfSyncUi();
    } catch (e){}
  }
  function resetPaintList(){
    const R = resetRules();
    const list = $('resetList');
    if (!R || !list) return;
    list.innerHTML = '';
    R.RESET_GAMES.forEach((g) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'resetgame';
      b.dataset.reset = g.id;
      b.setAttribute('aria-label', 'Reset ' + g.name);
      b.innerHTML = '<span class="re">' + g.emoji + '</span><span>' + g.name + '</span>';
      b.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); resetOpen(g.id); });
      list.appendChild(b);
    });
  }
  function resetOpen(id){
    const R = resetRules(); if (!R) return;
    const all = id === 'all';
    const g = all ? null : R.resetGame(id);
    if (!all && !g) return;
    resetDlg = all ? Object.assign(R.resetAllFresh(), {id: 'all', all: true}) : {id, all: false, step: 0, typed: ''};
    const modal = $('resetModal'); if (!modal) return;
    const title = $('resetTitle'), body = $('resetBody'), hint = $('resetHint'), typ = $('resetType'), emo = $('resetEmoji');
    if (title) title.textContent = R.resetConfirmTitle(all ? 'all' : id);
    if (body) body.textContent = R.resetConfirmBody(all ? 'all' : id);
    if (emo) emo.textContent = all ? '♻️' : (g.emoji || '♻️');
    const showType = all && resetDlg.step >= 1;
    if (hint) hint.hidden = !showType;
    if (typ){ typ.hidden = !showType; typ.value = ''; if (showType) typ.placeholder = 'Type RESET'; }
    modal.classList.add('show');
    if (document.body) document.body.classList.add('reset-open');
    const no = $('resetCancel'); if (no) try { no.focus(); } catch (e){}
  }
  function resetClose(){
    const modal = $('resetModal');
    if (modal) modal.classList.remove('show');
    if (document.body) document.body.classList.remove('reset-open');
    resetDlg = {id: null, all: false, step: 0, typed: ''};
    const typ = $('resetType'); if (typ) typ.value = '';
  }
  function resetModalIsOpen(){
    const m = $('resetModal');
    return !!(m && m.classList.contains('show'));
  }
  function resetDo(id){
    const R = resetRules(); if (!R) return false;
    const keys = id === 'all' ? R.resetAllKeys() : R.resetKeys(id);
    if (!keys.length && id !== 'all') return false;
    resetClearLocal(keys);
    if (id === 'all') R.RESET_GAMES.forEach((g) => { if (g.id !== 'pets') resetMemory(g.id); });
    else resetMemory(id);
    const name = id === 'all' ? 'Every game' : ((R.resetGame(id) || {}).name || 'This game');
    const loc = resetMpOn() ? ' on this device only' : '';
    resetToast(name + ' progress was reset' + loc + '.');
    return true;
  }
  function resetConfirm(){
    const R = resetRules(); if (!R) return;
    if (!resetDlg || !resetDlg.id) return;
    if (resetDlg.all){
      resetDlg.typed = ($('resetType') && $('resetType').value) || resetDlg.typed || '';
      const act = R.resetAllAdvance({step: resetDlg.step, typed: resetDlg.typed}, true);
      if (!act.apply){
        resetDlg.step = act.state.step;
        resetDlg.typed = act.state.typed;
        const hint = $('resetHint'), typ = $('resetType'), title = $('resetTitle');
        if (title) title.textContent = 'Press Confirm again?';
        if (hint){ hint.hidden = false; hint.textContent = 'Type RESET or press Confirm again. This can\'t be undone.'; }
        if (typ){ typ.hidden = false; typ.value = resetDlg.typed; try { typ.focus(); typ.select(); } catch (e){} }
        return;
      }
      resetDo('all');
      resetClose();
      return;
    }
    resetDo(resetDlg.id);
    resetClose();
  }
  function resetOnKey(e){
    if (!e) return false;
    const code = e.code || e.key || '';
    if (!resetModalIsOpen()) return false;
    if (code === 'Escape' || code === 'Esc' || e.key === 'Escape' || e.key === 'Esc'){
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      resetClose();
      return true;
    }
    if ((code === 'Enter' || e.key === 'Enter') && e.target && e.target.id === 'resetType'){
      resetDlg.typed = e.target.value || '';
      if (e.preventDefault) e.preventDefault();
      resetConfirm();
      return true;
    }
    return false;
  }

  function resetBind(){
    resetPaintList();
    const all = $('resetAllBtn');
    if (all) all.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); resetOpen('all'); };
    const yes = $('resetConfirm');
    if (yes) yes.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); resetConfirm(); };
    const no = $('resetCancel');
    if (no) no.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); resetClose(); };
    const typ = $('resetType');
    if (typ) typ.addEventListener('input', () => { resetDlg.typed = typ.value || ''; });
    const modal = $('resetModal');
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal || e.target.id === 'resetModal') resetClose(); });
    document.addEventListener('keydown', (ev) => { resetOnKey(ev); }, true);
    const setBtn = $('setBtn');
    if (setBtn) setBtn.addEventListener('click', () => resetPaintList());
  }

  if (typeof document !== 'undefined'){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', resetBind);
    else resetBind();
  }

  if (typeof window !== 'undefined'){
    window.resetOpen = resetOpen;
    window.resetClose = resetClose;
    window.resetModalIsOpen = resetModalIsOpen;
    window.resetOnKey = resetOnKey;
    window.resetDo = resetDo;
    window.resetPaintList = resetPaintList;
  }
})();
