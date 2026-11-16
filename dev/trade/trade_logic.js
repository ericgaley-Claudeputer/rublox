/* Pure trade rules — inventory checks and an atomic swap, no networking. */
(function (root) {
  'use strict';

  const TR_KEY = 'rubloxTrades';
  const TR_VER = 1;
  const TR_PET_MAX = 6;
  const RARITY_NAMES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  function trRarityName(r){
    const i = Math.max(0, Math.min(4, r | 0));
    return RARITY_NAMES[i];
  }

  function trPetKey(p){
    if (!p) return '';
    if (p.key) return String(p.key);
    return String(p.b || 0) + ':' + String(p.k || '') + ':' + String(p.n || '') + ':' + String(p.xp || 0);
  }

  function trClonePet(p){
    if (!p || !p.k) return null;
    return {
      k: String(p.k), c: Math.max(0, Math.min(2, p.c | 0)), n: String(p.n || 'Buddy').slice(0, 16),
      xp: Math.max(0, +p.xp || 0),
      f: p.f == null ? 80 : +p.f, u: p.u == null ? 80 : +p.u, e: p.e == null ? 80 : +p.e,
      b: +p.b || Date.now(), acc: (p.acc && typeof p.acc === 'object') ? Object.assign({}, p.acc) : {},
      tr: p.tr, g: (p.g === 'b' || p.g === 'g') ? p.g : 'g',
      key: trPetKey(p)
    };
  }

  function trInvClean(inv){
    const o = {};
    if (inv && typeof inv === 'object') for (const k in inv) if (inv[k]) o[String(k)] = 1;
    return o;
  }

  function trNormalizeInv(raw){
    const o = raw && typeof raw === 'object' ? raw : {};
    const pets = (Array.isArray(o.pets) ? o.pets : []).map(trClonePet).filter(Boolean);
    return {pets, inv: trInvClean(o.inv), a: Math.max(0, o.a | 0), owned: trInvClean(o.owned)};
  }

  // Default/free avatar pieces and "none" slots cannot be traded.
  const TR_BLOCKED_ITEMS = {none: 1, smile: 1, default: 1, classic: 1};

  function trTradableAcc(id, catalog){
    if (!id || TR_BLOCKED_ITEMS[id]) return false;
    if (catalog && catalog[id]) {
      const it = catalog[id];
      if (it.price === 0 || it.free) return false;
    }
    return true;
  }

  function trOfferItem(it){
    if (!it || typeof it !== 'object') return null;
    if (it.kind === 'pet'){
      const pet = trClonePet(it.pet || it);
      if (!pet) return null;
      return {kind: 'pet', key: pet.key, k: pet.k, n: pet.n, c: pet.c, xp: pet.xp, r: it.r | 0, emoji: it.emoji || '', pet};
    }
    if (it.kind === 'acc' || it.kind === 'item'){
      const id = String(it.id || '');
      if (!id || !trTradableAcc(id, it.catalog)) return null;
      return {kind: 'acc', id, n: String(it.n || id).slice(0, 24), e: String(it.e || '🎁').slice(0, 4), r: it.r | 0};
    }
    return null;
  }

  function trHasItem(inv, item){
    inv = trNormalizeInv(inv);
    if (item.kind === 'pet'){
      return inv.pets.some(p => trPetKey(p) === item.key);
    }
    if (item.kind === 'acc'){
      return !!(inv.inv[item.id] || (inv.owned && inv.owned[item.id]));
    }
    return false;
  }

  function trCleanOffer(inv, offer, catalog){
    inv = trNormalizeInv(inv);
    const seen = {}, out = [];
    (Array.isArray(offer) ? offer : []).forEach(raw => {
      const it = trOfferItem(raw);
      if (!it) return;
      const sig = it.kind === 'pet' ? 'pet:' + it.key : 'acc:' + it.id;
      if (seen[sig]) return;
      if (!trHasItem(inv, it)) return;
      if (it.kind === 'acc' && !trTradableAcc(it.id, catalog)) return;
      seen[sig] = 1;
      out.push(it);
    });
    return out;
  }

  function trCanReceive(inv, incoming){
    inv = trNormalizeInv(inv);
    const petsIn = (incoming || []).filter(i => i.kind === 'pet').length;
    return inv.pets.length + petsIn <= TR_PET_MAX;
  }

  function trApplyGive(inv, offer){
    inv = trNormalizeInv(inv);
    const keys = new Set((offer || []).filter(i => i.kind === 'pet').map(i => i.key));
    const accs = new Set((offer || []).filter(i => i.kind === 'acc').map(i => i.id));
    const pets = inv.pets.filter(p => !keys.has(trPetKey(p))).map(p => {
      const acc = Object.assign({}, p.acc || {});
      let changed = false;
      for (const sl in acc) if (accs.has(acc[sl])) { delete acc[sl]; changed = true; }
      return changed ? Object.assign({}, p, {acc}) : p;
    });
    const bag = trInvClean(inv.inv);
    accs.forEach(id => { delete bag[id]; });
    let a = inv.a | 0;
    if (a >= pets.length) a = Math.max(0, pets.length - 1);
    return {pets, inv: bag, a, owned: trInvClean(inv.owned)};
  }

  function trApplyRecv(inv, offer){
    inv = trNormalizeInv(inv);
    const pets = inv.pets.slice();
    const bag = trInvClean(inv.inv);
    (offer || []).forEach(it => {
      if (it.kind === 'pet' && it.pet){
        const p = trClonePet(it.pet);
        p.b = Date.now() + pets.length;
        p.key = trPetKey(p);
        pets.push(p);
      }
      if (it.kind === 'acc' && it.id) bag[it.id] = 1;
    });
    return {pets, inv: bag, a: inv.a | 0, owned: trInvClean(inv.owned)};
  }

  function trSwap(invA, offerA, invB, offerB, catalog){
    const aGive = trCleanOffer(invA, offerA, catalog);
    const bGive = trCleanOffer(invB, offerB, catalog);
    if (!aGive.length && !bGive.length) return {ok: false, why: 'empty'};
    // Re-check live ownership
    for (const it of aGive) if (!trHasItem(invA, it)) return {ok: false, why: 'missing-a'};
    for (const it of bGive) if (!trHasItem(invB, it)) return {ok: false, why: 'missing-b'};
    const aMid = trApplyGive(invA, aGive);
    const bMid = trApplyGive(invB, bGive);
    if (!trCanReceive(aMid, bGive)) return {ok: false, why: 'full-a'};
    if (!trCanReceive(bMid, aGive)) return {ok: false, why: 'full-b'};
    const aNext = trApplyRecv(aMid, bGive);
    const bNext = trApplyRecv(bMid, aGive);
    if (aNext.pets.length > TR_PET_MAX) return {ok: false, why: 'full-a'};
    if (bNext.pets.length > TR_PET_MAX) return {ok: false, why: 'full-b'};
    return {ok: true, why: 'ok', a: aNext, b: bNext, aGive, bGive};
  }

  // Session state machine. Any offer change clears Ready and Confirm.
  function trNewSession(id, aUid, bUid){
    return {
      id: String(id || ''), ph: 'open', a: String(aUid), b: String(bUid),
      offerA: [], offerB: [], readyA: false, readyB: false, confA: false, confB: false
    };
  }

  function trSetOffer(sess, uid, offer, inv, catalog){
    if (!sess || sess.ph === 'done' || sess.ph === 'cancel') return {ok: false, why: sess ? sess.ph : 'none', sess};
    const clean = trCleanOffer(inv, offer, catalog);
    if (uid === sess.a) sess.offerA = clean;
    else if (uid === sess.b) sess.offerB = clean;
    else return {ok: false, why: 'who', sess};
    sess.readyA = sess.readyB = sess.confA = sess.confB = false;
    sess.ph = 'open';
    return {ok: true, why: 'ok', sess};
  }

  function trSetReady(sess, uid, on){
    if (!sess || sess.ph === 'done' || sess.ph === 'cancel') return {ok: false, why: 'closed', sess};
    const want = !!on;
    if (uid === sess.a) sess.readyA = want;
    else if (uid === sess.b) sess.readyB = want;
    else return {ok: false, why: 'who', sess};
    sess.confA = sess.confB = false;
    sess.ph = (sess.readyA && sess.readyB) ? 'ready' : 'open';
    return {ok: true, why: 'ok', sess};
  }

  function trSetConfirm(sess, uid){
    if (!sess || sess.ph === 'done' || sess.ph === 'cancel') return {ok: false, why: 'closed', sess};
    if (!(sess.readyA && sess.readyB)) return {ok: false, why: 'not-ready', sess};
    if (uid === sess.a) sess.confA = true;
    else if (uid === sess.b) sess.confB = true;
    else return {ok: false, why: 'who', sess};
    sess.ph = (sess.confA && sess.confB) ? 'confirm' : 'ready';
    return {ok: true, why: 'ok', sess, both: !!(sess.confA && sess.confB)};
  }

  function trCancel(sess, uid){
    if (!sess) return {ok: true, why: 'ok', sess: {ph: 'cancel'}};
    sess.ph = 'cancel';
    sess.readyA = sess.readyB = sess.confA = sess.confB = false;
    return {ok: true, why: 'ok', sess, by: uid || null};
  }

  function trCommit(sess, invA, invB, catalog){
    if (!sess || sess.ph !== 'confirm' || !(sess.confA && sess.confB)) return {ok: false, why: 'not-confirm', sess};
    const sw = trSwap(invA, sess.offerA, invB, sess.offerB, catalog);
    if (!sw.ok){ sess.readyA = sess.readyB = sess.confA = sess.confB = false; sess.ph = 'open'; return {ok: false, why: sw.why, sess}; }
    sess.ph = 'done';
    return {ok: true, why: 'ok', sess, a: sw.a, b: sw.b, aGive: sw.aGive, bGive: sw.bGive};
  }

  function trHistEntry(now, otherName, gave, got){
    return {
      t: now != null ? +now : Date.now(),
      with: String(otherName || 'Friend').slice(0, 16),
      gave: (gave || []).map(i => i.kind === 'pet' ? (i.n || 'Pet') : (i.n || i.id)),
      got: (got || []).map(i => i.kind === 'pet' ? (i.n || 'Pet') : (i.n || i.id))
    };
  }

  function trLoadHist(raw){
    const o = raw && typeof raw === 'object' ? raw : {};
    const list = Array.isArray(o.list) ? o.list : [];
    return {ver: TR_VER, list: list.slice(0, 20).map(e => ({
      t: +e.t || 0, with: String(e.with || 'Friend').slice(0, 16),
      gave: Array.isArray(e.gave) ? e.gave.slice(0, 8).map(String) : [],
      got: Array.isArray(e.got) ? e.got.slice(0, 8).map(String) : []
    }))};
  }

  const api = {
    TR_KEY, TR_VER, TR_PET_MAX, RARITY_NAMES, TR_BLOCKED_ITEMS,
    trRarityName, trPetKey, trClonePet, trNormalizeInv, trTradableAcc, trOfferItem,
    trHasItem, trCleanOffer, trCanReceive, trApplyGive, trApplyRecv, trSwap,
    trNewSession, trSetOffer, trSetReady, trSetConfirm, trCancel, trCommit,
    trHistEntry, trLoadHist
  };
  root.TRRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
