  /* ---------- Daily Quests (t295u) — coins for 3 local-day tasks, new save key only ---------- */
  let qState = null, qNeedPaint = true;
  const Q_API = (typeof QRules !== 'undefined' && QRules) ? QRules : (typeof window !== 'undefined' ? window.QRules : null);

  function qNow(){ return (typeof window !== 'undefined' && window.__qNow != null) ? window.__qNow : Date.now(); }

  function qPersist(s){
    qState = s;
    try { save(Q_API.Q_KEY, {ver: s.ver, day: s.day, quests: s.quests, bonusClaimed: !!s.bonusClaimed, streak: s.streak | 0, lastAllDay: s.lastAllDay || '', totalClaimed: s.totalClaimed | 0}); } catch (e){}
    qNeedPaint = true;
    try { if (typeof achSweep === 'function') achSweep({silent: true, pay: true, source: 'quests'}); } catch (e){}
    return s;
  }

  function qEnsure(){
    if (!Q_API) return null;
    const raw = (typeof load === 'function') ? load(Q_API.Q_KEY, null) : null;
    const s = Q_API.qLoad(qState || raw, qNow());
    if (!qState || s.day !== (qState && qState.day) || JSON.stringify(s.quests) !== JSON.stringify(qState.quests)) qPersist(s);
    else qState = s;
    return qState;
  }

  function qNoteHook(ev, n){
    if (!Q_API || !ev) return;
    try {
      const s = qEnsure();
      if (!s) return;
      const r = Q_API.qNote(s, ev, n, qNow());
      if (r.changed) qPersist(r.state);
    } catch (e){}
  }

  function qNoteEv(ev, data){
    if (!ev) return;
    const evs = [String(ev)];
    if (ev === 'play' && data && data.mode) evs.push('play:' + data.mode);
    if (ev === 'lh:ride') evs.push('lh-ride');
    qNoteHook(evs, 1);
  }

  function qAward(amt, label){
    if (!(amt > 0)) return;
    try {
      const cur = (typeof coins === 'number') ? coins : ((typeof load === 'function' ? load('rubloxCoins', 0) : 0) | 0);
      setCoins(cur + amt);
    } catch (e){}
    try { if (typeof toast === 'function') toast((label || 'Quest complete!') + ' +' + amt + ' 🪙'); } catch (e){}
    try { if (typeof SND !== 'undefined' && SND.coin) SND.coin(); } catch (e){}
  }

  function qOnClaim(id){
    const s = qEnsure(); if (!s || !Q_API) return;
    const r = Q_API.qClaim(s, id, qNow());
    if (!r.ok) return;
    qPersist(r.state);
    qAward(r.coins, 'Quest claimed!');
    try { if (r.first && typeof achNote === 'function') achNote('quest-first'); } catch (e){}
    if (r.all){
      try { if (typeof achNote === 'function') achNote('quest-bonus'); } catch (e){}
      if ((r.streak | 0) >= 7){ try { if (typeof achNote === 'function') achNote('quest-streak7'); } catch (e){} }
    }
    qPaint();
  }

  function qOnBonus(){
    const s = qEnsure(); if (!s || !Q_API) return;
    const r = Q_API.qClaimBonus(s, qNow());
    if (!r.ok) return;
    qPersist(r.state);
    qAward(r.coins, 'All 3 done — bonus!');
    try { if (typeof achNote === 'function') achNote('quest-bonus'); } catch (e){}
    if ((r.streak | 0) >= 7){ try { if (typeof achNote === 'function') achNote('quest-streak7'); } catch (e){} }
    try { if (typeof confetti === 'function') confetti(); } catch (e){}
    qPaint();
  }

  function qCardHtml(q, compact){
    const pct = Math.max(0, Math.min(100, Math.round((q.progress / Math.max(1, q.goal)) * 100)));
    const ready = !q.claimed && q.progress >= q.goal;
    const st = q.claimed ? 'claimed' : (ready ? 'ready' : 'open');
    const btn = q.claimed ? '<span class="qdone">✅ Claimed</span>' : (ready ? '<button class="big green qclaim" data-qid="' + q.id + '">Claim +' + q.reward + ' 🪙</button>' : '<span class="qwait">' + q.progress + ' / ' + q.goal + '</span>');
    return '<div class="qcard ' + st + '"><div class="qtop"><span class="qem">' + q.emoji + '</span><div><b>' + q.title + '</b><small>' + q.desc + '</small></div></div><div class="qbar"><u style="width:' + pct + '%"></u></div><div class="qrow">' + btn + '</div></div>';
  }

  function qPaint(){
    if (!Q_API) return;
    const v = Q_API.qView(qEnsure(), qNow());
    const list = v.quests.map(q => qCardHtml(q)).join('');
    const bonus = v.canBonus
      ? '<button class="big green" id="qBonusBtn">🎁 All 3 done — claim +' + v.bonus + ' bonus 🪙</button>'
      : (v.all && v.bonusClaimed ? '<div class="qbonusdone">🎁 Daily bonus claimed — see you tomorrow!</div>' : '<div class="qbonuswait">Finish all 3 for a +' + v.bonus + ' 🪙 bonus</div>');
    const streak = '🔥 ' + (v.streak | 0) + ' day streak';
    const fill = (root, listId, bonusId, streakId) => {
      const L = root && (typeof root === 'string' ? document.querySelector(root) : root);
      if (!L) return;
      const listEl = L.querySelector(listId) || (L.id === listId.slice(1) ? L : null);
    };
    const set = (id, html) => { const n = document.getElementById(id); if (n) n.innerHTML = html; };
    const setT = (id, txt) => { const n = document.getElementById(id); if (n) n.textContent = txt; };
    set('qList', list);
    set('qListG', list);
    set('qBonusRow', bonus);
    set('qBonusRowG', bonus);
    setT('qStreak', streak);
    setT('qStreakG', streak);
    document.querySelectorAll('.qclaim').forEach(b => { b.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); qOnClaim(b.getAttribute('data-qid')); }; });
    const bb = document.getElementById('qBonusBtn');
    if (bb) bb.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); qOnBonus(); };
    qNeedPaint = false;
  }

  function qOpen(on){
    qEnsure(); qPaint();
    const p = document.getElementById('qPanel');
    if (p) p.classList.toggle('show', on !== false);
    if (on !== false){ try { if (typeof SND !== 'undefined' && SND.cp) SND.cp(); } catch (e){} }
  }

  function qClose(){ const p = document.getElementById('qPanel'); if (p) p.classList.remove('show'); }

  function qBind(){
    if (window.__qBound) return;
    window.__qBound = true;
    const openers = ['qOpenBtn', 'oQuestBtn', 'qPauseBtn'];
    openers.forEach(id => { const n = document.getElementById(id); if (n) n.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); qOpen(true); }); });
    const x = document.getElementById('qClose');
    if (x) x.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); qClose(); });
    const pan = document.getElementById('qPanel');
    if (pan) pan.addEventListener('click', ev => { if (ev.target === pan) qClose(); });
    qEnsure(); qPaint();
  }
