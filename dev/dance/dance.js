  /* ===================== t227u: 💃 BOSSA BEAT DANCE BATTLE — wider hit window, own win title, AudioContext resume ===================== */
  const DB_KEY = 'rubloxDance', DB_LEN = 45, DB_BPM = 88;
  const DB_PERFECT = .07, DB_GOOD = .18;   // ±70ms perfect, ±180ms good
  const DB_ARROWS = ['ArrowLeft', 'ArrowDown', 'ArrowUp', 'ArrowRight'];
  const DB_LABEL = ['←', '↓', '↑', '→'];
  let db = null, dbAudio = null;
  function dbProg(){ const o = load(DB_KEY, null), r = o && typeof o === 'object' ? o : {}; return {plays: Math.max(0, r.plays | 0), best: Math.max(0, r.best | 0), coins: Math.max(0, +r.coins || 0)}; }
  function dbBeatSec(){ return 60 / DB_BPM; }
  function dbMakeChart(secs){
    const beat = dbBeatSec(), n = Math.floor(secs / beat), chart = [];
    let x = 12345; const rnd = () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return (x >>> 0) / 0x7fffffff; };
    // first 8 beats: slower, one note every other beat (easier intro)
    for (let i = 3; i < n - 2; i++){
      const intro = i < 12, dens = intro ? (i % 2 === 0) : rnd() < .62;
      if (dens) chart.push({t: i * beat, dir: (rnd() * 4) | 0, hit: false, miss: false, score: 0});
    }
    return chart;
  }
  function dbEnsureAudio(){
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC || muted) return null;
      if (!dbAudio || !dbAudio.ac){ dbAudio = {ac: new AC(), t0: 0, started: false}; }
      const ac = dbAudio.ac;
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch (e){ return null; }
  }
  function dbBossaStart(){
    const ac = dbEnsureAudio(); if (!ac || (dbAudio && dbAudio.started)) return;
    dbAudio.started = true; dbAudio.t0 = ac.currentTime + .08;
    const beat = dbBeatSec(), t0 = dbAudio.t0;
    for (let i = 0; i < Math.ceil(DB_LEN / beat) + 2; i++){
      const t = t0 + i * beat;
      const bass = ac.createOscillator(), g = ac.createGain(); bass.type = 'triangle';
      bass.frequency.value = [110, 130.81, 146.83, 164.81][i % 4];
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.055, t + .03); g.gain.exponentialRampToValueAtTime(0.0001, t + beat * .7);
      bass.connect(g); g.connect(ac.destination); bass.start(t); bass.stop(t + beat);
      if (i % 2 === 0){ const hi = ac.createOscillator(), hg = ac.createGain(); hi.type = 'sine'; hi.frequency.value = [523.25, 587.33, 659.25, 698.46][(i / 2 | 0) % 4];
        hg.gain.setValueAtTime(0.0001, t); hg.gain.exponentialRampToValueAtTime(.028, t + .02); hg.gain.exponentialRampToValueAtTime(0.0001, t + .25);
        hi.connect(hg); hg.connect(ac.destination); hi.start(t); hi.stop(t + .3); }
    }
  }
  function dbBossaStop(){ try { if (dbAudio && dbAudio.ac) dbAudio.ac.close(); } catch (e){} dbAudio = null; }
  function buildDance(){
    db = {ph: 'play', t: 0, chart: dbMakeChart(DB_LEN), score: 0, combo: 0, maxCombo: 0, hits: 0, misses: 0, earned: 0, paid: false, pose: 0, remote: mpGuest(), rival: mp.on ? 0 : null, audioArmed: false};
    scene.background = new THREE.Color('#1d2340');
    plat(0, 0, 0, 16, 12, '#2b2d42', .3); plat(0, .35, -2, 6, 4, '#ff6fb5', .3);
    [[-4, '#7fd6ff'], [0, '#ffd23f'], [4, '#c39bff']].forEach(([x, c]) => plat(x, 5, -4, .4, .4, c, .3));
    Object.assign(P, {x: 0, y: .05, z: 1, vx: 0, vy: 0, vz: 0}); P.face = Math.PI; cam.yaw = Math.PI; cam.pitch = .28; cam.dist = 8;
    checkpoints[0] = {idx: 0, spawn: {x: 0, y: .05, z: 1}, flag: new THREE.Object3D()};
  }
  function danceEnter(){ if (!db) return; db.ph = 'play'; db.t = 0; db.paid = false; over = false; choosing = false;
    // prime AudioContext on this user-gesture path (card click / start); resume again on first note key
    dbEnsureAudio(); dbBossaStart();
    banner('💃 Bossa Beat! Hit ←↓↑→ (or A/S/W/D · d-pad) on the beat!'); tipTimer = 6; dbHud(); dbRender(); }
  function danceStop(){ dbBossaStop(); db = null; const el = $('#dbLane'); if (el) el.style.display = 'none'; }
  function dbHit(dir){
    if (!db || db.ph !== 'play' || over) return false;
    dbEnsureAudio(); if (dbAudio && !dbAudio.started) dbBossaStart();
    const now = db.t; let best = null, bd = 9e9;
    db.chart.forEach(n => { if (n.hit || n.miss || n.dir !== dir) return; const d = Math.abs(n.t - now); if (d < bd){ bd = d; best = n; } });
    if (!best || bd > DB_GOOD){ db.combo = 0; db.misses++; db.pose = (db.pose + 1) % 4; dbHud(); dbRender(); return true; }
    best.hit = true; const pts = bd <= DB_PERFECT ? 100 : 60; best.score = pts;
    db.combo++; db.maxCombo = Math.max(db.maxCombo, db.combo);
    db.score += pts + Math.min(50, (db.combo - 1) * 2); db.hits++;
    db.pose = best.dir; SND.cp(); if (pts === 100) banner('🌟 Perfect!'); dbHud(); dbRender(); return true;
  }
  function danceUpdate(dt){
    if (!db || db.ph !== 'play' || over || choosing) return;
    db.t += dt;
    db.chart.forEach(n => { if (!n.hit && !n.miss && n.t < db.t - DB_GOOD){ n.miss = true; db.combo = 0; db.misses++; } });
    if (db.t >= DB_LEN) dbFinish();
    dbHud(); dbRender();
  }
  function danceAnimate(dt){}
  function dbFinish(){
    if (!db || db.paid) return; db.ph = 'done'; db.paid = true; over = true; choosing = true; dbBossaStop();
    const bonus = 10 + Math.floor(db.score / 40), p = dbProg(); p.plays++; p.best = Math.max(p.best, db.score); p.coins += bonus; save(DB_KEY, p);
    setCoins(coins + bonus); db.earned = bonus; runCoins = (runCoins || 0) + bonus; confetti(); SND.win();
    banner('💃 Dance done! Score ' + db.score + ' · best combo ' + db.maxCombo + ' · +' + bonus + ' 🪙');
    const em = $('#oWinEmoji'), title = $('#oWinTitle'); if (em) em.textContent = '💃'; if (title) title.textContent = 'Bossa Beat complete!';
    $('#oWin').classList.add('show');
    $('#oWinStats').innerHTML = '💃 Bossa Beat results<br>⭐ Score <b>' + db.score + '</b><br>🔥 Best combo <b>' + db.maxCombo + '</b> · last combo ' + db.combo + '<br>✅ ' + db.hits + ' hits · 😅 ' + db.misses + ' misses<br>🎁 +' + bonus + ' Rublox Coins';
  }
  function dbHud(){ if (!db) return; const n = $('#dbN'); if (n) n.textContent = '💃 ' + db.score + ' · 🔥' + db.combo + ' (best ' + db.maxCombo + ') · ⏱️' + Math.max(0, Math.ceil(DB_LEN - db.t)); }
  function dbRender(){
    if (!db) return; const el = $('#dbLane'); if (!el) return; el.style.display = 'flex';
    const now = db.t, window = 2.0;   // visual lead-in matches timing feel
    const notes = db.chart.filter(n => !n.hit && !n.miss && n.t >= now - .15 && n.t <= now + window);
    // hit line at 12% from bottom; note bottom% = 12 + ((t-now)/window)*100 so at t==now note sits on the ▼
    el.innerHTML = '<div class="dbhit">▼</div>' + notes.map(n => {
      const y = 10 + ((n.t - now) / window) * 100; return '<div class="dbnote d' + n.dir + '" style="bottom:' + y + '%">' + DB_LABEL[n.dir] + '</div>';
    }).join('');
  }
  function dbPad(jp){
    if (!db || db.ph !== 'play') return false;
    if (jp.left) return dbHit(0); if (jp.down) return dbHit(1); if (jp.up) return dbHit(2); if (jp.right) return dbHit(3);
    return false;
  }
  function dbKey(e){
    if (!db || e.repeat || paused) return false;
    const map = {ArrowLeft: 0, KeyA: 0, ArrowDown: 1, KeyS: 1, ArrowUp: 2, KeyW: 2, ArrowRight: 3, KeyD: 3};
    if (e.code in map){ dbHit(map[e.code]); return true; }
    return false;
  }
  function dbPose(){ if (!db || db.ph !== 'play') return null; const poses = [
    {lL: -.2, lR: .4, aL: -1.6, aR: .3, lean: .05}, {lL: .5, lR: -.3, aL: .2, aR: -1.5, lean: -.05},
    {lL: -.4, lR: -.4, aL: -2.0, aR: -2.0, lean: 0}, {lL: .3, lR: .3, aL: -1.2, aR: 1.0, lean: .1}];
    return Object.assign({lLo: 0, lRo: 0, aLo: 0, aRo: 0}, poses[db.pose % 4]); }
