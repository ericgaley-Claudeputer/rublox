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
  const PS_PROPS = [
    {id: 'glasses', e: '🤓', n: 'Goofy Glasses'}, {id: 'mustache', e: '🥸', n: 'Mustache'},
    {id: 'party', e: '🥳', n: 'Party Hat'}, {id: 'ears', e: '🐰', n: 'Bunny Ears'},
    {id: 'shades', e: '😎', n: 'Star Shades'}, {id: 'bubble', e: '💬', n: 'Speech Bubble'}
  ];
  const PS_STICKERS = [
    {id: 'star', e: '⭐', n: 'Star', x: .14, y: .16}, {id: 'heart', e: '💕', n: 'Heart', x: .86, y: .16},
    {id: 'sparkle', e: '✨', n: 'Sparkles', x: .14, y: .82}, {id: 'rainbow', e: '🌈', n: 'Rainbow', x: .86, y: .82},
    {id: 'crown', e: '👑', n: 'Crown', x: .5, y: .13}, {id: 'paw', e: '🐾', n: 'Paw', x: .5, y: .86}
  ];
  const PS_POSE_N = () => FS_POSES.length + 1;   // 0 = natural (your normal idle)
  const PS_OPTS = {bg: PS_BGS, frame: PS_FRAMES, angle: PS_ANGLES, shape: PS_SHAPES, border: PS_BORDERS};
  const PS_MARK = [0, 0];   // stage spot (stage top is at y = .4)
  let psx = null;
  const psClamp = (v, n) => Math.max(0, Math.min(n - 1, v | 0));
  function psCleanProps(a){ const out = []; (Array.isArray(a) ? a : []).forEach(id => { if (PS_PROPS.some(p => p.id === id) && out.indexOf(id) < 0) out.push(id); }); return out.slice(0, 4); }
  function psCleanStickers(a){ const out = []; (Array.isArray(a) ? a : []).forEach(s => {
    const id = typeof s === 'string' ? s : (s && s.id), base = PS_STICKERS.find(k => k.id === id);
    if (!base || out.some(k => k.id === id)) return;
    const x = s && Number.isFinite(+s.x) ? Math.max(.06, Math.min(.94, +s.x)) : base.x;
    const y = s && Number.isFinite(+s.y) ? Math.max(.06, Math.min(.94, +s.y)) : base.y;
    out.push({id, x, y});
  }); return out.slice(0, 6); }
  function psSet(){ const r = load(PS_KEY, null), o = r && typeof r === 'object' ? r : {};
    const res = {bg: psClamp(o.bg, PS_BGS.length), frame: psClamp(o.frame, PS_FRAMES.length), angle: psClamp(o.angle, PS_ANGLES.length), shape: psClamp(o.shape, PS_SHAPES.length),
      border: psClamp(o.border, PS_BORDERS.length), pose: psClamp(o.pose, PS_POSE_N()), shots: Math.max(0, o.shots | 0)};
    const pr = psCleanProps(o.props), st = psCleanStickers(o.stickers);
    if (pr.length) res.props = pr;
    if (typeof CostumeRules !== 'undefined' && o.costume && CostumeRules.csClean(o.costume) !== 'none') res.costume = CostumeRules.csClean(o.costume);   // GB-7
    if (st.length) res.stickers = st;
    return res; }
  function psSaveSet(){ if (!psx) return; const S = Object.assign({}, psx.s); if (psx.props && psx.props.length) S.props = psx.props.slice(); else delete S.props; if (psx.stickers && psx.stickers.length) S.stickers = psx.stickers.map(s => ({id: s.id, x: +s.x.toFixed(3), y: +s.y.toFixed(3)})); else delete S.stickers; save(PS_KEY, S); }
  function psGallery(){ const r = load(PS_GAL, []); return (Array.isArray(r) ? r : []).filter(p => p && typeof p.d === 'string' && /^data:image\/(jpeg|png);base64,/.test(p.d) && +p.t > 0).slice(-PS_MAX).map(p => ({id: String(p.id || p.t).slice(0, 24), t: +p.t, d: p.d, bg: psClamp(p.bg, PS_BGS.length)})); }
  // store a photo; if the device is out of room, drop the oldest until it fits. Returns how many are kept (0 = could not save, download it instead).
  function psStore(photo){
    const g = psGallery(); g.push(photo); while (g.length > PS_MAX) g.shift();
    while (g.length){ try { localStorage.setItem(PS_GAL, JSON.stringify(g)); return g.length; } catch (e){ if (g.length === 1) break; g.shift(); } }
    return 0;
  }
  function psDelete(id){ const g = psGallery().filter(p => p.id !== id); try { localStorage.setItem(PS_GAL, JSON.stringify(g)); } catch (e){} return g.length; }
  function psCycle(k, dir){ if (!psx) return; if (k === 'extras'){ psTrayToggle(); return; } const n = k === 'pose' ? PS_POSE_N() : PS_OPTS[k].length; psx.s[k] = ((psx.s[k] + (dir || 1)) % n + n) % n; psSaveSet(); if (k === 'bg') psPaintBackdrop(); psHud(); }
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
    const init = psSet();
    psx = {s: init, props: psCleanProps(init.props), stickers: psCleanStickers(init.stickers), activeSticker: null, tray: false, trayIdx: 0, propG: null, cam: false, count: 0, flash: 0, gal: false, view: null, near: false, last: null, bdC: null, bdT: null};
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
  function psClearProps3D(){
    if (!psx || !psx.propG) return;
    try { if (psx.propG.parent) psx.propG.parent.remove(psx.propG);
      psx.propG.traverse(o => { if (o.geometry) o.geometry.dispose(); [].concat(o.material || []).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); });
    } catch (e){}
    psx.propG = null;
  }
  function psSyncProps(){
    psClearProps3D();
    if (!psx || !psx.props || !psx.props.length) return;
    if (typeof THREE === 'undefined' || typeof model === 'undefined' || !model || !model.head) return;
    const g = new THREE.Group(), mat = c => new THREE.MeshLambertMaterial({color: c});
    const addM = (geo, c, x, y, z, rx = 0, ry = 0, rz = 0, par = g) => { const m = new THREE.Mesh(geo, mat(c)); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); par.add(m); return m; };
    psx.props.forEach(id => {
      if (id === 'glasses'){
        [-1, 1].forEach(k => {
          addM(new THREE.TorusGeometry(.13, .028, 8, 16), '#2563eb', k * .17, .46, .43);
          const lens = new THREE.Mesh(new THREE.CircleGeometry(.115, 14), new THREE.MeshBasicMaterial({color: '#dbeeff', transparent: true, opacity: .55, side: THREE.DoubleSide}));
          lens.position.set(k * .17, .46, .435); g.add(lens);
          addM(new THREE.BoxGeometry(.03, .03, .36), '#2563eb', k * .32, .46, .25);
        });
        addM(new THREE.BoxGeometry(.1, .035, .035), '#2563eb', 0, .47, .44);
      } else if (id === 'shades'){
        [-1, 1].forEach(k => {
          addM(new THREE.CylinderGeometry(.14, .14, .03, 5), '#1d2340', k * .17, .46, .43, Math.PI/2);
          addM(new THREE.TorusGeometry(.135, .024, 6, 5), '#ff4d94', k * .17, .46, .438);
          addM(new THREE.BoxGeometry(.03, .03, .36), '#ff4d94', k * .32, .46, .25);
        });
        addM(new THREE.BoxGeometry(.1, .035, .035), '#ffd23f', 0, .47, .44);
      } else if (id === 'mustache'){
        addM(new THREE.BoxGeometry(.18, .06, .06), '#4a2c18', -.08, .25, .43, 0, 0, .18);
        addM(new THREE.BoxGeometry(.18, .06, .06), '#4a2c18', .08, .25, .43, 0, 0, -.18);
        addM(new THREE.SphereGeometry(.045, 7, 5), '#4a2c18', -.18, .27, .43);
        addM(new THREE.SphereGeometry(.045, 7, 5), '#4a2c18', .18, .27, .43);
      } else if (id === 'party'){
        addM(new THREE.ConeGeometry(.28, .72, 12), '#8b5cf6', 0, 1.18, 0);
        addM(new THREE.TorusGeometry(.27, .04, 6, 14), '#ffd23f', 0, .86, 0, Math.PI/2);
        addM(new THREE.SphereGeometry(.095, 8, 6), '#ff6fb5', 0, 1.56, 0);
      } else if (id === 'ears'){
        addM(new THREE.TorusGeometry(.42, .04, 6, 16, Math.PI), '#ff6fb5', 0, .84, 0);
        [-1, 1].forEach(k => {
          const piv = new THREE.Group(); piv.position.set(k * .2, .9, 0); piv.rotation.z = -k * .15; g.add(piv);
          addM(new THREE.BoxGeometry(.15, .62, .07), '#ffffff', 0, .28, 0, 0, 0, 0, piv);
          addM(new THREE.BoxGeometry(.08, .44, .02), '#ffb3c7', 0, .27, .035, 0, 0, 0, piv);
        });
      } else if (id === 'bubble'){
        try {
          const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128;
          const cx = cv.getContext('2d');
          if (cx && cx.roundRect){
            cx.fillStyle = '#ffffff'; cx.strokeStyle = '#1d2340'; cx.lineWidth = 8;
            cx.beginPath(); cx.roundRect(12, 10, 232, 86, 26); cx.fill(); cx.stroke();
            cx.beginPath(); cx.moveTo(46, 94); cx.lineTo(22, 122); cx.lineTo(76, 95); cx.closePath(); cx.fill(); cx.stroke();
          } else if (cx){ cx.fillStyle = '#ffffff'; cx.fillRect(12, 10, 232, 86); }
          if (cx){ cx.fillStyle = '#ff4d6d'; cx.font = 'bold 42px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('CHEESE!', 128, 53); }
          const tex = new THREE.CanvasTexture(cv);
          const sp = new THREE.Mesh(new THREE.PlaneGeometry(1.15, .58), new THREE.MeshBasicMaterial({map: tex, transparent: true, side: THREE.DoubleSide}));
          sp.position.set(1.26, 1.05, .38); g.add(sp);
        } catch (e){}
      }
    });
    model.head.add(g); psx.propG = g;
  }
  function psDrawSticker2d(ctx, id, cx, cy, r){
    if (!ctx || !ctx.arc || !ctx.moveTo || !ctx.fill){ ctx.fillText(id, cx, cy); return; }
    ctx.save(); ctx.translate(cx, cy); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (id === 'star'){
      ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#d98200'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i * Math.PI/5, d = i % 2 ? r*.45 : r; const x = Math.cos(a)*d, y = Math.sin(a)*d; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff7c2'; ctx.beginPath(); ctx.arc(-r*.2, -r*.2, r*.18, 0, Math.PI*2); ctx.fill();
    } else if (id === 'heart'){
      ctx.fillStyle = '#ff4d79'; ctx.strokeStyle = '#b51748'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, r*.85);
      ctx.bezierCurveTo(-r*1.2, r*.15, -r*1.0, -r*.9, 0, -r*.3);
      ctx.bezierCurveTo(r*1.0, -r*.9, r*1.2, r*.15, 0, r*.85);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(-r*.35, -r*.35, r*.18, 0, Math.PI*2); ctx.fill();
    } else if (id === 'sparkle'){
      const sp = (ox, oy, sr, c) => {
        ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(ox, oy - sr); ctx.quadraticCurveTo(ox, oy, ox + sr, oy);
        ctx.quadraticCurveTo(ox, oy, ox, oy + sr); ctx.quadraticCurveTo(ox, oy, ox - sr, oy); ctx.quadraticCurveTo(ox, oy, ox, oy - sr); ctx.fill();
      };
      sp(-r*.15, 0, r*.85, '#ffd23f'); sp(r*.55, -r*.45, r*.42, '#38bdf8'); sp(r*.5, r*.5, r*.34, '#ff6fb5');
    } else if (id === 'rainbow'){
      ['#ff4d5e','#ff9f1c','#ffd23f','#2ec27e','#3a86ff'].forEach((c, i) => {
        ctx.strokeStyle = c; ctx.lineWidth = Math.max(2, r*.16);
        ctx.beginPath(); ctx.arc(0, r*.25, r*(.92 - i*.14), Math.PI, 0); ctx.stroke();
      });
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-r*.65, r*.32, r*.28, 0, Math.PI*2); ctx.arc(r*.65, r*.32, r*.28, 0, Math.PI*2); ctx.fill();
    } else if (id === 'crown'){
      ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#b97c00'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(-r*.85, r*.55); ctx.lineTo(-r*.85, -r*.35); ctx.lineTo(-r*.35, r*.05); ctx.lineTo(0, -r*.65); ctx.lineTo(r*.35, r*.05); ctx.lineTo(r*.85, -r*.35); ctx.lineTo(r*.85, r*.55); ctx.closePath();
      ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ff2d55'; ctx.beginPath(); ctx.arc(0, r*.22, r*.14, 0, Math.PI*2); ctx.fill();
    } else if (id === 'paw'){
      ctx.fillStyle = '#ff8fab'; ctx.strokeStyle = '#9d174d'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, r*.2, r*.48, 0, Math.PI*2); ctx.fill(); ctx.stroke();
      [[-.55,-.32],[-.2,-.56],[.2,-.56],[.55,-.32]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx*r, dy*r, r*.2, 0, Math.PI*2); ctx.fill(); ctx.stroke(); });
    }
    ctx.restore();
  }
  // GB-7: dress-up costumes. While the camera is on you wear the picked costume (clothes + original pieces); it comes off after.
  function psCostume3D(id){
    if (!psx || typeof CostumeRules === 'undefined' || typeof model === 'undefined' || !model || !model.head) return;
    const parts = CostumeRules.cs3dParts(id); if (!parts.length) return;
    const body = model.head.parent || model.g, made = [];
    parts.forEach(pt => {
      const a = pt.a;
      const geo = pt.s === 'box' ? new THREE.BoxGeometry(a[0], a[1], a[2]) : pt.s === 'sph' ? new THREE.SphereGeometry(a[0], 10, 8)
        : pt.s === 'cyl' ? new THREE.CylinderGeometry(a[0], a[1], a[2], a[3] || 12) : pt.s === 'cone' ? new THREE.ConeGeometry(a[0], a[1], a[2] || 8)
        : new THREE.TorusGeometry(a[0], a[1], 8, 20);
      const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({color: pt.c}));
      m.position.set(pt.p[0], pt.p[1], pt.p[2]); m.rotation.set(pt.r[0], pt.r[1], pt.r[2]);
      (pt.at === 'head' ? model.head : body).add(m); made.push(m);
    });
    psx.cosParts = made;
  }
  function psWear(on){
    if (!psx) return;
    const id = on && psx.s.costume && typeof CostumeRules !== 'undefined' && CostumeRules.csClean(psx.s.costume) !== 'none' ? psx.s.costume : null;
    if ((psx.wearing || null) === id) return;
    try {
      if (typeof model !== 'undefined' && model && typeof buildPlayer === 'function'){
        const g = model.g, pos = g.position.clone(), ry = g.rotation.y;
        psClearProps3D(); scene.remove(g);
        model = buildPlayer(id ? CostumeRules.csApply(avatar, id) : avatar);
        model.g.position.copy(pos); model.g.rotation.y = ry; scene.add(model.g);
        psx.cosParts = null;
        if (id) psCostume3D(id);
        if (on) psSyncProps();
      }
    } catch (e){}
    psx.wearing = id;
  }
  function psSetCostume(id){
    if (!psx || typeof CostumeRules === 'undefined') return false;
    const c = CostumeRules.csClean(id);
    if (c === 'none') delete psx.s.costume; else psx.s.costume = c;
    psSaveSet(); psWear(!!psx.cam); psHud();
    const it = CostumeRules.csGet(c);
    banner(c === 'none' ? '👕 Back in your own outfit.' : it.emoji + ' Dressed up as the ' + it.name + '!');
    return true;
  }
  function psToggleProp(id){
    if (!psx || !PS_PROPS.some(p => p.id === id)) return false;
    const i = psx.props.indexOf(id);
    if (i >= 0) psx.props.splice(i, 1);
    else if (psx.props.length < 4) psx.props.push(id);
    else { banner('🎭 Up to 4 props! Tap a lit one to take it off.'); return false; }
    psSaveSet(); psSyncProps(); psHud(); return true;
  }
  function psToggleSticker(id){
    if (!psx) return false;
    const base = PS_STICKERS.find(s => s.id === id); if (!base) return false;
    const i = psx.stickers.findIndex(s => s.id === id);
    if (i >= 0){ psx.stickers.splice(i, 1); if (psx.activeSticker === id) psx.activeSticker = psx.stickers.length ? psx.stickers[psx.stickers.length - 1].id : null; }
    else if (psx.stickers.length < 6){ psx.stickers.push({id: base.id, x: base.x, y: base.y}); psx.activeSticker = id; }
    else { banner('✨ Up to 6 stickers! Tap a lit one to take it off.'); return false; }
    psSaveSet(); psHud(); return true;
  }
  function psMoveSticker(id, x, y){
    if (!psx) return false;
    const st = psx.stickers.find(s => s.id === id) || psx.stickers[psx.stickers.length - 1];
    if (!st) return false;
    st.x = Math.max(.06, Math.min(.94, +x || .5)); st.y = Math.max(.06, Math.min(.94, +y || .5));
    psSaveSet(); psOverlayPaint(); return true;
  }
  function psClearExtras(){
    if (!psx) return;
    psx.props = []; psx.stickers = []; psx.activeSticker = null;
    psSaveSet(); psSyncProps(); psHud();
  }
  function psTrayToggle(open){
    if (!psx) return false;
    psx.tray = open === undefined ? !psx.tray : !!open;
    psx.trayIdx = 0; psHud(); return psx.tray;
  }
  function psOverlayClick(ev){
    if (!psx || !psx.cam || !psx.stickers.length) return false;
    const cv = $('#psOverlay'); if (!cv || !cv.getBoundingClientRect) return false;
    const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return false;
    const cr = psCrop(r.width, r.height, PS_SHAPES[psx.s.shape].r);
    const lx = ev.clientX - r.left, ly = ev.clientY - r.top;
    if (lx < cr.x || lx > cr.x + cr.w || ly < cr.y || ly > cr.y + cr.h) return false;
    const id = psx.activeSticker || psx.stickers[psx.stickers.length - 1].id;
    return psMoveSticker(id, (lx - cr.x) / cr.w, (ly - cr.y) / cr.h);
  }
  function psOverlayPaint(){
    const cv = $('#psOverlay'); if (!cv || !cv.getContext) return;
    const on = !!(psx && psx.cam && !psx.gal);
    cv.classList.toggle('show', on);
    cv.classList.toggle('pick', on && !!(psx.stickers && psx.stickers.length));
    if (!on) return;
    const w = (typeof innerWidth === 'number' && innerWidth > 0) ? innerWidth : 1280;
    const h = (typeof innerHeight === 'number' && innerHeight > 0) ? innerHeight : 800;
    if (cv.width !== w || cv.height !== h){ cv.width = w; cv.height = h; }
    const ctx = cv.getContext('2d'); if (!ctx) return;
    if (ctx.clearRect) ctx.clearRect(0, 0, w, h);
    const cr = psCrop(w, h, PS_SHAPES[psx.s.shape].r);
    if (ctx.strokeRect){
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2;
      if (ctx.setLineDash) ctx.setLineDash([8, 6]);
      ctx.strokeRect(cr.x + 1, cr.y + 1, cr.w - 2, cr.h - 2);
      ctx.restore();
    }
    const r = Math.max(16, Math.round(Math.min(cr.w, cr.h) * .065));
    (psx.stickers || []).forEach(st => psDrawSticker2d(ctx, st.id, cr.x + st.x * cr.w, cr.y + st.y * cr.h, r));
  }
  function psTrayRender(){
    const tray = $('#psTray'); if (!tray || !psx) return;
    const on = !!(psx.cam && psx.tray && !psx.gal);
    tray.classList.toggle('show', on);
    if (!on) return;
    const csOn = (psx.s.costume || 'none');
    tray.innerHTML = (typeof CostumeRules !== 'undefined' ? '<div class="psrow"><b>👗 Costumes</b>' + CostumeRules.CS_LIST.map(c =>
      '<button type="button" data-ps-cos="' + c.id + '" class="' + (csOn === c.id ? 'on' : '') + '">' + c.emoji + ' ' + c.name + '</button>').join('') + '</div>' : '') +
      '<div class="psrow"><b>🎭 Props</b>' + PS_PROPS.map(p =>
      '<button type="button" data-ps-prop="' + p.id + '" class="' + (psx.props.includes(p.id) ? 'on' : '') + '">' + p.e + ' ' + p.n + '</button>'
    ).join('') + '</div><div class="psrow"><b>✨ Stickers</b>' + PS_STICKERS.map(s =>
      '<button type="button" data-ps-stik="' + s.id + '" class="' + (psx.stickers.some(x => x.id === s.id) ? 'on' : '') + '">' + s.e + ' ' + s.n + '</button>'
    ).join('') + ((psx.props.length || psx.stickers.length) ? '<button type="button" id="psClearEx">🧹 Clear</button>' : '') +
      '</div><div class="pstip">Tap props or stickers · tap the frame to move your sticker!</div>';
    const btns = Array.prototype.slice.call(tray.querySelectorAll('button'));
    btns.forEach((b, idx) => {
      if (b.dataset && b.dataset.psProp) b.onclick = () => psToggleProp(b.dataset.psProp);
      else if (b.dataset && b.dataset.psStik) b.onclick = () => psToggleSticker(b.dataset.psStik);
      else if (b.id === 'psClearEx') b.onclick = () => psClearExtras();
      else if (b.dataset && b.dataset.psCos) b.onclick = () => psSetCostume(b.dataset.psCos);
      b.classList.toggle('gpf', idx === ((psx.trayIdx || 0) % Math.max(1, btns.length)));
    });
  }
  function psCamOn(on){
    if (!psx) return; psx.cam = on; psx.count = 0; if (!on) psx.tray = false;
    if (on){ Object.assign(P, {x: PS_MARK[0], y: .45, z: PS_MARK[1], vx: 0, vy: 0, vz: 0}); P.face = 0; for (const k in keys) keys[k] = false; psWear(true); psSyncProps(); banner('📸 Camera on! Pick poses, backdrops, silly props & stickers, then press 📸 Snap!'); }
    else { psClearProps3D(); psWear(false); }
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
    const iw = out.w - pad * 2, ih = out.h - pad - bottom, sr = Math.max(18, Math.round(Math.min(iw, ih) * .065));
    (psx.stickers || []).forEach(st => psDrawSticker2d(ctx, st.id, pad + st.x * iw, pad + st.y * ih, sr));
    let d; try { d = cv.toDataURL('image/jpeg', .85); } catch (e){ return null; }
    const t = Date.now(), photo = {id: 'p' + t, t, d, bg: S.bg}; psx.last = photo; psx.flash = 1;
    S.shots++; psSaveSet();
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
    psOverlayPaint(); psTrayRender();
    if (!psx.cam) return;
    const lab = {pose: pz.e + ' ' + pz.n, bg: PS_BGS[S.bg].e + ' ' + PS_BGS[S.bg].n, frame: PS_FRAMES[S.frame].e + ' ' + PS_FRAMES[S.frame].n, angle: PS_ANGLES[S.angle].e + ' ' + PS_ANGLES[S.angle].n, shape: PS_SHAPES[S.shape].e + ' ' + PS_SHAPES[S.shape].n, border: PS_BORDERS[S.border].e + ' ' + PS_BORDERS[S.border].n, extras: ((typeof CostumeRules !== 'undefined' && psx.s.costume) ? CostumeRules.csGet(psx.s.costume).emoji + ' · ' : '') + '🎭 ' + (psx.props ? psx.props.length : 0) + ' · ✨ ' + (psx.stickers ? psx.stickers.length : 0)};
    Object.keys(lab).forEach(k => { const e = $('#psV_' + k); if (e) e.textContent = lab[k]; });
    const eb = $('#psExtrasBtn'); if (eb) eb.classList.toggle('on', !!psx.tray);
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
    if (jp[10]){ psTrayToggle(); return true; }
    if (psx.tray){
      const tray = $('#psTray'), btns = tray && tray.querySelectorAll ? Array.prototype.slice.call(tray.querySelectorAll('button')) : [];
      if (jp[1]){ psTrayToggle(false); return true; }
      if (jp[2]){ psSnap(); return true; }
      if (jp[3]){ psGalOpen(true); return true; }
      if (btns.length){
        if (jp[15] || jp[13] || jp[5]){ psx.trayIdx = ((psx.trayIdx || 0) + 1) % btns.length; psTrayRender(); return true; }
        if (jp[14] || jp[12] || jp[4]){ psx.trayIdx = ((psx.trayIdx || 0) - 1 + btns.length) % btns.length; psTrayRender(); return true; }
        if (jp[0]){ const b = btns[(psx.trayIdx || 0) % btns.length]; if (b && b.onclick) b.onclick(); return true; }
      }
      return true;
    }
    if (jp[0]) psSnap(); else if (jp[1]) psCamOn(false); else if (jp[3]) psGalOpen(true); else if (jp[4]) psCycle('pose', -1); else if (jp[5]) psCycle('pose', 1);
    else if (jp[14]) psCycle('bg', -1); else if (jp[15]) psCycle('bg', 1); else if (jp[12]) psCycle('frame', 1); else if (jp[13]) psCycle('angle', 1); else if (jp[2]) psCycle('border', 1); else if (jp[6] || jp[7]) psCycle('shape', 1); else return false;
    return true; }
  function psKey(e){ if (!psx || e.repeat || paused) return false; const c = e.code;
    if (psx.gal){ if (c === 'Escape' || c === 'KeyG'){ psGalOpen(false); return true; } return false; }
    if (c === 'KeyG'){ psGalOpen(true); return true; }
    if (!psx.cam){ if (c === 'KeyE'){ psAct(); return true; } return false; }
    const m = {KeyQ: ['pose', -1], KeyE: ['pose', 1], KeyB: ['bg', 1], KeyF: ['frame', 1], KeyC: ['angle', 1], KeyT: ['shape', 1], KeyK: ['border', 1]};
    if (m[c]){ psCycle(m[c][0], m[c][1]); return true; }
    if (c === 'KeyO'){ psTrayToggle(); return true; }
    if (c === 'KeyU' && typeof CostumeRules !== 'undefined'){ psSetCostume(CostumeRules.csNext(psx.s.costume || 'none', 1)); return true; }
    if (c === 'KeyR'){ const nxt = PS_PROPS.find(p => !psx.props.includes(p.id)) || PS_PROPS[0]; psToggleProp(nxt.id); return true; }
    if (c === 'KeyN'){ const nxt = PS_STICKERS.find(s => !psx.stickers.some(x => x.id === s.id)) || PS_STICKERS[0]; psToggleSticker(nxt.id); return true; }
    if (c === 'Space' || c === 'Enter'){ psSnap(); return true; }
    if (c === 'Escape'){ if (psx.tray){ psTrayToggle(false); return true; } psCamOn(false); return true; }
    return true;   // camera mode swallows other keys so you don't walk off the mark
  }
  function photostudioStop(){ psClearProps3D(); psWear(false); psx = null; ['#psBar', '#psCamBtn', '#psGal', '#psTray', '#psOverlay'].forEach(id => { const e = $(id); if (e) e.classList.remove('show', 'pick'); }); const f = $('#psFlash'); if (f) f.style.opacity = 0; }
