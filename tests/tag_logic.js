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

chk('BUILD is 2026.11.12-4 and matches version.json', src.includes("const BUILD = '2026.11.12-4'") && version.build === '2026.11.12-4', version);

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
  /else clipFpCamera\(\)/.test(src) && /camera\.near = Math\.min\(camera\.near,\s*0\.05\)/.test(src) &&
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
  const expected = ARENA - (R + 0.28);
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


console.log('RESULT', pass, '/', pass + fail);
process.exit(fail ? 1 : 0);
