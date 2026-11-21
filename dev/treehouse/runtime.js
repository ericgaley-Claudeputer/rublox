  /* ---------- Oakheart Treehouse ---------- */
  let th = null;
  function thKeep(m){ if (m && th && th.trash) th.trash.push(m); return m; }
  function thMat(c,o){ return new THREE.MeshLambertMaterial(Object.assign({color:c, side:THREE.DoubleSide}, o||{})); }
  function thMesh(geo,c,x,y,z){ const m=new THREE.Mesh(geo, thMat(c)); m.position.set(x,y,z); scene.add(m); return thKeep(m); }
  function thState(){ return TreehouseRules.thLoad(typeof load === 'function' ? load(TreehouseRules.TH_KEY, null) : null); }
  function thSave(s){ if (typeof save === 'function') save(TreehouseRules.TH_KEY, s); if (th) th.sv = s; }
  function thLab(text,x,y,z){ try { if (typeof t297Lab === 'function'){ const m = t297Lab(text,x,y,z); if (m) return thKeep(m); } } catch(e){} return null; }
  function thHud(text, act){
    const hint = document.getElementById('thHint'); if (hint) hint.textContent = text || '';
    const btn = document.getElementById('thAct');
    if (btn){ if (act){ btn.textContent = act; btn.classList.add('show'); } else btn.classList.remove('show'); }
  }
  function drawTreehouse(ctx){
    if (typeof sky === 'function') sky(ctx, '#8fd3ff', '#d8ffe0');
    else { ctx.fillStyle='#8fd3ff'; ctx.fillRect(0,0,320,200); }
    ctx.fillStyle='#2f8f4a'; ctx.fillRect(0,140,320,60);
    ctx.fillStyle='#6b3a1d'; ctx.fillRect(140,60,40,90);
    ctx.fillStyle='#2f8f4a'; ctx.beginPath(); ctx.arc(160,70,70,0,6.3); ctx.fill();
    ctx.fillStyle='#c45c1a'; ctx.fillRect(175,100,50,12);
    ctx.font='22px sans-serif'; ctx.fillText('🏠', 186, 98); ctx.fillText('🪵', 80, 130);
    if (typeof guy === 'function') guy(ctx, 110, 176, 12, '#3a86ff');
  }
  function thGhostCell(){
    if (!th || !P) return {gx:1, gz:0, level: th.sv.level|0};
    const c = TreehouseRules.TH_CELL;
    return {gx: Math.round(P.x / c), gz: Math.round(P.z / c), level: th.sv.level|0};
  }
  function thBuildPiece(piece){
    if (!th || !piece) return;
    const w = TreehouseRules.thWorld(piece.gx, piece.gz, piece.level);
    const y = w.y;
    const k = piece.kind;
    if (k === 'platform' || k === 'room'){
      const fl = plat(w.x, y, w.z, 2.5, 2.5, k==='room' ? '#c48a4a' : '#8d5524', 0.22);
      if (fl && fl.mesh) thKeep(fl.mesh);
      if (fl) th.solids.push(fl);
    }
    if (k === 'room'){
      const wall = '#b8793a', h = 4.4, thk = 0.28, gap = TreehouseRules.TH_DOOR_W, doorH = TreehouseRules.TH_DOOR_H;
      // four walls, door on +z. plat() takes the TOP of the box.
      [[0, 1.25, 2.5, thk],[0,-1.25,2.5,thk],[-1.25,0,thk,2.5]].forEach(s => {
        const b = plat(w.x+s[0], y + h, w.z+s[1], s[2], s[3], wall, h);
        if (b && b.mesh) thKeep(b.mesh); if (b) th.solids.push(b);
      });
      // south wall with door
      const side = (2.5 - gap) / 2;
      [-1,1].forEach(sign => {
        const mid = w.z + 1.25;
        const b = plat(w.x + sign * (gap/2 + side/2), y + h, mid, side, thk, wall, h);
        if (b && b.mesh) thKeep(b.mesh); if (b) th.solids.push(b);
      });
      const lintel = plat(w.x, y + h, w.z + 1.25, gap, thk, wall, h - doorH);
      if (lintel && lintel.mesh) thKeep(lintel.mesh); if (lintel) th.solids.push(lintel);
    }
    if (k === 'ladder' || k === 'rope'){
      const col = k==='rope' ? '#c47a3a' : '#8d5524';
      thMesh(new THREE.BoxGeometry(k==='rope'?0.12:0.4, TreehouseRules.TH_LEVEL + 0.4, 0.12), col, w.x, y + TreehouseRules.TH_LEVEL * 0.5, w.z);
    }
    if (k === 'slide'){
      const s = thMesh(new THREE.BoxGeometry(0.8, 0.16, 3.2), '#3a86ff', w.x, y + 0.4, w.z + 1.2);
      s.rotation.x = -0.6;
    }
    if (k === 'zip'){
      thMesh(new THREE.CylinderGeometry(0.12, 0.16, 2.4, 6), '#4a4a4a', w.x, y + 1.2, w.z);
    }
    if (k === 'rail') thMesh(new THREE.BoxGeometry(2.2, 0.16, 0.12), '#6b3a1d', w.x, y + 1.1, w.z + 1.1);
    if (k === 'roof'){ const r = thMesh(new THREE.ConeGeometry(1.8, 1.4, 4), '#c23d4b', w.x, y + 5.2, w.z); r.rotation.y = Math.PI/4; }
    if (k === 'lamp') thMesh(new THREE.SphereGeometry(0.22, 8, 6), '#ffe566', w.x, y + 1.6, w.z);
    if (k === 'flag') thMesh(new THREE.BoxGeometry(0.7, 0.4, 0.08), '#ff6fb5', w.x + 0.3, y + 1.8, w.z);
    if (k === 'chair') thMesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), '#6b3a1d', w.x, y + 0.45, w.z);
    if (k === 'table') thMesh(new THREE.BoxGeometry(0.9, 0.4, 0.9), '#8d5524', w.x, y + 0.55, w.z);
    if (k === 'hammock') thMesh(new THREE.BoxGeometry(1.4, 0.12, 0.6), '#3a86ff', w.x, y + 0.7, w.z);
    if (k === 'planter') thMesh(new THREE.BoxGeometry(0.6, 0.3, 0.4), '#2f8f4a', w.x, y + 0.35, w.z);
    th.meshes[piece.id] = true;
  }
  function thClear(){
    if (!th) return;
    (th.solids||[]).forEach(b => { try{ b.active=false; if (typeof solids!=='undefined'){ const i=solids.indexOf(b); if(i>=0) solids.splice(i,1);} }catch(e){} });
    (th.trash||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    th.trash = []; th.solids = []; th.meshes = {};
  }
  function thRebuildPieces(){
    const keepTree = th.tree || [];
    thClear();
    th.tree = keepTree;
    thBuildTree();
    (th.sv.pieces||[]).forEach(thBuildPiece);
  }
  function thBuildTree(){
    const trunk = thMesh(new THREE.CylinderGeometry(TreehouseRules.TH_TRUNK_R, TreehouseRules.TH_TRUNK_R+0.3, 16, 10), '#6b3a1d', 0, 8, 0);
    [6, 9, 12, 15].forEach((y,i) => {
      const leaf = thMesh(new THREE.SphereGeometry(4.2 - i*0.4, 10, 8), '#2f8f4a', 0, y+2, 0);
    });
    thLab('🌳 Oakheart', 0, 17, 0);
    const ground = plat(0, 0, 0, 48, 48, '#1d6a38', 0.25);
    if (ground && ground.mesh) thKeep(ground.mesh);
    if (ground) th.solids.push(ground);
    const trunkR = (TreehouseRules.TH_TRUNK_R || 2.2) * 1.6;
    const trunkSolid = plat(0, 16, 0, trunkR, trunkR, '#6b3a1d', 16);
    if (trunkSolid && trunkSolid.mesh){ trunkSolid.mesh.visible = false; thKeep(trunkSolid.mesh); }
    if (trunkSolid) th.solids.push(trunkSolid);
  }
  function thPaintPalette(){
    const box = document.getElementById('thPaletteList');
    if (!box || !th) return;
    box.innerHTML = TreehouseRules.TH_KINDS.map(k => {
      const on = th.sv.kind === k.id ? ' on' : '';
      return `<div class="t297row"><span>${k.emoji} ${k.name}</span><button type="button" class="${on.trim()}" data-thk="${k.id}">Pick</button></div>`;
    }).join('') + `<div class="t297row"><span>Level ${th.sv.level} of ${TreehouseRules.TH_MAX_LEVEL}  ·  rotate ${th.sv.rot*90}°</span><button type="button" data-thlv="1">Level +</button></div>`;
    box.querySelectorAll('[data-thk]').forEach(b => { b.onclick = ev => { ev.preventDefault(); th.sv = TreehouseRules.thLoad(Object.assign(th.sv, {kind:b.getAttribute('data-thk')})); thSave(th.sv); thPaintPalette(); thHintNow(); }; });
    const lv = box.querySelector('[data-thlv]');
    if (lv) lv.onclick = ev => { ev.preventDefault(); th.sv = TreehouseRules.thSetLevel(th.sv, ((th.sv.level|0)+1) % (TreehouseRules.TH_MAX_LEVEL+1)); thSave(th.sv); thPaintPalette(); };
  }
  function thOpenPalette(){
    thPaintPalette();
    if (typeof t297OverlayShow === 'function') t297OverlayShow('thPalette', true);
    else { const el=document.getElementById('thPalette'); if(el) el.classList.add('show'); }
  }
  function thHintNow(){
    if (!th) return;
    const k = TreehouseRules.thKind(th.sv.kind);
    const ghost = thGhostCell();
    const climb = TreehouseRules.thClimbAt(th.sv, P.x, P.z, P.y);
    const ride = TreehouseRules.thRideAt(th.sv, P.x, P.z, P.y);
    if (th.sv.del) thHud('Delete mode: walk to a piece and press E / Ⓧ to remove it. Undo is ready if you change your mind.', '🗑️ Delete');
    else if (climb) thHud('🪜 Climb this ' + (climb.kind==='rope'?'rope':'ladder') + '. Hold jump or walk into it.', '');
    else if (ride) thHud((ride.kind==='slide'?'🛝 Slide!':'➡️ Zipline!') + ' Press E / Ⓧ to ride.', '✨ Ride');
    else thHud((k?k.emoji+' '+k.name:'Piece') + '  ·  Level ' + th.sv.level + '  ·  R rotate, Q/E cycle, G place, U undo. Hang out with real friends!', '🧰 Place');
  }
  function thDoPlace(){
    if (!th) return false;
    const g = thGhostCell();
    if (th.sv.del){
      const hit = TreehouseRules.thAt(th.sv, g.gx, g.gz, g.level);
      if (!hit){ banner('No piece here to delete.'); return true; }
      const r = TreehouseRules.thRemove(th.sv, hit.id);
      if (r.ok){ thSave(r.state); thRebuildPieces(); banner('Removed a ' + hit.kind + '.'); }
      return true;
    }
    const r = TreehouseRules.thPlace(th.sv, th.sv.kind, g.gx, g.gz, g.level, th.sv.rot, (typeof mp!=='undefined' && mp && mp.me) || 'me', {snap:true});
    if (!r.ok){ banner(r.why==='full' ? 'The treehouse is full. Undo or delete a piece first.' : 'Need a nearby platform to snap to.'); return true; }
    thSave(r.state); thBuildPiece(r.piece);
    try { if (typeof mpSend === 'function' && typeof mp!=='undefined' && mp && mp.on) mpSend({t:'th', a:'place', piece:r.piece}); } catch(e){}
    banner((TreehouseRules.thKind(r.piece.kind)||{}).emoji + ' Placed ' + r.piece.kind + '!');
    return true;
  }
  function thDoUndo(){
    if (!th) return false;
    const r = TreehouseRules.thUndo(th.sv);
    if (!r.ok){ banner('Nothing to undo yet.'); return true; }
    thSave(r.state); thRebuildPieces(); banner('Undid the last change.'); return true;
  }
  function thToggleDel(){
    if (!th) return;
    th.sv = TreehouseRules.thSetDelete(th.sv, !th.sv.del);
    thSave(th.sv);
    const b=document.getElementById('thDelBtn'); if(b) b.classList.toggle('on', !!th.sv.del);
    banner(th.sv.del ? 'Delete mode on.' : 'Delete mode off.');
  }
  function buildTreehouse(){
    const started = TreehouseRules.thNewVisit(thState());
    th = {trash:[], solids:[], meshes:{}, sv: started.state, run: started.run, tree:[], ride:null};
    thSave(started.state);
    try { checkpoints[0] = {idx:0, spawn:{x:6,y:0.5,z:8}, flag:new THREE.Object3D()}; } catch(e){}
    scene.background = new THREE.Color('#8fd3ff');
    if (scene.fog){ scene.fog.color.set('#b8e8ff'); scene.fog.near = 20; scene.fog.far = 90; }
    const hemi = new THREE.HemisphereLight(0xecfff0, 0x1a3a18, 0.95); scene.add(hemi); thKeep(hemi);
    const sun = new THREE.DirectionalLight(0xfff4d2, 0.6); sun.position.set(8, 20, 6); scene.add(sun); thKeep(sun);
    thBuildTree();
    (th.sv.pieces||[]).forEach(thBuildPiece);
    if (P){ P.x=6; P.y=0.5; P.z=8; }
    if (typeof cam!=='undefined' && cam){ cam.pitch=0.3; cam.dist=16; cam.yaw=0.4; }
    const box=document.getElementById('thBox'); if(box) box.style.display='block';
    thHintNow();
  }
  function thEnter(){
    if (P){ P.x=6; P.y=0.5; P.z=8; P.vx=0; P.vz=0; P.vy=0; }
    if (typeof cam!=='undefined' && cam){ cam.yaw=Math.atan2(6, 8); cam.pitch=0.28; cam.dist=18; }
  }
  function thUpdate(dt){
    if (!th) return;
    if (th.ride){
      th.ride.t = (th.ride.t || 0) + dt;
      const k = Math.min(1, th.ride.t / 1.4);
      P.x = th.ride.ax + (th.ride.bx - th.ride.ax) * k;
      P.y = th.ride.ay + (th.ride.by - th.ride.ay) * k;
      P.z = th.ride.az + (th.ride.bz - th.ride.az) * k;
      P.vy = 0;
      if (k >= 1) th.ride = null;
    } else {
      const climb = TreehouseRules.thClimbAt(th.sv, P.x, P.z, P.y);
      if (climb && (keys[' '] || keys.ArrowUp || (typeof joy!=='undefined' && joy.jump))){
        P.vy = 4.2; P.onGround = false;
      }
    }
    thHintNow();
  }
  function thAct(){
    if (!th) return false;
    const ride = TreehouseRules.thRideAt(th.sv, P.x, P.z, P.y);
    if (ride && !th.sv.del){
      const w = TreehouseRules.thWorld(ride.gx, ride.gz, ride.level);
      const dir = ride.rot === 1 ? [1,0] : ride.rot === 2 ? [0,-1] : ride.rot === 3 ? [-1,0] : [0,1];
      const len = ride.kind === 'slide' ? 6 : 10;
      th.ride = {ax:P.x, ay:P.y, az:P.z, bx:w.x + dir[0]*len, by: ride.kind==='slide' ? Math.max(0.5, w.y - TreehouseRules.TH_LEVEL) : w.y + 0.4, bz:w.z + dir[1]*len, t:0};
      banner(ride.kind==='slide' ? '🛝 Weeee!' : '➡️ Zipline!');
      return true;
    }
    return thDoPlace();
  }
  function thKey(e){
    if (!th || !e) return false;
    if (typeof t297EatOverlayKey === 'function' && t297EatOverlayKey(e)) return true;
    const c = e.code || e.key;
    if (c === 'KeyE' || c === 'KeyG'){ if(!e.repeat) thAct(); return true; }
    if (c === 'KeyU'){ if(!e.repeat) thDoUndo(); return true; }
    if (c === 'KeyR'){ if(!e.repeat){ th.sv = TreehouseRules.thRotate(th.sv, 1); thSave(th.sv); thPaintPalette(); } return true; }
    if (c === 'KeyQ'){ if(!e.repeat){ th.sv = TreehouseRules.thCycleKind(th.sv, -1); thSave(th.sv); thPaintPalette(); } return true; }
    if (c === 'KeyF' || c === 'KeyC'){ if(!e.repeat) thOpenPalette(); return true; }
    if (c === 'KeyX'){ if(!e.repeat) thToggleDel(); return true; }
    if (c === 'BracketLeft' || c === 'Comma'){ if(!e.repeat){ th.sv = TreehouseRules.thSetLevel(th.sv, (th.sv.level|0)-1); thSave(th.sv);} return true; }
    if (c === 'BracketRight' || c === 'Period'){ if(!e.repeat){ th.sv = TreehouseRules.thSetLevel(th.sv, (th.sv.level|0)+1); thSave(th.sv);} return true; }
    return false;
  }
  function thPad(jp, s){
    if (!th || !jp) return false;
    if (typeof t297EatOverlayPad === 'function' && t297EatOverlayPad(jp)) return true;
    if (jp[2] || jp[7]){ thAct(); if (typeof pad!=='undefined') pad.jump=false; return true; }
    if (jp[3]){ thOpenPalette(); return true; }
    if (jp[5]){ thDoUndo(); return true; }
    if (jp[4]){ thToggleDel(); return true; }
    return false;
  }
  function treehouseStop(){
    if (!th) return;
    (th.solids||[]).forEach(b => { try{ b.active=false; if (typeof solids!=='undefined'){ const i=solids.indexOf(b); if(i>=0) solids.splice(i,1);} }catch(e){} });
    (th.trash||[]).forEach(m => { try{ scene.remove(m);}catch(e){} });
    th=null;
    const box=document.getElementById('thBox'); if(box) box.style.display='none';
    ['thAct','thPaletteBtn','thUndoBtn','thDelBtn'].forEach(id => { const n=document.getElementById(id); if(n) n.classList.remove('show','on'); });
    if (typeof t297OverlayClose === 'function') t297OverlayClose('thPalette');
  }
  if (typeof window !== 'undefined') window.thDebug = {
    cozy(){
      if (!th) return;
      let s = th.sv;
      [[1,0,1,'platform'],[2,0,1,'platform'],[2,1,1,'room'],[1,0,0,'ladder'],[3,0,1,'slide'],[2,-1,1,'lamp']].forEach(q => {
        const r = TreehouseRules.thPlace(s, q[3], q[0], q[1], q[2], 0, 'me', {snap:false});
        if (r.ok) s = r.state;
      });
      thSave(s); thRebuildPieces();
      if (P){ P.x=6; P.y=0.5; P.z=8; }
      if (typeof cam!=='undefined' && cam){ cam.yaw=0.7; cam.pitch=0.22; cam.dist=18; }
      try { if (obbyDebug && obbyDebug.camLook) obbyDebug.camLook({x:14,y:8,z:16},{x:2,y:5,z:0}); } catch(e){}
    }
  };
  try {
    const pal = document.getElementById('thPaletteBtn'); if (pal && !pal.__th){ pal.__th=true; pal.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); thOpenPalette(); }; }
    const un = document.getElementById('thUndoBtn'); if (un && !un.__th){ un.__th=true; un.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); thDoUndo(); }; }
    const del = document.getElementById('thDelBtn'); if (del && !del.__th){ del.__th=true; del.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); thToggleDel(); }; }
    const act = document.getElementById('thAct'); if (act && !act.__th){ act.__th=true; act.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); thAct(); }; }
  } catch(e){}
