  /* ===================== t215u: 📸 STAR SNAPS PHOTO STUDIO — pose your own avatar, pick a backdrop, save photos on this device ===================== */
  // Privacy: photos are made from this page's own 3D view, kept only in this device's localStorage and downloaded by you. Nothing is uploaded or sent to other players.
  const PS_KEY = 'rubloxPhotoStudio', PS_GAL = 'rubloxPhotos', PS_MAX = 12;
  const PS_BGS = [
    {id: 'pink', e: '🎀', n: 'Bubblegum', a: '#ffb3d9', b: '#ff6fb5', ic: '💖'}, {id: 'sky', e: '☁️', n: 'Sky High', a: '#e0f7ff', b: '#7fd6ff', ic: '☁️'},
    {id: 'stars', e: '🌟', n: 'Starry Night', a: '#1d2340', b: '#5b34c0', ic: '⭐'}, {id: 'beach', e: '🏖️', n: 'Sunny Beach', a: '#ffe7a3', b: '#3ac6ff', ic: '🌴'},
    {id: 'garden', e: '🌸', n: 'Flower Garden', a: '#d9ffd1', b: '#2ec27e', ic: '🌸'}, {id: 'candy', e: '🍭', n: 'Candy Land', a: '#fff0f8', b: '#8b5cf6', ic: '🍬'},
    {id: 'rainbow', e: '🌈', n: 'Rainbow', a: '#ff4d5e', b: '#3a86ff', ic: '🌈', rb: true}, {id: 'snow', e: '❄️', n: 'Snow Day', a: '#ffffff', b: '#a9d6ff', ic: '❄️'},
  ];
  const PS_FRAMES = [{id: 'full', e: '🧍', n: 'Full Body', d: 7.2, y: 1.6}, {id: 'waist', e: '👕', n: 'Waist Up', d: 4.4, y: 2.2}, {id: 'face', e: '🙂', n: 'Close-Up', d: 2.7, y: 2.75}];
  const PS_ANGLES = [{id: 'front', e: '⬆️', n: 'Front', yaw: 0, h: 0}, {id: 'left', e: '↖️', n: 'Left Side', yaw: -.6, h: 0}, {id: 'right', e: '↗️', n: 'Right Side', yaw: .6, h: 0},
    {id: 'hero', e: '🦸', n: 'Hero (low)', yaw: 0, h: -1.1}, {id: 'top', e: '🚁', n: 'From Above', yaw: 0, h: 2.6}];
  const PS_SHAPES = [{id: 'tall', e: '📱', n: 'Tall', r: 4 / 5}, {id: 'sq', e: '⬛', n: 'Square', r: 1}, {id: 'wide', e: '🖥️', n: 'Wide', r: 16 / 9}];
  const PS_BORDERS = [{id: 'none', e: '⬜', n: 'No Border'}, {id: 'pola', e: '🖼️', n: 'Snapshot'}, {id: 'stars', e: '✨', n: 'Sparkles'}, {id: 'hearts', e: '💕', n: 'Hearts'}, {id: 'film', e: '🎞️', n: 'Film Strip'}];
  const PS_POSE_N = () => FS_POSES.length + 1;   // 0 = natural (your normal idle)
  const PS_OPTS = {bg: PS_BGS, frame: PS_FRAMES, angle: PS_ANGLES, shape: PS_SHAPES, border: PS_BORDERS};
  const PS_MARK = [0, 0];   // stage spot (stage top is at y = .4)
  let psx = null;
  const psClamp = (v, n) => Math.max(0, Math.min(n - 1, v | 0));
  function psSet(){ const r = load(PS_KEY, null), o = r && typeof r === 'object' ? r : {};
    return {bg: psClamp(o.bg, PS_BGS.length), frame: psClamp(o.frame, PS_FRAMES.length), angle: psClamp(o.angle, PS_ANGLES.length), shape: psClamp(o.shape, PS_SHAPES.length),
      border: psClamp(o.border, PS_BORDERS.length), pose: psClamp(o.pose, PS_POSE_N()), shots: Math.max(0, o.shots | 0)}; }
  function psGallery(){ const r = load(PS_GAL, []); return (Array.isArray(r) ? r : []).filter(p => p && typeof p.d === 'string' && /^data:image\/(jpeg|png);base64,/.test(p.d) && +p.t > 0).slice(-PS_MAX).map(p => ({id: String(p.id || p.t).slice(0, 24), t: +p.t, d: p.d, bg: psClamp(p.bg, PS_BGS.length)})); }
  // store a photo; if the device is out of room, drop the oldest until it fits. Returns how many are kept (0 = could not save, download it instead).
  function psStore(photo){
    const g = psGallery(); g.push(photo); while (g.length > PS_MAX) g.shift();
    while (g.length){ try { localStorage.setItem(PS_GAL, JSON.stringify(g)); return g.length; } catch (e){ if (g.length === 1) break; g.shift(); } }
    return 0;
  }
  function psDelete(id){ const g = psGallery().filter(p => p.id !== id); try { localStorage.setItem(PS_GAL, JSON.stringify(g)); } catch (e){} return g.length; }
  function psCycle(k, dir){ if (!psx) return; const n = k === 'pose' ? PS_POSE_N() : PS_OPTS[k].length; psx.s[k] = ((psx.s[k] + (dir || 1)) % n + n) % n; save(PS_KEY, psx.s); if (k === 'bg') psPaintBackdrop(); psHud(); }
  // camera for the current framing/angle; the player stands on the mark facing +z (towards the camera)
  function psCamPos(s, px, py, pz){ const F = PS_FRAMES[s.frame], A = PS_ANGLES[s.angle], ty = py + F.y;
    return {x: px + Math.sin(A.yaw) * F.d, y: ty + A.h * (F.d / 7.2) + (s.frame === 2 ? 0 : .2), z: pz + Math.cos(A.yaw) * F.d, tx: px, ty, tz: pz}; }
  // centre crop of a w×h image to aspect r
  function psCrop(w, h, r){ if (w / h > r){ const cw = Math.round(h * r); return {x: Math.round((w - cw) / 2), y: 0, w: cw, h}; } const ch = Math.round(w / r); return {x: 0, y: Math.round((h - ch) / 2), w, h: ch}; }
  function psOutSize(r){ const L = 900; return r >= 1 ? {w: L, h: Math.round(L / r)} : {w: Math.round(L * r), h: L}; }
  function psFileName(t){ const d = new Date(t), z = n => ('0' + n).slice(-2); return 'rublox-photo-' + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds()) + '.jpg'; }
  function psBgPaint(ctx, w, h, i){
    const B = PS_BGS[i], g = ctx.createLinearGradient(0, 0, 0, h);
    if (B.rb) ['#ff4d5e', '#ff9f1c', '#ffd23f', '#2ec27e', '#3a86ff', '#8b5cf6'].forEach((c, k) => g.addColorStop(k / 5, c)); else { g.addColorStop(0, B.a); g.addColorStop(1, B.b); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.font = Math.round(h / 9) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.globalAlpha = .55;
    for (let y = 0; y < 5; y++) for (let x = 0; x < 7; x++) ctx.fillText(B.ic, (x + (y % 2 ? .5 : .1)) * w / 6.4, (y + .75) * h / 5);
    ctx.globalAlpha = 1;
  }
  function psPaintBackdrop(){ if (!psx || !psx.bdC) return; psBgPaint(psx.bdC.getContext('2d'), psx.bdC.width, psx.bdC.height, psx.s.bg); psx.bdT.needsUpdate = true; scene.background = new THREE.Color(PS_BGS[psx.s.bg].a); }
  function buildPhotoStudio(){
    scene.background = new THREE.Color('#ffe9f5');
    psx = {s: psSet(), cam: false, count: 0, flash: 0, gal: false, view: null, near: false, last: null, bdC: null, bdT: null};
    plat(0, 0, 0, 40, 40, '#f7d9ea', 2);
    [[0, -20, 40, 1], [0, 20, 40, 1], [-20, 0, 1, 40], [20, 0, 1, 40]].forEach(([x, z, w, d]) => plat(x, 6, z, w, d, '#ffffff', 6, {noEdge: true}));
    plat(0, .4, -1, 9, 7, '#ffffff', .4);   // stage
    const mk = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, .12, 5), new THREE.MeshBasicMaterial({color: '#ffd23f'})); mk.position.set(PS_MARK[0], .47, PS_MARK[1]); scene.add(mk); psx.mark = mk;   // raised, unlit gold star pad (5 sides) so it reads clearly on the white stage
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 6, 16, 1, true), new THREE.MeshBasicMaterial({color: '#ffe680', transparent: true, opacity: .25, side: THREE.DoubleSide})); beam.position.set(PS_MARK[0], 3.5, PS_MARK[1]); scene.add(beam);
    // the backdrop: a big curved sheet with a painted (swappable) picture
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512; psx.bdC = c; psx.bdT = new THREE.CanvasTexture(c);
    const bd = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 11, 32, 1, true, Math.PI * .65, Math.PI * .7), new THREE.MeshBasicMaterial({map: psx.bdT, side: THREE.DoubleSide}));
    bd.position.set(0, 5.9, 4.5); scene.add(bd);
    // studio lights + camera on a tripod (decor)
    [[-6, 4], [6, 4]].forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 4, 6), new THREE.MeshLambertMaterial({color: '#555'})); p.position.set(x, 2, z); scene.add(p);
      const l = new THREE.Mesh(new THREE.SphereGeometry(.6, 12, 8), new THREE.MeshBasicMaterial({color: '#fff6c9'})); l.position.set(x, 4.2, z); scene.add(l); });
    const tri = new THREE.Mesh(new THREE.BoxGeometry(.9, .6, .6), new THREE.MeshLambertMaterial({color: '#1d2340'})); tri.position.set(0, 2.2, 8); scene.add(tri);
    const sg = label('📸 Star Snaps Photo Studio', 'rgba(255,111,181,.95)', '#fff', 420); sg.position.set(0, 9.5, -7); scene.add(sg);
    const hint = label('📸 Photo spot — press Take Photo!', 'rgba(29,35,64,.85)', '#fff', 340); hint.scale.multiplyScalar(.6); hint.position.set(0, 3.4, 2.2); scene.add(hint); psx.hint = hint;
    psPaintBackdrop();
    // respawn()/start() need a spawn checkpoint in every mode — without it start('photostudio') threw half-way (blank sky, generic HUD, no studio)
    checkpoints[0] = {idx: 0, spawn: {x: 0, y: .05, z: 9}, flag: new THREE.Object3D()};
    P.x = 0; P.z = 9; P.face = Math.PI;
  }
  function photostudioEnter(){ P.face = Math.PI; psHud(); }
  function psOnMark(){ return Math.hypot(P.x - PS_MARK[0], P.z - PS_MARK[1]) < 2.2; }
  function psCamOn(on){
    if (!psx) return; psx.cam = on; psx.count = 0;
    if (on){ Object.assign(P, {x: PS_MARK[0], y: .45, z: PS_MARK[1], vx: 0, vy: 0, vz: 0}); P.face = 0; for (const k in keys) keys[k] = false; banner('📸 Camera on! You\'re on the photo spot — pick a pose and backdrop, then press 📸 Snap!'); }
    psHud();
  }
  function psSnap(){ if (!psx || !psx.cam || psx.count > 0) return false; psx.count = 3.01; psHud(); return true; }
  function psCapture(){
    const S = psx.s, sh = PS_SHAPES[S.shape], out = psOutSize(sh.r), cv = document.createElement('canvas'); cv.width = out.w; cv.height = out.h;
    const ctx = cv.getContext('2d'), src = renderer.domElement;
    updateCamera(); renderer.render(scene, camera);   // draw right now so the picture is read before the browser clears it
    const cr = psCrop(src.width, src.height, sh.r);
    const pad = S.border === 1 ? Math.round(out.w * .05) : S.border === 4 ? Math.round(out.w * .07) : 0, bottom = S.border === 1 ? Math.round(out.h * .1) : pad;
    ctx.fillStyle = S.border === 4 ? '#14141c' : '#ffffff'; ctx.fillRect(0, 0, out.w, out.h);
    try { ctx.drawImage(src, cr.x, cr.y, cr.w, cr.h, pad, pad, out.w - pad * 2, out.h - pad - bottom); } catch (e){ return null; }
    psDecorate(ctx, out.w, out.h, S.border, bottom);
    let d; try { d = cv.toDataURL('image/jpeg', .85); } catch (e){ return null; }
    const t = Date.now(), photo = {id: 'p' + t, t, d, bg: S.bg}; psx.last = photo; psx.flash = 1;
    S.shots++; save(PS_KEY, S);
    const kept = psStore(photo); banner(kept ? '📸 Snap! Saved on this device (' + kept + '/' + PS_MAX + ') — tap 🖼️ to see or download it' : '📸 Snap! This device is out of photo space — download it from 🖼️');
    SND.cp && SND.cp(); return photo;
  }
  function psDecorate(ctx, w, h, b, bottom){
    ctx.textAlign = 'center';
    if (b === 1){ ctx.fillStyle = '#5b5b6b'; ctx.font = 'bold ' + Math.round(bottom * .38) + 'px sans-serif'; ctx.fillText('⭐ Star Snaps · ' + new Date().toLocaleDateString(), w / 2, h - bottom * .38); }
    if (b === 2 || b === 3){ const ic = b === 2 ? ['✨', '⭐', '🌟'] : ['💕', '💖', '💗']; ctx.font = Math.round(w / 12) + 'px sans-serif';
      for (let k = 0; k < 10; k++){ const e = ic[k % 3], s = k / 10; ctx.fillText(e, w * (.06 + .88 * s), h * .08); ctx.fillText(ic[(k + 1) % 3], w * (.06 + .88 * s), h * .98); } }
    if (b === 4){ ctx.fillStyle = '#ffffff'; const p = Math.round(w * .07), hs = Math.round(p * .35); for (let y = hs; y < h; y += hs * 2.2){ ctx.fillRect(p * .3, y, hs, hs * 1.2); ctx.fillRect(w - p * .3 - hs, y, hs, hs * 1.2); } }
  }
  function psDownload(photo){ if (!photo) return false; const a = document.createElement('a'); a.href = photo.d; a.download = psFileName(photo.t); document.body.appendChild(a); a.click(); a.remove(); banner('⬇️ Downloading ' + a.download); return true; }
  function psGalOpen(open){
    if (!psx) return; psx.gal = open === undefined ? !psx.gal : open; psx.view = null; if (!psx.gal){ $('#psGal').classList.remove('show'); psHud(); return; }
    psGalRender(); $('#psGal').classList.add('show');
  }
  function psGalRender(){
    const g = psGallery(), v = psx.view && g.find(p => p.id === psx.view);
    if (v){ $('#psGList').innerHTML = '<img class="psbig" alt="your photo" src="' + v.d + '"><div class="row"><button class="big blue" id="psDl">⬇️ Download</button><button class="big gray" id="psDel">🗑️ Delete</button><button class="big gray" id="psBack">⬅️ All photos</button></div><small class="psnote">On a phone you can also press and hold the picture to save it.</small>';
      $('#psDl').onclick = () => psDownload(v); $('#psDel').onclick = () => { psDelete(v.id); psx.view = null; psGalRender(); }; $('#psBack').onclick = () => { psx.view = null; psGalRender(); }; return; }
    $('#psGList').innerHTML = g.length ? '<div class="psgrid">' + g.slice().reverse().map(p => '<button class="psth" data-id="' + p.id + '"><img alt="photo" src="' + p.d + '"></button>').join('') + '</div>'
      : '<p>No photos yet — step on the ⭐ spot and press 📸!</p>';
    $('#psGList').querySelectorAll('.psth').forEach(b => b.onclick = () => { psx.view = b.dataset.id; psGalRender(); });
  }
  function psHud(){
    if (!psx) return; const S = psx.s, pz = S.pose ? FS_POSES[S.pose - 1] : {e: '🙂', n: 'Natural'};
    $('#psBar').classList.toggle('show', psx.cam); $('#psCamBtn').classList.toggle('show', !psx.cam && !psx.gal);   // always there in the studio — no hunting for the spot
    $('#psN').textContent = '📸 Photos: ' + psGallery().length + '/' + PS_MAX;
    if (!psx.cam) return;
    const lab = {pose: pz.e + ' ' + pz.n, bg: PS_BGS[S.bg].e + ' ' + PS_BGS[S.bg].n, frame: PS_FRAMES[S.frame].e + ' ' + PS_FRAMES[S.frame].n, angle: PS_ANGLES[S.angle].e + ' ' + PS_ANGLES[S.angle].n, shape: PS_SHAPES[S.shape].e + ' ' + PS_SHAPES[S.shape].n, border: PS_BORDERS[S.border].e + ' ' + PS_BORDERS[S.border].n};
    Object.keys(lab).forEach(k => { const e = $('#psV_' + k); if (e) e.textContent = lab[k]; });
    $('#psSnap').textContent = psx.count > 0 ? Math.ceil(psx.count) + '…' : '📸 Snap!';
  }
  function photostudioUpdate(dt){
    if (!psx) return;
    const n = !psx.cam && psOnMark(); if (n !== psx.near){ psx.near = n; psHud(); }
    if (psx.cam){ Object.assign(P, {x: PS_MARK[0], z: PS_MARK[1], vx: 0, vz: 0}); P.face = 0;
      if (psx.count > 0){ const c0 = Math.ceil(psx.count); psx.count -= dt; if (psx.count <= 0){ psx.count = 0; psCapture(); psHud(); } else if (Math.ceil(psx.count) !== c0){ psHud(); SND.coin && SND.coin(); } } }
  }
  function photostudioAnimate(dt){ if (!psx) return; if (psx.mark) psx.mark.rotation.y += dt; if (psx.hint) psx.hint.visible = !psx.cam;
    if (psx.flash > 0){ psx.flash = Math.max(0, psx.flash - dt * 3); $('#psFlash').style.opacity = psx.flash; } }
  function photoCam(){ if (!psx || !psx.cam) return false; const c = psCamPos(psx.s, PS_MARK[0], .45, PS_MARK[1]); camera.position.set(c.x, c.y, c.z); camera.lookAt(c.tx, c.ty, c.tz); return true; }
  function psPosed(){ return psx && psx.cam && psx.s.pose > 0 ? Object.assign({lL: 0, lR: 0}, FS_POSES[psx.s.pose - 1].p(psx.s.pose === 4 ? 0 : worldT)) : null; }   // twirl is held still for the camera
  function psAct(){ if (!psx) return false; if (psx.cam) return psSnap(); psCamOn(true); return true; }   // works from anywhere: you're placed on the photo spot automatically
  function psPad(jp){ if (!psx) return false; if (psx.gal) return false;
    if (!psx.cam){ if (jp[2]){ psAct(); return true; } if (jp[3]){ psGalOpen(true); return true; } return false; }
    if (jp[0]) psSnap(); else if (jp[1]) psCamOn(false); else if (jp[3]) psGalOpen(true); else if (jp[4]) psCycle('pose', -1); else if (jp[5]) psCycle('pose', 1);
    else if (jp[14]) psCycle('bg', -1); else if (jp[15]) psCycle('bg', 1); else if (jp[12]) psCycle('frame', 1); else if (jp[13]) psCycle('angle', 1); else if (jp[2]) psCycle('border', 1); else if (jp[6] || jp[7]) psCycle('shape', 1); else return false;
    return true; }
  function psKey(e){ if (!psx || e.repeat || paused) return false; const c = e.code;
    if (psx.gal){ if (c === 'Escape' || c === 'KeyG'){ psGalOpen(false); return true; } return false; }
    if (c === 'KeyG'){ psGalOpen(true); return true; }
    if (!psx.cam){ if (c === 'KeyE'){ psAct(); return true; } return false; }
    const m = {KeyQ: ['pose', -1], KeyE: ['pose', 1], KeyB: ['bg', 1], KeyF: ['frame', 1], KeyC: ['angle', 1], KeyT: ['shape', 1], KeyK: ['border', 1]};
    if (m[c]){ psCycle(m[c][0], m[c][1]); return true; }
    if (c === 'Space' || c === 'Enter'){ psSnap(); return true; }
    if (c === 'Escape'){ psCamOn(false); return true; }
    return true;   // camera mode swallows other keys so you don't walk off the mark
  }
  function photostudioStop(){ psx = null; ['#psBar', '#psCamBtn', '#psGal'].forEach(id => { const e = $(id); if (e) e.classList.remove('show'); }); const f = $('#psFlash'); if (f) f.style.opacity = 0; }
