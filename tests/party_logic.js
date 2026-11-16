'use strict';
const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const P = require('../dev/party/party_logic.js');

describe('Party Pad layout', () => {
  test('has a dance floor, three sofas, a photo spot, and a kickable ball', () => {
    assert.equal(P.PY.name, 'Party Pad');
    assert.equal(P.PY.id, 'party');
    assert.ok(P.PY.dance.w >= 6 && P.PY.dance.d >= 6);
    assert.equal(P.PY.sofas.length, 3);
    assert.ok(P.PY.photo.r >= 2);
    assert.ok(P.PY.ball.r > 0);
    assert.equal(P.pyNoNpcs().length, 0);
  });

  test('dance / sit / photo probes are local and do not overlap awkwardly', () => {
    assert.equal(P.pyOnDance(0, -1), true);
    assert.equal(P.pyOnDance(0, 8), false);
    const sofa = P.pyNearSofa(11.4, 2);
    assert.ok(sofa && sofa.id === 'sofa-e');
    assert.equal(P.pyNearSofa(0, 0), null);
    assert.equal(P.pyNearPhoto(0, -11.2), true);
    assert.equal(P.pyNearPhoto(0, 8), false);
  });

  test('kicking the ball from a moving player sends it away, and walls bounce it', () => {
    const miss = P.pyKick({x: 8, z: 8, vx: 0, vz: 0}, 0, 0, 1, 0);
    assert.equal(miss.hit, false);
    const hit = P.pyKick({x: 1, z: 0, vx: 0, vz: 0}, 0, 0, 4, 0);
    assert.equal(hit.hit, true);
    assert.ok(hit.ball.vx > 0);
    let b = {x: P.PY.ball.wall + 1, z: 0, vx: 10, vz: 0};
    b = P.pyBallStep(b, 0.05);
    assert.ok(b.x <= P.PY.ball.wall);
    assert.ok(b.vx < 0);
  });
});
