  /* ---------- Leaderboard (t296u) — personal bests + friends in this room, no backend ---------- */
  let lbState = null, lbRoom = {}, lbTab = 'me';
  const LB_API = (typeof LBRules !== 'undefined' && LBRules) ? LBRules : (typeof window !== 'undefined' ? window.LBRules : null);

  function lbPersist(s){
    lbState = s;
    try { if (typeof save === 'function') save(LB_API.LB_KEY, s); } catch (e){}
    return s;
  }

  function lbEnsure(){
    if (!LB_API) return null;
    if (lbState) return lbState;
    try { lbState = LB_API.lbLoad(typeof load === 'function' ? load(LB_API.LB_KEY, null) : null); }
    catch (e){ lbState = LB_API.lbFresh(); }
    return lbState;
  }

  function lbSaves(){
    const L = (k, d) => { try { return typeof load === 'function' ? load(k, d) : d; } catch (e){ return d; } };
    return {
      tower: L('rubloxTower', null),
      obby: L('rubloxObby', null),
      race: L('rubloxRace', null),
      splash: L('rubloxSplash2', null),
      lava: L('rubloxLavaBest', 0),
      nds: L('rubloxNdsBest', 0),
      quests: L('rubloxQuests', null),
      lantern: L('rubloxLantern', null),
      season: L('rubloxSeason', null),
      board: evStateOrBoard()
    };
  }

  function evStateOrBoard(){ return lbEnsure(); }

  function lbMine(){
    if (!LB_API) return {};
    return LB_API.lbSnapshot(lbSaves(), lbEnsure() && lbEnsure().best);
  }

  function lbRecord(id, value){
    if (!LB_API) return;
    const r = LB_API.lbNote(lbEnsure(), id, value);
    if (r.ok) lbPersist(r.state);
    lbPaint();
    lbShare();
    return r;
  }

  function lbFromSeason(){ lbPaint(); lbShare(); }

  function lbFmtTime(v){
    const m = Math.floor(v / 60), s = v - m * 60;
    return m + ':' + s.toFixed(1).padStart(4, '0');
  }

  function lbPaintMe(){
    if (!LB_API) return;
    const box = document.getElementById('lbMe'); if (!box) return;
    const rows = LB_API.lbView(lbMine());
    if (!rows.length){
      box.innerHTML = '<div class="lbempty">Play some games to fill your best scores! Everything here is saved on this device.</div>';
      return;
    }
    box.innerHTML = rows.map(r => '<div class="lbrow"><span class="lbem">' + r.emoji + '</span><span class="lbname">' + r.name + '</span><b>' + LB_API.lbFmt(r.id, r.value, lbFmtTime) + '</b></div>').join('');
  }

  function lbPaintRoom(){
    if (!LB_API) return;
    const box = document.getElementById('lbRoom'); if (!box) return;
    const inRoom = !!(typeof mp !== 'undefined' && mp && mp.on);
    const note = document.getElementById('lbRoomNote');
    if (note) note.textContent = inRoom
      ? 'Live scores from friends in this room. Names are the ones already used in the game.'
      : 'Join a room with a friend to compare your best scores live. There is no online server — just this room.';
    const list = [];
    const mineName = (() => { try { const p = typeof load === 'function' ? load('rubloxPlayer', {}) : {}; return (p && p.name) || 'You'; } catch (e){ return 'You'; } })();
    const myUid = (typeof mp !== 'undefined' && mp && mp.me) ? mp.me : 'me';
    list.push({uid: myUid, name: mineName, scores: lbMine()});
    Object.keys(lbRoom).forEach(uid => {
      if (uid === myUid) return;
      list.push(lbRoom[uid]);
    });
    if (!inRoom && list.length <= 1){
      box.innerHTML = '<div class="lbempty">No friends in a room right now. Host or join a game, and their best scores will show up here.</div>';
      return;
    }
    const cats = (LB_API.LB_ROWS || []).filter(r => list.some(p => p.scores && p.scores[r.id] != null));
    if (!cats.length){
      box.innerHTML = '<div class="lbempty">No shared scores in this room yet. Play a game, then come back!</div>';
      return;
    }
    box.innerHTML = cats.map(r => {
      const ranked = LB_API.lbRoomTable(list, r.id);
      if (!ranked.length) return '';
      return '<div class="lbcat"><h3>' + r.emoji + ' ' + r.name + '</h3>' +
        ranked.map(p => '<div class="lbrow"><span class="lbrank">' + p.rank + '</span><span class="lbname">' + p.name + '</span><b>' + p.text + '</b></div>').join('') + '</div>';
    }).join('');
  }

  function lbPaint(){
    lbPaintMe();
    lbPaintRoom();
    document.querySelectorAll('[data-lbtab]').forEach(b => b.classList.toggle('on', b.getAttribute('data-lbtab') === lbTab));
    const me = document.getElementById('lbMe');
    const rm = document.getElementById('lbRoomWrap');
    if (me) me.style.display = lbTab === 'me' ? '' : 'none';
    if (rm) rm.style.display = lbTab === 'room' ? '' : 'none';
  }

  function lbSetTab(tab){ lbTab = tab === 'room' ? 'room' : 'me'; lbPaint(); }

  function lbShare(){
    if (typeof mp === 'undefined' || !mp || !mp.on || !LB_API) return;
    const msg = {t: 'lb', a: 'mine', scores: LB_API.lbWire(lbMine())};
    try {
      if (mp.host){ lbFromGuest({uid: mp.me, name: (load('rubloxPlayer', {}) || {}).name || 'You'}, msg); }
      else if (typeof mpSend === 'function') mpSend(msg);
    } catch (e){}
  }

  function lbBroadcastRoom(){
    if (!mp || !mp.host) return;
    const list = Object.keys(lbRoom).map(uid => ({uid, name: lbRoom[uid].name, scores: lbRoom[uid].scores}));
    const msg = {t: 'lb', a: 'room', list};
    try { if (typeof mpBroadcast === 'function') mpBroadcast(msg); } catch (e){}
  }

  function lbFromGuest(g, d){
    if (!d || d.t !== 'lb' || !mp || !mp.host) return;
    if (d.a === 'mine'){
      const uid = (g && g.uid) || 'g';
      const name = (g && g.name) || 'Friend';
      lbRoom[uid] = {uid, name: LB_API.lbCleanName(name), scores: LB_API.lbWire(d.scores)};
      lbBroadcastRoom();
      lbPaint();
    }
  }

  function lbFromHost(d){
    if (!d || d.t !== 'lb') return;
    if (d.a === 'room' && Array.isArray(d.list)){
      const next = {};
      d.list.forEach(p => {
        if (!p || !p.uid) return;
        next[p.uid] = {uid: p.uid, name: LB_API.lbCleanName(p.name), scores: LB_API.lbWire(p.scores)};
      });
      lbRoom = next;
      lbPaint();
    }
  }

  function lbOnJoin(){ lbShare(); }
  function lbOnLeave(uid){
    if (uid && lbRoom[uid]){ delete lbRoom[uid]; if (mp && mp.host) lbBroadcastRoom(); lbPaint(); }
    if (uid === 'host'){ lbRoom = {}; lbPaint(); }
  }

  function lbDemoRoom(){
    const mine = lbMine();
    if (!mine['tower-best']) mine['tower-best'] = 12;
    if (!mine['obby-done']) mine['obby-done'] = 4;
    lbRoom = {
      friend: {uid: 'friend', name: 'Sam', scores: {'tower-best': 20, 'obby-done': 2, 'quest-streak': 3, 'snow-toss': 9}},
      pal: {uid: 'pal', name: 'Riley', scores: {'tower-best': 8, 'obby-done': 7, 'lava-best': 15}}
    };
    lbTab = 'room';
    lbPaint();
  }

  function lbBind(){
    if (window.__lbBound) return;
    window.__lbBound = true;
    lbEnsure();
    document.querySelectorAll('[data-lbtab]').forEach(b => b.addEventListener('click', ev => { ev.preventDefault(); lbSetTab(b.getAttribute('data-lbtab')); }));
    lbPaint();
  }
