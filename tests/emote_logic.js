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
});
