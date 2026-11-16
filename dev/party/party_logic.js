/* Pure Party Pad layout + interact helpers. No rendering, no networking. */
(function (root) {
  'use strict';

  const PY = {
    id: 'party',
    name: 'Party Pad',
    emoji: '🎉',
    floor: {x: 0, z: 0, w: 36, d: 28, top: 0, h: 1.2, color: '#d7b48a'},
    wallsH: 7.2,
    spawn: {x: 0, y: 0.5, z: 8, face: Math.PI},
    dance: {x: 0, z: -1, w: 8, d: 8, r: 4.2},
    sofas: [
      {id: 'sofa-e', x: 12.5, z: 2, w: 3.6, d: 1.4, face: -Math.PI / 2, seat: [11.4, 2]},
      {id: 'sofa-w', x: -12.5, z: 2, w: 3.6, d: 1.4, face: Math.PI / 2, seat: [-11.4, 2]},
      {id: 'sofa-s', x: -6, z: 10.5, w: 3.6, d: 1.4, face: Math.PI, seat: [-6, 9.4]}
    ],
    photo: {x: 0, z: -11.2, r: 2.4},
    ball: {x: 8, z: 8, r: 0.55, bounce: 0.62, friction: 0.82, max: 16, wall: 16.5},
    sitRange: 1.85,
    actRange: 2.2,
    kickRange: 1.65
  };

  function pyOnDance(x, z){
    return Math.abs(x - PY.dance.x) <= PY.dance.w / 2 && Math.abs(z - PY.dance.z) <= PY.dance.d / 2;
  }

  function pyNearPhoto(x, z){
    return Math.hypot(x - PY.photo.x, z - PY.photo.z) <= PY.photo.r;
  }

  function pyNearSofa(x, z){
    let best = null, bestD = PY.sitRange;
    for (const s of PY.sofas){
      const d = Math.hypot(x - s.seat[0], z - s.seat[1]);
      if (d <= bestD){ bestD = d; best = s; }
    }
    return best;
  }

  function pyKick(ball, px, pz, pvx, pvz){
    const b = {x: +ball.x, z: +ball.z, vx: +ball.vx || 0, vz: +ball.vz || 0};
    const dx = b.x - px, dz = b.z - pz;
    const d = Math.hypot(dx, dz);
    if (d > PY.kickRange || d < 1e-5) return {hit: false, ball: b};
    const nx = dx / d, nz = dz / d;
    const incoming = Math.hypot(pvx || 0, pvz || 0);
    const speed = Math.max(7, Math.min(PY.ball.max, incoming * 2.1 + 6));
    b.vx = nx * speed; b.vz = nz * speed;
    b.x += nx * 0.2; b.z += nz * 0.2;
    return {hit: true, ball: b};
  }

  function pyBallStep(ball, dt){
    const b = {x: +ball.x, z: +ball.z, vx: +ball.vx || 0, vz: +ball.vz || 0};
    const wall = PY.ball.wall, bounce = PY.ball.bounce, fr = Math.pow(PY.ball.friction, Math.max(0, dt) * 4);
    b.x += b.vx * dt; b.z += b.vz * dt;
    b.vx *= fr; b.vz *= fr;
    if (Math.hypot(b.vx, b.vz) < 0.15){ b.vx = 0; b.vz = 0; }
    if (b.x > wall){ b.x = wall; b.vx = -Math.abs(b.vx) * bounce; }
    if (b.x < -wall){ b.x = -wall; b.vx = Math.abs(b.vx) * bounce; }
    if (b.z > wall * 0.8){ b.z = wall * 0.8; b.vz = -Math.abs(b.vz) * bounce; }
    if (b.z < -wall * 0.75){ b.z = -wall * 0.75; b.vz = Math.abs(b.vz) * bounce; }
    return b;
  }

  function pyNoNpcs(){ return []; }

  const api = {PY, pyOnDance, pyNearPhoto, pyNearSofa, pyKick, pyBallStep, pyNoNpcs};
  root.PYRules = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
