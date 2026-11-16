const {test, skip} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const RULES = require(path.join(ROOT, 'dev/lantern/lantern_rules.js'));
const BUILD = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8')).build || JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));

test('BUILD stamp is 2026.11.16-13 in lantern files and version.json', () => {
  const v = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));
  assert.equal(v.build, '2026.11.16-13');
  assert.match(HTML, /const BUILD = '2026\.11\.16-13'/);
});

test('Lantern Big Top is a playable GAMES card with original branding', () => {
  assert.match(HTML, /id:'lantern',\s*name:'Lantern Big Top'/);
  assert.match(HTML, /function drawLantern/);
  assert.doesNotMatch(HTML, /Experience Abstraction/);
  assert.doesNotMatch(HTML, /\bCaine\b/);
  assert.doesNotMatch(HTML, /\bPomni\b/);
  assert.doesNotMatch(HTML, /\bKaufmo\b/);
  assert.doesNotMatch(HTML, /The Amazing Digital Circus/);
  assert.doesNotMatch(HTML, /Glitch Circus Hotel/);
  assert.match(HTML, /Maestro Gleam/);
  assert.doesNotMatch(HTML, /Miss Fanfare/);
  assert.doesNotMatch(HTML, /Lantern Hotel/);
});

test('start() whitelist includes lantern and does not fall back to obby', () => {
  const m = HTML.match(/mode = \[([^\]]+)\]\.includes\(m\) \? m : 'obby'/);
  assert.ok(m, 'whitelist');
  assert.match(m[1], /'lantern'/);
  assert.match(HTML, /if \(mode === 'lantern'\) buildLantern\(\)/);
  // allow else-if or leading if
  assert.match(HTML, /lanternEnter\(\)/);
  assert.match(HTML, /if \(lh\) lanternStop\(\)/);
  assert.match(HTML, /if \(lh\) lanternUpdate\(dt\)/);
});

test('new save key is rubloxLantern only', () => {
  assert.match(HTML, /rubloxLantern/);
  const rules = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern_rules.js'), 'utf8');
  assert.match(rules, /LH_KEY = 'rubloxLantern'/);
  // the mode must not write over other keys
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.doesNotMatch(js, /save\('rubloxChat'/);
  assert.doesNotMatch(js, /save\('rubloxFriends'/);
  assert.doesNotMatch(js, /save\('rubloxAchievements'/);
});

test('test hashes lhtest and ghtest parse glitch and cellar', () => {
  assert.equal(RULES.lhTestHash('#ghtest=glitch'), 'glitch');
  assert.equal(RULES.lhTestHash('#lhtest=glitch'), 'glitch');
  assert.equal(RULES.lhTestHash('#lhtest=cellar'), 'cellar');
  assert.equal(RULES.lhTestHash('#ghtest=cellar'), 'cellar');
  assert.equal(RULES.lhTestHash('#chattest=demo'), '');
  assert.ok(RULES.lhTestActive('#ghtest=glitch'));
  assert.ok(HTML.includes('(?:lh|gh)test=') || /(?:lh|gh)test=/.test(HTML));
});

test('achBlockPersist treats lantern test hashes as fixtures', () => {
  assert.ok(HTML.includes('(?:lh|gh)test='));
  const block = HTML.slice(HTML.indexOf('function achBlockPersist'), HTML.indexOf('function achBlockPersist') + 900);
  assert.ok(block.includes('(?:lh|gh)test=') || /test=/.test(block));
});

test('sanity drains: proximity is fastest, isolation and darkness have delays, company in light restores', () => {
  const iso = {isolated:true, dark:false, nearGlitched:false, company:false, lit:true};
  const dark = {isolated:false, dark:true, nearGlitched:false, company:false, lit:false};
  const near = {isolated:false, dark:false, nearGlitched:true, company:false, lit:true};
  const rest = {isolated:false, dark:false, nearGlitched:false, company:true, lit:true};
  // during delay, no drain
  assert.equal(RULES.lhSanityDelta({...iso}, 0.5), 0);
  assert.equal(RULES.lhSanityDelta({...dark}, 0.5), 0);
  const isoN = {...iso}; RULES.lhSanityDelta(isoN, 2.05);
  const dIso = RULES.lhSanityDelta(isoN, 1);
  const darkN = {...dark}; RULES.lhSanityDelta(darkN, 3.05);
  const dDark = RULES.lhSanityDelta(darkN, 1);
  const nearN = {...near}; RULES.lhSanityDelta(nearN, 0.6);
  const dNear = RULES.lhSanityDelta(nearN, 1);
  assert.ok(dIso < 0 && dDark < 0 && dNear < 0, {dIso, dDark, dNear});
  assert.ok(Math.abs(dNear) > Math.abs(dIso), 'proximity faster than isolation');
  assert.ok(Math.abs(dNear) > Math.abs(dDark), 'proximity faster than darkness');
  const heal = RULES.lhSanityDelta({...rest}, 1);
  assert.ok(heal > 0, 'restore in light with company');
  // 4x slower than the original 4 / 5 / 16 drain and 8 restore
  assert.equal(dIso, -1);
  assert.equal(dDark, -1.25);
  assert.equal(dNear, -4);
  assert.equal(heal, 2);
  assert.equal(RULES.RATES.isolate, 1);
  assert.equal(RULES.RATES.dark, 1.25);
  assert.equal(RULES.RATES.near, 4);
  assert.equal(RULES.RATES.restore, 2);
  assert.equal(RULES.RATES.stareBonus, 1);
  const stareN = {...near, staring:true, _nearT: 1};
  assert.equal(RULES.lhSanityDelta(stareN, 1), -5);
  assert.equal(RULES.lhSanityDelta({glitched:true, isolated:true, dark:true, nearGlitched:true}, 1), 0);
  assert.equal(RULES.lhSanityDelta({cutscene:true, isolated:true}, 1), 0);
});

test('eye icons fill in as sanity empties', () => {
  assert.equal(RULES.lhEyeFill(100), 0);
  assert.equal(RULES.lhEyeFill(0), 5);
  assert.ok(RULES.lhEyeFill(20) > RULES.lhEyeFill(80));
});

test('cancellation settings: always / never / 50/50', () => {
  assert.equal(RULES.lhCancelSucceeds('always', () => 0.99), true);
  assert.equal(RULES.lhCancelSucceeds('never', () => 0), false);
  assert.equal(RULES.lhCancelSucceeds('fifty', () => 0.49), true);
  assert.equal(RULES.lhCancelSucceeds('fifty', () => 0.5), false);
  assert.equal(RULES.lhCancelSucceeds('fifty', () => 0.9), false);
});

test('host name Gleam is detected in filtered chat text, not as a substring of other words', () => {
  assert.ok(RULES.lhHostNameIn('Gleam'));
  assert.ok(RULES.lhHostNameIn('hey Gleam come here'));
  assert.ok(RULES.lhHostNameIn('GLEAM!!!'));
  assert.ok(RULES.lhHostNameIn('Maestro Gleam'));
  assert.ok(!RULES.lhHostNameIn('gleaming'));
  assert.ok(!RULES.lhHostNameIn('hello there'));
  assert.ok(RULES.lhCensored('####'));
  assert.ok(!RULES.lhCensored('Gleam'));
});

test('doodles accept stamps only, never free text', () => {
  const a = RULES.lhAddDoodle([], 'star', 0.2, 0.3, '#ff6b9a');
  assert.equal(a.length, 1);
  assert.equal(a[0].stamp, 'star');
  const b = RULES.lhAddDoodle([], 'FREE TEXT', 0.2, 0.3, '#ff6b9a');
  assert.equal(b.length, 0);
  const c = RULES.lhAddDoodle([], 'heart', 2, -1, 'red');
  assert.equal(c[0].x, 1);
  assert.equal(c[0].y, 0);
  assert.equal(c[0].color, '#ff6b9a');
});

test('16 official badges are mapped 1:1 to original Lantern Big Top achievements', () => {
  const official = RULES.LH_BADGES.filter(b => b.real);
  assert.equal(official.length, 16);
  assert.ok(RULES.LH_BADGES.length >= 18);
  const ids = official.map(b => b.id);
  assert.equal(new Set(ids).size, 16);
  const reals = official.map(b => b.real);
  assert.deepEqual(reals, [
    'Welcome!',
    'Welcome back',
    "I don't feel well...",
    'God you look stupid...',
    'And into the cellar you go!',
    "I've got keys everywhere!",
    'What... is that?',
    'Whoa Kaufmo, listen!',
    'Daisy, Daisy...',
    'I-I swear, I saw one!',
    'No foul language around here!',
    'A stare of bad luck...',
    'WHY DO YOU TORMENT ME?',
    'They abandoned me...',
    'Hello neighbor, welcome home!',
    'Peekaboo.'
  ]);
  // in-game names must be original (no TADC / official badge titles)
  RULES.LH_BADGES.forEach(b => {
    if (b.real) assert.notEqual(b.name, b.real);
    assert.doesNotMatch(b.name, /Caine|Kaufmo|Pomni|Eniac|Daisy/);
    assert.doesNotMatch(b.desc, /Caine|Kaufmo|Pomni|Eniac|Daisy Bell|abstract/i);
  });
  // registry in the built page
  assert.match(HTML, /id: 'lantern', name: 'Lantern Big Top'/);
  RULES.LH_BADGES.forEach(b => {
    assert.ok(HTML.includes("id:'" + b.id + "'"), b.id);
    assert.ok(HTML.includes("cat:'lantern'"), b.id + ' cat');
  });
});

test('settings defaults and normalize', () => {
  const d = RULES.lhDefaultSettings();
  assert.equal(d.cancellation, 'fifty');
  assert.equal(d.glitchedVision, true);
  assert.equal(d.muffledSound, true);
  const n = RULES.lhNormalizeSettings({cancellation:'nope', glitchedVision:false});
  assert.equal(n.cancellation, 'fifty');
  assert.equal(n.glitchedVision, false);
});

test('summon requires a nearby glitched target', () => {
  assert.equal(RULES.lhSummonOk(true, 4, 8), true);
  assert.equal(RULES.lhSummonOk(true, 12, 8), false);
  assert.equal(RULES.lhSummonOk(false, 1, 8), false);
});

test('a fizzled player cannot summon the host, in solo or multiplayer', () => {
  assert.equal(RULES.lhSummonBlocked({glitched:true}), true);
  assert.equal(RULES.lhSummonBlocked({glitched:false}), false);
  assert.equal(RULES.lhSummonBlocked({}), false);
  assert.equal(RULES.lhSummonOk(true, 4, 8, true), false);
  assert.equal(RULES.lhSummonOk(true, 4, 8, false), true);
  const msg = RULES.lhSummonDeniedMsg();
  assert.match(msg, /can.t hear you/i);
  assert.match(msg, /fizzled/i);
  assert.doesNotMatch(msg, /\bkill\b/i);
  assert.doesNotMatch(msg, /abstract/i);
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.match(js, /lhSummonBlocked/);
  assert.match(js, /lhUidIsGlitched/);
  assert.match(js, /I can\\'t hear you while you\\'re fizzled/);
  // every summon path (chat, button, E / prompt, controller, debug hook) goes through lhCallHost
  assert.match(js, /fan\.onclick = \(\) => \{ lhCallHost\(true\); \}/);
  assert.match(js, /p\.id === 'fanfare'\) lhCallHost\(true\)/);
  assert.match(js, /window\.lhCallHost = function\(\)\{ try \{ lhCallHost\(true\); \}/);
  assert.match(js, /lhCallHost\(false, uid\)/);
});

test('HUD hit list includes lantern panels so pointer lock is released', () => {
  assert.match(HTML, /#lhRoot/);
  assert.match(HTML, /#lhAct/);
  assert.match(HTML, /#lhSet/);
  assert.match(HTML, /#lhDraw/);
  assert.match(HTML, /Glitched vision/);
  assert.match(HTML, /Muffled sound/);
  assert.match(HTML, /Cancellation/);
});

test('MP hooks sync lantern state over existing rooms', () => {
  assert.match(HTML, /d\.t === 'lh'[\s\S]{0,80}lhFromGuest/);
  assert.match(HTML, /case 'lh':[\s\S]{0,80}lhFromHost/);
});

test('kid-safe copy: no kill language in the mode module', () => {
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.doesNotMatch(js, /\bkill(ed|ing)?\b/i);
  assert.doesNotMatch(js, /\bdead\b/i);
  assert.match(js, /tagged/);
  assert.match(js, /fizzled/);
});

test('entry wiring lists lantern as a launchable mode', () => {
  const w = fs.readFileSync(path.join(ROOT, 'dev/haunt/entry_wiring.js'), 'utf8');
  assert.match(w, /\['lantern', 'lantern'\]/);
  assert.match(HTML, /lantern: \(\) => lh/);
});

test('circus world, midway wagons, and scare FX are in the mode module', () => {
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.match(js, /lhFerris/);
  assert.match(js, /lhCarousel/);
  assert.match(js, /Cotton Candy/);
  assert.match(js, /Popcorn/);
  assert.match(js, /Midway/);
  assert.match(js, /lhScareTick/);
  assert.match(js, /lhPlaySting/);
  assert.match(js, /lhWhisper/);
  assert.match(HTML, /id="lhScare"/);
  assert.match(HTML, /id="lhVignette"/);
  assert.match(HTML, /id="lhEdgeEyes"/);
  assert.match(HTML, /Call Maestro Gleam/);
  assert.match(HTML, /Big Top settings/);
  assert.match(HTML, /Skip ▶/);
  assert.doesNotMatch(js, /\bCaine\b/);
  assert.doesNotMatch(js, /Digital Circus/);
});

test('midway walls leave walkable gaps at each wagon door', () => {
  const segs = RULES.lhMidwayWallSegments();
  assert.equal(RULES.lhWagonCount(), 20);
  assert.equal(RULES.LH_WAGON_ZS.length, 10);
  assert.ok(segs.length >= 11);
  for (const z of RULES.LH_WAGON_ZS){
    assert.equal(RULES.lhMidwayBlocksSide(z, segs), false, 'gap at z=' + z);
  }
  // midway wall remains between wagons and at the start of the hall
  assert.equal(RULES.lhMidwayBlocksSide(14.5, segs), true);
  assert.equal(RULES.lhMidwayBlocksSide(26, segs), true);
});

test('lit lanterns keep the fairground safe; dark grass drains sanity', () => {
  const lamps = [{x:-22, z:-2}, {x:-30, z:-10}];
  assert.equal(RULES.lhNearLamp(-22, -2, lamps, 5), true);
  assert.equal(RULES.lhNearLamp(-10, 0, lamps, 5), false);
  const st = {dark: true, isolated: false, nearGlitched: false, lit: false, company: false, _darkT: 3};
  const d = RULES.lhSanityDelta(st, 1);
  assert.ok(d < 0, 'dark outside drains');
  const safe = {dark: false, isolated: false, nearGlitched: false, lit: true, company: true};
  assert.ok(RULES.lhSanityDelta(safe, 1) >= 0);
});

test('a lantern restores sanity even when you are alone', () => {
  assert.equal(RULES.LH_LAMP_R, 5);
  assert.equal(RULES.RATES.lampRestore, 0.9);
  const aloneNear = {isolated:true, dark:false, nearGlitched:false, company:false, lit:true, nearLamp:true, _isoT:10};
  assert.equal(RULES.lhSanityDelta({...aloneNear}, 1), 0.9);
  // isolation and darkness do not drain while standing by a lantern
  const darkAlone = {isolated:true, dark:true, nearGlitched:false, company:false, lit:false, nearLamp:true, _isoT:10, _darkT:10};
  assert.equal(RULES.lhSanityDelta({...darkAlone}, 1), 0.9);
  // company + light (or lantern) still uses the higher restore rate
  const friends = {isolated:false, dark:false, nearGlitched:false, company:true, lit:true, nearLamp:true};
  assert.equal(RULES.lhSanityDelta({...friends}, 1), 2);
  // alone in the light but not near a lantern still isolates
  const aloneLit = {isolated:true, dark:false, nearGlitched:false, company:false, lit:true, nearLamp:false, _isoT:3};
  assert.equal(RULES.lhSanityDelta({...aloneLit}, 1), -1);
  // a fizzled friend nearby still drains, even under a lantern
  const spooky = {isolated:true, dark:false, nearGlitched:true, company:false, lit:true, nearLamp:true, _nearT:1};
  assert.equal(RULES.lhSanityDelta({...spooky}, 1), -4);
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.css'), 'utf8');
  assert.match(js, /lh\.nearLamp/);
  assert.match(js, /The lantern warms you/);
  assert.match(js, /lh-lamp/);
  assert.match(css, /lhlampglow/);
  assert.match(css, /#lhMeter\.lh-lamp/);
});

test('walk cycle, wagon access, and outdoor fairground are wired in the mode', () => {
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.match(js, /function lhCharPose/);
  assert.match(js, /applyPose\(dt, animPose/);
  assert.match(js, /function lhGoWagon/);
  assert.match(js, /function lhBuildFairground/);
  assert.match(js, /lhFlaps/);
  assert.match(js, /Tickets/);
  assert.match(js, /floorOnly/);
  assert.match(js, /Your Wagon/);
  assert.match(js, /Go to my wagon/);
  assert.match(js, /lhMidwayWallSegments/);
  assert.match(HTML, /id="lhMyWagon"/);
  assert.match(HTML, /🎪 Go to my wagon/);
  assert.doesNotMatch(js, /\bCaine\b/);
  assert.doesNotMatch(js, /Digital Circus/);
});

test('staggered ground Y offsets prevent coplanar floors', () => {
  const Y = RULES.LH_Y;
  const order = ['grass', 'path', 'floor', 'runner', 'ring', 'pad', 'wagon'];
  for (let i = 1; i < order.length; i++){
    assert.ok(Y[order[i]] - Y[order[i - 1]] >= 0.02, order[i - 1] + ' vs ' + order[i]);
    assert.equal(RULES.lhGroundGapOk(Y[order[i - 1]], Y[order[i]]), true);
  }
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.match(js, /polygonOffset/);
  assert.match(js, /lhApplyView/);
  assert.match(js, /camera\.near/);
  assert.match(js, /logarithmicDepthBuffer is not needed/);
  assert.equal(RULES.LH_CAM_NEAR, 0.2);
  assert.ok(RULES.LH_CAM_FAR >= 200 && RULES.LH_CAM_FAR <= 400);
});

test('sanity flicker stays under 3 flashes/sec and is off at full sanity', () => {
  assert.ok(RULES.LH_STATIC_PERIOD >= 1);
  const hz = 2 / RULES.LH_STATIC_PERIOD; // steps(2) keyframes per period
  assert.ok(hz < RULES.LH_STATIC_MAX_HZ);
  const css = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.css'), 'utf8');
  assert.match(css, /lhstatic 1\.2s steps\(2\)/);
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.match(js, /staticOn/);
  assert.match(js, /lh\.sanity < 90/);
});

test('wagon doors are hinged, block when closed, and auto-open for the owner', () => {
  assert.equal(RULES.lhDoorTarget(-1, true), 0);
  assert.ok(RULES.lhDoorTarget(-1, false) > 0);
  assert.ok(RULES.lhDoorTarget(1, false) < 0);
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.match(js, /function lhMakeHingeDoor/);
  assert.match(js, /function lhTickDoors/);
  assert.match(js, /function lhOwnerAutoDoor/);
  assert.match(js, /lhSetDoor\(rec, true\)/);
  assert.match(js, /rotation\.y/);
});

test('closing a door holds it shut until the owner leaves the doorway', () => {
  assert.equal(RULES.lhDoorShouldAutoOpen({near:true, inside:true, closed:true, auto:false, holdClosed:false}), false);
  assert.equal(RULES.lhDoorShouldAutoOpen({near:true, inside:false, closed:true, auto:false, holdClosed:true}), false);
  assert.equal(RULES.lhDoorShouldAutoOpen({near:true, inside:false, closed:true, auto:false, holdClosed:false}), true);
  assert.equal(RULES.lhDoorShouldAutoOpen({near:false, inside:false, closed:true, auto:false, holdClosed:false}), false);
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.match(js, /_holdClosed/);
  assert.match(js, /why === 'player'/);
  assert.match(js, /🚪 Close door/);
  assert.match(js, /_lhActAt/);
  assert.match(js, /now - _lhActAt < 250/);
  assert.match(js, /act\.onclick/);
  assert.doesNotMatch(js, /act\.onpointerdown/);
  assert.match(HTML, /toggle twice/);
  assert.match(HTML, /ev\.target\.closest\(HUD_HIT_SEL\)\) return false/);
  const css = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.css'), 'utf8');
  assert.match(css, /#lhAct\.fsnear/);
  assert.match(css, /z-index:22/);
});

test('the midway hallway has no roof or ceiling and stays lit', () => {
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.doesNotMatch(js, /const mC = lhBox\(0, 4\.5, midZc/);
  assert.match(js, /Open-air midway/);
  assert.match(js, /String lights/);
  // hall area is treated as lit so dusk does not drain sanity on the midway
  assert.match(js, /area:'hall',[\s\S]*lit:true/);
});

test('map overlay marks You are here and Your Wagon and the fairground is much bigger', () => {
  const layout = RULES.lhMapLayout();
  assert.ok(layout.zones.some(z => z.id === 'food'));
  assert.ok(layout.zones.some(z => z.id === 'games'));
  assert.ok(layout.zones.some(z => z.id === 'rides'));
  assert.ok(layout.zones.some(z => z.id === 'funhouse'));
  assert.ok(layout.zones.some(z => z.id === 'pond'));
  assert.ok(layout.zones.some(z => z.id === 'woods'));
  const area = (layout.bounds.x1 - layout.bounds.x0) * (layout.bounds.z1 - layout.bounds.z0);
  assert.ok(area > 88 * 90 * 2, 'walkable map bounds should be several times the old 88x90 grass');
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.match(js, /function lhToggleMap/);
  assert.match(js, /function lhDrawMap/);
  assert.match(js, /function lhBuildFunhouse/);
  assert.match(js, /function lhBuildPond/);
  assert.match(js, /function lhSwing/);
  assert.match(js, /You are here/);
  assert.match(js, /Your Wagon/);
  assert.match(js, /KeyM/);
  assert.match(HTML, /id="lhMap"/);
  assert.match(HTML, /id="lhMapBtn"/);
  assert.match(HTML, /id="lhMapCan"/);
});

test('room interiors stay hidden from outside unless the door is open', () => {
  const R = {id: 0, x: 16, z: 22, side: 1, w: 8, d: 6.2, door: {closed: true, ang: 0}};
  const outside = {x: 8, z: 22};
  const inside = {x: 16, z: 22};
  assert.equal(RULES.lhRoomContains(R, inside.x, inside.z), true);
  assert.equal(RULES.lhRoomContains(R, outside.x, outside.z), false);
  assert.equal(RULES.lhRoomInteriorVisible(R, outside), false);
  assert.equal(RULES.lhRoomInteriorVisible(R, inside), true);
  const open = {...R, door: {closed: false, ang: -1.9}};
  assert.equal(RULES.lhRoomInteriorVisible(open, outside), true);
  const ajar = {...R, door: {closed: true, ang: 1.2}};
  assert.equal(RULES.lhRoomInteriorVisible(ajar, outside), true);
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.match(js, /function lhTickPrivacy/);
  assert.match(js, /R\.interior/);
  assert.match(js, /frosted|lhFrost|frost/i);
  assert.match(js, /DoubleSide/);
  assert.match(js, /transom/);
});

test('a closed wagon door and transom seal the doorway', () => {
  const layout = RULES.lhDoorwayLayout({x: 16, z: 22, side: 1, w: 8, d: 6.2});
  assert.equal(layout.h, RULES.LH_WAGON_H);
  assert.equal(RULES.lhDoorSealsOpening(layout), true);
  assert.ok(layout.doorD >= layout.openW);
  assert.ok(layout.doorH >= layout.openH);
  assert.ok(layout.transomH > 0.2);
  assert.ok(layout.openH >= 3.0, 'doorway is taller than the player so the camera does not clip the transom');
  const west = RULES.lhDoorwayLayout({x: -16, z: 22, side: -1, w: 8, d: 6.2});
  assert.equal(west.ix, -16 - (-1) * 4);
  assert.equal(RULES.lhDoorSealsOpening(west), true);
});

test('wall writing presets, custom cap, chat filter, and chat mode', () => {
  const presets = RULES.LH_WALL_PRESETS;
  ['HELP', 'EXIT', 'GET OUT', 'RUN', 'BEHIND YOU', "DON'T LOOK", 'NO EXIT'].forEach(w => {
    assert.ok(presets.indexOf(w) >= 0, w);
  });
  assert.ok(presets.length >= 8);
  assert.equal(RULES.LH_WALL_MAX_CHARS, 12);

  const help = RULES.lhNormalizeWallText('help');
  assert.equal(help.ok, true);
  assert.equal(help.preset, true);
  assert.equal(help.text, 'HELP');

  const off = RULES.lhNormalizeWallText('HELLO THERE', {chatMode: 'off'});
  assert.equal(off.ok, false);
  assert.equal(off.reason, 'presets-only');
  const quick = RULES.lhNormalizeWallText('HELLO THERE', {chatMode: 'quick'});
  assert.equal(quick.ok, false);
  assert.equal(quick.reason, 'presets-only');
  // presets still work when chat is off
  assert.equal(RULES.lhNormalizeWallText('EXIT', {chatMode: 'off'}).ok, true);

  const long = RULES.lhNormalizeWallText('HELLOWORLD!!!!', {chatMode: 'on'});
  assert.ok(long.text.length <= 12);

  const filter = (text, opts) => {
    const max = (opts && opts.max) || 12;
    let src = String(text || '').slice(0, max);
    if (/@|555-/.test(src)) return {ok: true, text: '####', blocked: true, reasons: ['email']};
    if (/dang/i.test(src)) return {ok: true, text: '####', blocked: true, reasons: ['word']};
    return {ok: true, text: src, blocked: false, reasons: []};
  };
  const pii = RULES.lhNormalizeWallText('hi@x.com', {chatMode: 'on', chatFilter: filter});
  assert.equal(pii.ok, false);
  assert.equal(pii.reason, 'pii');
  assert.equal(pii.display, '####');
  const swear = RULES.lhNormalizeWallText('dang', {chatMode: 'on', chatFilter: filter});
  assert.equal(swear.ok, false);
  assert.equal(swear.reason, 'filtered');
  const ok = RULES.lhNormalizeWallText('BOO', {chatMode: 'on', chatFilter: filter});
  assert.equal(ok.ok, true);
  assert.equal(ok.text, 'BOO');

  const chatfilter = require(path.join(ROOT, 'dev/chat/chatfilter.js'));
  const real = RULES.lhNormalizeWallText('test@mail.com', {chatMode: 'on', chatFilter: chatfilter.chatFilter});
  assert.equal(real.ok, false);
  assert.equal(real.reason, 'pii');
});

test('wall words cap at 20 per player, oldest fades, and only the writer can erase', () => {
  let list = [];
  for (let i = 0; i < 21; i++){
    const r = RULES.lhAddWallWord(list, {id: 'a' + i, uid: 'me', text: 'HELP', x: i, y: 1.5, z: 0});
    list = r.list;
    if (i < 20) assert.equal(r.faded.length, 0);
    else {
      assert.equal(r.faded.length, 1);
      assert.equal(r.faded[0].id, 'a0');
    }
  }
  assert.equal(list.length, 20);
  assert.equal(list[0].id, 'a1');
  const other = RULES.lhAddWallWord(list, {id: 'b0', uid: 'friend', text: 'RUN'});
  assert.equal(other.list.length, 21);
  const no = RULES.lhEraseWallWord(other.list, 'b0', 'me');
  assert.equal(no.erased, null);
  assert.equal(no.reason, 'not-owner');
  const yes = RULES.lhEraseWallWord(other.list, 'a1', 'me');
  assert.equal(yes.erased.id, 'a1');
  assert.equal(yes.list.length, 20);
  // old saves without wallWords still load
  const st = RULES.lhLoadState({visits: 2, doodles: {}});
  assert.deepEqual(st.wallWords, []);
});

test('wall writing aims at the look-point on a wagon wall', () => {
  const R = {id: 3, x: 16, z: 22, side: 1, w: 8, d: 6.2, h: 3.2, floorY: 0.22};
  const planes = RULES.lhWagonWallPlanes(R);
  assert.equal(planes.length, 4);
  // standing inside, looking +X at the back wall
  const hit = RULES.lhRayWall(16, 1.4, 22, 1, 0, 0, planes, 4);
  assert.ok(hit);
  assert.equal(hit.wall, 'back');
  assert.equal(hit.interior, true);
  assert.ok(Math.abs(hit.x - (16 + 4)) < 0.02);
  // standing outside the doorway, looking +X at the door wall
  const out = RULES.lhRayWall(10, 1.4, 22, 1, 0, 0, planes, 4);
  assert.ok(out);
  assert.equal(out.wall, 'door');
  assert.equal(out.interior, false);
});

test('wall writing has an on-screen button, Key G, controller bumper, and mobile tap', () => {
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.css'), 'utf8');
  const hud = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern_hud.html'), 'utf8');
  assert.match(js, /KeyG/);
  assert.match(js, /jp\[4\]/);
  assert.match(js, /function lhOpenWrite/);
  assert.match(js, /function lhPlaceWallWord/);
  assert.match(js, /lhNet\(\{k:'word'/);
  assert.match(hud, /id="lhWrite"/);
  assert.match(hud, /id="lhWriteBtn"/);
  assert.match(css, /#lhWriteBtn/);
  assert.match(css, /#lhWrite/);
});


test('wagon and midway walls are taller than a jump and use plat top=height', () => {
  assert.ok(RULES.LH_WAGON_H >= 5);
  assert.ok(RULES.LH_MIDWAY_WALL_H >= 5);
  assert.ok(RULES.LH_WAGON_H > RULES.lhJumpClearHeight(16, 45));
  assert.ok(RULES.LH_DOOR_OPEN_H > 2.45, 'taller than eye height');
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  // plat() takes the TOP of the box: walls must be lhBox(..., h, ..., h) not h/2
  assert.match(js, /lhBox\(R\.x, h, R\.z - d \/ 2/);
  assert.match(js, /lhBox\(ix, h, lay\.stubZ0/);
  assert.match(js, /transomTop \|\| h/);
  assert.match(js, /LH_MIDWAY_WALL_H/);
  assert.match(js, /plat\(ix, lay\.openH, R\.z/);
  assert.doesNotMatch(js, /const w = 8, d = 6\.2, h = 3\.2/);
  assert.match(HTML, /mode === 'lantern'/);
  assert.match(HTML, /clipOrbitCam/);
  // lantern is in the orbit-clip mode list so the camera does not sink into the tall walls
  const cam = HTML.slice(HTML.indexOf('function updateCamera()'), HTML.indexOf('function updateCamera()') + 1600);
  assert.match(cam, /mode === 'lantern'/);
});

test('you have to knock to get into someone else\'s closed room', () => {
  const knock = RULES.lhDoorPromptKind({isOwner: false, doorClosed: true, wagonNo: 3});
  assert.equal(knock.id, 'knock');
  assert.match(knock.label, /Knock/);
  const own = RULES.lhDoorPromptKind({isOwner: true, doorClosed: true});
  assert.equal(own.id, 'door');
  assert.match(own.label, /Open door/);
  const enter = RULES.lhDoorPromptKind({isOwner: false, doorClosed: false, wagonNo: 3});
  assert.equal(enter.id, 'enter');
  const no = RULES.lhKnockAllowed({isOwner: true, doorClosed: true, lastAt: 0, now: 20});
  assert.equal(no.ok, false);
  assert.equal(no.reason, 'own');
  const wait = RULES.lhKnockAllowed({isOwner: false, doorClosed: true, lastAt: 10, now: 12, cooldown: 7});
  assert.equal(wait.ok, false);
  assert.equal(wait.reason, 'cooldown');
  assert.ok(wait.wait > 0);
  const ok = RULES.lhKnockAllowed({isOwner: false, doorClosed: true, lastAt: 0, now: 20, cooldown: 7});
  assert.equal(ok.ok, true);
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.match(js, /function lhKnock/);
  assert.match(js, /p\.id === 'knock'/);
  // Enter must not open a closed door
  assert.match(js, /p\.R\.door\.closed[\s\S]{0,80}Knock first/);
  assert.doesNotMatch(js, /p\.id === 'enter'\)\{ if \(p\.R\.door\.closed\) lhSetDoor/);
});

test('a knock may be answered, ignored, or stay closed if nobody is home', () => {
  assert.equal(RULES.LH_KNOCK_TIMEOUT, 10);
  assert.ok(RULES.LH_KNOCK_COOLDOWN >= 4);
  const popup = RULES.lhKnockResolve({solo: false, hasOwner: true, ownerOnline: true, ownerInRoom: true});
  assert.equal(popup.mode, 'popup');
  assert.equal(popup.timeout, 10);
  const away = RULES.lhKnockResolve({solo: false, hasOwner: true, ownerOnline: true, ownerInRoom: false});
  assert.equal(away.mode, 'closed');
  assert.equal(away.reason, 'away');
  const off = RULES.lhKnockResolve({solo: false, hasOwner: true, ownerOnline: false, ownerInRoom: false});
  assert.equal(off.reason, 'offline');
  const empty = RULES.lhKnockResolve({solo: false, hasOwner: false, ownerOnline: false, ownerInRoom: false});
  assert.equal(empty.mode, 'closed');
  // solo unowned / NPC rooms: random spooky outcome
  const open = RULES.lhKnockResolve({solo: true, hasOwner: false}, () => 0.1);
  assert.equal(open.mode, 'open');
  assert.equal(open.reason, 'solo-open');
  assert.ok(open.message);
  const stay = RULES.lhKnockResolve({solo: true, hasOwner: false}, () => 0.9);
  assert.equal(stay.mode, 'closed');
  assert.equal(stay.reason, 'solo-stay');
  assert.equal(RULES.lhKnockReplyMessage('closed'), 'They kept the door closed.');
  assert.equal(RULES.lhKnockReplyMessage('timeout'), 'No one answered. The door stays closed.');
  const hud = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern_hud.html'), 'utf8');
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.css'), 'utf8');
  assert.match(hud, /id="lhKnock"/);
  assert.match(hud, /id="lhKnockOpen"/);
  assert.match(hud, /id="lhKnockKeep"/);
  assert.match(css, /#lhKnock/);
  assert.match(js, /lhKnockReply\(true/);
  assert.match(js, /lhShowKnockPopup/);
  assert.match(js, /k:'knock'/);
});

test('optional save fields stay compatible and default empty', () => {
  const fresh = RULES.lhLoadState(null);
  assert.deepEqual(fresh.rides, {});
  assert.equal(fresh.tickets, 0);
  assert.deepEqual(fresh.decor, []);
  assert.deepEqual(fresh.wagonStyle, {});
  const old = RULES.lhLoadState({ver:1, visits:3, coins:8, settings:{cancellation:'always'}});
  assert.equal(old.visits, 3);
  assert.equal(old.coins, 8);
  assert.deepEqual(old.rides, {});
  assert.equal(old.tickets, 0);
  const kept = RULES.lhLoadState({rides:{ferris:true}, tickets:12, prizes:{'decor-lamp':true}, wear:{hat:'hat-party'}, decor:[{id:'lamp'}], wagonStyle:{wall:'stripe'}});
  assert.equal(kept.rides.ferris, true);
  assert.equal(kept.tickets, 12);
  assert.equal(kept.prizes['decor-lamp'], true);
  assert.equal(kept.wear.hat, 'hat-party');
  assert.equal(kept.decor[0].id, 'lamp');
  assert.equal(kept.wagonStyle.wall, 'stripe');
  const fresh2 = RULES.lhLoadState(null);
  assert.deepEqual(fresh2.prizes, {});
  assert.deepEqual(fresh2.wear, {});
});

test('ride seat picking, boarding rules, exits, and midway progress', () => {
  assert.equal(RULES.lhRidePickSeat([], 4), 0);
  assert.equal(RULES.lhRidePickSeat(['me', null, 'p2'], 3), 1);
  assert.equal(RULES.lhRidePickSeat(['a','b','c'], 3), -1);
  assert.equal(RULES.LH_RIDE_SPEC.length, 3);
  assert.deepEqual(RULES.LH_RIDE_SPEC.map(r => r.id), ['ferris','carousel','swing']);
  assert.equal(RULES.lhRideBoardOk({near:false, seat:0}).ok, false);
  assert.equal(RULES.lhRideBoardOk({near:false, seat:0}).reason, 'far');
  assert.equal(RULES.lhRideBoardOk({near:true, alreadyOn:true, seat:0}).reason, 'seated');
  assert.equal(RULES.lhRideBoardOk({near:true, seat:-1}).reason, 'full');
  const ok = RULES.lhRideBoardOk({near:true, seat:2});
  assert.equal(ok.ok, true);
  assert.equal(ok.seat, 2);
  const ferris = RULES.lhRideExitPoint({kind:'ferris', x:-80, z:-36});
  assert.ok(ferris.x > -80);
  assert.equal(ferris.y, 0.12);
  const first = RULES.lhRideProgress({}, 'ferris');
  assert.equal(first.first, true);
  assert.equal(first.all, false);
  assert.equal(first.rides.ferris, true);
  const mid = RULES.lhRideProgress(first.rides, 'carousel');
  assert.equal(mid.first, false);
  assert.equal(mid.all, false);
  const all = RULES.lhRideProgress(mid.rides, 'swing');
  assert.equal(all.all, true);
  const extra = RULES.LH_BADGES.filter(b => !b.real);
  assert.ok(extra.some(b => b.id === 'lh-ride' && b.note === 'lh:ride'));
  assert.ok(extra.some(b => b.id === 'lh-rides' && b.note === 'lh:rides'));
  extra.forEach(b => {
    assert.ok(!b.real);
    assert.doesNotMatch((b.name || '') + (b.desc || ''), /Caine|Kaufmo|Pomni|Eniac|Daisy|Digital Circus|TADC/i);
  });
});

test('fairground rides are boardable with camera-follow and MP co-ride hooks', () => {
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  assert.match(js, /function lhBoardRide/);
  assert.match(js, /function lhDismountRide/);
  assert.match(js, /function lhTickRides/);
  assert.match(js, /function lhApplyLocalRide/);
  assert.match(js, /function lhSnapRemoteRiders/);
  assert.match(js, /function lhApplyRemoteRide/);
  assert.match(js, /p\.id === 'hopoff'/);
  assert.match(js, /p\.id === 'ride'/);
  assert.match(js, /k:'ride'/);
  assert.match(js, /window\.lhBoardRide/);
  assert.match(js, /window\.lhDismount/);
  assert.match(js, /window\.lhRideState/);
  assert.match(js, /window\.lhGoRides/);
  // seats stay upright on the Ferris wheel
  assert.match(js, /s\.mesh\.rotation\.z = -spin\.rotation\.z/);
  // camera rides along by pinning the player to the seat
  assert.match(js, /P\.x = v\.x; P\.y = v\.y; P\.z = v\.z/);
  // Xbox B hops off
  assert.match(js, /jp\[1\] && lh\.riding/);
  // original ride names only
  assert.match(js, /Ferris Wheel/);
  assert.match(js, /Carousel/);
  assert.match(js, /Swing Ride/);
  assert.doesNotMatch(js, /Digital Circus|Caine|Pomni|Kaufmo/);
});

test('carnival games award tickets and the prize booth trades them', () => {
  assert.equal(RULES.LH_CARNIVAL_GAMES.length, 4);
  assert.deepEqual(RULES.LH_CARNIVAL_GAMES.map(g => g.id), ['rings','darts','ducks','whack']);
  assert.equal(RULES.lhGameTickets('rings', 0), 0);
  assert.equal(RULES.lhGameTickets('rings', 2), 4);
  assert.equal(RULES.lhGameTickets('rings', 3), 10); // 3*2 + bonus 4
  assert.equal(RULES.lhGameTickets('darts', 5), 14);
  assert.equal(RULES.lhGameTickets('whack', 10), 15);
  assert.equal(RULES.lhGameTickets('ducks', 0, () => 0.01), 8);
  assert.equal(RULES.lhGameTickets('ducks', 0, () => 0.5), 2);
  assert.equal(RULES.lhGameTickets('ducks', 0, () => 0.9), 1);
  assert.ok(RULES.LH_PRIZES.length >= 8);
  RULES.LH_PRIZES.forEach(p => {
    assert.ok(p.id && p.name && p.kind && p.cost > 0);
    assert.ok(['cosmetic','plush','decor'].includes(p.kind));
    assert.doesNotMatch(p.name + p.desc, /Caine|Kaufmo|Pomni|Eniac|Digital Circus|TADC/i);
  });
  const deny = RULES.lhBuyPrize({tickets: 3, prizes:{}}, 'decor-poster');
  assert.equal(deny.ok, false);
  assert.equal(deny.reason, 'cost');
  assert.equal(deny.tickets, 3);
  const buy = RULES.lhBuyPrize({tickets: 20, prizes:{}}, 'plush-glow');
  assert.equal(buy.ok, true);
  assert.equal(buy.tickets, 8);
  assert.equal(buy.prizes['plush-glow'], true);
  const again = RULES.lhBuyPrize({tickets: 40, prizes: buy.prizes}, 'plush-glow');
  assert.equal(again.ok, false);
  assert.equal(again.reason, 'owned');
  const wear = RULES.lhEquipCosmetic({}, 'hat-party');
  assert.equal(wear.ok, true);
  assert.equal(wear.equipped, 'hat-party');
  const off = RULES.lhEquipCosmetic(wear.wear, 'hat-party');
  assert.equal(off.equipped, null);
  const extra = RULES.LH_BADGES.filter(b => !b.real);
  assert.ok(extra.some(b => b.id === 'lh-tickets'));
  assert.ok(extra.some(b => b.id === 'lh-prize'));
});

test('carnival games and prize booth are wired for mobile, keyboard, and Xbox', () => {
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  const hud = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern_hud.html'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.css'), 'utf8');
  assert.match(hud, /id="lhGame"/);
  assert.match(hud, /id="lhBooth"/);
  assert.match(css, /#lhGame/);
  assert.match(css, /#lhBooth/);
  assert.match(js, /function lhOpenGame/);
  assert.match(js, /function lhOpenBooth/);
  assert.match(js, /function lhGiveTickets/);
  assert.match(js, /function lhBuyAtBooth/);
  assert.match(js, /p\.id === 'game'/);
  assert.match(js, /p\.id === 'booth'/);
  assert.match(js, /lh\.arcade/);
  assert.match(js, /jp\[1\] && !lh\._padB\)\{ lh\._padB = true; lhCloseArcade/);
  assert.match(js, /window\.lhOpenGame/);
  assert.match(js, /window\.lhOpenBooth/);
  assert.match(js, /window\.lhTickets/);
  assert.match(js, /rubloxLantern|LH_KEY/);
  assert.match(js, /tickets:/);
  assert.doesNotMatch(js, /Digital Circus|Caine|Pomni|Kaufmo/);
  assert.match(HTML, /#lhGame/);
  assert.match(HTML, /#lhBooth/);
});

test('wagon decor inventory, clamp, place/rotate/remove, and styles', () => {
  const starter = RULES.lhDecorCatalog({});
  assert.ok(starter.length >= 6);
  starter.forEach(s => assert.ok(s.starter || String(s.id).startsWith('start-')));
  const withPrize = RULES.lhDecorCatalog({'plush-glow':true, 'hat-party':true, 'decor-lamp':true});
  assert.ok(withPrize.some(p => p.id === 'plush-glow'));
  assert.ok(withPrize.some(p => p.id === 'decor-lamp'));
  assert.ok(!withPrize.some(p => p.id === 'hat-party'));
  const mid = RULES.lhDecorClamp(0, 0, 8, 6.2, 1.1);
  assert.equal(mid.x, 0);
  const out = RULES.lhDecorClamp(40, -40, 8, 6.2, 1.1);
  assert.ok(Math.abs(out.x) <= 8/2 - 1.1 + 0.001);
  assert.ok(Math.abs(out.z) <= 6.2/2 - 1.1 + 0.001);
  let items = [];
  const placed = RULES.lhDecorPlace(items, 'start-stool', 0.5, -0.4, 0);
  assert.equal(placed.ok, true);
  assert.equal(placed.items.length, 1);
  assert.equal(placed.placed.item, 'start-stool');
  const rot = RULES.lhDecorRotate(placed.items, placed.placed.id);
  assert.equal(rot.placed.rot, 1);
  const moved = RULES.lhDecorMove(rot.items, placed.placed.id, 1, 1);
  assert.equal(moved.placed.x, 1);
  const gone = RULES.lhDecorRemove(moved.items, placed.placed.id);
  assert.equal(gone.items.length, 0);
  const st = RULES.lhNormalizeStyle({wall:'stars', floor:'nope'});
  assert.equal(st.wall, 'stars');
  assert.equal(st.floor, 'wood');
  items = [];
  for (let i = 0; i < RULES.LH_DECOR_MAX; i++){
    const r = RULES.lhDecorPlace(items, 'start-mat', 0, 0, 0);
    assert.equal(r.ok, true);
    items = r.items;
  }
  const overflow = RULES.lhDecorPlace(items, 'start-mat', 0, 0, 0);
  assert.equal(overflow.ok, false);
  assert.equal(overflow.reason, 'full');
  const extra = RULES.LH_BADGES.filter(b => !b.real);
  assert.ok(extra.some(b => b.id === 'lh-decor'));
});

test('wagon decor layout saves and is only visible in MP when the door is open', () => {
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  const hud = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern_hud.html'), 'utf8');
  assert.match(hud, /id="lhDecor"/);
  assert.match(hud, /id="lhDecorBtn"/);
  assert.match(js, /function lhOpenDecor/);
  assert.match(js, /function lhRebuildDecor/);
  assert.match(js, /function lhApplyWagonStyle/);
  assert.match(js, /function lhPlaceSelectedDecor/);
  assert.match(js, /k:'decor'/);
  assert.match(js, /window\.lhPlaceDecor/);
  assert.match(js, /window\.lhSetStyle/);
  assert.match(js, /KeyT/);
  assert.match(js, /jp\[5\] && !lh\._padRB/);
  assert.match(js, /interior\.add\(decorG\)/);
  assert.match(js, /R\.decorG\.parent !== R\.interior/);
  assert.match(js, /lhReceiveDecor/);
  assert.match(js, /if \(R\.owner === 'me'\) return/);
  assert.doesNotMatch(js, /Digital Circus|Caine|Pomni|Kaufmo/);
});

test('Lantern uses the global dusk and night cycle with a settings toggle', () => {
  const js = fs.readFileSync(path.join(ROOT, 'dev/lantern/lantern.js'), 'utf8');
  const wx = require(path.join(ROOT, 'dev/weather/weather_rules.js'));
  assert.equal(wx.wxEnabled('lantern', {mode:'auto'}), true);
  const night = wx.wxSky('lantern', 'night', 'clear');
  const day = wx.wxSky('lantern', 'day', 'clear');
  assert.notEqual(night, day);
  assert.match(HTML, /id="wxSetAuto"/);
  assert.match(HTML, /wxTick\(frameDt, mode/);
});
