const {test, describe} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const P = require('../dev/photobooth/booth_logic.js');
const R = require('../dev/reset/reset_logic.js');

describe('Avatar photo booth', () => {
  test('reuses rubloxPhotos, caps the gallery, and falls back to 2D without WebGL', () => {
    assert.equal(P.PB_KEY, 'rubloxPhotos');
    assert.equal(P.PB_MAX, 12);
    const studio = R.resetGame('photostudio');
    assert.ok(studio.keys.includes('rubloxPhotos'));
    assert.equal(P.pbNeed2dFallback(false), true);
    assert.equal(P.pbNeed2dFallback(true), false);
    const tiny = 'data:image/png;base64,aGVsbG8='; // too short
    assert.equal(P.pbIsPhotoData(tiny), false);
    const ok = 'data:image/png;base64,' + 'A'.repeat(40);
    const stored = P.pbStore([], {t:1, d:ok, bg:'studio', pose:'wave', source:'booth'});
    assert.equal(stored.ok, true);
    assert.equal(stored.count, 1);
    let g = [];
    for (let i = 0; i < 15; i++){
      g = P.pbStore(g, {t:i+2, d:ok, id:String(i+2)}).gallery;
    }
    assert.equal(g.length, 12);
    const gone = P.pbDelete(g, g[0].id);
    assert.equal(gone.count, 11);
  });

  test('poses, backgrounds, frames, and stickers compose a layout', () => {
    let shot = P.pbFreshShot();
    shot = P.pbToggleSticker(shot, 'star');
    shot = P.pbToggleSticker(shot, 'heart');
    shot.pose = 'jump';
    shot.bg = 'sunset';
    shot.frame = 'gold';
    const lay = P.pbLayout(shot, 520, 600);
    assert.equal(lay.pose.id, 'jump');
    assert.equal(lay.bg.id, 'sunset');
    assert.equal(lay.frame.id, 'gold');
    assert.ok(lay.pad > 0);
    assert.ok(lay.poseShift.y < 0);
    assert.equal(lay.stickers.length, 2);
    shot = P.pbToggleSticker(shot, 'star');
    assert.equal(shot.stickers.includes('star'), false);
  });

  test('the avatar editor and hub expose a photo booth', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert.match(html, /id="avBoothBtn"/);
    assert.match(html, /id="avBooth"/);
    assert.match(html, /Photo Booth/);
  });
});
