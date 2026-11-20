const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const D = require('../dev/doors/door_logic.js');
const V = require('../dev/vet/vet_logic.js');
const M = require('../dev/mansion/mansion_logic.js');
const S = require('../dev/shelter/shelter_logic.js');
const W = require('../dev/winter/winter_logic.js');
const E = require('../dev/elevator/elev_logic.js');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function walk(list, label){
  assert.ok(Array.isArray(list) && list.length > 0, label + ' should list doorways');
  const player = D.doorMaxPlayer();
  assert.equal(player.cosmetics, false);
  assert.equal(player.h, D.DOOR_BODY_H);
  list.forEach(door => {
    const r = D.doorWalk(door, player);
    assert.equal(r.ok, true, label + ' ' + (r.door || door.id) + ' blocked by ' + r.hit + ' (h=' + door.h + ' w=' + door.w + ')');
  });
}

describe('doorway clearance for a max-height player', () => {
  test('collision height is the body only — hats, hair, wings, and horns do not count', () => {
    assert.equal(D.DOOR_BODY_H, 2.8);
    assert.equal(D.DOOR_BODY_R, 0.45);
    assert.ok(D.DOOR_MIN_H >= D.DOOR_BODY_H * 1.4 - 1e-9);
    assert.ok(D.DOOR_MIN_W >= D.DOOR_BODY_R * 2 * 2.5 - 1e-9);
    assert.match(html, /const COIN_VALUE = 5, FINISH_BONUS = 50, R = 0\.45, H = 2\.8,/);
    assert.match(html, /function bodyH\(\)\{ return \(typeof mode !== 'undefined' && mode === 'dreamhouse' && typeof dhPlayerHeight === 'function'\) \? dhPlayerHeight\(\) : H; \}/);
    assert.doesNotMatch(html, /function bodyH\(\)\{[^}]*hat/);
    assert.doesNotMatch(html, /function bodyH\(\)\{[^}]*hair/);
    assert.doesNotMatch(html, /function bodyH\(\)\{[^}]*wing/);
    assert.doesNotMatch(html, /function bodyH\(\)\{[^}]*horn/);
    assert.match(html, /function eyeHeight\(\)\{[^}]*: 2\.45; \}/);
  });

  test('a max-height player can walk through every Pawsley Vet Clinic doorway, and the first-person camera clears every lintel', () => {
    const doors = V.VT_DOORS.map(d => Object.assign({h: V.VT_DOOR_H, w: d.w, thick: d.thick || 0.42}, d));
    assert.equal(doors.length, 6);
    assert.ok(V.VT_DOOR_H >= D.DOOR_MIN_H);
    assert.ok(V.VT_DOOR_W >= D.DOOR_MIN_W);
    assert.ok(V.VT_WALL_H > V.VT_DOOR_H);
    walk(doors, 'vet');
    doors.forEach(d => {
      assert.equal(D.doorCameraClears(d.h, D.DOOR_EYE_H, D.DOOR_CAM_CLEAR), true, 'camera blocked in ' + (d.a + '-' + d.b));
    });
    assert.match(html, /VT_DOOR_H = 4\.2/);
    assert.doesNotMatch(html, /const doorH = 2\.75/);
  });

  test('a max-height player can walk through Mallowmist Manor hall doors, new side rooms, and the secret attic opening', () => {
    assert.ok(M.MN_DOORS.some(d => d.id === 'library-attic'));
    assert.ok(M.MN_DOORS.some(d => d.id === 'attic-secret'));
    assert.ok(M.MN_DOORS.some(d => d.id === 'library-chime'));
    walk(M.MN_DOORS, 'mansion');
  });

  test('a max-height player can walk through the Wagwell Shelter front door and the grooming salon doorway', () => {
    assert.ok(S.SH_DOORS.some(d => d.id === 'salon-front'));
    walk(S.SH_DOORS, 'shelter');
  });

  test('a max-height player can walk through Pinebell cottage and cocoa-shop doorways', () => {
    assert.ok(W.WN_DOORS.some(d => d.id === 'cocoa'));
    assert.equal(W.WN_DOORS.length, 3);
    walk(W.WN_DOORS, 'winter');
  });

  test('a max-height player can walk through the Wobblevator cab doorways', () => {
    const B = E.ELEV_BUILDING;
    const z = E.ELEV_CAB_D / 2 + 0.2;
    const doors = [
      {id:'elev-lobby', x:0, z:z, w:B.doorOpenW, h:B.doorOpenH, axis:'z', thick:0.36},
      {id:'elev-shaft', x:0, z:-z, w:B.doorOpenW, h:B.doorOpenH, axis:'z', thick:0.36}
    ];
    assert.ok(B.doorOpenH >= D.DOOR_MIN_H);
    assert.ok(B.doorOpenW >= D.DOOR_MIN_W);
    walk(doors, 'elevator');
  });
});
