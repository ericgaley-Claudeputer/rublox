const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const P = require(path.join(ROOT, 'dev/avatar/preview_logic.js'));
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8'));

const hat = {id:'hat-tophat', name:'Tiny Top Hat', price:200, slot:'hat', val:'tophat'};
const gown = {id:'pants-gown', name:'Fancy Gown', price:0, slot:'pantsPat', val:'gown'};
const base = {avatar:{hat:'none', hair:'short', shirt:'#3a86ff', pantsPat:'jeans'}, coins:500, owned:['hair-short'], draft:{hat:'none'}};

test('wearable cosmetics can be previewed, pure emotes cannot', () => {
  assert.equal(P.previewWearable(hat), true);
  assert.equal(P.previewWearable(gown), true);
  assert.equal(P.previewWearable({id:'shirt-flannel', slot:'shirtPat', val:'flannel', price:160}), true);
  assert.equal(P.previewWearable({id:'face-grin', slot:'face', val:'grin', price:0}), true);
  assert.equal(P.previewWearable({id:'ears-cat', slot:'ears', val:'cat', price:80}), true);
  assert.equal(P.previewWearable({id:'emo-wave', emote:'wave'}), false);
  assert.equal(P.previewWearable(null), false);
});

test('opening a preview never mutates the real outfit, coins, or owned list', () => {
  const state = JSON.parse(JSON.stringify(base));
  const before = P.previewSnap(state);
  const ses = P.previewBegin(state, hat);
  assert.equal(ses.ok, true);
  assert.equal(ses.open, true);
  assert.equal(ses.look.hat, 'tophat');
  assert.equal(ses.look.hair, 'short');
  assert.equal(state.avatar.hat, 'none');
  assert.equal(state.coins, 500);
  assert.deepEqual(state.owned, ['hair-short']);
  assert.equal(P.previewSameSave(before, P.previewSnap(state)), true);
});

test('canceling a preview restores the real outfit and spends nothing', () => {
  const state = JSON.parse(JSON.stringify(base));
  const before = P.previewSnap(state);
  const ses = P.previewBegin(state, hat);
  const out = P.previewCancel(ses);
  assert.equal(out.ok, true);
  assert.equal(out.open, false);
  assert.equal(out.saved, false);
  assert.equal(out.spent, false);
  assert.equal(out.avatar.hat, 'none');
  assert.equal(out.coins, 500);
  assert.deepEqual(out.owned, ['hair-short']);
  assert.equal(P.previewSameSave(before, {avatar: out.avatar, coins: out.coins, owned: out.owned}), true);
});

test('buying from the preview spends coins, owns the item, and wears it', () => {
  const state = JSON.parse(JSON.stringify(base));
  const ses = P.previewBegin(state, hat);
  const out = P.previewBuy(ses, hat, {coins: state.coins, owned: state.owned});
  assert.equal(out.ok, true);
  assert.equal(out.spent, true);
  assert.equal(out.saved, true);
  assert.equal(out.coins, 300);
  assert.ok(out.owned.includes('hat-tophat'));
  assert.equal(out.avatar.hat, 'tophat');
  // the session snapshot is unchanged until the caller writes
  assert.equal(ses.before.coins, 500);
  assert.equal(ses.before.avatar.hat, 'none');
  assert.equal(ses.before.owned.includes('hat-tophat'), false);
});

test('buying from preview with too few coins does not change the save', () => {
  const state = Object.assign(JSON.parse(JSON.stringify(base)), {coins: 50});
  const before = P.previewSnap(state);
  const ses = P.previewBegin(state, hat);
  const out = P.previewBuy(ses, hat, {coins: state.coins, owned: state.owned});
  assert.equal(out.ok, false);
  assert.equal(out.why, 'coins');
  assert.equal(out.spent, false);
  assert.equal(out.saved, false);
  assert.equal(out.coins, 50);
  assert.equal(out.avatar.hat, 'none');
  assert.equal(out.owned.includes('hat-tophat'), false);
  assert.equal(P.previewSameSave(before, {avatar: out.avatar, coins: out.coins, owned: out.owned}), true);
});

test('free or already-owned items can be worn from preview without spending', () => {
  const state = JSON.parse(JSON.stringify(base));
  const ses = P.previewBegin(state, gown);
  const out = P.previewBuy(ses, gown, {coins: state.coins, owned: state.owned});
  assert.equal(out.ok, true);
  assert.equal(out.spent, false);
  assert.equal(out.coins, 500);
  assert.equal(out.avatar.pantsPat, 'gown');
});

test('preview UI is wired in the shop and works with mouse, touch, and Xbox', () => {
  assert.ok(html.includes('id="avPrevModal"'));
  assert.ok(html.includes('id="avPrev2"') || html.includes('id="avPrev3"'));
  assert.ok(html.includes('data-act="preview"') || html.includes("data-act='preview'"));
  assert.match(html, /👀 Preview|Preview/);
  assert.match(html, /avPrevOpen|function avPrevOpen/);
  assert.match(html, /avPrevCancel|function avPrevCancel/);
  assert.match(html, /avPrevBuy|function avPrevBuy/);
  assert.match(html, /s\.jp\[3\]|jp\[3\]/);
  assert.match(html, /avPrevCancel/);
  assert.ok(html.includes('function previewWearable') || html.includes('PreviewRules'));
});

test('preview mode defaults to 3D and falls back to 2D when WebGL is off', () => {
  assert.equal(P.PREVIEW_MODE_KEY, 'rubloxPreviewMode');
  assert.equal(P.previewModeNormalize('3D'), '3d');
  assert.equal(P.previewModeNormalize('2d'), '2d');
  assert.equal(P.previewModeNormalize('flat'), '2d');
  assert.equal(P.previewModeNormalize('nope'), '');
  assert.equal(P.previewModePick('', true), '3d');
  assert.equal(P.previewModePick(null, false), '2d');
  assert.equal(P.previewModePick('3d', true), '3d');
  assert.equal(P.previewModePick('3d', false), '2d');
  assert.equal(P.previewModePick('2d', true), '2d');
  assert.equal(P.previewModePick('2d', false), '2d');
  assert.equal(P.previewModeSelected('3d', '3d'), true);
  assert.equal(P.previewModeSelected('3d', '2d'), false);
  assert.equal(P.previewModeSelected('2d', '2d'), true);
});

test('toggling 2D/3D and remembering the choice does not change the outfit, coins, or owned list', () => {
  const state = JSON.parse(JSON.stringify(base));
  const before = P.previewSnap(state);
  const ses = P.previewBegin(state, hat);
  assert.equal(P.previewModeToggle('3d', true), '2d');
  assert.equal(P.previewModeToggle('2d', true), '3d');
  assert.equal(P.previewModeToggle('2d', false), '2d');
  assert.equal(P.previewModeToggle('3d', false), '2d');
  assert.equal(ses.look.hat, 'tophat');
  assert.equal(state.avatar.hat, 'none');
  assert.equal(state.coins, 500);
  assert.deepEqual(state.owned, ['hair-short']);
  assert.equal(P.previewSameSave(before, P.previewSnap(state)), true);
});

test('preview panel has highlighted 2D and 3D buttons and Xbox 2D/3D controls', () => {
  assert.match(html, /id="avPrev2dBtn"/);
  assert.match(html, /id="avPrev3dBtn"/);
  assert.match(html, /id="avPrevModes"/);
  assert.match(html, /data-avprev-mode="2d"/);
  assert.match(html, /data-avprev-mode="3d"/);
  assert.match(html, /avprevmode\.on|\.avprevmode\.on/);
  assert.match(html, /rubloxPreviewMode/);
  assert.match(html, /function avPrevSetMode/);
  assert.match(html, /function avPrevToggleMode/);
  assert.match(html, /function avPrevStick/);
  assert.match(html, /avPrevToggleMode/);
  assert.match(html, /s\.jp\[2\][\s\S]{0,120}s\.jp\[4\][\s\S]{0,80}s\.jp\[5\][\s\S]{0,200}avPrevToggleMode|s\.jp\[4\][\s\S]{0,80}s\.jp\[5\][\s\S]{0,80}s\.jp\[2\][\s\S]{0,200}avPrevToggleMode/);
  assert.match(html, /avPrevStick\(s\.rx/);
  assert.doesNotMatch(html, /rubloxAvatar\s*=/);
});
