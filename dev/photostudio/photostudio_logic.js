// Non-GUI logic test for Star Snaps Photo Studio (tests/p40/photostudio.js) — stubbed engine, canvas and localStorage.
const fs = require('fs'), vm = require('vm'), path = require('path');
let pass = 0, fail = 0; const chk = (n, c, i) => { if (c) pass++; else fail++; console.log((c ? 'PASS ' : 'FAIL ') + n, c ? '' : JSON.stringify(i === undefined ? '' : i)); };
const SRC = fs.readFileSync(process.env.PS_SRC || path.join(__dirname, 'photostudio.js'), 'utf8');
const HTML = process.env.PS_HTML || path.join(__dirname, '../../index.html');
function world(store, opt = {}){
  const V = () => ({x: 0, y: 0, z: 0, set(x, y, z){ this.x = x; this.y = y; this.z = z; }, multiplyScalar(){ return this; }});
  const O = () => ({position: V(), rotation: V(), scale: V(), visible: true});
  const log = {draw: [], render: 0, anchors: [], look: null};
  const ctx2 = () => ({createLinearGradient: () => ({addColorStop(){}}), fillRect(){}, fillText(){}, drawImage(...a){ log.draw.push(a); }, set fillStyle(v){}, set font(v){}, set textAlign(v){}, set globalAlpha(v){}});
  const canvas = () => ({width: 300, height: 150, getContext: ctx2, toDataURL: (t, q) => 'data:' + (t || 'image/png') + ';base64,QUJD'});
  const els = {}, ls = {
    getItem: k => k in store ? store[k] : null,
    setItem: (k, v) => { if (opt.quota && String(v).length > opt.quota) throw new Error('QuotaExceededError'); store[k] = String(v); }};
  const POSE = n => ({e: '★', n: 'P' + n, p: t => ({aL: n, spin: n === 4 ? t * 7 : 0})});
  const ctx = {
    console, Math, JSON, Object, Array, Number, String, Date, localStorage: ls,
    THREE: new Proxy({}, {get: () => function(){ return O(); }}), scene: {add(){}, remove(){}, background: null},
    load: (k, d) => { try { return k in store ? JSON.parse(store[k]) : d; } catch (e){ return d; } }, save: (k, v) => { store[k] = JSON.stringify(v); },
    $: id => els[id] || (els[id] = {textContent: '', innerHTML: '', style: {}, classList: {s: new Set(), add(c){ this.s.add(c); }, remove(c){ this.s.delete(c); }, toggle(c, on){ on ? this.s.add(c) : this.s.delete(c); }, contains(c){ return this.s.has(c); }}, querySelectorAll: () => []}),
    document: {createElement: t => t === 'canvas' ? canvas() : {click(){ log.anchors.push({href: this.href, download: this.download}); }, remove(){}}, body: {appendChild(){}}},
    renderer: {domElement: {width: 1600, height: 900}, render(s, c){ log.render++; }},
    camera: {position: V(), lookAt(x, y, z){ log.look = [x, y, z]; }},
    paused: false, worldT: 1.5, banners: [], keys: {}, P: {x: 0, y: .45, z: 9, face: 0, vx: 0, vz: 0}, FS_POSES: [1, 2, 3, 4, 5, 6, 7].map(POSE),
    plat: () => ({mesh: O()}), label: () => O(), SND: {coin(){}, cp(){}}, mp: {on: !!opt.mp, host: false}, out: [], log
  };
  ctx.banner = t => ctx.banners.push(t); ctx.mpSendTo = (c, m) => ctx.out.push(m); ctx.updateCamera = () => ctx.A.photoCam();
  vm.createContext(ctx);
  vm.runInContext(SRC + '\n;globalThis.A = {get psx(){ return psx; }, buildPhotoStudio, photostudioEnter, photostudioUpdate, photostudioAnimate, photostudioStop, psAct, psCamOn, psSnap, psCapture, psCycle, psSet, psGallery, psStore, psDelete, psCamPos, psCrop, psOutSize, psFileName, psPosed, photoCam, psPad, psKey, psGalOpen, psDownload, PS_BGS, PS_FRAMES, PS_ANGLES, PS_SHAPES, PS_BORDERS, PS_MAX};', ctx);
  return ctx;
}
const tick = (W, s) => { for (let t = 0; t < s; t += 1 / 60){ W.worldT += 1 / 60; W.A.photostudioUpdate(1 / 60); W.A.photostudioAnimate(1 / 60); } };
const key = (W, code) => W.A.psKey({code, repeat: false});
const jp = (...i) => { const a = []; i.forEach(k => a[k] = true); return a; };

// --- build, defaults, sanitised settings ---
const st = {rubloxAvatar: '{"shirt":"#ff0000"}', rubloxCoins: '42', rubloxWaterPark: '{"best":61}'}, W = world(st);
W.A.buildPhotoStudio(); W.A.photostudioEnter();
chk('studio builds with default settings', W.A.psx && JSON.stringify(W.A.psSet()) === JSON.stringify({bg: 0, frame: 0, angle: 0, shape: 0, border: 0, pose: 0, shots: 0}));
chk('8 backdrops, 3 framings, 5 camera angles, 3 shapes, 5 borders', W.A.PS_BGS.length === 8 && W.A.PS_FRAMES.length === 3 && W.A.PS_ANGLES.length === 5 && W.A.PS_SHAPES.length === 3 && W.A.PS_BORDERS.length === 5);
const bad = world({rubloxPhotoStudio: '{"bg":99,"frame":-4,"angle":"x","pose":1e9,"shape":2,"shots":-3}'}).A.psSet();
chk('damaged settings save is clamped', bad.bg === 7 && bad.frame === 0 && bad.angle === 0 && bad.pose === 7 && bad.shape === 2 && bad.shots === 0, bad);
// --- entering the camera ---
chk('camera needs the ⭐ spot', !W.A.psAct() && !W.A.psx.cam);
W.P.x = .5; W.P.z = .4; tick(W, .1); chk('standing on the spot shows the camera button', W.A.psx.near && W.$('#psCamBtn').classList.contains('show'));
chk('E on the spot enters camera mode, snaps you to the mark facing the camera', key(W, 'KeyE') && W.A.psx.cam && W.P.x === 0 && W.P.z === 0 && W.P.face === 0);
W.P.x = 3; W.P.vx = 5; tick(W, .1); chk('camera mode holds you on the mark', W.P.x === 0 && W.P.vx === 0);
chk('camera mode swallows movement keys', key(W, 'KeyW') === true);
// --- poses (uses the fashion poses on your own avatar) ---
chk('natural pose = normal animation', W.A.psPosed() === null);
key(W, 'KeyE'); chk('E cycles to first pose and it applies', W.A.psx.s.pose === 1 && W.A.psPosed().aL === 1);
key(W, 'KeyQ'); key(W, 'KeyQ'); chk('Q goes back and wraps to the last pose', W.A.psx.s.pose === 7, W.A.psx.s.pose);
W.A.psx.s.pose = 4; chk('twirl is held still for the photo', W.A.psPosed().spin === 0);
// --- options cycle + persist ---
for (let k = 0; k < 8; k++) key(W, 'KeyB'); chk('backdrop cycles all 8 and wraps', W.A.psx.s.bg === 0);
key(W, 'KeyB'); key(W, 'KeyF'); key(W, 'KeyC'); key(W, 'KeyT'); key(W, 'KeyK');
chk('choices are saved on the device', JSON.parse(st.rubloxPhotoStudio).bg === 1 && JSON.parse(st.rubloxPhotoStudio).frame === 1 && JSON.parse(st.rubloxPhotoStudio).angle === 1 && JSON.parse(st.rubloxPhotoStudio).shape === 1 && JSON.parse(st.rubloxPhotoStudio).border === 1);
// --- camera framing math ---
const S0 = {frame: 0, angle: 0}, cps = [0, 1, 2].map(f => W.A.psCamPos({frame: f, angle: 0}, 0, .45, 0));
chk('front camera is in front of you and looks at you', cps.every(c => c.z > 2 && Math.abs(c.x) < 1e-9 && c.tx === 0 && c.tz === 0));
chk('full body is farther than waist-up, which is farther than close-up', cps[0].z > cps[1].z && cps[1].z > cps[2].z);
chk('close-up aims at the face, full body at the middle', cps[2].ty > cps[1].ty && cps[1].ty > cps[0].ty);
const ang = [0, 1, 2, 3, 4].map(a => W.A.psCamPos({frame: 0, angle: a}, 0, .45, 0));
chk('left/right angles swing to opposite sides', ang[1].x < -1 && ang[2].x > 1);
chk('hero is lower and from-above is higher than front', ang[3].y < ang[0].y && ang[4].y > ang[0].y);
let inside = true; for (let f = 0; f < 3; f++) for (let a = 0; a < 5; a++){ const c = W.A.psCamPos({frame: f, angle: a}, 0, .45, 0); if (Math.abs(c.x) > 19 || Math.abs(c.z) > 19 || c.y < .5) inside = false; }
chk('every camera stays inside the studio and above the floor', inside);
chk('photoCam drives the camera only in camera mode', W.A.photoCam() && W.log.look && (() => { const V = world({}); V.A.buildPhotoStudio(); return !V.A.photoCam(); })());
// --- crop + output size ---
const cr = W.A.psCrop(1600, 900, 4 / 5); chk('crop to tall keeps full height, centred', cr.h === 900 && cr.w === 720 && cr.x === 440);
const cw = W.A.psCrop(800, 900, 16 / 9); chk('crop to wide keeps full width, centred', cw.w === 800 && cw.h === 450 && cw.y === 225);
chk('output sizes match each shape', W.A.PS_SHAPES.every(s => { const o = W.A.psOutSize(s.r); return Math.abs(o.w / o.h - s.r) < .01 && Math.max(o.w, o.h) === 900; }));
// --- snap: countdown → capture → gallery ---
const r0 = W.log.render; chk('Space starts a 3-second countdown', key(W, 'Space') && W.A.psx.count > 2.9);
chk('no double snap during the countdown', !W.A.psSnap());
tick(W, 2.5); chk('nothing captured before the countdown ends', W.A.psGallery().length === 0);
tick(W, .7); const g1 = W.A.psGallery();
chk('photo captured after countdown and saved on this device', g1.length === 1 && /^data:image\/jpeg;base64,/.test(g1[0].d) && W.log.render === r0 + 1);
const dr = W.log.draw[W.log.draw.length - 1]; chk('capture crops the 3D view to the chosen shape (square)', dr && Math.abs(dr[3] / dr[4] - 1) < .01, dr && dr.slice(1, 5));
chk('shots counter saved', W.A.psSet().shots === 1);
// --- gallery: cap, quota, delete, junk filtering ---
for (let k = 0; k < 14; k++) W.A.psStore({id: 'q' + k, t: 1e12 + k, d: 'data:image/jpeg;base64,QUJD', bg: 0});
const g2 = W.A.psGallery(); chk('gallery keeps the newest 12', g2.length === 12 && g2[11].id === 'q13' && g2[0].id === 'q2');
chk('delete removes one photo', W.A.psDelete('q5') === 11 && !W.A.psGallery().some(p => p.id === 'q5'));
const Q = world({}, {quota: 400}); Q.A.buildPhotoStudio(); for (let k = 0; k < 6; k++) Q.A.psStore({id: 'z' + k, t: 1e12 + k, d: 'data:image/jpeg;base64,' + 'A'.repeat(60), bg: 0});
const qg = Q.A.psGallery(); chk('out of device space: oldest photos dropped so the new one fits', qg.length >= 1 && qg.length < 6 && qg[qg.length - 1].id === 'z5', qg.map(p => p.id));
const Q2 = world({}, {quota: 50}); chk('photo too big for the device: reports 0 (download instead)', Q2.A.psStore({id: 'big', t: 1e12, d: 'data:image/jpeg;base64,' + 'A'.repeat(200), bg: 0}) === 0);
const J = world({rubloxPhotos: JSON.stringify([{id: 'a', t: 5, d: 'https://example.com/x.jpg'}, {id: 'b', t: 6, d: 'javascript:alert(1)'}, {id: 'c', t: 7, d: 'data:image/png;base64,QQ=='}, null, 'x'])});
chk('gallery ignores anything that is not a local image (no remote/script links)', J.A.psGallery().length === 1 && J.A.psGallery()[0].id === 'c');
// --- download ---
chk('file name is dated and safe', W.A.psFileName(new Date(2026, 10, 7, 14, 5, 9).getTime()) === 'rublox-photo-20261107-140509.jpg');
W.A.psDownload(W.A.psGallery()[0]); const an = W.log.anchors[0]; chk('download saves the local image file (no upload)', an && /^data:image\//.test(an.href) && /\.jpg$/.test(an.download));
// --- gallery + exit keys/pad ---
key(W, 'KeyG'); chk('G opens My Photos', W.A.psx.gal && W.$('#psGal').classList.contains('show'));
key(W, 'Escape'); chk('Esc closes My Photos', !W.A.psx.gal);
key(W, 'Escape'); chk('Esc leaves camera mode', !W.A.psx.cam);
W.A.psCamOn(true); const p0 = W.A.psx.s.pose, b0 = W.A.psx.s.bg;
W.A.psPad(jp(5)); W.A.psPad(jp(15)); chk('Xbox RB pose / d-pad backdrop', W.A.psx.s.pose === (p0 + 1) % 8 && W.A.psx.s.bg === (b0 + 1) % 8);
W.A.psPad(jp(0)); chk('Xbox Ⓐ snaps', W.A.psx.count > 0); tick(W, 3.3);
W.A.psPad(jp(1)); chk('Xbox Ⓑ leaves camera mode', !W.A.psx.cam);
W.A.psPad(jp(3)); chk('Xbox Ⓨ opens My Photos', W.A.psx.gal); W.A.psGalOpen(false);
// --- privacy + other saves untouched ---
chk('other saves untouched (avatar, coins, water park)', st.rubloxAvatar === '{"shirt":"#ff0000"}' && st.rubloxCoins === '42' && st.rubloxWaterPark === '{"best":61}');
chk('only photo-studio keys added', Object.keys(st).filter(k => !['rubloxAvatar', 'rubloxCoins', 'rubloxWaterPark'].includes(k)).every(k => k === 'rubloxPhotoStudio' || k === 'rubloxPhotos'), Object.keys(st));
const M = world({}, {mp: true}); M.A.buildPhotoStudio(); M.P.x = 0; M.P.z = 0; tick(M, .1); M.A.psAct(); M.A.psSnap(); tick(M, 3.3);
chk('multiplayer: photo taken locally, nothing sent to other players', M.A.psGallery().length === 1 && M.out.length === 0);
chk('source has no network calls or remote URLs', !/fetch\(|XMLHttpRequest|WebSocket|sendBeacon|mpSend|https?:\/\//.test(SRC));
W.A.photostudioStop(); chk('leaving the studio clears it', W.A.psx === null && !W.$('#psBar').classList.contains('show'));
// --- built page integration ---
if (fs.existsSync(HTML)){ const h = fs.readFileSync(HTML, 'utf8');
  chk('built page: studio card, hooks, Xbox back map, real avatar pose hook', ["id:'photostudio'", 'buildPhotoStudio()', 'if (psx && photoCam()) return;', 'psGal: \'#psGalClose\'', 'applyPose(dt, psPosed() || (rc && rc.me', "mode === 'photostudio' && psx && psPad(jp)", "mode === 'photostudio' && psx && psKey(e)"].every(s => h.includes(s)));
  chk('built page: all four additions still present', ["id:'petisland'", "id:'bakery'", "id:'waterpark'", "id:'photostudio'"].every(s => h.includes(s)));
  chk('built page: photos never put on the multiplayer wire', !/msg\.ps\b|psx\s*&&[^\n]*msg\./.test(h));
} else console.log('SKIP built page checks (no index.html)');
console.log('RESULT', pass, '/', pass + fail); process.exit(fail ? 1 : 0);
