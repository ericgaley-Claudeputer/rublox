const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const RULES = require(path.join(ROOT, 'dev/petfollow/petfollow_rules.js'));

test('pet follow toggle defaults visible and stays compatible', () => {
  const d = RULES.pfLoadToggle(null);
  assert.equal(d.hide, false);
  assert.equal(RULES.PF_KEY, 'rubloxPetFollow');
  assert.equal(RULES.PF_PETS_KEY, 'rubloxPets');
  assert.equal(RULES.pfNormalize({hide:true}).hide, true);
  assert.equal(RULES.pfLoadToggle({ver:1, hide:true}).hide, true);
});

test('active pet is read from the Adopt a Pet save', () => {
  assert.equal(RULES.pfActiveFromSave(null), null);
  assert.equal(RULES.pfActiveFromSave({pets:[]}), null);
  const pet = RULES.pfActiveFromSave({a:1, pets:[{k:'cat', c:0, n:'Miso', xp:10},{k:'dog', c:2, n:'Biscuit', xp:200, acc:{hat:'bow'}}]});
  assert.equal(pet.k, 'dog');
  assert.equal(pet.c, 2);
  assert.equal(pet.n, 'Biscuit');
  assert.equal(pet.acc.hat, 'bow');
  assert.ok(RULES.pfStage(200) >= 2);
});

test('pets follow into sensible modes and skip races or splash', () => {
  const on = {hide:false};
  assert.equal(RULES.pfShouldFollow('lantern', on, true), true);
  assert.equal(RULES.pfShouldFollow('obby', on, true), true);
  assert.equal(RULES.pfShouldFollow('dreamhouse', on, true), true);
  assert.equal(RULES.pfShouldFollow('race', on, true), false);
  assert.equal(RULES.pfShouldFollow('splash', on, true), false);
  assert.equal(RULES.pfShouldFollow('waterpark', on, true), false);
  assert.equal(RULES.pfShouldFollow('pets', on, true), false);
  assert.equal(RULES.pfShouldFollow('lantern', {hide:true}, true), false);
  assert.equal(RULES.pfShouldFollow('lantern', on, false), false);
});

test('follow step trails behind, then catches up, then teleports', () => {
  const face = 0; // behind is +Z because face 0 looks -Z in some engines; rules use sin/cos of face
  const step = RULES.pfFollowStep(0, 0, 0, 0, 10, 0.05);
  assert.ok(step.x !== undefined);
  const far = RULES.pfFollowStep(0, 0, 0, 100, 100, 0.016);
  assert.equal(far.tele, true);
  const close = RULES.pfFollowStep(0, 0, 0, 0, -1.55, 0.016);
  // near the follow point should not sprint
  assert.ok(close.tele === false);
});

test('pet follower is wired for settings, local follow, and multiplayer', () => {
  assert.match(HTML, /id="pfSetHide"/);
  assert.match(HTML, /function pfEnter/);
  assert.match(HTML, /function pfTick/);
  assert.match(HTML, /function pfWire/);
  assert.match(HTML, /pfTick\(frameDt, mode\)/);
  assert.match(HTML, /pfEnter\(mode\)/);
  assert.match(HTML, /pfWire\(\)/);
  assert.match(HTML, /pfShowRemote\(mode, E\)/);
  assert.match(HTML, /rubloxPetFollow/);
  assert.match(HTML, /buildPet/);
  assert.doesNotMatch(HTML, /Digital Circus|Caine|Pomni|Kaufmo/);
});
