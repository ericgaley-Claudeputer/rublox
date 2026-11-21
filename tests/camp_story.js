'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const C = require(path.join(__dirname, '..', 'dev/t302/camp_logic.js'));
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('old camp saves load without the lost-camper story and new fields are optional', () => {
  const s = C.campLoad({ver:3, sticks:4, lessScary:true});
  assert.equal(s.sticks, 4);
  assert.equal(s.lessScary, true);
  assert.deepEqual(s.clues, []);
  assert.equal(s.camperFound, false);
  assert.equal(C.campAllClues(s), false);
});

test('clues can be found in any order and unlock a safe ending for Maple Wren', () => {
  let s = C.campFresh();
  assert.equal(C.CAMP_CAMPER.name, 'Maple Wren');
  assert.equal(C.CAMP_CLUES.length, 5);
  const ids = C.CAMP_CLUES.map(c => c.id).reverse();
  ids.forEach(id => {
    const r = C.campFindClue(s, id);
    assert.equal(r.ok, true, id);
    s = r.state;
  });
  assert.equal(C.campAllClues(s), true);
  assert.equal(C.campCanFindCamper(s), true);
  const early = C.campFindCamper(C.campFresh());
  assert.equal(early.ok, false);
  const end = C.campFindCamper(s);
  assert.equal(end.ok, true);
  assert.equal(end.state.camperFound, true);
  assert.ok(end.reward > 0);
  assert.match(end.name, /Maple Wren/);
  const journal = C.campJournalLines(end.state, false);
  assert.equal(journal.done, true);
  assert.equal(journal.found, 5);
  journal.lines.forEach(l => assert.equal(l.have, true));
});

test('Less scary uses gentler clue text, and the journal is wired in Campfire Grove', () => {
  const spooky = C.campClueText('radio', false);
  const soft = C.campClueText('radio', true);
  assert.notEqual(spooky, soft);
  assert.match(soft, /okay|fireflies|cheerful/i);
  assert.match(html, /id="campJournal"/);
  assert.match(html, /id="t302JournalBtn"/);
  assert.match(html, /Maple Wren/);
  assert.match(html, /function campOpenJournal/);
});

const G = require(path.join(__dirname, '..', 'dev/gore/gore_logic.js'));

test('Spooky Gore (and not Less scary) changes the Wren rescue look; other levels stay the same', () => {
  assert.equal(C.campWrenSpooky('off', false), false);
  assert.equal(C.campWrenSpooky('mild', false), false);
  assert.equal(C.campWrenSpooky('spooky', true), false, 'Less scary keeps the regular scene');
  assert.equal(C.campWrenSpooky('spooky', false), true);
  assert.match(C.campWrenEnding(), /Everyone is okay/);
  assert.match(C.campWrenEnding(), /Maple Wren/);
  assert.doesNotMatch(C.campWrenEnding(), /blood|wound|body parts|guts|severed/i);

  const mildIds = G.goreCampDecals('mild').map(d => d.id);
  assert.deepEqual(mildIds, ['cabin-door', 'cabin-steps', 'woods-stain-1', 'tree-scratch-1', 'tree-scratch-2']);
  assert.equal(G.goreCampCount('off'), 0);
  assert.equal(G.goreCampDecals('mild').filter(d => d.at === 'hollow-tree').length, 0);
  const spookyHollow = G.goreCampDecals('spooky').filter(d => d.at === 'hollow-tree');
  assert.ok(spookyHollow.length >= 4, 'spooky adds marks around the hollow tree');
  assert.ok(spookyHollow.some(d => d.kind === 'splat') && spookyHollow.some(d => d.kind === 'scratch'));
  assert.equal(G.goreCampDecals('spooky', {lessScary:true}).filter(d => d.at === 'hollow-tree').length, 0);
  assert.equal(G.goreCampCount('mild'), mildIds.length);
  assert.ok(G.goreCampCount('spooky') > G.goreCampCount('mild'));

  let s = C.campFresh();
  C.CAMP_CLUES.forEach(c => { const r = C.campFindClue(s, c.id); if (r.ok) s = r.state; });
  const found = C.campFindCamper(s);
  assert.equal(found.ok, true);
  assert.equal(found.why, 'safe');
  const journal = C.campJournalLines(found.state, false);
  assert.match(journal.done ? '🧣 Maple Wren is safe by the hollow tree. Everyone is okay!' : '', /Everyone is okay/);

  assert.match(html, /function campMakeWren/);
  assert.match(html, /function campRebuildWren/);
  assert.match(html, /function campWrenSpooky/);
  const make = html.slice(html.indexOf('function campMakeWren'), html.indexOf('function campBuildStory'));
  assert.match(make, /bandage/);
  assert.match(make, /shiver/);
  assert.doesNotMatch(make, /\bblood\b|\bwounds?\b|body parts|guts|severed|dismember/i);
  assert.match(html, /Everyone is okay/);
});
