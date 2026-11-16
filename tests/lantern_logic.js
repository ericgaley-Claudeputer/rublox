const {test, skip} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const RULES = require(path.join(ROOT, 'dev/lantern/lantern_rules.js'));
const BUILD = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8')).build || JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));

test('BUILD stamp is 2026.11.16-1 in lantern files and version.json', () => {
  const v = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));
  assert.equal(v.build, '2026.11.16-1');
  assert.match(HTML, /const BUILD = '2026\.11\.16-1'/);
});

test('Lantern Hotel is a playable GAMES card with original branding', () => {
  assert.match(HTML, /id:'lantern',\s*name:'Lantern Hotel'/);
  assert.match(HTML, /function drawLantern/);
  assert.doesNotMatch(HTML, /Experience Abstraction/);
  assert.doesNotMatch(HTML, /\bCaine\b/);
  assert.doesNotMatch(HTML, /\bPomni\b/);
  assert.doesNotMatch(HTML, /\bKaufmo\b/);
  assert.doesNotMatch(HTML, /The Amazing Digital Circus/);
  assert.doesNotMatch(HTML, /Glitch Circus Hotel/);
  assert.match(HTML, /Miss Fanfare/);
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

test('host name Fanfare is detected in filtered chat text, not as a substring of other words', () => {
  assert.ok(RULES.lhHostNameIn('Fanfare'));
  assert.ok(RULES.lhHostNameIn('hey Fanfare come here'));
  assert.ok(RULES.lhHostNameIn('FANFARE!!!'));
  assert.ok(!RULES.lhHostNameIn('fanfareish'));
  assert.ok(!RULES.lhHostNameIn('hello there'));
  assert.ok(RULES.lhCensored('####'));
  assert.ok(!RULES.lhCensored('Fanfare'));
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

test('16 official badges are mapped 1:1 to original Lantern Hotel achievements', () => {
  assert.equal(RULES.LH_BADGES.length, 16);
  const ids = RULES.LH_BADGES.map(b => b.id);
  assert.equal(new Set(ids).size, 16);
  const reals = RULES.LH_BADGES.map(b => b.real);
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
    assert.notEqual(b.name, b.real);
    assert.doesNotMatch(b.name, /Caine|Kaufmo|Pomni|Eniac|Daisy/);
    assert.doesNotMatch(b.desc, /Caine|Kaufmo|Pomni|Eniac|Daisy Bell|abstract/i);
  });
  // registry in the built page
  assert.match(HTML, /id: 'lantern', name: 'Lantern Hotel'/);
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
