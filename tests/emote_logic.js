const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const E = require('../dev/t297/emote_logic.js');

describe('emotes', () => {
  test('wave, dance, sit, cheer, clap, laugh, and sleep are always free', () => {
    for (const id of E.EMO_FREE){
      assert.equal(E.emoAllowed(id, []), true, id);
      assert.equal(E.EMO_CORE[id].price, 0);
    }
    assert.deepEqual(E.EMO_FREE, ['wave','dance','sit','cheer','clap','laugh','sleep']);
  });

  test('shop extras stay locked until owned, and are not granted by rewriting other saves', () => {
    assert.equal(E.emoAllowed('flip', []), false);
    assert.equal(E.emoAllowed('skate', ['emote-skate']), true);
    assert.equal(E.emoAllowed('wave', []), true);
    const list = E.emoList([]);
    assert.ok(list.includes('sit') && list.includes('clap'));
    assert.ok(!list.includes('flip'));
  });

  test('sit, sleep, and dance loop until the player moves, and the View button is used for the wheel', () => {
    assert.equal(E.emoLooping('sit'), true);
    assert.equal(E.emoCancelOnMove('sit'), true);
    assert.equal(E.emoCancelOnMove('wave'), false);
    assert.equal(E.EMO_PAD_VIEW, 8);
    assert.ok(E.EMO_PAD_VIEW !== 0 && E.EMO_PAD_VIEW !== 2 && E.EMO_PAD_VIEW !== 4 && E.EMO_PAD_VIEW !== 5);
  });

  test('every assigned emote hotkey is unique, labels match bindings, and extras without a key are wheel-only', () => {
    const merged = E.emoMerge();
    const uniq = E.emoKeyUnique(merged);
    assert.equal(uniq.ok, true);
    assert.equal(Object.keys(uniq.keys).length, 10);
    assert.deepEqual(Object.keys(uniq.keys).sort(), ['0','1','2','3','4','5','6','7','8','9']);
    assert.equal(uniq.keys['1'], 'wave');
    assert.equal(uniq.keys['7'], 'sleep');
    assert.equal(uniq.keys['8'], 'skate');
    assert.equal(uniq.keys['9'], 'flip');
    assert.equal(uniq.keys['0'], 'groan');
    assert.equal(E.emoHasKey(merged.facepalm), false);
    assert.equal(E.emoKeyLabel(merged.groan), '0');
    assert.equal(E.emoKeyLabel(merged.facepalm), '');
    assert.equal(E.emoByCode('Digit0', merged), 'groan');
    assert.equal(E.emoByCode('Numpad9', merged), 'flip');
    assert.equal(E.emoByCode('Digit8', merged), 'skate');
    assert.equal(E.emoByCode('Digitnull', merged), null);
    const labels = Object.keys(merged).map(id => E.emoKeyLabel(merged[id])).filter(Boolean);
    assert.equal(new Set(labels).size, labels.length);
  });
});
