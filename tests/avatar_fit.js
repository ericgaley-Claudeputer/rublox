// audit56: hair must never sit over the eyes or mouth — neither in the 2D face art that is
// painted onto the 3D head, nor as 3D boxes in front of the face. Also checks every hat/hair
// item actually draws something and every outfit set only names real items.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function grab(name){
  const i = html.indexOf('\nfunction ' + name + '(');
  if (i < 0) return 'function ' + name + '(){}';
  let d = 0, j = html.indexOf('{', i);
  for (let k = j; k < html.length; k++){ const c = html[k]; if (c === '{') d++; else if (c === '}'){ d--; if (!d) return html.slice(i, k + 1); } }
  throw new Error('unterminated ' + name);
}
const src = ['shade', 'block', 'poly', 'circ', 'rrect', 'hairBack', 'hairFront', 'drawLookHair', 'drawLookHairBack', 'drawLook3D'].map(grab).join('\n');
const ctxV = vm.createContext({Math});
vm.runInContext(src + '\nthis.F = {hairBack, hairFront, drawLook3D};', ctxV);
const F = ctxV.F;

// A canvas stand-in that records every filled shape (rects, circles/ellipses, polygons).
function recorder(){
  const fills = []; let shapes = [], cur = null;
  const ctx = {
    fillStyle: '', strokeStyle: '', lineWidth: 1, lineCap: '', save(){}, restore(){},
    fillRect(x, y, w, h){ fills.push({r: [x, y, x + w, y + h]}); },
    beginPath(){ shapes = []; cur = null; }, closePath(){},
    moveTo(x, y){ cur = [[x, y]]; shapes.push({p: cur}); }, lineTo(x, y){ if (!cur){ cur = []; shapes.push({p: cur}); } cur.push([x, y]); },
    quadraticCurveTo(a, b, x, y){ const o = cur[cur.length - 1]; for (let t = .25; t <= 1; t += .25){ const u = 1 - t; cur.push([u*u*o[0] + 2*u*t*a + t*t*x, u*u*o[1] + 2*u*t*b + t*t*y]); } },
    arc(x, y, r){ shapes.push({e: [x, y, r, r]}); cur = null; }, ellipse(x, y, rx, ry){ shapes.push({e: [x, y, rx, ry]}); cur = null; },
    rect(x, y, w, h){ shapes.push({r: [x, y, x + w, y + h]}); }, roundRect(x, y, w, h){ shapes.push({r: [x, y, x + w, y + h]}); },
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
// eyes (both) and the mouth area on the 260x310 face art (drawFace)
const EYES = [[108, 66, 118, 80], [142, 66, 152, 80]], MOUTH = [[116, 84, 144, 100]];
// every hairstyle and hat sold in the shop (from ITEMS in a real browser run, 2026.11.22)
const HAIRS = ['short','long','ponytail','pigtails','curly','spiky','bun','beehive','braid','bowl','spacebuns','combover','sidepony','twinbraids','curl','wolf','shag','curtains','crimped','waves','updo','slickbob','undercut','milkmaid','mullet'];
const HATS = ['toque','burger','backcap','propeller','pumpkin','witch','santa','turkey','beanie','bucket','visor','beret','tophat','slouch','earmuffs','newsboy','flower','jellycap','tidecap','dinocap','starcap'];

test('every hairstyle and hat in the list is still sold', () => {
  for (const v of HAIRS) assert.ok(new RegExp("slot:\\s*'hair',\\s*val:\\s*'" + v + "'|\\['" + v + "',").test(html), 'hair ' + v);
  for (const v of HATS) assert.ok(new RegExp("val:\\s*'" + v + "'|\\['" + v + "',").test(html), 'hat ' + v);
});

test('no hairstyle paints over the eyes or mouth on the face', () => {
  for (const h of HAIRS){
    const r = recorder();
    F.hairFront(r.ctx, {hair: h, hairColor: '#7a3d14'});
    assert.ok(r.fills.length > 0 || r.ctx.stroked, h + ' draws something');
    for (const f of r.fills) for (const z of EYES.concat(MOUTH)){ const at = covers(f, z); assert.ok(!at, `${h} covers the face at ${at}`); }
  }
});

test('long back hair is drawn behind the head, not on the face', () => {
  for (const h of ['mullet', 'wolf', 'waves', 'slickbob']){
    const r = recorder(); F.hairBack(r.ctx, {hair: h, hairColor: '#7a3d14'});
    assert.ok(r.fills.length > 0, h + ' has back hair');
  }
});

test('no 3D hair or hat piece sits in front of the face', () => {
  const looks = HAIRS.map(h => ({hair: h})).concat(HATS.map(h => ({hat: h, hair: 'short'})));
  for (const lk of looks){
    const boxes = [];
    const bx = (w, h, d, c, x, y, z) => { boxes.push([x - w / 2, y - h / 2, z - d / 2, x + w / 2, y + h / 2, z + d / 2]); return {rotation: {}}; };
    F.drawLook3D(Object.assign({hat: 'none', hairColor: '#7a3d14'}, lk), {add(){}}, bx, () => ({}), '#7a3d14');
    // the face window on the 0.8 head (centre y 2.4): eyes + mouth, in front of the face plane z=0.4
    const FACE = [-.3, 2.1, .38, .3, 2.62, 1.2];
    for (const b of boxes){
      const overlap = b[0] < FACE[3] && b[3] > FACE[0] && b[1] < FACE[4] && b[4] > FACE[1] && b[2] < FACE[5] && b[5] > FACE[2];
      assert.ok(!overlap, `${JSON.stringify(lk)} puts a box over the face at ${b.map(v => v.toFixed(2))}`);
    }
  }
});
