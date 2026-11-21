  /* ---------- Afterbell School ---------- */
  let sc = null;
  function scKeep(m){ if (m && sc && sc.trash) sc.trash.push(m); return m; }
  function scMat(c,o){ return new THREE.MeshLambertMaterial(Object.assign({color:c, side:THREE.DoubleSide}, o||{})); }
  function scMesh(geo,c,x,y,z){ const m=new THREE.Mesh(geo, scMat(c)); m.position.set(x,y,z); scene.add(m); return scKeep(m); }
  function scState(){ return SchoolRules.scLoad(typeof load === 'function' ? load(SchoolRules.SC_KEY, null) : null); }
  function scSave(s){ if (typeof save === 'function') save(SchoolRules.SC_KEY, s); if (sc) sc.sv = s; }
  function scLab(text,x,y,z){ try { if (typeof t297Lab === 'function'){ const m = t297Lab(text,x,y,z); if (m) return scKeep(m); } } catch(e){} return null; }
  function scHud(text, act){
    const hint = document.getElementById('scHint'); if (hint) hint.textContent = text || '';
    const btn = document.getElementById('scAct');
    if (btn){ if (act){ btn.textContent = act; btn.classList.add('show'); } else btn.classList.remove('show'); }
  }
  function drawSchool(ctx){
    if (typeof sky === 'function') sky(ctx, '#141018', '#2a2038');
    else { ctx.fillStyle='#141018'; ctx.fillRect(0,0,320,200); }
    ctx.fillStyle='#2a2438'; ctx.fillRect(40,70,240,90);
    ctx.fillStyle='#1a1624'; ctx.fillRect(60,90,40,50); ctx.fillRect(220,90,40,50);
    ctx.fillStyle='#ffe566'; ctx.fillRect(150,110,20,50);
    ctx.font='22px sans-serif'; ctx.fillText('🏫', 148, 70); ctx.fillText('🕯️', 80, 80);
    if (typeof guy === 'function') guy(ctx, 160, 176, 12, '#8b5cf6');
  }
  function scWall(x,y,z,w,h,d,c){
    // plat(x, top, z, w, d, color, h): y is the floor of the wall, h is its height
    const b = plat(x, y + h, z, w, d, c, h);
    if (b && b.mesh){ b.mesh.material = scMat(c); scKeep(b.mesh); }
    if (b && sc) sc.solids.push(b);
    return b;
  }
  function scSplitWall(along, a0, a1, fixed, gaps, color){
    const h = SchoolRules.SC_WALL_H, doorH = SchoolRules.SC_DOOR_H, th = 0.42;
    const opens = (gaps||[]).map(g => ({a:g.c - g.w/2, b:g.c + g.w/2})).sort((p,q)=>p.a-q.a);
    let cursor = a0;
    function seg(lo, hi, y, hh){
      if (hi-lo < 0.15) return;
      const mid=(lo+hi)/2, len=hi-lo;
      if (along==='x') scWall(mid, y, fixed, len, hh, th, color);
      else scWall(fixed, y, mid, th, hh, len, color);
    }
    opens.forEach(op => { seg(cursor, op.a, 0, h); seg(op.a, op.b, doorH, Math.max(0.2, h-doorH)); cursor = op.b; });
    seg(cursor, a1, 0, h);
  }
  function scApplyMood(){
    if (!sc) return;
    const less = !!sc.sv.lessScary;
    if (typeof scene !== 'undefined' && scene){
      scene.background = new THREE.Color(less?'#2a2650':'#141018');
      if (scene.fog){ scene.fog.color.copy(scene.background); scene.fog.near = less?20:12; scene.fog.far = less?85:55; }
    }
    (sc.trash||[]).forEach(m => {
      if (!m) return;
      if (m.isHemisphereLight){ m.intensity = less?1.15:0.7; try{ m.color.set(less?0xa0a8d8:0x5a5878);}catch(e){} }
      if (m.isPointLight){ m.intensity = less?1.5:0.9; m.distance = less?32:26; }
    });
  }
  function scPaintLess(){
    const b=document.getElementById('scLessBtn'); if(!b||!sc) return;
    b.textContent = sc.sv.lessScary ? '😈 Really scary' : '😌 Less scary';
  }
  function scPaintGoreNote(){
    const n=document.getElementById('scGoreNote'); if(!n||!sc) return;
    let raw='off';
    try { raw = (typeof goreSetting==='function') ? goreSetting() : 'off'; } catch(e){}
    const note = (typeof GoreRules!=='undefined' && GoreRules.goreCapNote) ? GoreRules.goreCapNote(raw, !!sc.sv.lessScary) : '';
    if (note){ n.textContent=note; n.classList.add('show'); n.hidden=false; } else { n.textContent=''; n.classList.remove('show'); n.hidden=true; }
  }
  function scClearGore(){
    if (!sc) return;
    (sc.gore||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    sc.gore=[];
  }
  function scRebuildGore(){
    if (!sc || typeof GoreRules==='undefined') return;
    scClearGore(); scPaintGoreNote();
    let raw='off';
    try { raw = (typeof goreSetting==='function') ? goreSetting() : 'off'; } catch(e){}
    const list = GoreRules.goreDecalsFor('school', raw, {lessScary: !!sc.sv.lessScary}) || [];
    list.forEach(d => {
      const col = d.kind==='scratch' ? '#6a1018' : '#7a1a22';
      const m = new THREE.Mesh(d.kind==='scratch' ? new THREE.BoxGeometry(d.sx||0.04, d.sy||0.7, d.sz||0.2) : new THREE.CylinderGeometry((d.sx||1)*0.5,(d.sz||0.7)*0.45,d.sy||0.03,8), new THREE.MeshBasicMaterial({color:col, transparent:true, opacity:0.8, depthWrite:false}));
      m.position.set(d.x, d.y, d.z); m.rotation.y = d.yaw||0; m.raycast=function(){};
      scene.add(m); scKeep(m); sc.gore.push(m);
    });
  }
  function scMakeWarden(){
    const g = new THREE.Group();
    const less = !!(sc && sc.sv && sc.sv.lessScary);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, less?2.4:3.1, 0.45), scMat(less?'#4a3f6a':'#1a1424'));
    body.position.y = less?1.3:1.6; g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.5), scMat('#2a2438'));
    head.position.y = less?2.6:3.15; g.add(head);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08,6,5), new THREE.MeshBasicMaterial({color: less?'#ffe566':'#cfe6ff'}));
    eye.position.set(-0.12, less?2.65:3.2, 0.26); g.add(eye);
    const eye2 = eye.clone(); eye2.position.x=0.12; g.add(eye2);
    const pass = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.04), new THREE.MeshBasicMaterial({color:'#ffe566'}));
    pass.position.set(0.4, less?1.4:1.7, 0.2); g.add(pass);
    scene.add(g); scKeep(g); return g;
  }
  function buildSchool(){
    const started = SchoolRules.scNewVisit(scState());
    sc = {trash:[], solids:[], gore:[], sv: started.state, run: started.run, warden:null, near:null};
    scSave(started.state);
    try { checkpoints[0] = {idx:0, spawn:{x:0,y:0.5,z:24}, flag:new THREE.Object3D()}; } catch(e){}
    const less = !!sc.sv.lessScary;
    scene.background = new THREE.Color(less?'#242044':'#141018');
    if (scene.fog){ scene.fog.color.copy(scene.background); scene.fog.near = less?18:12; scene.fog.far = less?80:55; }
    const hemi = new THREE.HemisphereLight(less?0x8a90c0:0x5a5878, 0x1a1020, less?0.95:0.7); scene.add(hemi); scKeep(hemi);
    const lamp = new THREE.PointLight('#ffd8a0', less?1.4:1.0, 32); lamp.position.set(0, 4.2, 8); scene.add(lamp); scKeep(lamp);
    const wall = less?'#4a4568':'#3a3552';
    SchoolRules.SC_ROOMS.forEach(r => {
      const fl = plat(r.x, 0, r.z, r.w, r.d, r.color, 0.28);
      if (fl && fl.mesh) scKeep(fl.mesh);
      const ceil = scMesh(new THREE.BoxGeometry(r.w+0.2, 0.2, r.d+0.2), '#1a1624', r.x, SchoolRules.SC_WALL_H, r.z);
      scLab(r.name, r.x, 2.6, r.z - r.d/2 + 1.2);
    });
    function scBuildRoomWalls(color){
      const doors = SchoolRules.SC_DOORS || [];
      SchoolRules.SC_ROOMS.forEach(r => {
        const x0=r.x-r.w/2, x1=r.x+r.w/2, z0=r.z-r.d/2, z1=r.z+r.d/2;
        const gaps = (axis, fixed) => doors.filter(d => {
          if (axis==='x' && d.axis==='z' && Math.abs(d.z-fixed)<0.25 && d.x>=x0-0.2 && d.x<=x1+0.2) return true;
          if (axis==='z' && d.axis==='x' && Math.abs(d.x-fixed)<0.25 && d.z>=z0-0.2 && d.z<=z1+0.2) return true;
          return false;
        }).map(d => ({c: d.axis==='z' ? d.x : d.z, w: d.w}));
        scSplitWall('x', x0, x1, z0, gaps('x', z0), color);
        scSplitWall('x', x0, x1, z1, gaps('x', z1), color);
        scSplitWall('z', z0, z1, x0, gaps('z', x0), color);
        scSplitWall('z', z0, z1, x1, gaps('z', x1), color);
      });
    }
    scBuildRoomWalls(wall);
    [ [0,4.2,22], [0,4.2,0], [-22,4.2,0], [22,4.2,0], [-22,4.2,-26], [22,4.2,-26] ].forEach(p => {
      const lamp2 = new THREE.PointLight('#ffd8a0', less?1.2:0.85, 26);
      lamp2.position.set(p[0], p[1], p[2]); scene.add(lamp2); scKeep(lamp2);
    });
    // warm window slits so hallways stay readable
    [[-7.7,3.2,6],[7.7,3.2,6],[-7.7,3.2,-6],[7.7,3.2,-6],[-7.7,3.2,20],[7.7,3.2,20]].forEach(p => {
      const w = scMesh(new THREE.BoxGeometry(0.08, 1.4, 1.1), less?'#ffe9a0':'#c9a24a', p[0], p[1], p[2]);
      if (w && w.material){ w.material = new THREE.MeshBasicMaterial({color: less?'#ffe9a0':'#c9a24a'}); }
    });
    // visible locked front doors on the north wall
    scMesh(new THREE.BoxGeometry(1.5, 3.6, 0.16), less?'#6a4a2a':'#3a2418', -1.0, 1.8, 29.6);
    scMesh(new THREE.BoxGeometry(1.5, 3.6, 0.16), less?'#6a4a2a':'#3a2418', 1.0, 1.8, 29.6);
    const glow = scMesh(new THREE.BoxGeometry(0.2, 0.2, 0.08), '#ffe566', 0, 2.4, 29.7);
    if (glow && glow.material) glow.material = new THREE.MeshBasicMaterial({color:'#ffe566'});
        // props
    scMesh(new THREE.BoxGeometry(1.2, 2.4, 0.5), '#3d3228', 0, 1.2, -6); // locker
    scLab('🔒 Locker', 0, 2.8, -6);
    scMesh(new THREE.BoxGeometry(2.4, 1.2, 0.12), '#2a4a2a', -26, 1.8, 8.8); // chalkboard
    scLab('📝 Chalkboard', -26, 3.0, 8.2);
    scMesh(new THREE.BoxGeometry(1.4, 1.1, 0.8), '#5a3a22', 26, 0.7, -2);
    scLab('📚 Library desk', 26, 2.2, -2);
    scLab('4', 26, 2.0, -30); scLab('1', -26, 2.4, -30); scLab('8', -30, 2.6, 0);
    scLab('🚪 Front doors', 0, 3.0, 29);
    if (P){ P.x=0; P.y=0.5; P.z=20; }
    if (typeof cam!=='undefined' && cam){ cam.pitch=0.12; cam.dist=7; cam.yaw=0; }
    sc.warden = scMakeWarden();
    scRebuildGore(); scPaintLess(); scApplyMood();
    const box=document.getElementById('scBox'); if(box) box.style.display='block';
    banner(less ? '🌙 Afterbell School. Less scary is on — the Hush Warden is slower and easier to see. Solve the puzzles and walk out. If it finds you, everyone is okay.' : '🌙 Afterbell School. You are locked in after dark. Solve the chalkboard, locker, and hall pass, and slip past the Hush Warden. If it finds you, everyone is okay.');
  }
  function scEnter(){
    if (P){ P.x=0; P.y=0.5; P.z=20; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam!=='undefined' && cam){ cam.yaw=0; cam.pitch=0.12; cam.dist=7; }
  }
  function scPrompt(){
    if (!sc || !P) return null;
    if (Math.hypot(P.x, P.z-(-6)) < 1.8) return {kind:'locker', act:'🔒 Open'};
    if (Math.hypot(P.x-(-26), P.z-4) < 2.0) return {kind:'board', act:'📝 Read'};
    if (Math.hypot(P.x-26, P.z-(-2)) < 1.8 && sc.sv.pass) return {kind:'pass', act:'🎫 Hall pass'};
    SchoolRules.SC_DIGITS.forEach(d => { /* handled below */ });
    for (let i=0;i<(SchoolRules.SC_DIGITS||[]).length;i++){
      const d=SchoolRules.SC_DIGITS[i];
      if (Math.hypot(P.x-d.x, P.z-d.z) < d.r && (sc.sv.digits||[]).indexOf(d.id)<0) return {kind:'digit', id:d.id, n:d.n, act:'🔍 Look'};
    }
    if (Math.hypot(P.x, P.z-29) < 2.0) return {kind:'exit', act: sc.sv.pass ? '🚪 Leave' : '🚪 Locked'};
    return null;
  }
  function scOpenLocker(){
    const body=document.getElementById('scLockerBody');
    if (sc.sv.locker){ if(body) body.textContent = 'The locker is open. You already have the hall pass.'; }
    else if (body) body.textContent = sc.sv.riddle || (sc.sv.digits||[]).length>=3 ? 'Enter the three-digit code (hint: 4, 1, and 8).' : 'The locker needs a code. Search the school, or solve the chalkboard riddle first.';
    const inp=document.getElementById('scLockerIn'); if(inp) inp.value='';
    if (typeof t297OverlayShow==='function') t297OverlayShow('scLocker', true);
    else { const el=document.getElementById('scLocker'); if(el) el.classList.add('show'); }
  }
  function scTryLocker(){
    const inp=document.getElementById('scLockerIn');
    const r = SchoolRules.scOpenLocker(sc.sv, inp ? inp.value : '');
    if (!r.ok){ banner(r.why==='code' ? 'That code does not work yet.' : 'Find the clues first.'); return; }
    scSave(r.state); banner('🎫 The locker clicks open. You have a hall pass!');
    if (typeof t297OverlayClose==='function') t297OverlayClose('scLocker');
    SchoolRules.scSetCheckpoint(sc.run, 'hall');
  }
  function scOpenBoard(){
    const q=document.getElementById('scBoardQ');
    if (q) q.textContent = SchoolRules.SC_RIDDLE.prompt;
    const box=document.getElementById('scBoardChoices');
    if (box){
      box.innerHTML = SchoolRules.SC_RIDDLE.choices.map(c => `<button type="button" data-ans="${c}">${c.toUpperCase()}</button>`).join(' ');
      box.querySelectorAll('[data-ans]').forEach(b => { b.onclick = ev => { ev.preventDefault(); scAnswer(b.getAttribute('data-ans')); }; });
    }
    if (typeof t297OverlayShow==='function') t297OverlayShow('scBoard', true);
  }
  function scAnswer(ans){
    const r = SchoolRules.scSolveRiddle(sc.sv, ans);
    if (!r.ok){ banner('Not that one. Look at the clue again!'); return; }
    scSave(r.state);
    banner('📝 Yes — a book! The chalkboard now shows the locker code: ' + r.code + '.');
    if (typeof t297OverlayClose==='function') t297OverlayClose('scBoard');
    SchoolRules.scSetCheckpoint(sc.run, 'class');
  }
  function scAct(){
    if (!sc) return false;
    const p = scPrompt();
    if (!p) return false;
    if (p.kind==='locker'){ scOpenLocker(); return true; }
    if (p.kind==='board'){ scOpenBoard(); return true; }
    if (p.kind==='digit'){
      const r=SchoolRules.scFindDigit(sc.sv, p.id);
      if (r.ok){ scSave(r.state); banner('You found a ' + r.n + '!' + (r.left?(' ' + (3-r.left) + '/3 digits.'):' That is all three digits.')); }
      return true;
    }
    if (p.kind==='pass'){ banner('🎫 You already have the hall pass. Take it to the front doors.'); return true; }
    if (p.kind==='exit'){
      const r=SchoolRules.scEscape(sc.sv);
      if (!r.ok){ banner('The front doors are locked. You need a hall pass.'); return true; }
      scSave(r.state);
      try { if (typeof confetti==='function') confetti(); } catch(e){}
      if (typeof t297Pay==='function') t297Pay(r.reward, '🌙 Afterbell');
      else if (typeof setCoins==='function') try { setCoins(coins + r.reward); } catch(e){}
      const body=document.getElementById('scWinBody');
      if (body) body.textContent = 'The front doors swing open onto the quiet street. Everyone is okay!' + (r.reward?(' +'+r.reward+' 🪙'):'');
      if (typeof t297OverlayShow==='function') t297OverlayShow('scWin', true);
      banner('🌙 You made it out of Afterbell School! Everyone is okay!');
      return true;
    }
    return false;
  }
  function scToggleLess(){
    if (!sc) return;
    sc.sv = SchoolRules.scSetLessScary(sc.sv, !sc.sv.lessScary);
    scSave(sc.sv);
    if (sc.warden){ try{ scene.remove(sc.warden);}catch(e){} }
    sc.warden = scMakeWarden();
    scRebuildGore(); scPaintLess(); scApplyMood();
    banner(sc.sv.lessScary ? 'Less scary is on. The Hush Warden is slower and easier to see. Getting caught still means everyone is okay.' : 'Really scary is on. The Hush Warden is sneakier, but light and hiding spots still keep you safe.');
  }
  function scUpdate(dt){
    if (!sc) return;
    const hide = SchoolRules.scNearHide(P.x, P.z);
    SchoolRules.scTickWarden(sc.run, dt, {lessScary:!!sc.sv.lessScary, px:P.x, pz:P.z, hidden:!!hide});
    if (sc.warden){
      sc.warden.position.set(sc.run.wx||0, 0, sc.run.wz||0);
      if (P) sc.warden.lookAt(P.x, 1.6, P.z);
    }
    if (sc.run.caught){
      const r = sc.run.respawn || {x:0,y:0.5,z:24};
      P.x=r.x; P.y=r.y; P.z=r.z; P.vy=0;
      sc.run.caught=false;
      banner('The Hush Warden found you… but everyone is okay! Back to your last checkpoint.');
    }
    const p = scPrompt();
    sc.near = p;
    if (p) scHud(p.kind==='exit' && !sc.sv.pass ? 'The front doors are locked. Find a hall pass.' : 'E / Ⓧ — ' + (p.act||'act') + '.', p.act||'✨ Do it');
    else if (hide) scHud('You are tucked out of sight. The Hush Warden will walk by.', '');
    else scHud('Explore Afterbell after dark. Solve the chalkboard, locker, and hall pass. If the Hush Warden finds you, everyone is okay.', '');
    scPaintGoreNote();
  }
  function scKey(e){
    if (!sc || !e) return false;
    if (typeof t297EatOverlayKey === 'function' && t297EatOverlayKey(e)) return true;
    // QA t332u: the global keyup handler also routes here. Act once per fresh keydown.
    if (e.type === 'keyup') return false;
    const c = e.code || e.key;
    if (e.repeat && (c === 'KeyE' || c === 'KeyF' || c === 'KeyL' || c === 'KeyY' || c === 'Enter')) return true;
    if (c === 'KeyE' || c === 'KeyF'){ if(!e.repeat) scAct(); return true; }
    if (c === 'KeyL' || c === 'KeyY'){ if(!e.repeat) scToggleLess(); return true; }
    if (c === 'Enter' && document.getElementById('scLocker') && document.getElementById('scLocker').classList.contains('show')){ scTryLocker(); return true; }
    return false;
  }
  function scPad(jp, s){
    if (!sc || !jp) return false;
    if (typeof t297EatOverlayPad === 'function' && t297EatOverlayPad(jp)) return true;
    if (jp[2] || jp[7]){ scAct(); if (typeof pad!=='undefined') pad.jump=false; return true; }
    if (jp[3]){ scToggleLess(); return true; }
    return false;
  }
  function schoolStop(){
    if (!sc) return;
    (sc.solids||[]).forEach(b => { try{ b.active=false; if (typeof solids!=='undefined'){ const i=solids.indexOf(b); if(i>=0) solids.splice(i,1);} }catch(e){} });
    (sc.trash||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    sc=null;
    const box=document.getElementById('scBox'); if(box) box.style.display='none';
    ['scAct','scLessBtn'].forEach(id => { const n=document.getElementById(id); if(n) n.classList.remove('show'); });
    const note=document.getElementById('scGoreNote'); if(note){ note.classList.remove('show'); note.hidden=true; }
    if (typeof t297OverlayClose === 'function')['scLocker','scBoard','scWin'].forEach(id => t297OverlayClose(id));
  }
  if (typeof window !== 'undefined') window.scDebug = {
    hall(){ if(!sc) return; sc.sv.lessScary=false; scSave(sc.sv); scPaintLess(); scApplyMood(); if(P){P.x=0;P.y=0.5;P.z=6;} if(sc.warden) sc.warden.position.set(2,0,-2); if(typeof cam!=='undefined'&&cam){cam.yaw=0.15;cam.pitch=0.08;cam.dist=11;} try{ if(obbyDebug&&obbyDebug.camLook) obbyDebug.camLook({x:5,y:3.4,z:12},{x:0,y:1.6,z:-1}); }catch(e){} },
    less(){ if(!sc) return; sc.sv.lessScary=true; scSave(sc.sv); if(sc.warden){try{scene.remove(sc.warden);}catch(e){}} sc.warden=scMakeWarden(); scRebuildGore(); scPaintLess(); scApplyMood(); if(P){P.x=0;P.y=0.5;P.z=6;} if(sc.warden) sc.warden.position.set(2,0,-2); if(typeof cam!=='undefined'&&cam){cam.yaw=0.15;cam.pitch=0.08;cam.dist=11;} try{ if(obbyDebug&&obbyDebug.camLook) obbyDebug.camLook({x:5,y:3.4,z:12},{x:0,y:1.6,z:-1}); }catch(e){} }
  };
  try {
    const less=document.getElementById('scLessBtn'); if(less && !less.__sc){ less.__sc=true; less.onclick=ev=>{ev.preventDefault();ev.stopPropagation();scToggleLess();}; }
    const act=document.getElementById('scAct'); if(act && !act.__sc){ act.__sc=true; act.onclick=ev=>{ev.preventDefault();ev.stopPropagation();scAct();}; }
    const go=document.getElementById('scLockerGo'); if(go && !go.__sc){ go.__sc=true; go.onclick=ev=>{ev.preventDefault();scTryLocker();}; }
    const wc=document.getElementById('scWinClose'); if(wc && !wc.__sc){ wc.__sc=true; wc.onclick=ev=>{ev.preventDefault(); if(typeof t297OverlayClose==='function') t297OverlayClose('scWin');}; }
    ['scLockerX','scBoardX','scWinX'].forEach(id => { const x=document.getElementById(id); if(x && !x.__sc){ x.__sc=true; x.onclick=ev=>{ev.preventDefault(); if(typeof t297OverlayClose==='function') t297OverlayClose(id.replace('X','').replace('scL','scL')==='scLocker'||true); const map={scLockerX:'scLocker',scBoardX:'scBoard',scWinX:'scWin'}; if(typeof t297OverlayClose==='function') t297OverlayClose(map[id]); }; } });
  } catch(e){}
