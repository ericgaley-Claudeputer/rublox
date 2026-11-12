'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(root, 'version.json'), 'utf8'));

let pass = 0, fail = 0;
function chk(n, c, i){
  if (c){ pass++; console.log('PASS ' + n); }
  else { fail++; console.log('FAIL ' + n, i === undefined ? '' : JSON.stringify(i)); }
}

chk('BUILD is 2026.11.12-7 and matches version.json', src.includes("const BUILD = '2026.11.12-7'") && version.build === '2026.11.12-7', version);

chk('the Block Tag arena floor is marked floor-only so the huge slab cannot shove you sideways',
  /fl\.floorOnly\s*=\s*true/.test(src) && /function buildTag\(/.test(src), 'missing floorOnly on tag floor');

chk('resolve ejects on the approach side instead of the box midpoint',
  /function ejectXZ\(/.test(src) && /P\.px\s*=\s*P\.x/.test(src) && /P\.pz\s*=\s*P\.z/.test(src));

chk('Block Tag clamps or respawns anyone who leaves the arena',
  /function tagKeepInArena\(/.test(src) && /tagKeepInArena\(P,\s*true\)/.test(src) && /tagArenaLimit\(/.test(src));

function box(x, y, z, hw, hh, hd, opts){
  return {
    mesh: {position: {x, y, z}},
    hw, hh, hd,
    active: true,
    dx: 0, dy: 0, dz: 0,
    floorOnly: !!(opts && opts.floorOnly),
  };
}
function body(x, y, z, extra){
  return Object.assign({x, y, z, vx: 0, vy: 0, vz: 0, px: x, py: y, pz: z, onGround: true, ground: null}, extra || {});
}

function physics(){
  const a = src.indexOf('function overlaps(b,');
  const b = src.indexOf('function input(){', a);
  assert.ok(a >= 0 && b > a, 'could not extract overlaps/resolve');
  const t0 = src.indexOf('function tagArenaLimit(){');
  const t1 = src.indexOf('function stairs(', t0);
  assert.ok(t0 >= 0 && t1 > t0, 'could not extract tagKeepInArena');
  const ctx = {
    R: 0.45, ARENA: 34, mode: 'tag', solids: [],
    isFinite, Math, Number,
    bodyH(){ return 2.8; },
    P: body(0, 0.05, 0),
    respawn(){ Object.assign(ctx.P, {x: 0, y: 0.05, z: -28, vx: 0, vy: 0, vz: 0}); ctx._respawned = true; },
    _respawned: false,
  };
  vm.createContext(ctx);
  vm.runInContext(src.slice(a, b) + '\n' + src.slice(t0, t1), ctx);
  return ctx;
}

const R = 0.45, ARENA = 34, lim = ARENA - R;

// Recreate the Block Tag boundary: floor 72x72, walls at ±35 thickness 2 (inner face ±34).
function arena(ctx){
  const W = ARENA + 1;
  ctx.solids = [
    box(0, -1, 0, (ARENA * 2 + 4) / 2, 1, (ARENA * 2 + 4) / 2, {floorOnly: true}),
    box(0, 2, W, (ARENA * 2 + 4) / 2, 2, 1),
    box(0, 2, -W, (ARENA * 2 + 4) / 2, 2, 1),
    box(W, 2, 0, 1, 2, (ARENA * 2 + 4) / 2),
    box(-W, 2, 0, 1, 2, (ARENA * 2 + 4) / 2),
  ];
}

{
  const W = physics();
  arena(W);
  // Sprint into the +X wall with a long frame (16 m/s * 0.15s = 2.4m), crossing the midplane.
  const start = ARENA - 1.2; // 32.8, just inside, not yet touching (inner face 34, need 34-R=33.55 to touch)
  const B = body(start, 0.05, 0, {px: start, vx: 16, onGround: true});
  B.x = start + 16 * 0.15; // 35.2, past the wall center at 35
  W.resolve('x', B);
  chk('a long-frame sprint into a Block Tag arena wall stays inside the inner face (no midpoint eject)',
    B.x <= lim + 1e-6 && B.x >= start - 0.01, {x: B.x, lim, start, crossedMid: start + 16 * 0.15 > 35});
}

{
  const W = physics();
  arena(W);
  // Thin 1.5-wide interior wall like the ones in buildTag.
  W.solids.push(box(26, 2, 6, 0.75, 2, 5));
  const start = 26 - 0.75 - R - 0.05; // just outside the west face
  const B = body(start, 0.05, 6, {px: start, vx: 16});
  B.x = start + 16 * 0.15; // tunnels past the midpoint
  W.resolve('x', B);
  chk('a long-frame run into a thin Block Tag wall is pushed back to the side you came from',
    Math.abs(B.x - (26 - 0.75 - R)) < 1e-6, {x: B.x, expected: 26 - 0.75 - R, wentTo: start + 16 * 0.15});
}

{
  const W = physics();
  // Floor NOT marked floorOnly would be the old bug; our arena floor is floorOnly.
  // Also test the y-dip skip: even a non-floorOnly dip of 5cm should not fling (top-0.08).
  const floor = box(0, -1, 0, 36, 1, 36); // not floorOnly, top = 0
  W.solids = [floor];
  const B = body(20, -0.05, 8, {px: 20, pz: 8, vy: -4});
  W.resolve('x', B);
  chk('a slight dip into a standing-on box does not fling you to the box edge',
    Math.abs(B.x - 20) < 1e-6, {x: B.x});
}

{
  const W = physics();
  const floor = box(0, -1, 0, 36, 1, 36); // no floorOnly, deep dip
  W.solids = [floor];
  const B = body(20, -0.2, 8, {px: 20, pz: 8, y: -0.2});
  W.resolve('x', B);
  // With approach-side, even a deep floor overlap should push back to the near face
  // along the motion (we didn't move in x, so min-pen). We mark the real floor floorOnly
  // so this path is skipped in game. Here we only assert we do not use the far face.
  chk('if a huge floor is ever treated as a wall, eject uses the near face not the far map edge',
    Math.abs(B.x) < 36 && B.x > 0, {x: B.x, farEdge: 36 + R});
}

{
  const W = physics();
  W.P = body(50, 0.05, 0, {vx: 8});
  const far = W.tagKeepInArena(W.P, true);
  chk('a player who is glitched far outside the arena is respawned',
    far === true && W._respawned === true && Math.abs(W.P.x) <= lim && Math.abs(W.P.z) <= ARENA, W.P);
}

{
  const W = physics();
  const B = body(35.2, 0.05, 12, {vx: 5, vz: 0});
  const hit = W.tagKeepInArena(B, false);
  chk('a body just outside the inner wall is clamped back inside the arena',
    hit === true && Math.abs(B.x - lim) < 1e-9 && B.vx === 0 && Math.abs(B.z) === 12, {x: B.x, vx: B.vx, lim});
}

{
  const W = physics();
  arena(W);
  // crate in the map like buildTag's 2m boxes
  W.solids.push(box(-12, 1, -10, 2, 1, 2));
  const start = -12 + 2 + R + 0.02;
  const B = body(start, 0.05, -10, {px: start, vx: -16});
  B.x = start - 16 * 0.12;
  W.resolve('x', B);
  chk('running into a Block Tag crate does not teleport you through it',
    Math.abs(B.x - (-12 + 2 + R)) < 1e-6 && B.x > -12, {x: B.x, expected: -12 + 2 + R});
}


chk('Block Tag first-person uses a general clipFpCamera (not the Dream House-only clip) and a closer near plane',
  /function clipFpCamera\(/.test(src) && /function camBodyR\(/.test(src) &&
  /else clipFpCamera\(\)/.test(src) && /camera\.near = Math\.min\(camera\.near,\s*(0\.05|near)\)/.test(src) &&
  /mode === 'dreamhouse' && typeof dhClipFpCamera/.test(src));

{
  const W = physics();
  arena(W);
  W.fpOn = () => false;
  const start = ARENA - 1;
  W.P.x = start; W.P.px = start; W.P.vx = 8;
  W.P.x = start + 2;
  W.resolve('x', W.P);
  chk('third-person Block Tag still stands off walls by the usual body radius',
    Math.abs(W.P.x - (ARENA - R)) < 1e-6, {x: W.P.x, expected: ARENA - R});
}

{
  const W = physics();
  arena(W);
  W.fpOn = () => true;
  const start = ARENA - 1;
  W.P.x = start; W.P.px = start; W.P.vx = 8;
  W.P.x = start + 2;
  W.resolve('x', W.P);
  const expected = ARENA - (R + 0.4);
  chk('first-person Block Tag keeps the player a little farther from walls so the eye is not in the surface',
    Math.abs(W.P.x - expected) < 1e-6, {x: W.P.x, expected, R});
}

function fpCam(){
  const a = src.indexOf('function camSolidAt(');
  const b = src.indexOf('function updateCamera(){', a);
  assert.ok(a >= 0 && b > a, 'could not extract clipFpCamera');
  const pos = {x: 0, y: 0, z: 0, set(x, y, z){ this.x = x; this.y = y; this.z = z; return this; }};
  const ctx = {
    Math,
    mode: 'tag',
    fpOn: () => true,
    eyeHeight: () => 2.45,
    P: body(ARENA - R, 0.05, 0),
    cam: {yaw: -Math.PI / 2, pitch: 0, dist: 11},
    solids: [],
    camera: {
      near: 0.1,
      position: pos,
      lookAt(){},
      updateProjectionMatrix(){ ctx.camera._upd = true; },
    },
  };
  vm.createContext(ctx);
  vm.runInContext(src.slice(a, b), ctx);
  return ctx;
}

{
  const W = fpCam();
  arena(W);
  // Face the +X arena wall and place the default FP eye (P + forward*0.22) almost in the surface.
  W.P.x = ARENA - R;
  W.P.y = 0.05;
  W.P.z = 0;
  W.cam.yaw = -Math.PI / 2;
  const fx = -Math.sin(W.cam.yaw);
  W.camera.position.set(W.P.x + fx * 0.22, W.P.y + 2.45, W.P.z);
  const unclipped = W.camera.position.x;
  const ok = W.clipFpCamera();
  const wallFace = ARENA; // inner face at x=34
  chk('pressing a Block Tag wall in first-person pulls the eye back and drops the near plane to 0.05',
    ok === true && W.camera.near <= 0.05 && W.camera._upd === true &&
    W.camera.position.x < wallFace - 0.4 && W.camera.position.x < unclipped - 0.2,
    {camX: W.camera.position.x, unclipped, near: W.camera.near, wallFace, ok});
  chk('the first-person eye is not left inside the Block Tag wall AABB',
    Math.abs(W.camera.position.x - 35) >= 1 && W.camera.position.y > 0,
    {cam: {x: W.camera.position.x, y: W.camera.position.y, z: W.camera.position.z}});
}



{
  const W = physics();
  arena(W);
  W.fpOn = () => true;
  // Crate like buildTag's 2 m boxes: mesh y=1, hh=1 (top=2, bottom=0).
  const crate = box(-12, 1, -10, 2, 1, 2);
  W.solids.push(crate);
  const start = -12 + 2 + R + 0.02;
  W.P.x = start; W.P.z = -10; W.P.y = 0.05; W.P.py = 0.05; W.P.px = start; W.P.pz = -10; W.P.vy = 0;
  W.P.x = start - 0.3; // overlap the crate from the east
  W.resolve('x', W.P);
  W.resolve('z', W.P);
  W.resolve('y', W.P);
  chk('walking into a Block Tag crate from the side does not teleport you under it',
    W.P.y >= -0.05 && W.P.x >= -12 + 2 && W.P.x > -12, {x: W.P.x, y: W.P.y, under: -12, top: 2});
}

function fpWorld(){
  const W = physics();
  const C = fpCam();
  // share bodies/solids/cam/camera
  C.solids = W.solids;
  C.P = W.P;
  C.mode = 'tag';
  C.fpOn = () => true;
  C.R = 0.45;
  C.bodyH = W.bodyH;
  C.overlaps = W.overlaps;
  C.ejectXZ = W.ejectXZ;
  C.camBodyR = W.camBodyR;
  C.resolve = W.resolve;
  W.clipFpCamera = C.clipFpCamera;
  W.recoverFpPlayer = C.recoverFpPlayer;
  W.camSolidAt = C.camSolidAt;
  W.camera = C.camera;
  W.cam = C.cam;
  W.eyeHeight = C.eyeHeight;
  W.fpOn = () => true;
  return W;
}

function insideSolid(W, x, y, z, pad){
  pad = pad == null ? 0.02 : pad;
  return (W.solids || []).some(b => {
    if (!b || !b.active || b.floorOnly || !b.mesh) return false;
    const p = b.mesh.position;
    return Math.abs(x - p.x) < b.hw + pad && Math.abs(y - p.y) < b.hh + pad && Math.abs(z - p.z) < b.hd + pad;
  });
}

{
  const W = fpWorld();
  arena(W);
  W.solids.push(box(-12, 1, -10, 2, 1, 2));
  // Face -X at the crate and run into it for many frames (~8 s at 60 fps).
  const face = -12 + 2; // east face of crate at x=-10
  W.P.x = face + R + 0.5; W.P.y = 0.05; W.P.z = -10;
  W.P.vx = -16; W.P.vy = 0; W.P.vz = 0;
  W.cam.yaw = Math.PI / 2; // look -X (fx = -1)
  let trapped = false, under = false, camInside = 0, minY = 99, maxInside = 0;
  const dt = 1 / 60;
  for (let i = 0; i < 500; i++){
    W.P.px = W.P.x; W.P.x += W.P.vx * dt; W.resolve('x', W.P);
    W.P.pz = W.P.z; W.P.z += W.P.vz * dt; W.resolve('z', W.P);
    W.P.py = W.P.y; W.P.vy = Math.max(-40, W.P.vy - 45 * dt); W.P.y += W.P.vy * dt; W.resolve('y', W.P);
    if (W.recoverFpPlayer) W.recoverFpPlayer();
    W.clipFpCamera();
    if (W.P.y < -0.2) under = true;
    if (W.P.y < minY) minY = W.P.y;
    const cam = W.camera.position;
    if (insideSolid(W, cam.x, cam.y, cam.z, 0.02)){ camInside++; if (camInside > maxInside) maxInside = camInside; trapped = true; }
    else camInside = 0;
  }
  chk('running first-person into a Block Tag crate for 8s never puts the player under it or the eye inside it',
    !under && !trapped && minY >= -0.05 && W.P.y >= -0.05 && W.camera.near <= 0.05 && maxInside === 0,
    {y: W.P.y, minY, x: W.P.x, cam: {x: W.camera.position.x, y: W.camera.position.y, z: W.camera.position.z}, maxInside, near: W.camera.near});
}

{
  const W = fpWorld();
  arena(W);
  // Sprint into the +X brown arena wall for many frames, looking at it.
  W.P.x = ARENA - 2; W.P.y = 0.05; W.P.z = 0;
  W.P.vx = 16; W.P.vy = 0; W.P.vz = 0;
  W.cam.yaw = -Math.PI / 2; // look +X
  let under = false, trapped = false, minY = 99, maxInside = 0, camInside = 0;
  const dt = 1 / 60;
  for (let i = 0; i < 500; i++){
    W.P.px = W.P.x; W.P.x += W.P.vx * dt; W.resolve('x', W.P);
    W.P.pz = W.P.z; W.P.z += W.P.vz * dt; W.resolve('z', W.P);
    W.P.py = W.P.y; W.P.vy = Math.max(-40, W.P.vy - 45 * dt); W.P.y += W.P.vy * dt; W.resolve('y', W.P);
    if (W.recoverFpPlayer) W.recoverFpPlayer();
    W.clipFpCamera();
    if (W.P.y < -0.2) under = true;
    if (W.P.y < minY) minY = W.P.y;
    const cam = W.camera.position;
    if (insideSolid(W, cam.x, cam.y, cam.z, 0.02)){ camInside++; if (camInside > maxInside) maxInside = camInside; trapped = true; }
    else camInside = 0;
  }
  const wallFace = ARENA;
  chk('running first-person into a Block Tag arena wall for 8s never buries the eye in the wall',
    !under && !trapped && minY >= -0.05 && W.P.x <= wallFace - R + 1e-6 && W.camera.position.x < wallFace - 0.3 && W.camera.near <= 0.05,
    {x: W.P.x, y: W.P.y, minY, camX: W.camera.position.x, camY: W.camera.position.y, maxInside, near: W.camera.near});
}

{
  const W = physics();
  W.mode = 'pethotel';
  W.fpOn = () => true;
  W.P.x = 12; W.P.px = 12; W.P.vx = 8; W.P.y = 0.05;
  W.solids = [box(13.7, 2, 2.5, 0.25, 2, 12.5)];
  W.P.x = 13.6;
  W.resolve('x', W.P);
  const expected = 13.7 - 0.25 - (R + 0.4);
  chk('Pet Hotel first-person also stands the player off walls so the eye stays outside the near plane',
    Math.abs(W.P.x - expected) < 1e-6, {x: W.P.x, expected, mode: W.mode});
}


console.log('RESULT', pass, '/', pass + fail);
process.exit(fail ? 1 : 0);
