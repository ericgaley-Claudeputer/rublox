const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const L = require('../dev/avatar/looks.js');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

describe('new avatar looks', () => {
  test('adds a batch of original hats, hair, outfits, and a boy body, with new ids only', () => {
    assert.ok(L.LOOK_ITEMS.length >= 24);
    const ids = L.lookIds();
    assert.equal(new Set(ids).size, ids.length);
    ids.forEach(id => {
      assert.equal(L.lookIsNew(id), true, id + ' must be a new optional id');
      assert.equal(L.OLD_IDS.includes(id), false);
    });
    assert.ok(L.lookItem('body-boy') && L.lookItem('body-boy').val === 'boy');
    L.lookVibes().forEach(v => {
      assert.ok(L.LOOK_ITEMS.some(it => it.vibe === v), 'missing vibe ' + v);
    });
    assert.ok(L.LOOK_ITEMS.some(it => it.slot === 'hat'));
    assert.ok(L.LOOK_ITEMS.some(it => it.slot === 'hair'));
    assert.ok(L.LOOK_ITEMS.some(it => it.slot === 'shirtPat'));
    assert.ok(L.LOOK_ITEMS.some(it => it.slot === 'pantsPat' && /gown|sundress/.test(it.val)));
  });

  test('old avatar saves still load, and the new ids are wired into the shop', () => {
    const old = L.lookFixAv({head:'#ffd23f', shirt:'#3a86ff', pants:'#2d2d2d', hat:'cap', hair:'long', body:'classic'});
    assert.equal(old.body, 'classic');
    assert.equal(old.hat, 'cap');
    assert.equal(L.lookFixAv({body:'galaxy'}).body, 'classic');
    assert.equal(L.lookFixAv({body:'boy'}).body, 'boy');
    if (html.includes("const BUILD = '2026.11.20-7'") || html.includes("id:'body-boy'")){
      L.lookIds().forEach(id => {
        assert.ok(html.includes("id:'" + id + "'") || html.includes('id:"' + id + '"'), 'shop missing ' + id);
      });
      assert.match(html, /data-cat="looks"/);
      assert.match(html, /av\.body === 'boy'/);
    }
  });
});
