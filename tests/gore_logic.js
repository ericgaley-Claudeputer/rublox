'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const G = require(path.join(ROOT, 'dev/gore/gore_logic.js'));
const Reset = require(path.join(ROOT, 'dev/reset/reset_logic.js'));

test('gore defaults to off with no Campfire Grove decals, and old saves load as off', () => {
  assert.equal(G.GORE_KEY, 'rubloxGore');
  assert.equal(G.goreDefault(), 'off');
  assert.equal(G.goreNormalize(null), 'off');
  assert.equal(G.goreLoadState(null), 'off');
  assert.equal(G.goreLoadState(undefined), 'off');
  assert.equal(G.goreLoadState(''), 'off');
  assert.equal(G.goreLoadState({}), 'off');
  assert.equal(G.goreLoadState({ver:1}), 'off');
  assert.equal(G.goreLoadState('nope'), 'off');
  assert.equal(G.goreLoadState({level:'bloodbath'}), 'off');
  assert.equal(G.goreCampCount(null), 0);
  assert.equal(G.goreCampCount('off'), 0);
  assert.equal(G.goreCampDecals(null).length, 0);
});

test('gore accepts off, mild, and spooky from a string or object', () => {
  assert.equal(G.goreLoadState('mild'), 'mild');
  assert.equal(G.goreLoadState('spooky'), 'spooky');
  assert.equal(G.goreLoadState('off'), 'off');
  assert.equal(G.goreLoadState({level:'mild'}), 'mild');
  assert.equal(G.goreLoadState({level:'spooky'}), 'spooky');
  assert.ok(G.GORE_ORDER.every(id => G.GORE_LEVELS[id] && G.GORE_LEVELS[id].id === id));
  assert.ok(G.goreRank('mild') > G.goreRank('off'));
  assert.ok(G.goreRank('spooky') > G.goreRank('mild'));
});

test('mild and spooky produce increasing decal counts in Campfire Grove only', () => {
  const off = G.goreCampCount('off');
  const mild = G.goreCampCount('mild');
  const spooky = G.goreCampCount('spooky');
  assert.equal(off, 0);
  assert.ok(mild > 0, 'mild should place some cartoon marks');
  assert.ok(spooky > mild, 'spooky should add more marks than mild');
  G.goreCampDecals('mild').forEach(d => assert.ok(['splat', 'scratch', 'stain'].includes(d.kind)));
  assert.ok(G.goreCampDecals('spooky').some(d => d.kind === 'handprint' && d.at === 'cabin-window'));
  assert.equal(G.goreDecalsFor('winter', 'spooky').length, 0);
  assert.equal(G.goreDecalsFor('vet', 'spooky').length, 0);
  assert.equal(G.goreDecalsFor('elevator', 'mild').length, 0);
  assert.equal(G.goreAllowedIn('camp'), true);
  assert.equal(G.goreAllowedIn('school'), true);
  assert.equal(G.goreAllowedIn('winter'), false);
  const sm = G.goreDecalsFor('school', 'mild').length;
  const ss = G.goreDecalsFor('school', 'spooky').length;
  assert.ok(sm > 0 && ss > sm, 'school gore counts should increase');
  assert.equal(G.goreDecalsFor('school', 'off').length, 0);
  const banned = /wound|guts|body ?part|limb|injury|gore fest|dismember/i;
  JSON.stringify(G.CAMP_GORE_DECALS).search(banned) === -1 || assert.fail('decal table looks graphic');
  G.GORE_KINDS.forEach(k => assert.ok(['splat', 'scratch', 'stain', 'handprint'].includes(k)));
});

test('lessScary caps gore at Mild and the UI says so', () => {
  assert.equal(G.goreEffective('spooky', {lessScary:true}), 'mild');
  assert.equal(G.goreEffective('mild', {lessScary:true}), 'mild');
  assert.equal(G.goreEffective('off', {lessScary:true}), 'off');
  assert.equal(G.goreEffective('spooky', {lessScary:false}), 'spooky');
  assert.ok(G.goreCapped('spooky', true));
  assert.equal(G.goreCapped('mild', true), false);
  assert.match(G.goreCapNote('spooky', true), /Mild/);
  assert.equal(G.goreCapNote('spooky', false), '');
  assert.equal(G.goreCampCount('spooky', {lessScary:true}), G.goreCampCount('mild'));
  assert.ok(G.goreCampCount('spooky', {lessScary:true}) < G.goreCampCount('spooky'));
});

test('gore settings are wired in the page and kept as a global option', () => {
  assert.match(HTML, /id="goreSet"/);
  assert.match(HTML, /id="goreSetOff"/);
  assert.match(HTML, /id="goreSetMild"/);
  assert.match(HTML, /id="goreSetSpooky"/);
  assert.match(HTML, /🩸 Gore/);
  assert.match(HTML, /gore stays at Mild|Gore stays at Mild/i);
  assert.match(HTML, /function goreSetLevel/);
  assert.match(HTML, /function goreSyncUi/);
  assert.match(HTML, /function campRebuildGore/);
  assert.match(HTML, /window\.campRebuildGore\s*=\s*campRebuildGore/);
  assert.match(HTML, /window\.scRebuildGore\s*=\s*scRebuildGore/);
  assert.match(HTML, /Campfire Grove and Afterbell School/);
  assert.match(HTML, /rubloxGore/);
  assert.match(HTML, /const BUILD = '2026\.11\.22-8'/);
  assert.equal(Reset.RESET_KEEP_ON_ALL.includes('rubloxGore'), true);
  assert.match(HTML, /'rubloxGore'/);
  assert.match(HTML, /no wounds or body parts/i);
  assert.doesNotMatch(HTML, /injury animation|open wound|severed|dismember/i);
});
