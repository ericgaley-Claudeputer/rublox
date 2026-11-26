// GB-7: dress-up costumes for Star Snaps and the Photo Booth. No costume piece may sit over the eyes or mouth.
const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const C = require('../dev/costumes/costume_logic.js');
const B = require('../dev/photobooth/booth_logic.js');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

function recorder(){
  const fills = []; let shapes = [], cur = null;
  const ctx = {
    fillStyle: '', strokeStyle: '', lineWidth: 1, save(){}, restore(){},
    fillRect(x, y, w, h){ fills.push({r: [x, y, x + w, y + h]}); },
    beginPath(){ shapes = []; cur = null; }, closePath(){},
    moveTo(x, y){ cur = [[x, y]]; shapes.push({p: cur}); }, lineTo(x, y){ if (!cur){ cur = []; shapes.push({p: cur}); } cur.push([x, y]); },
    arc(x, y, r){ shapes.push({e: [x, y, r, r]}); cur = null; }, ellipse(x, y, rx, ry){ shapes.push({e: [x, y, rx, ry]}); cur = null; },
    rect(x, y, w, h){ shapes.push({r: [x, y, x + w, y + h]}); },
    fill(){ fills.push(...shapes); }, stroke(){ ctx.stroked = true; },
  };
  return {ctx, fills};
}
function inside(s, x, y){
  if (s.r) return x > s.r[0] && x < s.r[2] && y > s.r[1] && y < s.r[3];
  if (s.e){ const dx = (x - s.e[0]) / s.e[2], dy = (y - s.e[1]) / s.e[3]; return dx * dx + dy * dy < 1; }
  const p = s.p; let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
  return c;
}
const covers = (s, z) => { for (let x = z[0] + 1; x < z[2]; x += 2) for (let y = z[1] + 1; y < z[3]; y += 2) if (inside(s, x, y)) return [x, y]; return null; };
// same face zones as tests/avatar_fit.js (eyes + mouth on the 260x310 avatar art)
const EYES = [[108, 66, 118, 80], [142, 66, 152, 80]], MOUTH = [[116, 84, 144, 100]];
const HATS_OK = ['none', 'toque', 'backcap', 'propeller', 'witch', 'santa', 'beanie', 'bucket', 'visor', 'beret', 'tophat', 'flower'];
const overlap = (a, b) => a[0] < b[3] && a[3] > b[0] && a[1] < b[4] && a[4] > b[1] && a[2] < b[5] && a[5] > b[2];

describe('dress-up costumes', () => {
  test('six original costumes plus "none", each with a full look', () => {
    const ids = C.CS_LIST.map(c => c.id);
    assert.deepEqual(ids, ['none', 'princess', 'astro', 'rover', 'dino', 'chef', 'ballet']);
    C.CS_LIST.slice(1).forEach(c => {
      assert.ok(c.name.length > 4 && c.emoji, c.id);
      for (const k of ['shirt', 'pants']) assert.match(c.look[k], /^#[0-9a-f]{6}$/i, c.id + ' ' + k);
      assert.ok([null, 'dress', 'skirt'].includes(c.look.pantsPat), c.id + ' pantsPat');
      assert.ok(HATS_OK.includes(c.look.hat), c.id + ' hat ' + c.look.hat);
    });
    assert.equal(C.csClean('nope'), 'none');
    assert.equal(C.csNext('ballet', 1), 'none');
    assert.equal(C.csNext('none', -1), 'ballet');
  });

  test('a costume keeps your face, skin and hair and only swaps clothes', () => {
    const av = {head: '#c68642', hair: 'bun', hairColor: '#222', face: 'smile', shirt: '#000', pants: '#111', hat: 'witch'};
    const d = C.csApply(av, 'chef');
    assert.equal(d.head, av.head); assert.equal(d.hair, 'bun'); assert.equal(d.face, 'smile');
    assert.equal(d.shirt, '#ffffff'); assert.equal(d.hat, 'toque');
    assert.equal(av.shirt, '#000', 'your saved avatar is not changed');
    assert.deepEqual(C.csApply(av, 'none'), av);
  });

  test('no 2D costume piece paints over the eyes or mouth', () => {
    C.CS_LIST.slice(1).forEach(c => {
      const r = recorder();
      C.csDraw2d(r.ctx, c.id);
      assert.ok(r.fills.length > 3, c.id + ' draws something');
      for (const f of r.fills) for (const z of EYES.concat(MOUTH)){ const at = covers(f, z); assert.ok(!at, `${c.id} covers the face at ${at}`); }
    });
  });

  test('no 3D costume part sits in front of the face', () => {
    const FACE_HEAD = [-.3, .1, .38, .3, .62, 1.2];          // head-local (head group sits at y = 2.0)
    const FACE_BODY = [-.3, 2.1, .38, .3, 2.62, 1.2];
    C.CS_LIST.slice(1).forEach(c => {
      const parts = C.cs3dParts(c.id);
      assert.ok(parts.length >= 2, c.id + ' has 3D parts');
      parts.forEach((p, i) => {
        assert.ok(['head', 'body'].includes(p.at));
        assert.ok(['box', 'sph', 'cyl', 'cone', 'torus'].includes(p.s));
        const b = C.csPartBox(p);
        assert.ok(!overlap(b, p.at === 'head' ? FACE_HEAD : FACE_BODY), `${c.id} part ${i} (${p.s}) is in front of the face: ${b.map(v => v.toFixed(2))}`);
      });
    });
  });
});

describe('costumes in the Photo Booth and Star Snaps', () => {
  test('booth shots keep a valid costume and lay it out for the photo', () => {
    assert.equal(B.pbFreshShot().costume, 'none');
    assert.equal(B.PB_COSTUMES.length, C.CS_LIST.length);
    let s = B.pbCleanShot({costume: 'dino'});
    assert.equal(s.costume, 'dino');
    assert.equal(B.pbLayout(s, 520, 600).costume.id, 'dino');
    assert.equal(B.pbCleanShot({costume: 'evil'}).costume, 'none');
  });

  test('the booth draws the costume into the snapped canvas (page + dev runtime)', () => {
    for (const src of [html, fs.readFileSync(path.join(root, 'dev/photobooth/runtime.js'), 'utf8')]){
      assert.match(src, /row\('avBoothCostumes', R\.PB_COSTUMES \|\| \[\], 'costume'/);
      assert.match(src, /drawAvatar\(avCtx, pbDressed\(\), \{\}\);/);
      assert.match(src, /CostumeRules\.csDraw2d\(ctx, lay\.costume\.id\);/);
    }
    assert.match(html, /<div class="avbooth-row" id="avBoothCostumes"><\/div>/);
  });

  test('Star Snaps wears the costume while the camera is on, saves it, and takes it off after', () => {
    for (const src of [html, fs.readFileSync(path.join(root, 'dev/photostudio/photostudio.js'), 'utf8')]){
      assert.match(src, /psWear\(true\); psSyncProps\(\); banner\(/);
      assert.match(src, /else \{ psClearProps3D\(\); psWear\(false\); \}/);
      assert.match(src, /function photostudioStop\(\)\{ psClearProps3D\(\); psWear\(false\); psx = null;/);
      assert.match(src, /model = buildPlayer\(id \? CostumeRules\.csApply\(avatar, id\) : avatar\);/);
      assert.match(src, /data-ps-cos="/);
      assert.match(src, /if \(c === 'KeyU' && typeof CostumeRules !== 'undefined'\)/);
      assert.match(src, /res\.costume = CostumeRules\.csClean\(o\.costume\);/);
    }
    assert.ok(html.includes(fs.readFileSync(path.join(root, 'dev/costumes/costume_logic.js'), 'utf8').trim()), 'page carries the dev costume rules');
    assert.ok(html.indexOf('root.CostumeRules = api') < html.indexOf('root.PhotoBoothRules = api'), 'costumes load before the booth rules');
  });
});
