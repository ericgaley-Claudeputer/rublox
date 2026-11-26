/* GB-7: dress-up costumes for Star Snaps Photo Studio and the hub / avatar Photo Booth.
   A costume swaps your shirt / pants colours for the photo and adds a few original pieces on top.
   Nothing here ever sits over the eyes or mouth (tests/costumes.js checks the 2D art and the 3D parts). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CostumeRules = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const CS_LIST = [
    {id:'none',     name:'No costume',            emoji:'🙂'},
    {id:'princess', name:'Rosepetal Princess',    emoji:'👸', look:{shirt:'#ff8fc8', pants:'#ffd23f', pantsPat:'dress', shirtPat:null, hat:'none'}},
    {id:'astro',    name:'Starhopper Astronaut',  emoji:'🧑‍🚀', look:{shirt:'#eef1f6', pants:'#d4d9e4', pantsPat:null, shirtPat:null, hat:'none'}},
    {id:'rover',    name:'Sea Rover Captain',     emoji:'⚓', look:{shirt:'#f4f1e6', pants:'#3a2a1a', pantsPat:null, shirtPat:null, hat:'none'}},
    {id:'dino',     name:'Chompy Dino Onesie',    emoji:'🦖', look:{shirt:'#5fbf4a', pants:'#5fbf4a', pantsPat:null, shirtPat:null, hat:'none'}},
    {id:'chef',     name:'Crumbcake Chef',        emoji:'👨‍🍳', look:{shirt:'#ffffff', pants:'#2b2b33', pantsPat:null, shirtPat:null, hat:'toque'}},
    {id:'ballet',   name:'Twirlwind Ballerina',   emoji:'🩰', look:{shirt:'#ffb3d9', pants:'#ffc9e3', pantsPat:null, shirtPat:null, hat:'none'}}
  ];
  function csGet(id){ return CS_LIST.find(c => c.id === id) || CS_LIST[0]; }
  function csClean(id){ return csGet(id).id; }
  function csNext(id, dir){ const i = CS_LIST.findIndex(c => c.id === csClean(id)); const n = CS_LIST.length; return CS_LIST[((i + (dir == null ? 1 : dir)) % n + n) % n].id; }
  // The avatar to draw for the photo: your face, skin and hair stay; the costume swaps the clothes.
  function csApply(av, id){
    const c = csGet(id), out = Object.assign({}, av || {});
    if (!c.look) return out;
    Object.assign(out, c.look);
    if (out.hat === 'none' && av && av.hat === 'pumpkin') out.hat = 'none';
    out.costume = c.id;
    return out;
  }

  // ---- 2D pieces, drawn on the 260x310 avatar art (the face sits in x 90..170, y 42..114) ----
  function csDraw2d(ctx, id){
    if (!ctx || !ctx.fill) return;
    const c = csGet(id).id;
    const P = (pts, col) => { ctx.fillStyle = col; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); };
    const C = (x, y, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); };
    const Rc = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.rect(x, y, w, h); ctx.fill(); };
    const E = (x, y, rx, ry, col) => { ctx.fillStyle = col; ctx.beginPath(); if (ctx.ellipse) ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); else ctx.arc(x, y, Math.max(rx, ry), 0, Math.PI * 2); ctx.fill(); };
    ctx.save();
    if (c === 'princess'){
      P([[102, 42], [104, 26], [114, 34], [122, 18], [130, 30], [138, 18], [146, 34], [156, 26], [158, 42]], '#ffd84a');
      Rc(102, 38, 56, 5, '#e8a90c');
      C(130, 32, 4, '#ff4d94'); C(114, 36, 3, '#7fd6ff'); C(146, 36, 3, '#7fd6ff');
      C(76, 122, 15, '#ffb3d9'); C(184, 122, 15, '#ffb3d9');            // puffy sleeves
      [104, 117, 130, 143, 156].forEach(x => C(x, 120, 3.4, '#ffffff'));  // pearl necklace
      P([[112, 150], [148, 150], [140, 172], [120, 172]], '#ffd23f');     // bodice gem panel
      C(130, 160, 5, '#ff4d94');
    } else if (c === 'astro'){
      if (ctx.stroke){ ctx.strokeStyle = 'rgba(200,215,235,.9)'; ctx.lineWidth = 5; ctx.beginPath(); if (ctx.ellipse) ctx.ellipse(130, 78, 56, 50, 0, 0, Math.PI * 2); else ctx.arc(130, 78, 56, 0, Math.PI * 2); ctx.stroke(); }
      Rc(90, 114, 80, 10, '#b8c2d4');                                    // helmet collar ring
      Rc(110, 138, 40, 26, '#3a4a6a');                                    // chest panel
      C(118, 146, 4, '#ff4d5e'); C(130, 146, 4, '#ffd23f'); C(142, 146, 4, '#2ec27e');
      Rc(116, 155, 28, 4, '#7fd6ff');
      Rc(166, 18, 4, 24, '#9aa6ba'); C(168, 16, 6, '#ff4d5e');            // antenna
      P([[64, 132], [70, 120], [76, 132], [70, 128]], '#3a86ff');          // shoulder star patch
    } else if (c === 'rover'){
      P([[80, 42], [96, 18], [130, 10], [164, 18], [180, 42], [130, 34]], '#1d2a4a');   // two-point captain hat
      P([[84, 42], [130, 35], [176, 42], [130, 44]], '#f4c430');
      C(130, 24, 6, '#ffffff'); Rc(128.5, 18, 3, 12, '#1d2a4a');            // white rope-knot badge
      Rc(86, 118, 22, 92, '#2b3f78'); Rc(152, 118, 22, 92, '#2b3f78');     // open navy coat
      P([[104, 116], [116, 116], [160, 200], [148, 204]], '#d9343f');       // red sash
      [134, 156, 178].forEach(y => { C(98, y, 3.2, '#f4c430'); C(162, y, 3.2, '#f4c430'); });
      Rc(98, 128, 64, 6, '#e8dcc4'); Rc(98, 146, 64, 6, '#e8dcc4');         // stripy shirt
    } else if (c === 'dino'){
      Rc(84, 26, 92, 20, '#4aa63a');                                       // hood cap over the hair
      Rc(80, 40, 12, 64, '#4aa63a'); Rc(168, 40, 12, 64, '#4aa63a');       // hood sides (beside the face)
      [96, 110, 124, 138, 152, 164].forEach(x => P([[x, 46], [x + 4, 54], [x + 8, 46]], '#ffffff'));   // soft felt teeth
      [[100, 26], [118, 18], [136, 16], [154, 22]].forEach(([x, y]) => P([[x, y + 2], [x + 8, y - 12], [x + 16, y + 2]], '#ff9f1c'));   // spikes
      C(108, 34, 6, '#ffffff'); C(152, 34, 6, '#ffffff'); C(109, 35, 3, '#1d2340'); C(151, 35, 3, '#1d2340');
      E(130, 164, 26, 34, '#f4e3a1');                                     // belly
      P([[180, 228], [236, 262], [182, 252]], '#4aa63a');                  // tail
      P([[196, 236], [204, 226], [208, 242]], '#ff9f1c');
    } else if (c === 'chef'){
      P([[112, 112], [148, 112], [130, 132]], '#e63946');                  // neckerchief
      Rc(104, 146, 52, 94, '#f6f6f6'); Rc(104, 146, 52, 6, '#d5d8e4');      // apron
      Rc(116, 182, 28, 16, '#e9ecf4');                                      // apron pocket
      C(126, 190, 2.4, '#ffd23f'); C(134, 188, 2.4, '#ffd23f');
      [130, 146, 162].forEach(y => C(122, y + 6, 2.6, '#2b2b33'));
    } else if (c === 'ballet'){
      E(130, 208, 70, 15, '#ff8fc8'); E(130, 204, 62, 11, '#ffc9e3'); E(130, 200, 52, 8, '#ffe0ef');   // tutu
      [[100, 38], [114, 34], [130, 32], [146, 34], [160, 38]].forEach(([x, y], i) => { C(x, y, 5, i % 2 ? '#ffffff' : '#ff6fb5'); C(x, y, 2, '#ffd23f'); });   // flower crown
      Rc(126, 116, 8, 30, '#ff8fc8');
    }
    ctx.restore();
  }

  // ---- 3D pieces. at:'head' is relative to the head (y 0..0.8, face on z = +0.4), at:'body' to the player. ----
  const PARTS = {
    princess: [
      {at:'head', s:'box', a:[0.62, 0.08, 0.06], c:'#e8a90c', p:[0, 0.86, 0.18]},
      {at:'head', s:'cone', a:[0.07, 0.2, 6], c:'#ffd84a', p:[0, 1.0, 0.18]},
      {at:'head', s:'cone', a:[0.06, 0.15, 6], c:'#ffd84a', p:[-0.2, 0.97, 0.18]},
      {at:'head', s:'cone', a:[0.06, 0.15, 6], c:'#ffd84a', p:[0.2, 0.97, 0.18]},
      {at:'head', s:'sph', a:[0.045], c:'#ff4d94', p:[0, 0.88, 0.22]},
      {at:'body', s:'sph', a:[0.27], c:'#ffb3d9', p:[-0.68, 1.95, 0]},
      {at:'body', s:'sph', a:[0.27], c:'#ffb3d9', p:[0.68, 1.95, 0]},
      {at:'body', s:'torus', a:[0.3, 0.035], c:'#ffffff', p:[0, 2.02, 0.02], r:[Math.PI / 2, 0, 0]}
    ],
    astro: [
      {at:'body', s:'torus', a:[0.44, 0.08], c:'#b8c2d4', p:[0, 1.97, 0], r:[Math.PI / 2, 0, 0]},
      {at:'body', s:'box', a:[0.72, 0.82, 0.3], c:'#d4d9e4', p:[0, 1.55, -0.42]},
      {at:'body', s:'box', a:[0.42, 0.28, 0.05], c:'#3a4a6a', p:[0, 1.62, 0.29]},
      {at:'body', s:'sph', a:[0.035], c:'#ff4d5e', p:[-0.1, 1.64, 0.32]},
      {at:'body', s:'sph', a:[0.035], c:'#2ec27e', p:[0.1, 1.64, 0.32]},
      {at:'head', s:'cyl', a:[0.025, 0.025, 0.36], c:'#9aa6ba', p:[0.3, 0.98, -0.1]},
      {at:'head', s:'sph', a:[0.06], c:'#ff4d5e', p:[0.3, 1.18, -0.1]}
    ],
    rover: [
      {at:'head', s:'box', a:[1.12, 0.26, 0.34], c:'#1d2a4a', p:[0, 0.96, 0]},
      {at:'head', s:'box', a:[1.14, 0.05, 0.36], c:'#f4c430', p:[0, 0.84, 0]},
      {at:'head', s:'sph', a:[0.06], c:'#ffffff', p:[0, 0.98, 0.18]},
      {at:'body', s:'box', a:[0.12, 1.06, 0.05], c:'#d9343f', p:[0, 1.5, 0.29], r:[0, 0, 0.6]},
      {at:'body', s:'box', a:[0.22, 0.98, 0.05], c:'#2b3f78', p:[-0.36, 1.5, 0.28]},
      {at:'body', s:'box', a:[0.22, 0.98, 0.05], c:'#2b3f78', p:[0.36, 1.5, 0.28]}
    ],
    dino: [
      {at:'head', s:'box', a:[0.94, 0.22, 0.9], c:'#4aa63a', p:[0, 0.9, -0.03]},
      {at:'head', s:'box', a:[0.08, 0.7, 0.82], c:'#4aa63a', p:[-0.46, 0.46, -0.05]},
      {at:'head', s:'box', a:[0.08, 0.7, 0.82], c:'#4aa63a', p:[0.46, 0.46, -0.05]},
      {at:'head', s:'sph', a:[0.08], c:'#ffffff', p:[-0.2, 1.03, 0.3]},
      {at:'head', s:'sph', a:[0.08], c:'#ffffff', p:[0.2, 1.03, 0.3]},
      {at:'head', s:'cone', a:[0.09, 0.2, 5], c:'#ff9f1c', p:[0, 1.1, -0.15]},
      {at:'body', s:'cone', a:[0.09, 0.2, 5], c:'#ff9f1c', p:[0, 1.85, -0.32], r:[-1.2, 0, 0]},
      {at:'body', s:'cone', a:[0.09, 0.2, 5], c:'#ff9f1c', p:[0, 1.5, -0.32], r:[-1.2, 0, 0]},
      {at:'body', s:'cone', a:[0.24, 0.9, 7], c:'#4aa63a', p:[0, 0.95, -0.7], r:[-1.75, 0, 0]},
      {at:'body', s:'box', a:[0.58, 0.68, 0.04], c:'#f4e3a1', p:[0, 1.45, 0.28]}
    ],
    chef: [
      {at:'body', s:'box', a:[0.62, 0.92, 0.04], c:'#f6f6f6', p:[0, 1.25, 0.29]},
      {at:'body', s:'box', a:[0.3, 0.16, 0.05], c:'#e63946', p:[0, 1.92, 0.29]}
    ],
    ballet: [
      {at:'body', s:'cyl', a:[0.5, 0.86, 0.14, 14], c:'#ff8fc8', p:[0, 1.0, 0]},
      {at:'body', s:'cyl', a:[0.46, 0.72, 0.12, 14], c:'#ffe0ef', p:[0, 1.1, 0]},
      {at:'head', s:'sph', a:[0.06], c:'#ff6fb5', p:[-0.28, 0.84, 0.12]},
      {at:'head', s:'sph', a:[0.06], c:'#ffffff', p:[-0.1, 0.86, 0.16]},
      {at:'head', s:'sph', a:[0.06], c:'#ff6fb5', p:[0.1, 0.86, 0.16]},
      {at:'head', s:'sph', a:[0.06], c:'#ffffff', p:[0.28, 0.84, 0.12]}
    ]
  };
  function cs3dParts(id){ return (PARTS[csGet(id).id] || []).map(p => Object.assign({}, p, {a: p.a.slice(), p: p.p.slice(), r: (p.r || [0, 0, 0]).slice()})); }
  // Rough box of a part (used by tests to keep pieces off the face).
  function csPartBox(part){
    const a = part.a, s = part.s;
    let hx, hy, hz;
    if (s === 'box'){ hx = a[0] / 2; hy = a[1] / 2; hz = a[2] / 2; }
    else if (s === 'sph'){ hx = hy = hz = a[0]; }
    else if (s === 'cyl'){ hx = hz = Math.max(a[0], a[1]); hy = a[2] / 2; }
    else if (s === 'cone'){ hx = hz = a[0]; hy = a[1] / 2; }
    else if (s === 'torus'){ hx = a[0] + a[1]; hz = a[0] + a[1]; hy = a[1]; }
    else { hx = hy = hz = 0.2; }
    const flatRing = s === 'torus' && part.r && Math.abs(part.r[0] - Math.PI / 2) < 1e-6 && !part.r[1] && !part.r[2];
    if (!flatRing && part.r && (part.r[0] || part.r[2])){ const m = Math.max(hx, hy, hz); hx = hy = hz = m; }   // rotated: use a safe cube
    const p = part.p;
    return [p[0] - hx, p[1] - hy, p[2] - hz, p[0] + hx, p[1] + hy, p[2] + hz];
  }
  return {CS_LIST, csGet, csClean, csNext, csApply, csDraw2d, cs3dParts, csPartBox};
});
