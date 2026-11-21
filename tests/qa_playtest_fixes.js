// Regressions for the bugs found while play-testing every game in real Chrome + WebGL (QA t330u).
const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Pull one top-level-in-closure function's source out of the single-file build.
function fnSource(name){
  const i = html.indexOf('  function ' + name + '(');
  assert.ok(i >= 0, name + ' not found');
  const end = html.indexOf('\n  }\n', i);
  return html.slice(i, end + 4);
}

describe('controls tips', () => {
  const NEW = ['elevator', 'mansion', 'shelter', 'winter', 'vet', 'mermaid', 'garden', 'meadow', 'rides', 'hive', 'camp', 'cafe', 'fish', 'petshow', 'hunt', 'party', 'snowfest'];
  test('every newer game has its own keyboard / touch tip instead of the Obby "dodge the red lava" text', () => {
    const at = html.indexOf('const NEWTIP = {');
    assert.ok(at > 0);
    const block = html.slice(at, html.indexOf('};', at));
    NEW.forEach(id => assert.match(block, new RegExp('\\b' + id + ": \\['"), id + ' has no tip'));
    assert.ok(html.indexOf('if (NEWTIP[mode])') < html.indexOf(": grab the coins, dodge the red lava"), 'NEWTIP must win before the Obby goal');
  });
  test('the vet tip does not offer the first-person toggle the clinic ignores', () => {
    const at = html.indexOf('const NEWTIP = {');
    const vet = html.slice(at, html.indexOf('};', at)).split('\n').find(l => l.includes('vet: ['));
    assert.doesNotMatch(vet, /V first person/);
  });
  test('Xbox tips name the action button for the lot games', () => {
    const src = fnSource('padTip');
    ['meadow', 'camp', 'rides'].forEach(id => assert.match(src, new RegExp("mode === '" + id + "' \\? '🎮")));
    assert.match(src, /\['garden', 'hive', 'cafe', 'fish', 'petshow', 'hunt', 'party', 'snowfest'\]\.includes\(mode\)/);
  });
});

describe('falling off the map', () => {
  test('cozy lot games catch you at the edge and put you back toward the start', () => {
    const src = fnSource('qaEdgeCatch');
    const modes = html.match(/const QA_EDGE_MODES = \[([^\]]+)\]/)[1];
    ['garden', 'meadow', 'rides', 'hive', 'camp', 'cafe', 'fish', 'petshow', 'hunt'].forEach(m => assert.ok(modes.includes("'" + m + "'"), m));
    // run it against a tiny fake world
    const P = {x: 0, y: 0, z: 0, vx: 1, vy: -9, vz: 1, onGround: true, ground: {}};
    const said = [];
    const make = new Function('P', 'checkpoints', 'banner', 'QA_EDGE_MODES', 'state', 'let mode = state.mode; let qaSafe = null;\n' + src + '\nreturn {step(m){ mode = m; return qaEdgeCatch(); }};');
    const w = make(P, [{spawn: {x: 0, z: 0}}], s => said.push(s), ['garden'], {mode: 'garden'});
    Object.assign(P, {x: 13, z: 0, y: 0, onGround: true});
    assert.equal(w.step('garden'), false);            // standing on the lot edge: remembered
    Object.assign(P, {x: 16, z: 0, y: -7, onGround: false});
    assert.equal(w.step('garden'), true);             // fell off: caught
    assert.ok(P.x < 13 && P.x > 9, 'moved back toward the start, got ' + P.x);
    assert.equal(P.vy, 0);
    assert.equal(said.length, 1);
    Object.assign(P, {x: 40, y: -30, onGround: false});
    assert.equal(w.step('obby'), false);              // Obby keeps its own void + respawn
  });
  test('checks() runs the edge catch first', () => {
    assert.match(fnSource('checks'), /^  function checks\(\)\{\n    if \(SIM\) return;\n    if \(qaEdgeCatch\(\)\) return;/);
  });
});

describe('HUD that covered other HUD', () => {
  test('📜 quests and 🤝 trade sit beside the 😀 emote button, not on top of it', () => {
    assert.match(html, /#obby:not\(\.touchui\) #oQuestBtn\{right:calc\(max\(20px,env\(safe-area-inset-right\)\) \+ 66px\)\}/);
    assert.match(html, /#obby:not\(\.touchui\) #oTradeBtn\{right:calc\(max\(20px,env\(safe-area-inset-right\)\) \+ 132px\)\}/);
    assert.match(html, /#obby\.bmode:not\(\.touchui\) \.oemo\{bottom:/);
    assert.match(html, /#obby\.lhmode:not\(\.touchui\) \.oemo\{bottom:/);
  });
  test('top-right buttons are not stretched by a tall stats box', () => {
    assert.match(html, /\.ohud > \.obtns\{align-self:flex-start;align-items:flex-start\}/);
  });
  test('on phones the goal pills start under the wrapped top buttons', () => {
    assert.match(html, /\.touchui #t297Box,\.touchui #t302Box,\.touchui #elevBox,\.touchui #mnBox,\.touchui #shBox,\.touchui #wnBox,\.touchui #mmBox,\.touchui #vtBox\{top:calc\(var\(--hudb, 56px\) \+ 6px\)\}/);
    assert.match(html, /\.touchui #t302Coins\{top:calc\(var\(--hudb, 56px\) \+ \d+px\)\}/);
  });
  test('long action buttons wrap instead of covering the thumb stick', () => {
    assert.match(html, /#pyAct,#t297Act,#t302Act,#elevAct,#mnAct,#shAct,#wnAct,#mmAct,#vtAct\{max-width:min\(320px,calc\(100vw - 200px\)\);white-space:normal/);
  });
  test('the pony adopt list wraps and scrolls so no pony hides behind Later', () => {
    assert.match(html, /#sbPickList\{display:flex;flex-wrap:wrap;[^}]*overflow-y:auto\}/);
  });
  test('Treasure Trail shows one Map button, not two', () => {
    assert.doesNotMatch(html, /t297Hud\([^;]*'🗺️ Map'\)/);
  });
});

describe('labels', () => {
  test('vet and manor labels are hidden by walls and smaller indoors', () => {
    assert.match(fnSource('vtLab'), /m\.material\.depthTest = true; m\.scale\.multiplyScalar\(0\.62\)/);
    assert.match(fnSource('mnLab'), /m\.material\.depthTest = true/);
  });
  test('vet prop labels hide when you walk right up to them', () => {
    assert.match(fnSource('vtUpdate'), /pr\.label\.visible = Math\.hypot\(P\.x - pr\.x, P\.z - pr\.z\) > 1\.9/);
  });
  test('Wobblevator lobby sign is not in front of the camera', () => {
    assert.ok(html.includes("elevLab('🛗 Wobblevator Lobby', 0, 5.6, 4.5)"));
    assert.ok(!html.includes("elevLab('🛗 Wobblevator Lobby', 0, 3.4, 22)"));
  });
  test('Glimmergill sea-pet and decor names are staggered', () => {
    assert.match(html, /4\+i\*2\.2, 2\.2 \+ \(i % 2\) \* 0\.7, 6\)/);
    assert.match(html, /1\.5 \+ \(i % 3\) \* 0\.6, -2\)/);
  });
  test('Pet Talent Show mat and stage signs stay out of the starting camera', () => {
    assert.ok(html.includes("t297Lab('🎭 Stage — start a show here', 0, 3.4, -7)"));
    assert.match(html, /t297Lab\(t\.emoji \+ ' ' \+ t\.name, x, 1\.5 \+ \(i % 2\) \* 0\.55, z\); if \(ml\) ml\.scale\.multiplyScalar\(0\.6\)/);
  });
  test('the controls tip moves above the run-energy bar', () => {
    assert.ok(html.includes('#obby:not(.touchui):has(#oStam:not([style*="none"])) .otip{bottom:56px}'));
  });
  test('Dream House fits a portrait phone: one-row toolbar, current step, goal beside the steps, no desktop look hint', () => {
    assert.ok(html.includes('#obby.touchui .dhlookhint{display:none!important}'));
    assert.ok(html.includes('#obby.touchui.dhmode .dhstep:not(.on){display:none}'));
    assert.match(html, /#obby\.touchui\.dhmode \.dhtools:not\(\.dhvisitbar\),#obby\.touchui\.dhmode \.dinv\{flex-wrap:nowrap/);
    assert.match(html, /#obby\.touchui\.dhmode \.dhgoal\{top:calc\(var\(--hudb, 56px\) \+ 6px\);left:auto/);
  });
  test('phone pickers start under the HUD rows and Splash levels fit the width', () => {
    assert.ok(html.includes('#obby.touchui .opanel{padding-top:calc(var(--hudb, 56px) + 6px);place-items:start center}'));
    assert.ok(html.includes('@media (max-width:560px){.splevels{grid-template-columns:repeat(3,minmax(0,1fr))}'));
  });
  test('Bingle is not named twice in a speech bubble', () => {
    const src = fnSource('elevSay');
    const out = [];
    const run = new Function('elv', 'elevLab', 'banner', 'scene', src + '\nreturn elevSay;')({bubbles: []}, (t) => { out.push(t); return {}; }, () => {}, {remove(){}});
    run('🛎️ Bingle', '🛎️ Bingle: "Doors closing! Get back in!"', 0, 0, 0);
    run('Niblet', 'Hi there!', 0, 0, 0);
    assert.equal(out[0], '🛎️ Bingle: "Doors closing! Get back in!"');
    assert.equal(out[1], 'Niblet: "Hi there!"');
  });
});

describe('modals and cameras', () => {
  test('Escape closes the Pinebell gift-wrap modal instead of pausing behind it', () => {
    const at = html.indexOf("const wrapModal = document.getElementById('wnWrap');");
    assert.ok(at > 0);
    const pauseAt = html.indexOf("if (e.code === 'Escape' || e.code === 'KeyP'){ if (!won && !over && !choosing) setPause(", at);
    assert.ok(pauseAt > at, 'wrap check must run before the pause toggle');
    assert.match(html.slice(at, at + 400), /wnCloseWrap\(\)/);
  });
  test('the ambulance chase camera pulls in instead of sitting inside a wall', () => {
    const src = fnSource('vtDriveCam');
    const camAt = [];
    const mk = solids => new Function('vtDriving', 'vt', 'cam', 'camera', 'solids', src + '\nreturn vtDriveCam;')(
      () => true, {run: {drive: {x: 0, z: 0, yaw: 0}}}, {}, {position: {set(x, y, z){ camAt.push([x, y, z]); }}, lookAt(){}}, solids);
    mk([])();
    assert.equal(camAt[0][2], 8);
    mk([{mesh: {position: {x: 0, y: 2, z: 5}}, hw: 4, hh: 2, hd: 0.3, active: true}])();
    assert.ok(camAt[1][2] < 4.7, 'camera should stay in front of the wall, got z=' + camAt[1][2]);
  });
  test('the photo booth explains the 4-sticker limit', () => {
    assert.ok(html.includes('Up to 4 stickers! Tap a lit one to take it off.'));
  });
});
