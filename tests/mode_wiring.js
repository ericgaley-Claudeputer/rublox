// Regression (QA t330u): build 2026.11.20-9 accidentally dropped the Mallowmist Manor and Wagwell Shelter
// runtimes, so both games crashed on start ("buildMansion is not defined"). Every per-mode hook that the
// engine calls must have a definition somewhere in the single-file build.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
// app code only (skip minified vendor lines such as three.js)
const app = html.split('\n').filter(l => l.length < 20000).join('\n');

const HOOK = /(?<![\w.$])((?:build[A-Z]\w*)|(?:[a-z]{2,5}(?:Enter|Update|Stop|Key|Pad|FromHost|FromNet|Hud|Bind|Act|Net|Wire|Apply)))\s*\(/g;
function defined(name){
  return new RegExp('function\\s+' + name + '\\s*\\(|(?:const|let|var)\\s+' + name + '\\s*=|[{,]\\s*' + name + '\\s*[(:]|\\b' + name + '\\s*=\\s*(?:function|\\()').test(html);
}
test('every per-mode hook the engine calls is defined', () => {
  const names = new Set(); let m;
  while ((m = HOOK.exec(app))) names.add(m[1]);
  const missing = [...names].filter(n => !defined(n));
  assert.deepEqual(missing, []);
});
test('every hub game id has a build function in the build dispatch', () => {
  const gi = html.indexOf('const GAMES = ['), ge = html.indexOf('\n];', gi);
  const ids = [...html.slice(gi, ge).matchAll(/\{id:\s*'([a-z]+)'/g)].map(x => x[1]);
  assert.ok(ids.length > 35);
  const line = html.split('\n').find(l => l.includes("if (mode === 'elevator') buildElevator();"));
  assert.ok(line, 'build dispatch line');
  for (const id of ids){
    if (id === 'obby') continue;
    const at = line.indexOf("mode === '" + id + "')");
    const mm = at >= 0 ? line.slice(at, at + 80).match(/(build\w+)\(\)/) : null;
    assert.ok(mm, 'no build dispatch for ' + id);
    assert.ok(new RegExp('function ' + mm[1] + '\\(').test(html), mm[1] + ' is not defined');
  }
});
test('Mallowmist Manor and Wagwell Shelter runtimes are present', () => {
  ['buildMansion', 'mnUpdate', 'mnKey', 'mnPad', 'mansionStop', 'mnFromHost', 'buildShelter', 'shUpdate', 'shKey', 'shPad', 'shelterStop', 'shFromHost'].forEach(n => {
    assert.ok(new RegExp('function ' + n + '\\(').test(html), n + ' missing');
  });
});
