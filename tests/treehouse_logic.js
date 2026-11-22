'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const T = require(path.join(__dirname, '..', 'dev/treehouse/treehouse_logic.js'));
const Reset = require(path.join(__dirname, '..', 'dev/reset/reset_logic.js'));
const D = require(path.join(__dirname, '..', 'dev/doors/door_logic.js'));
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('Oakheart Treehouse uses a new rubloxTreehouse save and stays compatible', () => {
  assert.equal(T.TH_KEY, 'rubloxTreehouse');
  const s = T.thLoad(null);
  assert.equal(s.pieces.length, 0);
  assert.equal(s.kind, 'platform');
  assert.equal(s.level, 1, 'a new treehouse starts one floor up, not on the grass');
  assert.equal(T.thLoad({}).level, 1);
  const kept = T.thLoad({v:1, visits:2, pieces:[{kind:'platform', gx:2, gz:0, level:0, rot:0}]});
  assert.equal(kept.visits, 2);
  assert.equal(kept.pieces.length, 1);
  assert.equal(kept.level, 1, 'saves that never stored a level still start one floor up');
  assert.equal(T.thLoad({level:0}).level, 0, 'an explicit saved level 0 stays 0');
  assert.equal(T.thFriendsOnly(), true);
  assert.match(html, /o\.level == null \? d\.level/);
});

test('treehouse pieces snap, undo, and delete, and room doors fit a max player', () => {
  let s = T.thFresh();
  const a = T.thPlace(s, 'platform', 1, 0, 0, 0, 'me', {});
  assert.equal(a.ok, true);
  s = a.state;
  const blocked = T.thPlace(s, 'platform', 0, 0, 0, 0, 'me', {});
  assert.equal(blocked.ok, false);
  const b = T.thPlace(s, 'room', 2, 0, 0, 0, 'me', {snap:true});
  assert.equal(b.ok, true);
  s = b.state;
  const doors = T.thAllDoors(s);
  assert.ok(doors.length >= 1);
  doors.forEach(d => {
    assert.ok(d.h >= D.DOOR_MIN_H);
    assert.ok(d.w >= D.DOOR_MIN_W);
    assert.equal(D.doorWalk({id:d.id, h:d.h, w:d.w, thick:d.thick||0.4}, D.doorMaxPlayer()).ok, true);
  });
  s = T.thUndo(s).state;
  assert.equal(s.pieces.length, 1);
  s = T.thRemove(s, s.pieces[0].id).state;
  assert.equal(s.pieces.length, 0);
});

test('treehouse is a playable menu game listed under Reset a game', () => {
  assert.ok(Reset.RESET_GAMES.some(g => g.id === 'treehouse' && g.keys.includes('rubloxTreehouse')));
  assert.match(html, /id:'treehouse'/);
  assert.match(html, /function buildTreehouse\(/);
  assert.match(html, /function thUpdate\(/);
  assert.match(html, /function treehouseStop\(/);
  assert.match(html, /Oakheart Treehouse/);
  assert.match(html, /rubloxTreehouse/);
});
