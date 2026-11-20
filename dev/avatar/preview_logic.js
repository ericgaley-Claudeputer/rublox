/* Shop / editor try-on preview. Never writes saves or spends coins on its own. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PreviewRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const PREVIEW_MODE_KEY = 'rubloxPreviewMode';

  function previewWearable(it){
    if (!it || typeof it !== 'object') return false;
    if (it.emote && !it.slot && !it.set && !it.look) return false;
    return !!(it.slot || it.set || it.look || it.val);
  }

  function previewApply(base, it, byId){
    const a = Object.assign({}, base || {});
    if (!previewWearable(it)) return a;
    const parts = [];
    if (it.set && Array.isArray(it.set)){
      it.set.forEach(id => {
        const x = typeof byId === 'function' ? byId(id) : (id && id.slot ? id : null);
        if (x) parts.push(x);
      });
    } else {
      parts.push(it);
    }
    parts.forEach(x => { if (x && x.slot) a[x.slot] = x.val; });
    if (it.look) Object.assign(a, it.look);
    return a;
  }

  function previewSnap(state){
    const owned = state && state.owned;
    return {
      avatar: JSON.parse(JSON.stringify((state && state.avatar) || {})),
      draft: state && state.draft ? JSON.parse(JSON.stringify(state.draft)) : null,
      coins: (state && state.coins) | 0,
      owned: Array.isArray(owned) ? owned.slice() : (owned && typeof owned[Symbol.iterator] === 'function' ? [...owned] : [])
    };
  }

  function previewSameSave(before, after){
    if (!before || !after) return false;
    if ((before.coins | 0) !== (after.coins | 0)) return false;
    const bo = (before.owned || []).slice().sort();
    const ao = (after.owned || []).slice().sort();
    if (bo.length !== ao.length || bo.some((id, i) => id !== ao[i])) return false;
    return JSON.stringify(before.avatar || {}) === JSON.stringify(after.avatar || {});
  }

  function previewBegin(state, it){
    if (!previewWearable(it)) return {ok:false, why:'item'};
    const before = previewSnap(state);
    return {
      ok: true,
      open: true,
      itemId: it.id,
      item: it,
      look: previewApply(before.avatar, it, state && state.byId),
      before
    };
  }

  function previewCancel(session){
    if (!session || !session.before) return {ok:false, why:'session', open:false};
    return {
      ok: true,
      open: false,
      saved: false,
      spent: false,
      avatar: JSON.parse(JSON.stringify(session.before.avatar)),
      draft: session.before.draft ? JSON.parse(JSON.stringify(session.before.draft)) : null,
      coins: session.before.coins,
      owned: session.before.owned.slice()
    };
  }

  function previewBuy(session, item, now){
    now = now || {};
    const before = session && session.before ? session.before : previewSnap(now);
    const price = (item && item.price) | 0;
    const owned = Array.isArray(now.owned) ? now.owned.slice() : (now.owned && typeof now.owned[Symbol.iterator] === 'function' ? [...now.owned] : before.owned.slice());
    const already = !!(item && (owned.indexOf(item.id) >= 0 || price === 0));
    if (already){
      return {
        ok: true,
        open: false,
        saved: true,
        spent: false,
        already: true,
        coins: now.coins != null ? (now.coins | 0) : before.coins,
        owned,
        avatar: previewApply(before.avatar, item, now.byId)
      };
    }
    const coins = now.coins != null ? (now.coins | 0) : before.coins;
    if (coins < price){
      return {
        ok: false,
        why: 'coins',
        open: true,
        saved: false,
        spent: false,
        coins,
        owned,
        avatar: JSON.parse(JSON.stringify(before.avatar))
      };
    }
    const nextOwned = owned.slice();
    if (item && item.id && nextOwned.indexOf(item.id) < 0) nextOwned.push(item.id);
    if (item && item.set) item.set.forEach(id => { const k = typeof id === 'string' ? id : (id && id.id); if (k && nextOwned.indexOf(k) < 0) nextOwned.push(k); });
    return {
      ok: true,
      open: false,
      saved: true,
      spent: true,
      coins: coins - price,
      owned: nextOwned,
      avatar: previewApply(before.avatar, item, now.byId)
    };
  }

  function previewModeNormalize(val){
    const s = (val == null ? '' : String(val)).toLowerCase().trim();
    if (s === '2d' || s === '2' || s === 'flat' || s === 'card') return '2d';
    if (s === '3d' || s === '3' || s === 'spin' || s === 'model') return '3d';
    return '';
  }

  function previewModePick(stored, webglOk){
    const m = previewModeNormalize(stored);
    if (m === '2d') return '2d';
    if (!webglOk) return '2d';
    return '3d';
  }

  function previewModeToggle(current, webglOk){
    const cur = previewModeNormalize(current) || previewModePick(current, webglOk);
    if (cur === '3d') return '2d';
    return webglOk ? '3d' : '2d';
  }

  function previewModeSelected(shown, btn){
    return previewModeNormalize(shown) === previewModeNormalize(btn);
  }

  return {PREVIEW_MODE_KEY, previewWearable, previewApply, previewSnap, previewSameSave, previewBegin, previewCancel, previewBuy, previewModeNormalize, previewModePick, previewModeToggle, previewModeSelected};
});
