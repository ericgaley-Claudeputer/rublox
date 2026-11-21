const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const W = require('../dev/winter/winter_logic.js');

describe('Pinebell Village layout and labels', () => {
  test('buildings, props, and the hill do not overlap', () => {
    const hits = W.wnLayoutOverlaps(0.8);
    assert.deepEqual(hits, []);
    const boxes = W.wnLayoutBoxes();
    assert.ok(boxes.some(b => b.kind === 'house' && b.id === 'cocoa'));
    assert.ok(boxes.some(b => b.kind === 'hill' && b.id === 'hill-finish'));
    assert.ok(boxes.some(b => b.kind === 'tree' && b.id === 'tree-a'));
    assert.ok(boxes.some(b => b.kind === 'post' && b.id === 'post-1'));
    const cocoa = boxes.find(b => b.id === 'cocoa');
    const fir = boxes.find(b => b.id === 'tree-a');
    assert.ok(cocoa && fir);
    assert.equal(W.wnBoxesOverlap(cocoa, fir, 0.8), false);
    const hill = boxes.filter(b => b.kind === 'hill');
    boxes.filter(b => b.kind === 'house').forEach(h => {
      hill.forEach(p => {
        assert.equal(W.wnBoxesOverlap(h, p, 0.8), false, h.id + ' vs ' + p.id);
      });
    });
  });

  test('each place label is unique and anchored to a real building or prop', () => {
    const labels = W.wnPlaceLabels();
    const names = labels.map(l => l.name);
    assert.equal(names.length, new Set(names).size);
    assert.equal(names.filter(n => /Mugsy's Cocoa/i.test(n)).length, 1);
    const boxes = W.wnLayoutBoxes();
    const anchors = new Set(boxes.map(b => b.id));
    anchors.add('plaza');
    anchors.add('posts');
    labels.forEach(l => {
      assert.ok(l.anchor, l.name + ' needs an anchor');
      const box = boxes.find(b => b.id === l.anchor || b.id === l.id || b.name === l.name);
      if (l.anchor === 'plaza' || l.anchor === 'posts') return;
      assert.ok(box, l.name + ' should be anchored to an existing place, got ' + l.anchor);
      const dist = Math.hypot(l.x - box.x, l.z - box.z);
      assert.ok(dist < 8, l.name + ' is ' + dist + ' from ' + box.id);
    });
    const near = W.wnVisibleLabels(0, 8, 6, 32);
    assert.ok(near.length <= 8);
    assert.equal(near.filter(l => /Mugsy's Cocoa/i.test(l.name)).length <= 1, true);
  });

  test('cottage walls are solid and the 4.2×3.6 doors stay walkable', () => {
    assert.equal(W.WN_DOOR_H, 4.2);
    assert.equal(W.WN_DOOR_W, 3.6);
    assert.equal(W.WN_DOORS.length, 3);
    W.WN_COTTAGES.forEach(c => {
      assert.ok(W.wnHitWall(c.x, c.z - c.d/2), c.id + ' back wall');
      assert.ok(W.wnHitWall(c.x - c.w/2, c.z), c.id + ' side wall');
      assert.ok(W.wnHitWall(c.x + c.w/2, c.z), c.id + ' other side wall');
      const door = W.wnInDoorway(c.x, c.z + c.d/2);
      assert.ok(door, c.id + ' doorway exists');
      assert.equal(W.wnHitWall(c.x, c.z + c.d/2), null);
      assert.equal(W.wnWalkableAt(c.x, c.z + c.d/2), true);
      assert.equal(W.wnWalkableAt(c.x, c.z), true);
    });
  });
});

describe('Pinebell layout is wired into the page', () => {
  test('index uses the shared cottage and label helpers', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert.match(html, /wnLayoutOverlaps/);
    assert.match(html, /wnPlaceLabels/);
    assert.match(html, /wnHitWall/);
    assert.match(html, /wnPaintLabels/);
    assert.match(html, /Mugsy's Cocoa/);
  });
});
