'use strict';
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function hubCss(){
  const start = html.indexOf('id="hubInkCss"');
  assert.ok(start > 0, 'missing #hubInkCss stylesheet');
  const open = html.indexOf('>', start);
  const close = html.indexOf('</style>', open);
  return html.slice(open + 1, close);
}

describe('home / hub text is black and sits on a light background', () => {
  test('a dedicated hub stylesheet forces black copy on the home screen', () => {
    const css = hubCss();
    assert.match(css, /\.hero\{color:#111;/);
    assert.match(css, /background:linear-gradient\(120deg,#d4e8ff,#ebe0ff 55%,#ffd9ee\)/);
    assert.match(css, /\.hero h1,\.hero p\{color:#111;/);
    assert.match(css, /header\.top \.logo \.b\{color:#111;/);
    assert.match(css, /nav button\{color:#111\}/);
    assert.match(css, /nav button\.active\{color:#111;background:#b7d4ff/);
    assert.match(css, /main \.big\.green[^}]*color:#111;background:#8ef0be/);
    assert.match(css, /main \.big\.blue[^}]*color:#111;background:#b3d4ff/);
    assert.match(css, /\.badge\.play\{color:#111;background:#8ef0be/);
    assert.match(css, /\.updbar\{color:#111;background:#b3d4ff\}/);
    assert.match(css, /\.cinfo h3, \.cinfo small/);
    assert.match(css, /#nameModal \.mbox[^}]*background:#fff;color:#111/);
    assert.match(html, /linear-gradient\(rgba\(255,255,255,\.55\)/);
    assert.match(html, /style="background:#ffb3ba">R/);
    assert.match(html, /style="background:#d7c8ff">X/);
  });

  test('the original dark hero gradient is overridden, not left as white-on-blue', () => {
    const css = hubCss();
    assert.doesNotMatch(css, /color:#fff/);
    assert.doesNotMatch(css, /#3a86ff,#8b5cf6 55%,#ff6fb5/);
    // The old rule may still exist earlier; the hub sheet must win later in the document.
    const oldHero = html.indexOf('.hero{position:relative');
    const ink = html.indexOf('id="hubInkCss"');
    assert.ok(oldHero > 0 && ink > oldHero, 'hubInkCss must come after the original .hero rule');
  });

  test('dark mode on the hub lightens surfaces so black text stays readable', () => {
    const css = hubCss();
    assert.match(css, /body\.dark:not\(:has\(#obby\.show\)\)\{/);
    assert.match(css, /--card:#ffffff;/);
    assert.match(css, /--bg:#eef6ff;/);
    assert.match(css, /--text:#111;/);
  });

  test('in-game HUD keep their own contrast (the hub sheet is scoped off #obby)', () => {
    const css = hubCss();
    assert.match(css, /not\(:has\(#obby\.show\)\)/);
    // Global in-game tips stay white-on-dark; we did not rewrite .otip / .obanner here.
    assert.doesNotMatch(css, /\.otip\{/);
    assert.doesNotMatch(css, /\.obanner\{/);
    const src = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert.match(src, /\.otip\{[^}]*color:#fff/);
  });
});
