const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const P = require('../dev/photobooth/booth_logic.js');
const R = require('../dev/reset/reset_logic.js');

describe('Avatar photo booth', () => {
  test('reuses rubloxPhotos, caps the gallery, and falls back to 2D without WebGL', () => {
    assert.equal(P.PB_KEY, 'rubloxPhotos');
    assert.equal(P.PB_MAX, 12);
    const studio = R.resetGame('photostudio');
    assert.ok(studio.keys.includes('rubloxPhotos'));
    assert.equal(P.pbNeed2dFallback(false), true);
    assert.equal(P.pbNeed2dFallback(true), false);
    const tiny = 'data:image/png;base64,aGVsbG8='; // too short
    assert.equal(P.pbIsPhotoData(tiny), false);
    const ok = 'data:image/png;base64,' + 'A'.repeat(40);
    const stored = P.pbStore([], {t:1, d:ok, bg:'studio', pose:'wave', source:'booth'});
    assert.equal(stored.ok, true);
    assert.equal(stored.count, 1);
    let g = [];
    for (let i = 0; i < 15; i++){
      g = P.pbStore(g, {t:i+2, d:ok, id:String(i+2)}).gallery;
    }
    assert.equal(g.length, 12);
    const gone = P.pbDelete(g, g[0].id);
    assert.equal(gone.count, 11);
  });

  test('poses, backgrounds, frames, and stickers compose a layout', () => {
    let shot = P.pbFreshShot();
    shot = P.pbToggleSticker(shot, 'star');
    shot = P.pbToggleSticker(shot, 'heart');
    shot.pose = 'jump';
    shot.bg = 'sunset';
    shot.frame = 'gold';
    const lay = P.pbLayout(shot, 520, 600);
    assert.equal(lay.pose.id, 'jump');
    assert.equal(lay.bg.id, 'sunset');
    assert.equal(lay.frame.id, 'gold');
    assert.ok(lay.pad > 0);
    assert.ok(lay.poseShift.y < 0);
    assert.equal(lay.stickers.length, 2);
    shot = P.pbToggleSticker(shot, 'star');
    assert.equal(shot.stickers.includes('star'), false);
  });

  test('the avatar editor and hub expose a photo booth', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert.match(html, /id="avBoothBtn"/);
    assert.match(html, /id="avBooth"/);
    assert.match(html, /Photo Booth/);
  });
});

function miniDom(htmlBooth){
  const listeners = {click: [], keydown: []};
  function cls(el){
    const set = new Set();
    return {
      add(c){ set.add(c); el._cls = set; },
      remove(c){ set.delete(c); },
      contains(c){ return set.has(c); },
      toggle(c, on){ if (on == null) on = !set.has(c); if (on) set.add(c); else set.delete(c); }
    };
  }
  const nodes = {};
  function closest(el, sel){
    let n = el;
    while (n){
      if (match(n, sel)) return n;
      n = n.parentNode;
    }
    return null;
  }
  function match(el, sel){
    if (!el || !sel) return false;
    const parts = sel.split(',').map(s => s.trim());
    return parts.some(s => {
      if (s.startsWith('#')) return el.id === s.slice(1);
      if (s.startsWith('.')) return el.classList && el.classList.contains(s.slice(1));
      if (s.startsWith('[') && s.endsWith(']')){
        const body = s.slice(1, -1);
        const eq = body.indexOf('=');
        if (eq < 0) return el.getAttribute && el.getAttribute(body) != null;
        const k = body.slice(0, eq), v = body.slice(eq+1).replace(/['"]/g, '');
        return el.getAttribute && el.getAttribute(k) === v;
      }
      if (s === 'button') return el.tagName === 'BUTTON';
      if (s === 'img') return el.tagName === 'IMG';
      if (s.includes('#')){
        const [tag, id] = s.split('#');
        return (!tag || el.tagName === tag.toUpperCase()) && el.id === id;
      }
      return el.tagName === String(s).toUpperCase();
    });
  }
  function makeEl(tag, attrs){
    const el = {
      tagName: String(tag).toUpperCase(), id: '', className: '', textContent: '', innerHTML: '',
      hidden: false, disabled: false, type: 'button', parentNode: null, children: [],
      style: {}, dataset: {}, href: '', download: '', src: '', alt: '',
      _listeners: {click: [], keydown: []},
      get classList(){ return this._cl || (this._cl = cls(this)); },
      setAttribute(k, v){
        if (k === 'id') { this.id = v; nodes[v] = this; }
        else if (k === 'hidden') this.hidden = v === '' || v === true || v === 'hidden' || v === 'true' ? true : !!v;
        else this[k] = v;
      },
      getAttribute(k){ if (k === 'hidden') return this.hidden ? '' : null; return this[k] != null ? String(this[k]) : null; },
      removeAttribute(k){ if (k === 'hidden') this.hidden = false; else delete this[k]; },
      appendChild(c){ c.parentNode = this; this.children.push(c); if (c.id) nodes[c.id] = c; return c; },
      remove(){ if (this.parentNode){ const i = this.parentNode.children.indexOf(this); if (i>=0) this.parentNode.children.splice(i,1); this.parentNode = null; } },
      contains(n){ let x = n; while (x){ if (x === this) return true; x = x.parentNode; } return false; },
      closest(sel){ return closest(this, sel); },
      querySelectorAll(sel){
        const out = [];
        (function walk(n){ n.children.forEach(c => { if (match(c, sel)) out.push(c); walk(c); }); })(el);
        return out;
      },
      querySelector(sel){ return el.querySelectorAll(sel)[0] || null; },
      addEventListener(type, fn){ (this._listeners[type] || (this._listeners[type]=[])).push(fn); },
      focus(){ el._focused = true; document.activeElement = el; },
      scrollIntoView(){},
      blur(){},
      click(){
        const ev = {type:'click', target: el, currentTarget: el, preventDefault(){}, stopPropagation(){}, stopImmediatePropagation(){}};
        // capture on document first
        (document._cap.click || []).forEach(fn => fn(ev));
        (el._listeners.click || []).forEach(fn => fn(ev));
        if (typeof el.onclick === 'function') el.onclick(ev);
      },
      getContext(){
        return {
          createLinearGradient(){ return {addColorStop(){}}; },
          fillRect(){}, save(){}, restore(){}, beginPath(){}, rect(){}, clip(){},
          translate(){}, scale(){}, fillText(){}, strokeRect(){},
          fillStyle:'', strokeStyle:'', lineWidth:1, font:'', textAlign:'', textBaseline:''
        };
      },
      toDataURL(){ return 'data:image/png;base64,' + 'A'.repeat(80); },
      width: 520, height: 600
    };
    Object.assign(el, attrs || {});
    el._cl = cls(el);
    let htmlStr = el.innerHTML || '';
    Object.defineProperty(el, 'innerHTML', {
      get(){ return htmlStr; },
      set(v){
        htmlStr = String(v == null ? '' : v);
        this.children.forEach(c => { c.parentNode = null; });
        this.children = [];
      }
    });
    if (el.id) nodes[el.id] = el;
    return el;
  }
  const body = makeEl('body', {id: 'body'});
  const document = {
    readyState: 'complete',
    body,
    activeElement: null,
    _cap: {click: [], keydown: []},
    _pbDoc: false,
    getElementById(id){ return nodes[id] || null; },
    querySelector(sel){ return document.querySelectorAll(sel)[0] || null; },
    querySelectorAll(sel){
      const all = [];
      (function walk(n){ if (!n) return; if (match(n, sel)) all.push(n); (n.children||[]).forEach(walk); })(body);
      return all;
    },
    createElement(tag){ return makeEl(tag); },
    addEventListener(type, fn, cap){
      if (cap) (document._cap[type] || (document._cap[type]=[])).push(fn);
      else (listeners[type] || (listeners[type]=[])).push(fn);
    }
  };
  // mount default booth markup
  const avBtn = makeEl('button', {id:'avBoothBtn', textContent:'Photo Booth'});
  const hubBtn = makeEl('button', {id:'hubBoothBtn', textContent:'Photo Booth'});
  const booth = makeEl('div', {id:'avBooth', hidden:true, className:'avbooth'});
  const card = makeEl('div', {className:'avbooth-card'});
  booth.appendChild(card);
  card.appendChild(makeEl('canvas', {id:'avBoothCv'}));
  ['avBoothPoses','avBoothBgs','avBoothFrames','avBoothStickers'].forEach(id => card.appendChild(makeEl('div', {id, className:'avbooth-row'})));
  const acts = makeEl('div', {className:'avbooth-acts'});
  acts.appendChild(makeEl('button', {id:'avBoothSnap', textContent:'Take photo'}));
  acts.appendChild(makeEl('button', {id:'avBoothDl', textContent:'Download'}));
  acts.appendChild(makeEl('button', {id:'avBoothGal', textContent:'Gallery'}));
  acts.appendChild(makeEl('button', {id:'avBoothX', textContent:'Close'}));
  card.appendChild(acts);
  card.appendChild(makeEl('div', {id:'avBoothGallery', hidden:true, className:'avbooth-gal'}));
  // trap the modal in a fake avatar column first (the original bug)
  const avatar = makeEl('section', {id:'avatar'});
  const opt = makeEl('div', {className:'opt'});
  opt.appendChild(avBtn);
  opt.appendChild(booth);
  avatar.appendChild(opt);
  body.appendChild(hubBtn);
  body.appendChild(avatar);
  return {document, body, nodes, makeEl};
}

describe('Photo booth buttons respond to clicks in a jsdom-style DOM', () => {
  test('every booth button click has an effect, including both entry points', () => {
    const vm = require('vm');
    const fs = require('fs');
    const path = require('path');
    const {document, body} = miniDom();
    const store = {};
    const downloads = [];
    const sandbox = {
      console, Date, Math, JSON, String, Number, Array, Object, Boolean,
      PhotoBoothRules: P,
      document,
      window: {},
      localStorage: {
        getItem(k){ return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
        setItem(k,v){ store[k] = String(v); }
      },
      load(k, d){ if (!Object.prototype.hasOwnProperty.call(store, k)) return d; try { return JSON.parse(store[k]); } catch(e){ return d; } },
      save(k, v){ store[k] = JSON.stringify(v); },
      draft: {head:'#ffe0c0', shirt:'#3a86ff', pants:'#1d2340'},
      avatar: {head:'#ffe0c0', shirt:'#3a86ff', pants:'#1d2340'},
      drawAvatar(){},
      toast(){},
      banner(){},
    };
    sandbox.window = sandbox;
    sandbox.globalThis = sandbox;
    const src = fs.readFileSync(path.join(__dirname, '..', 'dev/photobooth/runtime.js'), 'utf8');
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox);
    const $ = id => document.getElementById(id);

    // Bind happens even if we "rebuild" later: document capture is already on.
    // Opening from the hub button.
    assert.equal($('avBooth').hidden, true);
    $('hubBoothBtn').click();
    assert.equal($('avBooth').hidden, false);
    // Modal must have been moved to document.body so it is not trapped in #avatar .opt
    assert.equal($('avBooth').parentNode, document.body);

    sandbox.pbClose();
    assert.equal($('avBooth').hidden, true);
    $('avBoothBtn').click();
    assert.equal($('avBooth').hidden, false);

    const poseBtns = $('avBoothPoses').children;
    assert.ok(poseBtns.length >= 6);
    const wave = poseBtns.find(b => (b.getAttribute('data-pb-id') === 'wave') || /wave/i.test(b.textContent));
    assert.ok(wave);
    wave.click();
    assert.equal(sandbox.pb.shot.pose, 'wave');
    const waveOn = $('avBoothPoses').children.find(b => b.getAttribute('data-pb-id') === 'wave');
    assert.ok(waveOn && waveOn.classList.contains('on'));

    const bgBtns = $('avBoothBgs').children;
    const sunset = bgBtns.find(b => b.getAttribute('data-pb-id') === 'sunset');
    sunset.click();
    assert.equal(sandbox.pb.shot.bg, 'sunset');

    const frBtns = $('avBoothFrames').children;
    const gold = frBtns.find(b => b.getAttribute('data-pb-id') === 'gold');
    gold.click();
    assert.equal(sandbox.pb.shot.frame, 'gold');

    const pick = (row, id) => $(row).children.find(b => b.getAttribute('data-pb-id') === id);
    pick('avBoothStickers','star').click();
    assert.ok(sandbox.pb.shot.stickers.includes('star'));
    pick('avBoothStickers','star').click();
    assert.equal(sandbox.pb.shot.stickers.includes('star'), false);
    pick('avBoothStickers','star').click();
    assert.ok(sandbox.pb.shot.stickers.includes('star'));

    // Take photo saves to the shared gallery
    $('avBoothSnap').click();
    const gal = JSON.parse(store.rubloxPhotos || '[]');
    assert.ok(gal.length >= 1);
    assert.equal(gal[0].source, 'booth');
    assert.ok(P.pbIsPhotoData(gal[0].d));
    assert.ok(sandbox.pb.lastData && sandbox.pb.lastData.indexOf('data:image') === 0);

    // Download
    const beforeKids = document.body.children.length;
    $('avBoothDl').click();
    const link = document.body.children.find(c => c.tagName === 'A') || document.body.children[document.body.children.length-1];
    // link is removed after click; record via a patched click
    // Re-run download after hooking
    let downloaded = null;
    const realCreate = document.createElement.bind(document);
    document.createElement = function(tag){
      const el = realCreate(tag);
      if (String(tag).toLowerCase() === 'a'){
        const old = el.click.bind(el);
        el.click = function(){ downloaded = {href: el.href, download: el.download}; old(); };
      }
      return el;
    };
    $('avBoothDl').click();
    assert.ok(downloaded);
    assert.ok(downloaded.href.indexOf('data:image') === 0);
    assert.equal(downloaded.download, 'rublox-photo.png');

    $('avBoothGal').click();
    assert.equal($('avBoothGallery').hidden, false);
    assert.ok($('avBoothGallery').children.length >= 1);

    $('avBoothX').click();
    assert.equal($('avBooth').hidden, true);

    // Keyboard: reopen, Escape closes. A/Enter activates.
    $('hubBoothBtn').click();
    assert.equal($('avBooth').hidden, false);
    sandbox.pbKey({code:'Escape', preventDefault(){}, stopPropagation(){}});
    assert.equal($('avBooth').hidden, true);
    $('hubBoothBtn').click();
    sandbox.pbPad({1:true});
    assert.equal($('avBooth').hidden, true, 'Xbox B closes the booth');
  });

  test('document delegation still opens the booth if bind ran before the buttons existed', () => {
    const vm = require('vm');
    const fs = require('fs');
    const path = require('path');
    // Start with an empty body, run runtime (bind no-ops on missing nodes but installs doc listener), then add buttons.
    const {document, makeEl, body} = miniDom();
    // remove entry buttons and booth to simulate bind-before-DOM
    ['avBoothBtn','hubBoothBtn','avBooth'].forEach(id => {
      const n = document.getElementById(id);
      if (n && n.remove) n.remove();
    });
    const sandbox = {
      console, Date, Math, JSON, String, Number, Array, Object,
      PhotoBoothRules: P, document, window: {}, localStorage:{getItem(){return null;}, setItem(){}},
      load(k,d){return d;}, save(){}, draft:{}, drawAvatar(){}, toast(){}, banner(){}
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'dev/photobooth/runtime.js'), 'utf8'), sandbox);
    // now add the late DOM
    const {document: d2, body: b2} = miniDom();
    // steal late nodes into the original document used by the runtime
    const lateHub = d2.getElementById('hubBoothBtn');
    const lateBooth = d2.getElementById('avBooth');
    lateHub.parentNode = document.body;
    lateBooth.parentNode = document.body;
    document.body.children.push(lateHub, lateBooth);
    document.getElementById = id => (id==='hubBoothBtn'?lateHub:id==='avBooth'?lateBooth: d2.getElementById(id));
    // Click must go through the document the runtime bound to (capture listeners live there).
    const ev = {type:'click', target: lateHub, currentTarget: lateHub, preventDefault(){}, stopPropagation(){}, stopImmediatePropagation(){}};
    (document._cap.click || []).forEach(fn => fn(ev));
    assert.equal(lateBooth.hidden, false);
  });

  test('the built page lifts the booth above other overlays and ignores canvas hits', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const css = html.slice(html.lastIndexOf('.avbooth{'), html.lastIndexOf('.avbooth{') + 700);
    assert.match(css, /z-index:\s*10070/);
    assert.match(html, /#avBoothCv\{[^}]*pointer-events:\s*none/);
    assert.match(html, /function pbMount\(/);
    assert.match(html, /document\.body\.appendChild\(box\)/);
    assert.match(html, /getElementById\('avBooth'\)/);
    assert.match(html, /#avBoothX/);
    // gamepad routes D-pad / A / B into the open booth
    assert.match(html, /getElementById\('avBooth'\)/);
    assert.match(html, /avBooth:\s*'#avBoothX'|avBooth: '#avBoothX'/);
  });
});
