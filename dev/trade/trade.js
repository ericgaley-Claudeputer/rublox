  /* ---------- Friend trades (t295u) — same-room, host-authoritative, no free-text ---------- */
  let trs = null; // local view of the open session
  let trHist = null;
  let trUiOffer = [];
  let trDemo = false;
  const TR_API = (typeof TRRules !== 'undefined' && TRRules) ? TRRules : (typeof window !== 'undefined' ? window.TRRules : null);

  function trUid(){ return (typeof mp !== 'undefined' && mp && mp.on && mp.me) ? String(mp.me) : 'me'; }
  function trNameOf(uid){
    try {
      if (typeof mp === 'undefined' || !mp) return 'Friend';
      if (uid === mp.me) return (typeof playerName === 'function' ? playerName() : (load('rubloxPlayer', {}) || {}).name) || 'You';
      if (mp.host && mp.guests){ for (const g of mp.guests.values()) if (g.uid === uid) return g.name || 'Friend'; }
      if (mp.roster){ const r = mp.roster.find(x => x.uid === uid || x.id === uid); if (r) return r.name || 'Friend'; }
    } catch (e){}
    return 'Friend';
  }

  function trAccCatalog(){
    const map = {};
    try { if (typeof ACC !== 'undefined') ACC.forEach(a => { map[a.id] = {n: a.n, e: a.e, r: a.r | 0, price: a.p | 0}; }); } catch (e){}
    return map;
  }

  function trPetEmoji(k){
    try { if (typeof PET_KINDS !== 'undefined' && PET_KINDS[k] && PET_KINDS[k].emoji) return PET_KINDS[k].emoji; } catch (e){}
    return '🐾';
  }

  function trPetRare(k){
    try { if (typeof PET_KINDS !== 'undefined' && PET_KINDS[k] && PET_KINDS[k].r != null) return PET_KINDS[k].r | 0; } catch (e){}
    return 0;
  }

  function trMyInv(){
    let pets = [], inv = {};
    try {
      if (typeof pt !== 'undefined' && pt && pt.s){ pets = (pt.s.pets || []).slice(); inv = Object.assign({}, pt.s.inv || {}); }
      else if (typeof load === 'function'){
        const s = load('rubloxPets', null);
        if (s){ pets = (s.pets || []).slice(); inv = Object.assign({}, s.inv || {}); }
      }
    } catch (e){}
    return {pets, inv, a: 0};
  }

  function trApplyInv(next){
    if (!next) return;
    try {
      if (typeof pt !== 'undefined' && pt && pt.s){
        pt.s.pets = next.pets.slice();
        pt.s.inv = Object.assign({}, next.inv || {});
        if (pt.s.a >= pt.s.pets.length) pt.s.a = Math.max(0, pt.s.pets.length - 1);
        if (typeof petsSave === 'function') petsSave();
        try { if (!pt.s.pets.length) pt.pet = null; else if (typeof spawnPet === 'function') spawnPet(); } catch (e){}
        return;
      }
    } catch (e){}
    try {
      const s = (typeof load === 'function' ? load('rubloxPets', {pets: [], inv: {}}) : {pets: [], inv: {}});
      s.pets = next.pets.slice(); s.inv = Object.assign({}, next.inv || {});
      if (typeof save === 'function') save('rubloxPets', s);
    } catch (e){}
  }

  function trBagList(){
    const inv = trMyInv();
    const cat = trAccCatalog();
    const out = [];
    inv.pets.forEach(p => {
      out.push({kind: 'pet', key: TR_API.trPetKey(p), k: p.k, n: p.n, e: trPetEmoji(p.k), r: trPetRare(p.k), pet: p});
    });
    Object.keys(inv.inv || {}).forEach(id => {
      if (!inv.inv[id]) return;
      const a = cat[id] || {n: id, e: '🎁', r: 0, price: 1};
      if (!TR_API.trTradableAcc(id, cat)) return;
      out.push({kind: 'acc', id, n: a.n, e: a.e || '🎁', r: a.r | 0});
    });
    return out;
  }

  function trOfferedHas(offer, it){
    return (offer || []).some(x => x.kind === it.kind && (it.kind === 'pet' ? x.key === it.key : x.id === it.id));
  }

  function trLoadHist(){
    try { trHist = TR_API.trLoadHist(typeof load === 'function' ? load(TR_API.TR_KEY, null) : null); }
    catch (e){ trHist = {ver: 1, list: []}; }
    return trHist;
  }

  function trSaveHist(entry){
    const h = trLoadHist();
    h.list.unshift(entry);
    h.list = h.list.slice(0, 20);
    trHist = h;
    try { save(TR_API.TR_KEY, h); } catch (e){}
  }

  function trInRoom(){ return !!(typeof mp !== 'undefined' && mp && mp.on); }

  function trOthers(){
    const out = [];
    if (!trInRoom()) return out;
    try {
      if (mp.host && mp.guests){
        for (const g of mp.guests.values()) if (g.ready && g.uid) out.push({uid: g.uid, name: g.name || 'Friend', x: g.x, z: g.z});
      } else if (mp.roster){
        (mp.roster || []).forEach(r => {
          const uid = r.uid || r.id;
          if (uid && uid !== mp.me) out.push({uid, name: r.name || 'Friend', x: r.x, z: r.z});
        });
      }
    } catch (e){}
    return out;
  }

  function trNearPeer(){
    if (typeof P === 'undefined' || !P) return null;
    let best = null, bestD = 5;
    trOthers().forEach(o => {
      if (o.x == null || o.z == null) { if (!best) best = o; return; }
      const d = Math.hypot((o.x) - P.x, (o.z) - P.z);
      if (d < bestD){ bestD = d; best = o; }
    });
    if (best && (best.x == null || bestD < 5)) return best;
    return trOthers().length === 1 ? trOthers()[0] : best;
  }

  function trSend(msg){
    if (trDemo) return;
    try {
      if (typeof mp !== 'undefined' && mp && mp.host) trHostOn(trUid(), msg);
      else if (typeof mpSend === 'function') mpSend(Object.assign({t: 'tr'}, msg));
    } catch (e){}
  }

  function trHostSendTo(uid, msg){
    if (!mp || !mp.host) return;
    try {
      if (uid === mp.me){ trFromHost(Object.assign({t: 'tr'}, msg)); return; }
      for (const g of mp.guests.values()) if (g.uid === uid && g.conn) mpSendTo(g.conn, Object.assign({t: 'tr'}, msg));
    } catch (e){}
  }

  function trHostBroadcastSess(){
    if (!trs || !mp || !mp.host) return;
    const msg = {t: 'tr', a: 'state', id: trs.id, aUid: trs.a, bUid: trs.b, offerA: trs.offerA, offerB: trs.offerB, readyA: !!trs.readyA, readyB: !!trs.readyB, confA: !!trs.confA, confB: !!trs.confB, ph: trs.ph};
    trHostSendTo(trs.a, msg);
    trHostSendTo(trs.b, msg);
  }

  function trBegin(withUid){
    if (!TR_API || !withUid) return;
    if (!trInRoom()){ try { banner('🤝 Trades work when you and a friend are in the same room.'); } catch (e){} return; }
    if (withUid === trUid()) return;
    if (trs && trs.ph !== 'done' && trs.ph !== 'cancel'){ try { banner('🤝 Finish or cancel your open trade first.'); } catch (e){} return; }
    trSend({a: 'req', to: withUid});
    try { banner('🤝 Trade request sent!'); } catch (e){}
  }

  function trHostOnReq(fromUid, toUid){
    if (!mp || !mp.host || !TR_API) return;
    const ids = [mp.me].concat([...mp.guests.values()].filter(g => g.ready).map(g => g.uid));
    if (ids.indexOf(fromUid) < 0 || ids.indexOf(toUid) < 0) return;
    if (trs && trs.ph !== 'done' && trs.ph !== 'cancel'){
      trHostSendTo(fromUid, {a: 'busy'});
      return;
    }
    const id = 'tr' + Date.now().toString(36);
    trs = TR_API.trNewSession(id, fromUid, toUid);
    trHostSendTo(fromUid, {a: 'ask', id, from: fromUid, to: toUid, name: trNameOf(fromUid)});
    trHostSendTo(toUid, {a: 'ask', id, from: fromUid, to: toUid, name: trNameOf(fromUid)});
  }

  function trHostOn(fromUid, d){
    if (!mp || !mp.host || !d) return;
    if (d.a === 'req'){ trHostOnReq(fromUid, String(d.to || '')); return; }
    if (d.a === 'accept'){
      if (!trs || trs.id !== d.id) return;
      trs.ph = 'open';
      trHostSendTo(trs.a, {a: 'open', id: trs.id, aUid: trs.a, bUid: trs.b});
      trHostSendTo(trs.b, {a: 'open', id: trs.id, aUid: trs.a, bUid: trs.b});
      return;
    }
    if (d.a === 'decline' || d.a === 'cancel'){
      if (trs && (!d.id || trs.id === d.id)){
        TR_API.trCancel(trs, fromUid);
        trHostSendTo(trs.a, {a: 'cancel', id: trs.id});
        trHostSendTo(trs.b, {a: 'cancel', id: trs.id});
        trs = null;
      }
      return;
    }
    if (!trs || trs.id !== d.id) return;
    if (trs.a !== fromUid && trs.b !== fromUid) return;
    if (d.a === 'offer'){
      // Host trusts the offered ids but re-checks ownership at commit using last known bags.
      TR_API.trSetOffer(trs, fromUid, d.items || [], d.inv || {pets: [], inv: {}}, trAccCatalog());
      // Keep raw offers if inv wasn't sent — still store items; commit will re-validate live bags.
      if (fromUid === trs.a) trs.offerA = TR_API.trCleanOffer(d.inv || trs._invA || {pets:[]}, d.items || [], trAccCatalog()) || (d.items || []);
      if (fromUid === trs.b) trs.offerB = d.items || [];
      if (d.inv){ if (fromUid === trs.a) trs._invA = d.inv; else trs._invB = d.inv; }
      trs.readyA = trs.readyB = trs.confA = trs.confB = false;
      trs.ph = 'open';
      trHostBroadcastSess();
      return;
    }
    if (d.a === 'ready'){
      if (d.inv){ if (fromUid === trs.a) trs._invA = d.inv; else if (fromUid === trs.b) trs._invB = d.inv; }
      TR_API.trSetReady(trs, fromUid, !!d.on);
      trHostBroadcastSess();
      return;
    }
    if (d.a === 'confirm'){
      if (d.inv){ if (fromUid === trs.a) trs._invA = d.inv; else if (fromUid === trs.b) trs._invB = d.inv; }
      TR_API.trSetConfirm(trs, fromUid);
      if (trs.ph === 'confirm'){
        const invA = trs._invA, invB = trs._invB;
        if (!invA || !invB){ trs.ph = 'open'; trs.confA = trs.confB = trs.readyA = trs.readyB = false; trHostBroadcastSess(); return; }
        const done = TR_API.trCommit(trs, invA, invB, trAccCatalog());
        if (!done.ok){
          trHostSendTo(trs.a, {a: 'fail', id: trs.id, why: done.why});
          trHostSendTo(trs.b, {a: 'fail', id: trs.id, why: done.why});
          trHostBroadcastSess();
          return;
        }
        trHostSendTo(trs.a, {a: 'done', id: trs.id, inv: done.a, gave: done.aGive, got: done.bGive, with: trNameOf(trs.b)});
        trHostSendTo(trs.b, {a: 'done', id: trs.id, inv: done.b, gave: done.bGive, got: done.aGive, with: trNameOf(trs.a)});
        trs = null;
        return;
      }
      trHostBroadcastSess();
    }
  }

  function trCancelLocal(reason){
    const had = trs;
    if (had && had.id && !trDemo) trSend({a: 'cancel', id: had.id});
    trs = null; trUiOffer = [];
    trHideAsk();
    trPaint();
    const p = document.getElementById('trPanel'); if (p) p.classList.remove('show');
    if (reason) try { banner(reason); } catch (e){}
  }

  function trOnDrop(uid){
    if (!trs) return;
    if (trs.a === uid || trs.b === uid || uid === 'host'){
      if (mp && mp.host && trs){
        const a = trs.a, b = trs.b, id = trs.id;
        TR_API.trCancel(trs, uid);
        try { trHostSendTo(a, {a: 'cancel', id}); trHostSendTo(b, {a: 'cancel', id}); } catch (e){}
        trs = null;
      }
      trCancelLocal('🤝 Trade cancelled — a player left the room.');
    }
  }

  function trFromGuest(g, d){
    if (!d || d.t !== 'tr') return;
    const uid = g && g.uid;
    if (!uid) return;
    trHostOn(uid, d);
  }

  function trShowAsk(d){
    const box = document.getElementById('trAsk');
    if (!box) return;
    const nm = (d && d.name) ? String(d.name).slice(0, 16) : 'A friend';
    const msg = document.getElementById('trAskMsg');
    if (msg) msg.textContent = '🤝 ' + nm + ' wants to trade!';
    box.dataset.id = d.id || '';
    box.classList.add('show');
  }

  function trHideAsk(){ const box = document.getElementById('trAsk'); if (box) box.classList.remove('show'); }

  function trFromHost(d){
    if (!d || d.t !== 'tr' && d.a && !d.t) d.t = 'tr';
    if (!d || (d.t && d.t !== 'tr')) return;
    if (d.a === 'busy'){ try { banner('🤝 They are already in a trade.'); } catch (e){} return; }
    if (d.a === 'ask'){
      trs = TR_API.trNewSession(d.id, d.from || d.aUid, d.to || d.bUid);
      // The requester opened the ask; the other player sees Accept.
      if (trUid() === (d.to || d.bUid) || (d.to && d.to === trUid())) trShowAsk(d);
      else try { banner('🤝 Waiting for ' + (d.name || 'your friend') + ' to accept…'); } catch (e){}
      return;
    }
    if (d.a === 'open' || d.a === 'state'){
      trHideAsk();
      trs = trs || TR_API.trNewSession(d.id, d.aUid, d.bUid);
      trs.id = d.id; trs.a = d.aUid || trs.a; trs.b = d.bUid || trs.b;
      if (d.offerA) trs.offerA = d.offerA;
      if (d.offerB) trs.offerB = d.offerB;
      if (d.readyA != null) trs.readyA = !!d.readyA;
      if (d.readyB != null) trs.readyB = !!d.readyB;
      if (d.confA != null) trs.confA = !!d.confA;
      if (d.confB != null) trs.confB = !!d.confB;
      if (d.ph) trs.ph = d.ph;
      const p = document.getElementById('trPanel'); if (p) p.classList.add('show');
      if (d.a === 'open'){ try { trPushOffer(); } catch (e){} }
      trPaint();
      return;
    }
    if (d.a === 'cancel' || d.a === 'fail'){
      trs = null; trUiOffer = [];
      trHideAsk();
      const p = document.getElementById('trPanel'); if (p) p.classList.remove('show');
      try { banner(d.a === 'fail' ? '🤝 Trade could not finish. Check your items and try again.' : '🤝 Trade cancelled.'); } catch (e){}
      return;
    }
    if (d.a === 'done'){
      trApplyInv(d.inv);
      try { trSaveHist(TR_API.trHistEntry(Date.now(), d.with || 'Friend', d.gave || [], d.got || [])); } catch (e){}
      try { if (typeof achNote === 'function') achNote('trade-done'); } catch (e){}
      trs = {id: d.id, ph: 'done', a: 'me', b: 'them', offerA: d.gave || [], offerB: d.got || [], readyA: true, readyB: true, confA: true, confB: true, done: d};
      const p = document.getElementById('trPanel'); if (p) p.classList.add('show');
      trPaint(true);
      try { if (typeof SND !== 'undefined' && SND.win) SND.win(); } catch (e){}
      try { banner('🤝 Trade complete!'); } catch (e){}
      setTimeout(() => { const p2 = document.getElementById('trPanel'); if (p2 && trs && trs.ph === 'done') p2.classList.remove('show'); trs = null; trUiOffer = []; }, 2800);
    }
  }

  function trRarityBadge(r){
    const n = TR_API.trRarityName(r);
    return '<small class="trrare r' + (r | 0) + '">' + n + '</small>';
  }

  function trItemHtml(it, opts){
    opts = opts || {};
    const on = opts.on ? ' on' : '';
    const e = it.e || (it.kind === 'pet' ? trPetEmoji(it.k) : '🎁');
    const name = it.n || it.id || 'Item';
    const key = it.kind === 'pet' ? ('pet:' + it.key) : ('acc:' + it.id);
    return '<button type="button" class="trit' + on + '" data-tr="' + key + '" ' + (opts.disabled ? 'disabled' : '') + '><span class="tre">' + e + '</span><span class="trn">' + name + '</span>' + trRarityBadge(it.r) + '</button>';
  }

  function trMine(){ return trs && trUid() === trs.a; }
  function trMyOffer(){ return trs ? (trMine() ? trs.offerA : trs.offerB) : trUiOffer; }
  function trTheirOffer(){ return trs ? (trMine() ? trs.offerB : trs.offerA) : []; }
  function trImReady(){ return trs ? (trMine() ? trs.readyA : trs.readyB) : false; }
  function trTheyReady(){ return trs ? (trMine() ? trs.readyB : trs.readyA) : false; }
  function trImConf(){ return trs ? (trMine() ? trs.confA : trs.confB) : false; }
  function trTheyConf(){ return trs ? (trMine() ? trs.confB : trs.confA) : false; }

  function trPushOffer(){
    if (!trs || trs.ph === 'done' || trs.ph === 'cancel') return;
    trSend({a: 'offer', id: trs.id, items: trUiOffer, inv: trMyInv()});
  }

  function trPaint(confirmed){
    const pan = document.getElementById('trPanel');
    if (!pan) return;
    const done = !!(confirmed || (trs && trs.ph === 'done'));
    const other = trs ? trNameOf(trMine() ? trs.b : trs.a) : 'Friend';
    const title = document.getElementById('trTitle');
    if (title) title.textContent = done ? '🤝 Trade complete!' : ('Trade with ' + other);
    const bagEl = document.getElementById('trBag');
    const mineEl = document.getElementById('trMine');
    const theirsEl = document.getElementById('trTheirs');
    const status = document.getElementById('trStatus');
    const readyBtn = document.getElementById('trReady');
    const confBtn = document.getElementById('trConfirm');
    const mineOffer = trUiOffer.length ? trUiOffer : trMyOffer();
    if (!trUiOffer.length && mineOffer && mineOffer.length) trUiOffer = mineOffer.slice();
    if (bagEl){
      const bag = trBagList();
      bagEl.innerHTML = bag.length ? bag.map(it => trItemHtml(it, {on: trOfferedHas(trUiOffer, it), disabled: done})).join('') : '<div class="trempty">No tradable pets or items yet.</div>';
      bagEl.querySelectorAll('.trit').forEach(b => {
        b.onclick = ev => {
          ev.preventDefault(); ev.stopPropagation();
          if (done) return;
          const sig = b.getAttribute('data-tr');
          const it = bag.find(x => (x.kind === 'pet' ? ('pet:' + x.key) : ('acc:' + x.id)) === sig);
          if (!it) return;
          if (trOfferedHas(trUiOffer, it)) trUiOffer = trUiOffer.filter(x => !(x.kind === it.kind && (it.kind === 'pet' ? x.key === it.key : x.id === it.id)));
          else trUiOffer = trUiOffer.concat([it]);
          trPushOffer();
          trPaint();
        };
      });
    }
    if (mineEl) mineEl.innerHTML = (trUiOffer.length ? trUiOffer : mineOffer).map(it => trItemHtml(it, {disabled: true})).join('') || '<div class="trempty">Tap your items to offer them.</div>';
    if (theirsEl) theirsEl.innerHTML = trTheirOffer().map(it => trItemHtml(it, {disabled: true})).join('') || '<div class="trempty">Waiting for their offer…</div>';
    const bothReady = !!(trImReady() && trTheyReady());
    if (status){
      if (done) status.textContent = '✅ Items swapped — nothing was duplicated or lost.';
      else if (bothReady && trImConf() && !trTheyConf()) status.textContent = 'Waiting for ' + other + ' to confirm…';
      else if (bothReady && trTheyConf() && !trImConf()) status.textContent = other + ' confirmed — your turn!';
      else if (bothReady) status.textContent = 'Both ready — press Confirm to swap.';
      else if (trImReady()) status.textContent = 'Ready! Waiting for ' + other + '…';
      else if (trTheyReady()) status.textContent = other + ' is ready. Press Ready when your offer looks good.';
      else status.textContent = 'Add items, then both press Ready, then both press Confirm.';
    }
    if (readyBtn){
      readyBtn.disabled = done;
      readyBtn.textContent = trImReady() ? '✅ Ready' : 'Ready';
      readyBtn.className = 'big ' + (trImReady() ? 'green' : '');
    }
    if (confBtn){
      confBtn.disabled = done || !bothReady;
      confBtn.textContent = trImConf() ? '✅ Confirm' : 'Confirm';
      confBtn.className = 'big ' + (bothReady && !confBtn.disabled ? 'green' : 'gray');
    }
    pan.classList.toggle('trdone', done);
  }

  function trOpenDemo(done){
    trDemo = true;
    const aPet = {k: 'dog', n: 'Pip', c: 0, xp: 12, f: 80, u: 80, e: 80, b: 11, acc: {}, g: 'g'};
    const bPet = {k: 'cat', n: 'Mochi', c: 1, xp: 20, f: 80, u: 80, e: 80, b: 22, acc: {}, g: 'g'};
    trs = TR_API.trNewSession('demo', 'me', 'friend');
    trs.offerA = [{kind: 'pet', key: TR_API.trPetKey(aPet), k: 'dog', n: 'Pip', e: '🐶', r: 0, pet: aPet}, {kind: 'acc', id: 'bow', n: 'Bow', e: '🎀', r: 0}];
    trs.offerB = [{kind: 'pet', key: TR_API.trPetKey(bPet), k: 'cat', n: 'Mochi', e: '🐱', r: 0, pet: bPet}, {kind: 'acc', id: 'hat', n: 'Party Hat', e: '🥳', r: 1}];
    trUiOffer = trs.offerA.slice();
    if (done){ trs.ph = 'done'; trs.readyA = trs.readyB = trs.confA = trs.confB = true; }
    else { trs.ph = 'open'; }
    const p = document.getElementById('trPanel'); if (p) p.classList.add('show');
    trPaint(!!done);
  }

  function trBind(){
    if (window.__trBound) return;
    window.__trBound = true;
    const ready = document.getElementById('trReady');
    const conf = document.getElementById('trConfirm');
    const can = document.getElementById('trCancel');
    const close = document.getElementById('trClose');
    if (ready) ready.onclick = ev => { ev.preventDefault(); if (!trs || trs.ph === 'done') return; trSend({a: 'ready', id: trs.id, on: !trImReady(), inv: trMyInv()}); };
    if (conf) conf.onclick = ev => { ev.preventDefault(); if (!trs || !(trImReady() && trTheyReady())) return; trSend({a: 'confirm', id: trs.id, inv: trMyInv()}); };
    if (can) can.onclick = ev => { ev.preventDefault(); if (trDemo){ trDemo = false; trCancelLocal(); return; } trCancelLocal('🤝 Trade cancelled.'); };
    if (close) close.onclick = ev => { ev.preventDefault(); if (trs && trs.ph !== 'done' && !trDemo) trCancelLocal('🤝 Trade cancelled.'); else { trDemo = false; const p = document.getElementById('trPanel'); if (p) p.classList.remove('show'); trs = null; } };
    const yes = document.getElementById('trAskYes');
    const no = document.getElementById('trAskNo');
    if (yes) yes.onclick = ev => { ev.preventDefault(); const box = document.getElementById('trAsk'); trHideAsk(); if (box && box.dataset.id) trSend({a: 'accept', id: box.dataset.id}); };
    if (no) no.onclick = ev => { ev.preventDefault(); const box = document.getElementById('trAsk'); trHideAsk(); if (box && box.dataset.id) trSend({a: 'decline', id: box.dataset.id}); };
    const tbtn = document.getElementById('oTradeBtn');
    if (tbtn) tbtn.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); const n = trNearPeer(); if (n) trBegin(n.uid); else if (trOthers()[0]) trBegin(trOthers()[0].uid); else try { banner('🤝 Join a room with a friend, then stand near them and press Trade.'); } catch (e){} };
    const pbtn = document.getElementById('trPauseBtn');
    if (pbtn) pbtn.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); const n = trNearPeer() || trOthers()[0]; if (n) trBegin(n.uid); else try { banner('🤝 Join a room with a friend first, then trade.'); } catch (e){} };
  }

  function trTickHud(){
    const b = document.getElementById('oTradeBtn');
    if (b) b.style.display = (trInRoom() && (typeof running !== 'undefined' ? running : true)) ? '' : 'none';
  }
